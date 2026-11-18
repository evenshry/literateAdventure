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
  addWrong: (char: string) => void;
  addToWrongList: (char: string) => void;
  removeFromWrongList: (char: string) => void;
  resetAll: () => Promise<void>;
  toggleSound: () => void;
  toggleAudioFeedback: () => void;
}

// IndexedDB 写入串行化：并发写入容易因完成顺序不确定而互相覆盖，
// 这里用一条 Promise 链保证顺序，并合并短时间内的连续写入。
let persistChain: Promise<void> = Promise.resolve();
let pendingData: UserProgress | null = null;

function schedulePersist(data: UserProgress): Promise<void> {
  pendingData = data;
  persistChain = persistChain.then(async () => {
    while (pendingData) {
      const snapshot = pendingData;
      pendingData = null;
      try {
        await saveProgress(snapshot);
      } catch (e) {
        console.error('[progress] 保存进度失败', e);
      }
    }
  });
  return persistChain;
}

function freshProgress(): UserProgress {
  return {
    id: 'default-user',
    currentLevel: 'L1',
    totalStars: 0,
    learnedChars: [],
    charProgress: {},
    wrongList: [],
    settings: { soundEnabled: true, voiceType: 'female', musicEnabled: true, audioFeedback: true },
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
      steps: { play: false, recognize: false, write: false, practice: false, read: false },
      stars: 0,
      completed: false,
      wrongCount: 0,
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
    void schedulePersist(next);
  },

  markStepComplete(char, step) {
    const state = get();
    const cp = getCharProgress(state, char);
    const nextSteps = { ...cp.steps, [step]: true };
    const allDone =
      nextSteps.play && nextSteps.recognize && nextSteps.write && nextSteps.practice && nextSteps.read;
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

    // 字全部学会后自动移出错字本
    const wasInWrongList = state.data.wrongList.includes(char);
    const wrongList = wasInWrongList && allDone
      ? state.data.wrongList.filter((c) => c !== char)
      : state.data.wrongList;

    const nextData: UserProgress = {
      ...state.data,
      charProgress: { ...state.data.charProgress, [char]: nextCharProgress },
      learnedChars,
      wrongList,
      updatedAt: Date.now(),
    };
    set({ data: nextData });
    void schedulePersist(nextData);
  },

  addWrong(char) {
    const state = get();
    const cp = getCharProgress(state, char);
    const nextCharProgress: CharProgress = { ...cp, wrongCount: cp.wrongCount + 1 };

    const alreadyInWrongList = state.data.wrongList.includes(char);
    const wrongList = alreadyInWrongList
      ? state.data.wrongList
      : [...state.data.wrongList, char];

    const nextData: UserProgress = {
      ...state.data,
      charProgress: { ...state.data.charProgress, [char]: nextCharProgress },
      wrongList,
      updatedAt: Date.now(),
    };
    set({ data: nextData });
    void schedulePersist(nextData);
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
    void schedulePersist(nextData);
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
    void schedulePersist(nextData);
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
    void schedulePersist(nextData);
  },

  async resetAll() {
    // 等待已排队的写入完成，避免清空后又被旧数据覆盖
    await persistChain;
    pendingData = null;
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
    void schedulePersist(nextData);
  },

  toggleAudioFeedback() {
    const state = get();
    const nextData: UserProgress = {
      ...state.data,
      settings: { ...state.data.settings, audioFeedback: !state.data.settings.audioFeedback },
    };
    set({ data: nextData });
    void schedulePersist(nextData);
  },
}));
