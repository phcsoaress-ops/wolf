import React, { useState, useEffect } from 'react';
import { GameState, ClientAction, Role, Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getRoleColor, RoleIcon, ROLE_DESCRIPTIONS } from './RoleUI';
import { Moon, Sun, User, HelpCircle, Eye, EyeOff, AlertCircle, FlaskConical, Skull, HeartPulse, Volume2, VolumeX } from 'lucide-react';
import { RoleGuide } from './RoleGuide';
import { Avatar } from './Avatar';
import { playPotion } from '../lib/audio';

import { Reaction, GhostMessage } from '../hooks/useGameClient';

export function PlayerScreen({ gameState, sendAction, myId, reactions, ghostMessages, wolfMessages, muted, onToggleMute }: { gameState: GameState, sendAction: (a: ClientAction) => void, myId: string, reactions: Reaction[], ghostMessages: GhostMessage[], wolfMessages: GhostMessage[], muted: boolean, onToggleMute: () => void }) {
  const me = gameState.players.find(p => p.id === myId);
  const [showRoleGuide, setShowRoleGuide] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [confirmVoteTarget, setConfirmVoteTarget] = useState<string | null>(null);
  const [ghostChatInput, setGhostChatInput] = useState('');
  const [wolfChatInput, setWolfChatInput] = useState('');

  // Clear leftover local UI state between phases so a stale pick from the
  // previous round can't re-open the confirm modal pre-selected.
  useEffect(() => {
    if (gameState.status !== 'DAY_VOTING') setConfirmVoteTarget(null);
    if (gameState.status === 'LOBBY') setIsRevealed(false);
  }, [gameState.status]);

  if (!me) return null;

  const renderPhase = () => {
    if (gameState.status === 'LOBBY') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
             <User className="text-white w-12 h-12 drop-shadow-md" />
          </div>
          <p className="text-2xl drop-shadow-md">Hello, <span className="font-extrabold text-orange-200">{me.name}</span>!</p>
          <p className="text-purple-100/90 font-medium text-lg mt-2">Waiting for the host to start the game...</p>
        </div>
      );
    }

    if (gameState.status === 'ROLE_REVEAL') {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center text-white relative">
           <h2 className="text-3xl font-bold text-neutral-300 drop-shadow-lg mb-8">Mystery.</h2>
           
           {isRevealed ? (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-sm rounded-3xl p-8 flex flex-col items-center shadow-2xl border-4 border-white/10 ${getRoleColor(me.role!)}`}>
                 <RoleIcon role={me.role!} className="w-24 h-24 mb-6 opacity-80" />
                 <h3 className="text-4xl font-extrabold mb-4">{me.role}</h3>
                 <p className="text-lg opacity-90 leading-snug">{ROLE_DESCRIPTIONS[me.role!]}</p>
                 <div className="mt-8 text-white/50 font-bold text-2xl">{gameState.timerSeconds}s</div>
              </motion.div>
           ) : (
              <button onClick={() => setIsRevealed(true)} className="bg-orange-500 hover:bg-orange-400 active:scale-95 transition-all text-white font-bold text-2xl py-6 px-12 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                 <Eye className="w-12 h-12" />
                 View My Role
              </button>
           )}
        </div>
      );
    }

    if (gameState.status.startsWith('NIGHT')) {
       
       if (gameState.status === 'NIGHT_START') {
         return (
            <motion.div initial={{ opacity: 0, backgroundColor: "#000" }} animate={{ opacity: 1, backgroundColor: "#0a0a0a" }} transition={{ duration: 1.5 }} className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
               <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
                  <Moon className="w-20 h-20 text-orange-800 drop-shadow-[0_0_20px_orange] mb-6 mx-auto" />
               </motion.div>
               <h2 className="text-4xl font-bold text-orange-100">The city is sleeping...</h2>
               <p className="text-orange-300/50 mt-4 text-lg">Close your eyes or wait in silence.</p>
            </motion.div>
         );
       }
       
       const isActiveSeer = gameState.status === 'NIGHT_SEER' && me.role === 'Seer' && me.isAlive;
       const isActiveWolves = gameState.status === 'NIGHT_WOLVES' && me.role === 'Werewolf' && me.isAlive;
       const isActiveDoctor = gameState.status === 'NIGHT_DOCTOR' && me.role === 'Doctor' && me.isAlive;
       const isActiveWitch = gameState.status === 'NIGHT_WITCH' && me.role === 'Witch' && me.isAlive;
       const isMyTurn = isActiveSeer || isActiveWolves || isActiveDoctor;

       if (isActiveWitch) {
         const victim = gameState.players.find(p => p.id === gameState.nightResult.wolfTargetId);
         const victimSaved = gameState.nightResult.witchSavedId === gameState.nightResult.wolfTargetId && !!gameState.nightResult.wolfTargetId;
         const poisonTargetId = gameState.nightResult.witchPoisonId;
         const poisonTarget = gameState.players.find(p => p.id === poisonTargetId);
         const canHeal = gameState.witchPotions.heal && !!victim && !victimSaved;

         return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen bg-neutral-950 flex flex-col p-6 text-white pb-28">
               <div className="text-center mb-6 relative">
                  <h2 className="text-3xl font-bold text-fuchsia-400 flex items-center justify-center gap-2"><FlaskConical className="w-7 h-7" /> Witch</h2>
                  <div className="absolute right-0 top-0 bg-white/10 px-3 py-1 rounded-full text-white font-mono font-bold">{gameState.timerSeconds}s</div>
                  <p className="text-neutral-400 mt-2">Use your potions wisely — each works only once.</p>
               </div>

               {/* Life potion */}
               <div className="mb-5 p-4 rounded-2xl bg-emerald-900/20 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3 text-emerald-300 font-bold uppercase text-sm"><HeartPulse className="w-4 h-4" /> Life potion</div>
                  {victim ? (
                     <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                           <Avatar name={victim.name} size={40} />
                           <div>
                              <p className="text-neutral-300 text-sm">The wolves attacked</p>
                              <p className="font-bold text-lg">{victim.id === me.id ? 'You' : victim.name}</p>
                           </div>
                        </div>
                        {victimSaved ? (
                           <span className="text-emerald-400 font-bold">Saved ✓</span>
                        ) : gameState.witchPotions.heal ? (
                           <button onClick={() => { playPotion(); sendAction({ type: 'WITCH_HEAL' }); }} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl font-bold active:scale-95 transition-transform">Save</button>
                        ) : (
                           <span className="text-neutral-500 text-sm">Potion used</span>
                        )}
                     </div>
                  ) : (
                     <p className="text-neutral-500">No one was attacked tonight.</p>
                  )}
               </div>

               {/* Death potion */}
               <div className="flex-1 p-4 rounded-2xl bg-red-900/20 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-3 text-red-300 font-bold uppercase text-sm"><Skull className="w-4 h-4" /> Death potion {!gameState.witchPotions.poison && '(used)'}</div>
                  {poisonTarget ? (
                     <div className="flex items-center gap-3">
                        <Avatar name={poisonTarget.name} size={40} />
                        <p className="font-bold text-lg text-red-300">{poisonTarget.name} will be poisoned</p>
                     </div>
                  ) : gameState.witchPotions.poison ? (
                     <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                        {gameState.players.filter(p => !p.isModerator && p.isAlive && p.id !== me.id).map(p => (
                           <button key={p.id} onClick={() => { playPotion(); sendAction({ type: 'WITCH_POISON', targetId: p.id }); }} className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-neutral-900 border-2 border-neutral-800 hover:bg-red-950/40 hover:border-red-800 transition-colors text-left">
                              <Avatar name={p.name} size={36} />
                              <span className="font-bold">{p.name}</span>
                           </button>
                        ))}
                     </div>
                  ) : (
                     <p className="text-neutral-500">You have no death potion left.</p>
                  )}
               </div>

               <button onClick={() => sendAction({ type: 'WITCH_PASS' })} className="fixed bottom-6 left-6 right-6 py-5 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-transform">
                  Finish the night
               </button>
            </motion.div>
         );
       }

       if (isMyTurn) {
         const aliveOthers = gameState.players.filter(p => p.id !== me.id && p.isAlive && p.role !== 'Werewolf' && !p.isModerator);
         const alivePlayersExcludingMe = gameState.players.filter(p => p.id !== me.id && p.isAlive && !p.isModerator);
         const otherWolves = gameState.players.filter(p => p.id !== me.id && p.role === 'Werewolf' && p.isAlive);

         return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen bg-neutral-950 flex flex-col p-6 text-white pb-24">
               <div className="text-center mb-8 relative">
                  <h2 className="text-3xl font-bold text-[#FF7B3E]">Your Turn: {me.role}</h2>
                  <div className="absolute right-0 top-0 bg-white/10 px-3 py-1 rounded-full text-white font-mono font-bold">
                     {gameState.timerSeconds}s
                  </div>
                  {isActiveWolves && <p className="text-neutral-400 mt-2">Choose a victim to eliminate.</p>}
                  {isActiveSeer && <p className="text-neutral-400 mt-2">Discover the identity of a player.</p>}
                  {isActiveDoctor && <p className="text-neutral-400 mt-2">Choose a player to save tonight.</p>}
               </div>

               {isActiveWolves && otherWolves.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-500/20">
                     <p className="text-red-300 text-sm mb-2 font-bold uppercase">Wolf Pack:</p>
                     <div className="flex gap-2 flex-wrap">
                        {otherWolves.map(wolf => (
                           <span key={wolf.id} className="bg-red-800/50 pl-1 pr-3 py-1 rounded-full text-sm flex items-center gap-2"><Avatar name={wolf.name} size={24} />{wolf.name}</span>
                        ))}
                     </div>
                  </div>
               )}
               
               <div className="flex-1 space-y-3">
                  {(isActiveWolves ? aliveOthers : gameState.players.filter(p => !p.isModerator && p.isAlive)).map(p => {
                     const isSelectedByMe = isActiveWolves && gameState.votes[me.id] === p.id;
                     const votesFromWolves = Object.entries(gameState.votes).filter(([voterId, targetId]) => targetId === p.id).length;
                     // Doctor cannot save the same player two nights in a row.
                     const blockedHeal = isActiveDoctor && gameState.lastHealedId === p.id;

                     return (
                        <button
                           key={p.id}
                           disabled={blockedHeal}
                           onClick={() => {
                              if (isActiveSeer) sendAction({ type: 'SEER_SEE', targetId: p.id });
                              if (isActiveWolves) sendAction({ type: 'WOLF_VOTE', targetId: p.id });
                              if (isActiveDoctor) sendAction({ type: 'DOCTOR_HEAL', targetId: p.id });
                           }}
                           className={`w-full py-5 rounded-2xl text-xl font-bold transition-all relative overflow-hidden flex items-center justify-between px-6 border-2 ${
                              blockedHeal ? 'bg-neutral-900/50 border-neutral-800 text-neutral-600 cursor-not-allowed' :
                              isSelectedByMe ? 'bg-orange-500 border-orange-400 scale-[1.02]' : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
                           }`}
                        >
                           <span className="flex items-center gap-3"><Avatar name={p.name} size={36} dead={!p.isAlive} />{p.id === me.id ? 'Yourself' : p.name}</span>
                           {blockedHeal && <span className="text-xs uppercase tracking-wide text-neutral-500">Saved last night</span>}
                           {isActiveWolves && votesFromWolves > 0 && (
                              <span className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md animate-pulse">
                                 {votesFromWolves}
                              </span>
                           )}
                        </button>
                     );
                  })}
               </div>

               {isActiveWolves && (
                  <WolfChat me={me} gameState={gameState} wolfMessages={wolfMessages} value={wolfChatInput} setValue={setWolfChatInput} sendAction={sendAction} />
               )}

               {isActiveSeer && gameState.nightResult.seerSeenId && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                     <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 max-w-sm w-full text-center space-y-6 shadow-2xl">
                        <h3 className="text-xl text-neutral-300">Your vision shows...</h3>
                        <div className="flex justify-center">
                           <Avatar name={gameState.players.find(x => x.id === gameState.nightResult.seerSeenId)?.name || '?'} size={64} />
                        </div>
                        <p className="text-3xl font-extrabold text-white">
                           {gameState.players.find(x => x.id === gameState.nightResult.seerSeenId)?.name} is a
                        </p>
                        <p className={`text-4xl font-extrabold pb-2 ${gameState.nightResult.seerResult === 'Werewolf' ? 'text-red-500' : 'text-orange-400'}`}>
                           {gameState.nightResult.seerResult === 'Werewolf' ? 'WEREWOLF' : 'VILLAGER'}
                        </p>
                        <p className="text-xs text-neutral-500 italic">The night air is thick — not every vision is true.</p>
                        <button onClick={() => sendAction({ type: 'SEER_CONFIRM' })} className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold text-lg">Done</button>
                     </div>
                  </motion.div>
               )}
            </motion.div>
         );
       }

       return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
               <Moon className="w-20 h-20 text-orange-800 drop-shadow-[0_0_20px_orange] mb-6 mx-auto" />
            </motion.div>
            <h2 className="text-4xl font-bold text-orange-100">The city is sleeping...</h2>
            <p className="text-orange-300/50 mt-4 text-lg">Wait in silence.</p>
         </motion.div>
       );
    }

    if (gameState.status === 'DAY_ANNOUNCE') {
       const diedCount = gameState.deadThisRound.length;
       return (
         <div className="min-h-screen bg-orange-900 flex flex-col items-center justify-center p-6 text-center">
            <Sun className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,1)] mb-8" />
            <h2 className="text-4xl font-bold text-white mb-6">Sun has risen!</h2>
            {diedCount === 0 ? (
               <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                  <p className="text-2xl font-medium text-emerald-300">No one died tonight!</p>
                  <p className="text-orange-200 mt-2">The doctor did a good job (or the wolves overslept).</p>
               </div>
            ) : (
               <div className="bg-red-900/40 p-6 rounded-2xl backdrop-blur-sm border border-red-500/30">
                  <p className="text-2xl font-medium text-red-300 mb-4">We had casualties:</p>
                  <div className="space-y-2">
                     {gameState.deadThisRound.map(id => (
                        <p key={id} className="text-3xl font-extrabold text-white">
                           {gameState.players.find(x => x.id === id)?.name}
                        </p>
                     ))}
                  </div>
               </div>
            )}

            {!me.isAlive && gameState.deadThisRound.includes(me.id) && (
               <div className="mt-12 bg-red-600 px-6 py-4 rounded-xl shadow-2xl animate-bounce">
                  <p className="text-white font-bold text-xl uppercase tracking-widest">You were killed!</p>
                  <p className="text-red-200 text-sm">You are now a spectator.</p>
               </div>
            )}
         </div>
       );
    }

    if (!me.isAlive && ['DAY_DISCUSS', 'DAY_VOTING'].includes(gameState.status)) {
       return (
         <div className="min-h-screen bg-neutral-900 flex flex-col p-4 text-white">
            <div className="text-center mb-4 flex-shrink-0 pt-4">
               <h2 className="text-2xl font-bold text-purple-400 font-mono tracking-widest">GHOST CHAT</h2>
               <p className="text-neutral-500 text-sm">Only other dead players can see this.</p>
            </div>

            {/* Roles Reveal for Ghosts */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-neutral-800 flex-shrink-0">
               {gameState.players.filter(p => !p.isModerator).map(p => (
                  <div key={p.id} className={`flex-shrink-0 p-2 rounded-lg text-xs font-bold w-24 text-center border flex flex-col items-center gap-1 ${p.isAlive ? 'border-neutral-700 bg-neutral-800' : 'border-red-900/50 bg-red-900/10 opacity-50'}`}>
                     <Avatar name={p.name} size={28} dead={!p.isAlive} />
                     <div className="truncate w-full">{p.name}</div>
                     <div className={`${p.role === 'Werewolf' ? 'text-red-400' : (p.role === 'Seer' ? 'text-purple-400' : (p.role === 'Doctor' ? 'text-green-400' : (p.role === 'Witch' ? 'text-fuchsia-400' : 'text-orange-400')))}`}>{p.role}</div>
                  </div>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 rounded-xl">
               {ghostMessages.map(msg => {
                  const sender = gameState.players.find(p => p.id === msg.senderId);
                  const isMe = msg.senderId === me.id;
                  return (
                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-neutral-500 mb-0.5 ml-1">{sender?.name}</span>
                        {msg.emoji ? (
                           <div className="text-3xl animate-bounce">{msg.emoji}</div>
                        ) : (
                           <div className={`px-4 py-2 rounded-2xl max-w-[80%] break-words shadow-md ${isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-neutral-800 text-neutral-200 rounded-tl-sm'}`}>
                              {msg.text}
                           </div>
                        )}
                     </div>
                  );
               })}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
               <div className="flex gap-2 overflow-x-auto pb-2">
                  {['👻', '💀', '😱', '👀', '🍿', '🤡'].map(em => (
                     <button key={em} onClick={() => sendAction({ type: 'GHOST_CHAT', emoji: em })} className="text-2xl bg-neutral-800 hover:bg-neutral-700 transition-all p-2 rounded-full flex-shrink-0">
                        {em}
                     </button>
                  ))}
               </div>
               <form onSubmit={(e) => { e.preventDefault(); if (ghostChatInput.trim()) { sendAction({ type: 'GHOST_CHAT', text: ghostChatInput.trim() }); setGhostChatInput(''); } }} className="flex gap-2">
                  <input
                     value={ghostChatInput}
                     onChange={e => setGhostChatInput(e.target.value)}
                     placeholder="Spooky message..."
                     className="flex-1 bg-neutral-800 border-2 border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors text-white"
                  />
                  <button type="submit" disabled={!ghostChatInput.trim()} className="bg-purple-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-6 rounded-xl font-bold active:scale-95 transition-transform shadow-lg">
                     Send
                  </button>
               </form>
            </div>
         </div>
       );
    }

    if (gameState.status === 'DAY_DISCUSS') {
       const m = Math.floor(gameState.timerSeconds / 60);
       const s = gameState.timerSeconds % 60;
       return (
         <div className="min-h-screen bg-[#C679FF] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <h2 className="text-4xl font-extrabold text-white drop-shadow-md mb-8 relative z-10">Discussion</h2>
            <div className="bg-white text-[#C679FF] text-7xl font-mono py-8 px-12 rounded-[2rem] shadow-2xl font-black relative z-10">
               {m}:{s.toString().padStart(2, '0')}
            </div>
            <p className="text-white font-medium text-xl mt-8 relative z-10">Who is the werewolf?</p>

            <div className="absolute inset-0 pointer-events-none flex items-end justify-center pb-40">
                <AnimatePresence>
                   {reactions.map(r => {
                      // simple deterministic but dispersed x position based on ID
                      const seed = Array.from(r.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const xOffset = (seed % 200) - 100;
                      return (
                      <motion.div key={r.id}
                        initial={{ opacity: 0, y: 50, scale: 0.5, x: xOffset }}
                        animate={{ opacity: 1, y: -200, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 2.5, ease: 'easeOut' }}
                        className="absolute text-5xl drop-shadow-lg"
                      >
                        {r.emoji}
                        <span className="block text-[10px] text-white opacity-80 mt-1 font-bold bg-black/50 rounded px-1 max-w-[60px] truncate mx-auto">
                           {gameState.players.find(p => p.id === r.senderId)?.name.split(' ')[0]}
                        </span>
                      </motion.div>
                   )})}
                </AnimatePresence>
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4 flex-wrap z-20">
                {['👀', '🤔', '🤨', '😅', '😱', '👎'].map(em => (
                   <button key={em} onClick={() => sendAction({ type: 'EMOJI_REACTION', emoji: em })} className="text-3xl bg-black/20 hover:bg-black/40 active:scale-95 transition-all p-3 rounded-full shadow-xl backdrop-blur-sm border border-white/20">
                      {em}
                   </button>
                ))}
            </div>
         </div>
       );
    }

    if (gameState.status === 'DAY_VOTING') {
       const alivePlayersCount = gameState.players.filter(p => !p.isModerator && p.isAlive).length;
       const votedCount = Object.keys(gameState.votes).length;

       if (gameState.votes[me.id]) {
         return (
            <div className="min-h-screen bg-[#C679FF] flex flex-col items-center justify-center p-6 text-center">
               <p className="text-3xl font-extrabold text-white">Vote Registered!</p>
               <p className="text-purple-100 mt-4 text-lg">Waiting for other players...</p>
               <p className="text-white font-bold bg-white/20 rounded-full px-6 py-2 mt-8 text-xl">
                  {votedCount} / {alivePlayersCount} Voted
               </p>
            </div>
         );
       }

       return (
         <div className="min-h-screen bg-[#C679FF] flex flex-col p-6 space-y-6 pb-24">
            <div className="text-center">
               <h2 className="text-4xl font-extrabold text-white mt-4 drop-shadow-md">Voting</h2>
               <p className="text-purple-100 mt-2 text-lg">Who will the village eliminate?</p>
               <p className="text-white font-bold bg-white/20 rounded-full px-4 py-1 inline-block mt-2">
                  Votes: {votedCount} / {alivePlayersCount}
               </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pt-4">
               {gameState.players.filter(p => !p.isModerator && p.isAlive).map(p => (
                  <button 
                     key={p.id}
                     onClick={() => setConfirmVoteTarget(p.id)}
                     className="w-full py-6 bg-white hover:bg-gray-100 text-[#C679FF] rounded-2xl text-2xl font-bold transition-transform active:scale-95 shadow-xl flex justify-between px-6 items-center"
                  >
                     <span>{p.name}</span>
                     {p.id === me.id && <span className="opacity-50 text-sm">(You)</span>}
                  </button>
               ))}
               <button 
                 onClick={() => setConfirmVoteTarget('skip')}
                 className="w-full py-6 bg-transparent hover:bg-white/10 text-white border-2 border-white/50 rounded-2xl text-xl font-bold transition-all active:scale-95 shadow-sm"
               >
                 Skip Vote / Do Not Lynch
               </button>
            </div>

            <AnimatePresence>
               {confirmVoteTarget && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#C679FF]/90 backdrop-blur-md">
                     <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center space-y-8 shadow-2xl">
                        <AlertCircle className="w-20 h-20 text-[#C679FF] mx-auto drop-shadow-sm" />
                        <div>
                           <h3 className="text-xl text-gray-500 font-bold uppercase">Lynching</h3>
                           <p className="text-3xl font-black text-[#C679FF] mt-2">
                              {confirmVoteTarget === 'skip' ? 'Do not lynch anyone?' : `${gameState.players.find(x => x.id === confirmVoteTarget)?.name}?`}
                           </p>
                        </div>
                        <div className="flex flex-col gap-3">
                           <button onClick={() => { sendAction({ type: 'DAY_VOTE', targetId: confirmVoteTarget }); setConfirmVoteTarget(null); }} className="w-full py-5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-xl shadow-lg transition-transform active:scale-95">Confirm</button>
                           <button onClick={() => setConfirmVoteTarget(null)} className="w-full py-5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl font-bold transition-colors">Cancel</button>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
       );
    }

    if (gameState.status === 'END') {
       const isWolfWin = gameState.winner === 'Werewolves';
       return (
         <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-6xl font-black mb-12 drop-shadow-xl uppercase tracking-widest text-[#C679FF]">
              {gameState.winner}
              <br/>
              <span className="text-4xl text-white">Won!</span>
            </h2>

            <div className="bg-neutral-900 border-2 border-neutral-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
               <h3 className="text-2xl font-bold text-neutral-300 mb-6 border-b border-neutral-700 pb-4">Your Role</h3>
               <div className="flex items-center justify-center flex-col">
                  {me.role && <RoleIcon role={me.role} className={`w-20 h-20 mb-4 ${isWolfWin ? 'text-red-500' : 'text-orange-400'}`} />}
                  <p className="text-3xl font-extrabold text-white">{me.role}</p>
               </div>
            </div>

            <p className="mt-12 text-neutral-500 text-lg font-medium">Look at the Host's screen for the summary.</p>
         </div>
       );
    }

    return null;
  };

  return (
    <>
      {renderPhase()}
      <button onClick={onToggleMute} aria-label={muted ? 'Ligar som' : 'Desligar som'} className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 border-2 border-white/20 backdrop-blur-sm">
         {muted ? <VolumeX className="w-7 h-7 text-white/90" /> : <Volume2 className="w-7 h-7 text-white/90" />}
      </button>
      <button onClick={() => setShowRoleGuide(true)} className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-orange-500 hover:bg-orange-400 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 border-2 border-orange-400/50">
         <HelpCircle className="w-8 h-8 text-white drop-shadow-md" />
      </button>
      <AnimatePresence>
         {showRoleGuide && <RoleGuide rolesInPlay={['Villager', 'Werewolf', 'Doctor', 'Seer', 'Witch']} onClose={() => setShowRoleGuide(false)} />}
      </AnimatePresence>
    </>
  );
}

// Private chat for the wolf pack at night (reuses the ghost-message channel shape).
function WolfChat({ me, gameState, wolfMessages, value, setValue, sendAction }: {
  me: Player; gameState: GameState; wolfMessages: GhostMessage[];
  value: string; setValue: (v: string) => void; sendAction: (a: ClientAction) => void;
}) {
  return (
    <div className="mt-6 bg-neutral-900/80 border border-red-900/40 rounded-2xl p-3 flex flex-col">
      <p className="text-red-300/80 text-xs font-bold uppercase tracking-wide mb-2 px-1">Pack whisper</p>
      <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
        {wolfMessages.length === 0 && <p className="text-neutral-600 text-sm px-1">Coordinate your kill in secret…</p>}
        {wolfMessages.map(msg => {
          const sender = gameState.players.find(p => p.id === msg.senderId);
          const isMe = msg.senderId === me.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar name={sender?.name || '?'} size={24} />
              <div className={`px-3 py-1.5 rounded-2xl text-sm max-w-[75%] break-words ${isMe ? 'bg-red-700 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                {msg.emoji ? <span className="text-xl">{msg.emoji}</span> : msg.text}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mb-2">
        {['🎯', '🤝', '👆', '❓', '😈'].map(em => (
          <button key={em} onClick={() => sendAction({ type: 'WOLF_CHAT', emoji: em })} className="text-lg bg-neutral-800 hover:bg-neutral-700 rounded-full w-8 h-8 flex items-center justify-center">{em}</button>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); if (value.trim()) { sendAction({ type: 'WOLF_CHAT', text: value.trim() }); setValue(''); } }} className="flex gap-2">
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="Whisper to the pack…" className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-600 text-white" />
        <button type="submit" disabled={!value.trim()} className="bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white px-4 rounded-xl font-bold text-sm active:scale-95 transition-transform">Send</button>
      </form>
    </div>
  );
}
