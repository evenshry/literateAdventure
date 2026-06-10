export type LevelId = 'L1' | 'L2' | 'L3' | 'L4';

export interface LevelInfo {
  id: LevelId;
  name: string;
  subtitle: string;
  unlockStars: number;
  bgColor: string;
}

export type StepId = 'recognize' | 'write' | 'practice' | 'read';

export interface StrokePoint {
  x: number;
  y: number;
}

export type PracticeType = 'match' | 'fill' | 'puzzle';

export interface PracticeQuestion {
  id: string;
  type: PracticeType;
  question: string;
  options: string[];
  answer: string;
  hint?: string;
}

export interface HanziData {
  char: string;
  level: LevelId;
  pinyin: string;
  tonePinyin?: string; // 带声调符号的拼音，如 "rén" vs "人"
  meaning: string;
  emoji: string;
  examples: string[];
  sentences: string[];
  practice: PracticeQuestion[];
  strokes?: StrokePoint[][];
}

export interface CharProgress {
  char: string;
  steps: Record<StepId, boolean>;
  stars: number;
  completed: boolean;
  lastStudiedAt?: number;
  recordingUrl?: string;
  wrongCount: number; // 累计答错次数，达阈值后加入错字本
}

export interface UserProgress {
  id: string;
  currentLevel: LevelId;
  totalStars: number;
  learnedChars: string[];
  charProgress: Record<string, CharProgress>;
  wrongList: string[];
  settings: {
    soundEnabled: boolean;
    voiceType: 'male' | 'female';
    musicEnabled: boolean;
    audioFeedback: boolean;
  };
  createdAt: number;
  updatedAt: number;
}
