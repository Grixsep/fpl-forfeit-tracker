// src/types.ts
import { Period } from "@/utils/fpl";

export interface Team {
  id: number;
  name: string;
  playerName: string;
  totalScore: number;
  currentPeriodScore?: number;
  lastPeriodScore?: number;
}

export interface FPLData {
  currentGameweek: number;
  currentPeriod: Period;
  currentPeriodLeaderboard: Team[];
  lastPeriodLeaderboard: Team[];
  lastLoser: string | null;
  leagueName?: string;
  forfeitHistory?: {
    period: Period;
    forfeit: string;
    loser: string;
  }[];
}
