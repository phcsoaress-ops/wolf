export type Role = 'Villager' | 'Werewolf' | 'Doctor' | 'Seer' | 'Witch';

export type GamePhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'NIGHT_START'
  | 'NIGHT_SEER'
  | 'NIGHT_WOLVES'
  | 'NIGHT_DOCTOR'
  | 'NIGHT_WITCH'
  | 'DAY_ANNOUNCE'
  | 'DAY_DISCUSS'
  | 'DAY_VOTING'
  | 'END';

export interface Player {
  id: string;
  name: string;
  socketId: string;
  isModerator: boolean;
  isAlive: boolean;
  role: Role | null;
  isBot?: boolean;
}

export interface GameState {
  status: GamePhase;
  players: Player[];
  timerSeconds: number;
  votes: Record<string, string>; // Used for Wolf votes and Day votes (voterId -> targetId)
  nightResult: {
    healedId: string | null;
    wolfTargetId: string | null;
    seerSeenId: string | null;
    seerResult: 'Werewolf' | 'Villager' | null; // reading shown to the Seer (may be corrupted)
    witchSavedId: string | null;                // victim the Witch chose to save this night
    witchPoisonId: string | null;               // player the Witch chose to poison this night
  };
  witchPotions: { heal: boolean; poison: boolean }; // remaining single-use potions
  lastHealedId: string | null; // who the Doctor saved last night (cannot repeat)
  deadThisRound: string[];
  nightActed: string[]; // ids of players who completed their night action (host indicator)
  round: number;        // 1-based night counter (drives "first night, no death")
  winner: 'Villagers' | 'Werewolves' | null;
  // Monotonic phase counter. Bumped on every phase transition so stale, delayed
  // bot timeouts can detect that the game already moved on and abort.
  seq: number;
  settings: {
    numWolves: number;
    numSeers: number;
    numDoctors: number;
    numWitches: number;
    dayLength: number;
    firstNightNoDeath: boolean;
  };
}

export type ClientAction =
  | { type: 'JOIN'; name: string; isModerator: boolean; roomCode: string }
  | { type: 'START_GAME'; settings: GameState['settings'] }
  | { type: 'NEXT_PHASE' } // Moderator manual advance
  | { type: 'SKIP_TO_VOTE' } // Any living player can end the discussion early
  | { type: 'SEER_SEE'; targetId: string }
  | { type: 'SEER_CONFIRM' }
  | { type: 'WOLF_VOTE'; targetId: string }
  | { type: 'WOLF_CONFIRM' } // Wolves lock in their kill
  | { type: 'WOLF_CHAT'; text?: string; emoji?: string } // private wolf pack chat at night
  | { type: 'DOCTOR_HEAL'; targetId: string }
  | { type: 'WITCH_HEAL' }                  // use the life potion on tonight's victim
  | { type: 'WITCH_POISON'; targetId: string } // use the death potion on a player
  | { type: 'WITCH_PASS' }                  // finish the Witch's turn
  | { type: 'DAY_VOTE'; targetId: string }
  | { type: 'ADD_BOT' }
  | { type: 'RESTART' }
  | { type: 'EMOJI_REACTION'; emoji: string }
  | { type: 'GHOST_CHAT'; text?: string; emoji?: string };
