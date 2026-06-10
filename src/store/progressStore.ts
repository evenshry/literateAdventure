import { create } from 'zustand';
import type { UserProgress, LevelId, StepId, CharProgress } from '@/types/global';
import { loadProgress, saveProgress, clearProgress } from '@/utils/db';

interface ProgressState {
  ready: boolean;
  data: UserProgress;
  init: () => Promise<void>;
  setLevel: (level: LevelId) => void;
  markStepComplete: (char: string, step: StepId) => void;
  awardStarsForChar: (char: string, stars: number) => void;
  addToWrongList: (char: string) => void;
  removeFromWrongList: (char: string) => void;
  resetAll: () => Promise<void>;
  toggleSound: () => void;
  _persist: (data: UserProgress) => Promise<void>;
}

function freshProgress(): UserProgress {
  return {
    id: 'default-user',
    currentLevel: 'L1',
    totalStars: 0,
    learnedChars: [],
    charProgress: {},
    wrongList: [],
    settings: { soundEnabled: true, voiceType: 'female' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function getCharProgress(
  state: ProgressState,
  char: string
): CharProgress {
  return (
    state.data.charProgress[char] ?? {
      char,
      steps: { recognize: false, write: false, practice: false, read: false },
      stars: 0,
      completed: false,
    });
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  ready: false,
  data: freshProgress(),

  async init() {
    const existing = await loadProgress();
    if (existing) {
      set({ data: existing, ready: true });
    } else {
      const fresh = freshProgress();
      await saveProgress(fresh);
      set({ data: fresh, ready: true });
    }
  },

  setLevel(level) {
    const state = get();
    const next = { ...state.data, currentLevel: level, updatedAt: Date.now() };
    set({ data: next });
    void state._persist(next);
  },

  markStepComplete(char, step) {
    const state = get();
    const cp = getCharProgress(state, char);
    const nextSteps = { ...cp.steps, [step]: true };
    const allDone =
      nextSteps.recognize && nextSteps.write && nextSteps.practice && nextSteps.read;
    const nextCharProgress: CharProgress = {
      ...cp,
      steps: nextSteps,
      completed: allDone || cp.completed,
      lastStudiedAt: Date.now(),
    };

    let learnedChars = state.data.learnedChars;
    if (!learnedChars.includes(char) && allDone) {
      learnedChars = [...learnedChars, char];
    }

    const nextData: UserProgress = {
      ...state.data,
      charProgress: { ...state.data.charProgress, [char]: nextCharProgress },
      learnedChars,
      updatedAt: Date.now(),
    };
    set({ data: nextData });
    void state._persist(nextData);
  },

  awardStarsForChar(char, stars) {
    const state = get();
    const cp = getCharProgress(state, char);
    const newStars = Math.max(cp.stars, stars);
    const gained = newStars - cp.stars;

    const nextCharProgress: CharProgress = { ...cp, stars: newStars };
    const nextData: UserProgress = {
      ...state.data,
      charProgress: { ...state.data.charProgress, [char]: nextCharProgress },
      totalStars: state.data.totalStars + gained,
      updatedAt: Date.now(),
    };
    set({ data: nextData });
    void state._persist(nextData);
  },

  addToWrongList(char) {
    const state = get();
    if (state.data.wrongList.includes(char)) return;
    const nextData: UserProgress = {
      ...state.data,
      wrongList: [...state.data.wrongList, char],
      updatedAt: Date.now(),
    };
    set({ data: nextData });
    void state._persist(nextData);
  },

  removeFromWrongList(char) {
    const state = get();
    if (!state.data.wrongList.includes(char)) return;
    const nextData: UserProgress = {
      ...state.data,
      wrongList: state.data.wrongList.filter((c) => c !== char),
      updatedAt: Date.now(),
    };
    set({ data: nextData });
    void state._persist(nextData);
  },

  async resetAll() {
    await clearProgress();
    const fresh = freshProgress();
    await saveProgress(fresh);
    set({ data: fresh });
  },

  toggleSound() {
    const state = get();
    const nextData: UserProgress = {
      ...state.data,
      settings: { ...state.data.settings, soundEnabled: !state.data.settings.soundEnabled },
    };
    set({ data: nextData });
    void state._persist(nextData);
  },

  async _persist(data) {
    await saveProgress(data);
  },
}));
