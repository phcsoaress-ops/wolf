import React, { useState } from 'react';
import { GameState, ClientAction } from '../types';
import { getRoleColor, RoleIcon } from './RoleUI';
import { Users, Skull, Play, SkipForward, FlaskConical } from 'lucide-react';
import { Avatar } from './Avatar';

export function ModeratorScreen({ gameState, sendAction }: { gameState: GameState, sendAction: (a: ClientAction) => void, myId: string }) {
  const [numWolves, setNumWolves] = useState(1);
  const [numSeers, setNumSeers] = useState(1);
  const [numDoctors, setNumDoctors] = useState(1);
  const [numWitches, setNumWitches] = useState(0);
  const [firstNightNoDeath, setFirstNightNoDeath] = useState(true);
  const [dayLengthMins, setDayLengthMins] = useState(2);

  const players = gameState.players.filter(p => !p.isModerator);
  const alivePlayers = players.filter(p => p.isAlive);

  const renderLobby = () => {
    const requiredRoles = numWolves + numSeers + numDoctors + numWitches;
    const isReady = players.length > requiredRoles; // need at least one villager
    const numAldeoes = Math.max(0, players.length - requiredRoles);

    return (
      <div className="space-y-6">
        <div className="bg-white text-[#C679FF] p-6 rounded-[2rem] text-center shadow-xl">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-2">Lobby</h2>
          <p className="text-lg font-medium opacity-70 mb-4">{players.length} Players</p>
          <div className="flex flex-wrap justify-center gap-3">
            {players.map(p => (
              <span key={p.id} className="bg-gray-100 pl-1.5 pr-4 py-1.5 rounded-xl text-lg font-bold shadow-sm flex items-center gap-2"><Avatar name={p.name} size={28} />{p.name}</span>
            ))}
          </div>
        </div>

        <div className="bg-white text-gray-900 p-6 rounded-[2rem] shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-center text-[#C679FF] mb-6">Game Settings</h3>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold flex items-center gap-2 text-red-600"><RoleIcon role="Werewolf" className="w-5 h-5"/> Werewolves</span>
                <input type="number" min="1" max="5" value={numWolves} onChange={e => setNumWolves(Number(e.target.value))} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-lg" />
             </div>
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold flex items-center gap-2 text-purple-600"><RoleIcon role="Seer" className="w-5 h-5"/> Seers</span>
                <input type="number" min="0" max="2" value={numSeers} onChange={e => setNumSeers(Number(e.target.value))} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-lg" />
             </div>
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold flex items-center gap-2 text-emerald-600"><RoleIcon role="Doctor" className="w-5 h-5"/> Doctors</span>
                <input type="number" min="0" max="2" value={numDoctors} onChange={e => setNumDoctors(Number(e.target.value))} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-lg" />
             </div>
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold flex items-center gap-2 text-fuchsia-600"><FlaskConical className="w-5 h-5"/> Witches</span>
                <input type="number" min="0" max="1" value={numWitches} onChange={e => setNumWitches(Number(e.target.value))} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-lg" />
             </div>
             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="font-bold">Villagers (Auto-filled)</span>
                <span className="text-xl font-black text-gray-400">{numAldeoes}</span>
             </div>

             <button
                onClick={() => setFirstNightNoDeath(v => !v)}
                className={`w-full flex justify-between items-center p-4 rounded-xl border transition-colors ${firstNightNoDeath ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}
             >
                <span className="font-bold text-indigo-600 text-left">First night without deaths</span>
                <span className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${firstNightNoDeath ? 'bg-indigo-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                   <span className="w-5 h-5 bg-white rounded-full shadow" />
                </span>
             </button>

             <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                <span className="font-bold text-orange-500">Day Time (min)</span>
                <input type="number" min="1" max="15" value={dayLengthMins} onChange={e => setDayLengthMins(Number(e.target.value))} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold text-lg" />
             </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={!isReady}
            onClick={() => sendAction({ type: 'START_GAME', settings: { numWolves, numSeers, numDoctors, numWitches, dayLength: dayLengthMins * 60, firstNightNoDeath } })}
            className="flex-1 py-6 bg-orange-500 disabled:bg-gray-400 hover:bg-orange-400 rounded-2xl font-black text-xl md:text-2xl text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center uppercase tracking-wide"
          >
            {isReady ? 'Start Game' : `Not enough players`}
          </button>
          
          <button 
            onClick={() => sendAction({ type: 'ADD_BOT' })}
            className="w-1/3 py-6 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center leading-tight px-2 text-center"
          >
            <span className="text-xs md:text-sm font-medium opacity-80">Test auto</span>
            <span className="text-lg md:text-xl">+1 Bot</span>
          </button>
        </div>
      </div>
    );
  };

  const renderActivePhase = () => {
    let title = '';
    let subtitle = '';
    let phaseColor = 'text-white';
    let canAdvance = true;
    
    switch(gameState.status) {
       case 'ROLE_REVEAL':
          title = 'Role Reveal';
          subtitle = 'Players are viewing their secret identities.';
          break;
       case 'NIGHT_START':
          title = 'The City Sleeps';
          subtitle = "Click advance to start the Seer's turn.";
          break;
       case 'NIGHT_SEER':
          title = "Seer's Turn";
          subtitle = gameState.nightResult.seerSeenId ? 'The Seer has acted.' : 'Waiting for the Seer...';
          canAdvance = !!gameState.nightResult.seerSeenId || players.filter(p => p.role === 'Seer' && p.isAlive).length === 0;
          break;
       case 'NIGHT_WOLVES':
          title = "Wolves' Turn";
          const wolfVotes = Object.keys(gameState.votes).length;
          const aliveWolves = players.filter(p => p.role === 'Werewolf' && p.isAlive).length;
          subtitle = `${wolfVotes}/${aliveWolves} Wolves voted. Advance to confirm the most voted target.`;
          break;
       case 'NIGHT_DOCTOR':
          title = "Doctor's Turn";
          subtitle = gameState.nightResult.healedId ? 'Doctor saved someone.' : 'Waiting for the Doctor...';
          canAdvance = !!gameState.nightResult.healedId || players.filter(p => p.role === 'Doctor' && p.isAlive).length === 0;
          break;
       case 'NIGHT_WITCH':
          title = "Witch's Turn";
          subtitle = 'The Witch may use her life and death potions.';
          break;
       case 'DAY_ANNOUNCE':
          title = 'Sunrise';
          subtitle = "Announce the night's casualties and advance to discussion.";
          break;
       case 'DAY_DISCUSS':
          title = 'Open Discussion';
          subtitle = 'Let the players talk. The timer will close automatically or you can skip.';
          break;
       case 'DAY_VOTING':
          title = 'Lynching Vote';
          const dayVotes = Object.keys(gameState.votes).length;
          subtitle = `${dayVotes}/${alivePlayers.length} players voted. (Auto-advances when complete)`;
          canAdvance = true; // Can skip
          break;
    }

    return (
      <div className="space-y-6 text-center text-white pb-24">
        <div className="bg-white/10 backdrop-blur pb-8 p-6 rounded-3xl border border-white/20 shadow-xl">
           <h2 className={`text-4xl font-extrabold uppercase tracking-widest ${phaseColor} mb-4`}>{title}</h2>
           <p className="text-orange-100 text-lg">{subtitle}</p>
        </div>

        <button 
          onClick={() => sendAction({ type: 'NEXT_PHASE' })}
          className={`w-full py-6 rounded-2xl font-black text-2xl flex justify-center items-center gap-3 transition-transform active:scale-95 shadow-2xl ${
             canAdvance ? 'bg-orange-500 hover:bg-orange-400' : 'bg-orange-500 hover:bg-orange-400'
          }`}
        >
          <SkipForward className="w-8 h-8" /> 
          {canAdvance ? 'Advance Phase' : 'Force Advance'}
        </button>
        
        {['DAY_DISCUSS'].includes(gameState.status) && (
           <div className="mt-8">
             <div className="text-white text-6xl font-mono py-8 bg-black/30 rounded-3xl font-black shadow-inner">
               {Math.floor(gameState.timerSeconds / 60)}:{(gameState.timerSeconds % 60).toString().padStart(2, '0')}
             </div>
           </div>
        )}

        <Grimoire gameState={gameState} players={players} />
        
        {gameState.status === 'NIGHT_WOLVES' && (
           <button onClick={() => sendAction({ type: 'WOLF_CONFIRM' })} className="w-full mt-4 py-6 bg-red-600 hover:bg-red-500 rounded-2xl font-bold shadow-lg transition-transform active:scale-95 text-xl">
             Confirm Wolves' Victim
           </button>
        )}
      </div>
    );
  };

  const renderEnd = () => {
    return (
      <div className="space-y-6 text-center pb-24">
        <h2 className="text-6xl font-black mt-4 mb-4 uppercase tracking-widest text-white drop-shadow-lg">
           {gameState.winner}
        </h2>
        <h3 className="text-3xl text-purple-200 font-bold mb-12">Won!</h3>

        <div className="space-y-4 pt-6 bg-white rounded-3xl p-6 shadow-2xl">
           <h3 className="text-2xl font-black text-[#C679FF] text-left uppercase">Survivors</h3>
           {players.map(p => (
              <div key={p.id} className={`flex justify-between items-center p-4 border-2 rounded-xl ${p.isAlive ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200 opacity-60'}`}>
                 <span className="font-bold text-xl text-gray-900 flex items-center gap-3"><Avatar name={p.name} size={36} dead={!p.isAlive} />{p.name}</span>
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${getRoleColor(p.role!)} shadow-sm`}>
                    <RoleIcon role={p.role!} className="w-5 h-5" />
                    <span className="font-bold">{p.role}</span>
                 </div>
              </div>
           ))}
        </div>

        <div className="pt-12">
           <button onClick={() => sendAction({ type: 'RESTART' })} className="w-full py-6 bg-neutral-900 hover:bg-black rounded-2xl font-black text-2xl text-white shadow-xl transition-transform active:scale-95">
             New Game
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#C679FF] p-6 font-sans">
      <div className="max-w-2xl mx-auto">
        {gameState.status === 'LOBBY' && renderLobby()}
        {gameState.status !== 'LOBBY' && gameState.status !== 'END' && renderActivePhase()}
        {gameState.status === 'END' && renderEnd()}
      </div>
    </div>
  );
}

// The storyteller's grimoire: every role, who is alive, who has already acted
// this night, and the resolved night actions — the host's god view.
function Grimoire({ gameState, players }: { gameState: GameState; players: GameState['players'] }) {
  const nameOf = (id: string | null) => id ? (players.find(p => p.id === id)?.name ?? '—') : '—';
  const isNight = gameState.status.startsWith('NIGHT');
  const nr = gameState.nightResult;

  return (
    <div className="mt-8 bg-neutral-900 rounded-3xl p-6 text-left shadow-xl">
      <h3 className="font-bold text-xl mb-1 text-neutral-300 uppercase tracking-widest">Grimoire</h3>
      <p className="text-neutral-500 text-sm mb-4">Night {gameState.round} · host-only view</p>

      <div className="space-y-2">
        {players.map(p => {
          const acted = gameState.nightActed.includes(p.id);
          return (
            <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-xl border-2 ${p.isAlive ? 'border-neutral-700 bg-neutral-800' : 'border-red-900 bg-red-950 opacity-60'}`}>
              <Avatar name={p.name} size={36} dead={!p.isAlive} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate">{p.name} {p.isAlive ? '' : <span className="text-red-400 text-xs">(dead)</span>}</div>
                <div className={`text-sm font-bold ${getRoleColor(p.role ?? 'Villager').split(' ')[0].replace('bg-', 'text-')}`}>{p.role ?? '—'}</div>
              </div>
              {isNight && p.isAlive && acted && (
                <span className="text-emerald-400 text-xs font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded-full">acted ✓</span>
              )}
            </div>
          );
        })}
      </div>

      {isNight && (
        <div className="mt-5 pt-4 border-t border-neutral-800 grid grid-cols-2 gap-2 text-sm">
          <div className="text-neutral-400">🔮 Seer saw: <span className="text-white font-bold">{nameOf(nr.seerSeenId)}</span>{nr.seerResult && <span className="text-neutral-500"> ({nr.seerResult})</span>}</div>
          <div className="text-neutral-400">🐺 Wolves target: <span className="text-white font-bold">{nameOf(nr.wolfTargetId)}</span></div>
          <div className="text-neutral-400">💊 Doctor saved: <span className="text-white font-bold">{nameOf(nr.healedId)}</span></div>
          <div className="text-neutral-400">🧪 Witch save/poison: <span className="text-white font-bold">{nameOf(nr.witchSavedId)}</span> / <span className="text-white font-bold">{nameOf(nr.witchPoisonId)}</span></div>
        </div>
      )}
    </div>
  );
}
