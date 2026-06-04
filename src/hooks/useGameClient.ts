import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, ClientAction, Role } from '../types';

let socket: Socket;

// Connect once
function getSocket() {
  if (!socket) {
    socket = io(window.location.origin);
  }
  return socket;
}

export interface Reaction {
  id: string;
  emoji: string;
  senderId: string;
  timestamp: number;
}

export interface GhostMessage {
  id: string;
  text?: string;
  emoji?: string;
  senderId: string;
  timestamp: number;
}

export function useGameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [ghostMessages, setGhostMessages] = useState<GhostMessage[]>([]);
  const [wolfMessages, setWolfMessages] = useState<GhostMessage[]>([]);

  useEffect(() => {
    const s = getSocket();
    
    s.on('connect', () => {
      setMyId(s.id!);
    });

    s.on('gameState', (state: GameState) => {
      setGameState(state);
    });

    s.on('emojiReaction', (reaction: Reaction) => {
       setReactions(prev => [...prev, reaction]);
       setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== reaction.id));
       }, 3000);
    });

    s.on('ghostMessage', (msg: GhostMessage) => {
       setGhostMessages(prev => [...prev, msg].slice(-50)); // keep last 50
    });

    s.on('wolfMessage', (msg: GhostMessage) => {
       setWolfMessages(prev => [...prev, msg].slice(-50));
    });

    s.on('actionError', (payload: { message: string }) => {
       setError(payload.message);
       setTimeout(() => setError(null), 4000);
    });

    return () => {
      s.off('connect');
      s.off('gameState');
      s.off('emojiReaction');
      s.off('ghostMessage');
      s.off('wolfMessage');
      s.off('actionError');
    };
  }, []);

  const sendAction = (action: ClientAction) => {
    getSocket().emit('action', action);
  };

  return {
    gameState,
    myId,
    reactions,
    ghostMessages,
    wolfMessages,
    sendAction,
    error
  };
}
