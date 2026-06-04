import React, { useState, useEffect, useRef } from 'react';
import { useGameClient } from './hooks/useGameClient';
import { JoinScreen } from './components/JoinScreen';
import { ModeratorScreen } from './components/ModeratorScreen';
import { PlayerScreen } from './components/PlayerScreen';
import { playNightTransition, playDayTransition, playTick, playVictory, playDefeat, startAmbience, stopAmbience, playDeath } from './lib/audio';

export default function App() {
  const { gameState, myId, reactions, ghostMessages, wolfMessages, sendAction, error } = useGameClient();
  const [hasJoined, setHasJoined] = useState(false);
  const lastStateRef = useRef<string | null>(null);
  const lastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameState) return;

    // Atmospheric ambience: a tense pad at night only. Daytime/discussion plays
    // no background music (kept silent on purpose).
    if (gameState.status.startsWith('NIGHT') || gameState.status === 'ROLE_REVEAL') {
      startAmbience('night');
    } else {
      stopAmbience();
    }

    if (lastStateRef.current !== gameState.status) {
      if (gameState.status === 'NIGHT_START') {
        playNightTransition();
      } else if (gameState.status === 'DAY_ANNOUNCE') {
        playDayTransition();
        if (gameState.deadThisRound.length > 0) setTimeout(playDeath, 600);
      } else if (gameState.status === 'END') {
        const me = gameState.players.find(p => p.id === myId);
        if (me && !me.isModerator) {
           const isWolf = me.role === 'Werewolf';
           const wolfWin = gameState.winner === 'Werewolves';
           if ((isWolf && wolfWin) || (!isWolf && !wolfWin)) {
              playVictory();
           } else {
              playDefeat();
           }
        } else if (me && me.isModerator) {
           playVictory();
        }
      }
      lastStateRef.current = gameState.status;
    }
    
    if (gameState.timerSeconds !== null && gameState.timerSeconds !== undefined && gameState.timerSeconds !== lastTimerRef.current) {
        if (gameState.timerSeconds > 0 && gameState.timerSeconds <= 10 && gameState.status === 'DAY_DISCUSS') {
            playTick();
        }
        lastTimerRef.current = gameState.timerSeconds;
    }
  }, [gameState, myId]);

  // Only wait for the socket connection (myId). The gameState arrives *after*
  // we JOIN a room, so it must not gate the join screen — otherwise we'd wait
  // forever for data that only comes once the player acts.
  if (!myId) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <p className="text-xl animate-pulse">Conectando...</p>
      </div>
    );
  }

  const me = gameState?.players.find(p => p.id === myId);

  // Show the join screen until the server confirms we are in the room.
  if (!hasJoined || !gameState || !me) {
    return (
      <>
        <JoinScreen onJoin={(name, isMod, roomCode) => {
          sendAction({ type: 'JOIN', name, isModerator: isMod, roomCode });
          setHasJoined(true);
        }} />
        {error && <ErrorBanner message={error} />}
      </>
    );
  }

  // The screen is driven by the role the server actually granted, not by what
  // the client requested — so a denied "I am the Moderator" lands on the player UI.
  return (
    <div className="min-h-screen bg-[#C679FF] text-white font-sans selection:bg-white/30">
      {me.isModerator ? (
        <ModeratorScreen gameState={gameState} sendAction={sendAction} myId={myId} />
      ) : (
        <PlayerScreen gameState={gameState} sendAction={sendAction} myId={myId} reactions={reactions} ghostMessages={ghostMessages} wolfMessages={wolfMessages} />
      )}
      {error && <ErrorBanner message={error} />}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white font-bold px-5 py-3 rounded-xl shadow-2xl max-w-[90vw] text-center animate-bounce">
      {message}
    </div>
  );
}
