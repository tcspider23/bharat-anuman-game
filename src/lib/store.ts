"use client";

import { useEffect, useState } from "react";

// Settings (persisted in localStorage)
export type Settings = {
  language: "en" | "hi" | "hinglish" | "ta";
  voiceAssistant: boolean;
  microphone: boolean;
  music: boolean;
  volume: number;
  soundEffects: boolean;
  animations: boolean;
  reducedMotion: boolean;
  theme: "dark" | "light";
  currentTrack: number;
};

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  voiceAssistant: false,
  microphone: false,
  music: false,
  volume: 0.5,
  soundEffects: true,
  animations: true,
  reducedMotion: false,
  theme: "dark",
  currentTrack: 0,
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("ba_settings");
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ba_settings", JSON.stringify(s));
}

// Stats
export type Stats = {
  gamesPlayed: number;
  correctGuesses: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  totalQuestions: number;
  personalitiesLearned: number;
  categoryMastery: Record<string, { played: number; won: number }>;
  level: number;
  xp: number;
};

export const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  correctGuesses: 0,
  totalScore: 0,
  bestScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalQuestions: 0,
  personalitiesLearned: 0,
  categoryMastery: {},
  level: 1,
  xp: 0,
};

export function loadStats(): Stats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem("ba_stats");
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(s: Stats) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ba_stats", JSON.stringify(s));
}

// History
export type HistoryEntry = {
  personalityName: string;
  category: string;
  questions: number;
  confidence: number;
  score: number;
  result: "win" | "loss";
  date: string;
};

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ba_history");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  list.unshift(entry);
  localStorage.setItem("ba_history", JSON.stringify(list.slice(0, 50)));
}

// Achievements
export type AchievementId =
  | "firstGuess"
  | "under10"
  | "perfect"
  | "threeNoSurvivor"
  | "threeYesCelebration"
  | "comebackKing"
  | "knowledgeBuilder"
  | "cricketMaster"
  | "bollywoodExpert"
  | "sportsMaster"
  | "musicMaster"
  | "businessMaster"
  | "impossibleGuess";

export type Achievement = {
  id: AchievementId;
  emoji: string;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "firstGuess", emoji: "🎯", title: "First Guess", description: "Win your first game" },
  { id: "under10", emoji: "⚡", title: "Speed Detective", description: "Win in under 10 questions" },
  { id: "perfect", emoji: "💯", title: "Perfect Prediction", description: "Win with > 90% confidence" },
  { id: "threeNoSurvivor", emoji: "🧠", title: "Three NO Survivor", description: "Win after 3 consecutive NOs" },
  { id: "threeYesCelebration", emoji: "🎉", title: "Three YES Celebration", description: "Win after 3 consecutive YESes" },
  { id: "comebackKing", emoji: "👑", title: "Comeback King", description: "Win in Comeback Mode" },
  { id: "knowledgeBuilder", emoji: "📚", title: "Knowledge Builder", description: "Teach 5 new personalities" },
  { id: "cricketMaster", emoji: "🏏", title: "Cricket Master", description: "Win 5 Cricket games" },
  { id: "bollywoodExpert", emoji: "🎬", title: "Bollywood Expert", description: "Win 5 Bollywood games" },
  { id: "sportsMaster", emoji: "🏆", title: "Sports Master", description: "Win 5 Sports games" },
  { id: "musicMaster", emoji: "🎤", title: "Music Master", description: "Win 5 Music games" },
  { id: "businessMaster", emoji: "💼", title: "Business Master", description: "Win 5 Business games" },
  { id: "impossibleGuess", emoji: "🌟", title: "Impossible Guess", description: "Win a Challenge game" },
];

export function loadUnlockedAchievements(): AchievementId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("ba_achievements");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function unlockAchievement(id: AchievementId): boolean {
  if (typeof window === "undefined") return false;
  const list = loadUnlockedAchievements();
  if (list.includes(id)) return false;
  list.push(id);
  localStorage.setItem("ba_achievements", JSON.stringify(list));
  return true;
}

// Reset
export function resetAll() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ba_stats");
  localStorage.removeItem("ba_history");
  localStorage.removeItem("ba_achievements");
  localStorage.removeItem("ba_user_personalities");
}

// React hook for persistent state
export function usePersistentState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch { /* empty */ }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch { /* empty */ }
  }, [key, state]);

  return [state, setState];
}
