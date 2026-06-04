import React from 'react';
import { Role } from '../types';
import { ROLE_DESCRIPTIONS, RoleIcon, getRoleColor } from './RoleUI';
import { X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoleGuideProps {
  rolesInPlay: Role[];
  onClose: () => void;
}

export function RoleGuide({ rolesInPlay, onClose }: RoleGuideProps) {
  // Use unique roles since some might be duplicated (e.g., 2 Werewolves, 3 Villagers)
  const uniqueRoles = Array.from(new Set(rolesInPlay));

  return (
    <motion.div
       initial={{ opacity: 0, scale: 0.95 }} 
       animate={{ opacity: 1, scale: 1 }} 
       exit={{ opacity: 0, scale: 0.95 }}
       className="fixed inset-0 bg-neutral-950/95 z-[100] p-6 flex flex-col overflow-y-auto backdrop-blur-md"
    >
      <div className="flex justify-between items-center mb-8 pt-4">
         <div>
            <h2 className="text-3xl font-bold text-white mb-2">Roles in Play</h2>
            <p className="text-neutral-400">Guide to characters and their roles for this match.</p>
         </div>
         <button onClick={onClose} className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
         </button>
      </div>

      <div className="space-y-4 pb-12 w-full max-w-lg mx-auto">
         {uniqueRoles.map(r => (
            <div key={r} className="flex gap-4 p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80">
               <div className={`mt-1 flex-shrink-0 p-4 rounded-xl text-white shadow-lg ${getRoleColor(r)}`}>
                  <RoleIcon role={r} className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">{r}</h3>
                  <p className="text-neutral-400 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
               </div>
            </div>
         ))}
         
         {uniqueRoles.length === 0 && (
           <div className="text-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800">
             <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
             <p className="text-neutral-400 text-lg">The moderator hasn't started the match yet and the roles haven't been set.</p>
           </div>
         )}
      </div>
    </motion.div>
  );
}
