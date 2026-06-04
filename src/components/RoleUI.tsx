import React from 'react';
import { Ghost, Eye, HeartPulse, User, FlaskConical } from 'lucide-react';
import { Role } from '../types';

export function RoleIcon({ role, className }: { role: Role; className?: string }) {
  switch (role) {
    case 'Werewolf': return <Ghost className={className} />;
    case 'Seer': return <Eye className={className} />;
    case 'Doctor': return <HeartPulse className={className} />;
    case 'Witch': return <FlaskConical className={className} />;
    case 'Villager': return <User className={className} />;
    default: return null;
  }
}

export function getRoleColor(role: Role) {
  switch (role) {
    case 'Werewolf': return 'bg-red-600 text-white';
    case 'Seer': return 'bg-purple-600 text-white';
    case 'Doctor': return 'bg-emerald-600 text-white';
    case 'Witch': return 'bg-fuchsia-600 text-white';
    case 'Villager': return 'bg-orange-500 text-white';
    default: return 'bg-gray-200 text-black';
  }
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Werewolf: 'Wakes up at night to choose a player to eliminate.',
  Seer: "Wakes up at night to discover someone's true identity (Werewolf or Villager). Beware: visions can be clouded.",
  Doctor: 'Wakes up at night to choose a player to protect from an attack.',
  Witch: 'Knows the wolves’ victim. Has one life potion (save the victim) and one death potion (kill anyone) — each usable only once.',
  Villager: 'Sleeps at night. Try to find the werewolves and vote during the day.'
};
