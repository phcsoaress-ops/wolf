import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Moon } from 'lucide-react';
import { initAudio } from '../lib/audio';

export function JoinScreen({ onJoin }: { onJoin: (name: string, isMod: boolean, roomCode: string) => void }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="min-h-screen bg-[#C679FF] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-white/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <Moon className="w-16 h-16 mx-auto text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-md">Werewolf</h1>
          <p className="text-purple-100 font-medium">Who will you save tonight?</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-white text-[#C679FF] font-bold placeholder:text-[#C679FF]/50 border-none rounded-2xl px-4 py-5 text-xl outline-none focus:ring-4 focus:ring-white/50 transition-all text-center shadow-lg"
            autoFocus
          />

          <input
            type="text"
            placeholder="Room code (e.g. SALA1)"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
            className="w-full bg-white/90 text-[#C679FF] font-bold tracking-widest placeholder:text-[#C679FF]/50 placeholder:tracking-normal border-none rounded-2xl px-4 py-4 text-lg outline-none focus:ring-4 focus:ring-white/50 transition-all text-center shadow-lg uppercase"
          />

          <button
            onClick={() => {
              if (name.trim()) {
                initAudio();
                onJoin(name.trim(), false, roomCode.trim());
              }
            }}
            disabled={!name.trim()}
            className="w-full bg-orange-500 disabled:bg-gray-400 disabled:opacity-80 hover:bg-orange-400 shadow-xl disabled:cursor-not-allowed text-white font-bold text-xl py-5 rounded-2xl transition-all active:scale-95"
          >
            Join Game
          </button>
        </div>

        <div className="pt-8 text-center space-y-4">
          <button
            onClick={() => {
              if (name.trim()) {
                initAudio();
                onJoin(name.trim(), true, roomCode.trim());
              }
            }}
            className="w-full text-purple-100 hover:text-white font-medium text-sm py-2 underline underline-offset-4 opacity-80"
          >
             I am the Moderator
          </button>
          <p className="text-xs text-white/70 bg-white/10 p-4 rounded-2xl backdrop-blur-[2px] shadow-sm font-medium border border-white/20">
            Use the same room code to play together. Leave it blank to join the default room (MAIN).
            Tip: to test alone, open 2 tabs with the same code — one Moderator (to add bots), one Player.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
