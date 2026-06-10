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
