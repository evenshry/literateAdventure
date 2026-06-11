import type { LevelInfo, HanziData, LevelId, StrokePoint } from '@/types/global';
import { L1_DATA, L1_CHARS } from './levels/L1';
import { L2_DATA, L2_CHARS } from './levels/L2';
import { L3_DATA, L3_CHARS } from './levels/L3';
import { L4_DATA, L4_CHARS } from './levels/L4';
import { getTonePinyin } from '@/utils/pinyin';

export const LEVELS: LevelInfo[] = [
  {
    id: 'L1',
    name: '启蒙岛',
    subtitle: '认识最基础的汉字',
    unlockStars: 0,
    bgColor: '#e8f5e0',
  },
  {
    id: 'L2',
    name: '基础岛',
    subtitle: '日常生活常用字',
    unlockStars: 30,
    bgColor: '#fff5d6',
  },
  {
    id: 'L3',
    name: '成长岛',
    subtitle: '动物花草好伙伴',
    unlockStars: 90,
    bgColor: '#f5e0ff',
  },
  {
    id: 'L4',
    name: '进阶岛',
    subtitle: '动作情感真丰富',
    unlockStars: 180,
    bgColor: '#e0f0ff',
  },
];

/** 将字库数据与笔顺数据合并，每条 HanziData 都内嵌 strokes 和 tonePinyin 字段 */
const ALL_DATA: HanziData[] = [...L1_DATA, ...L2_DATA, ...L3_DATA, ...L4_DATA].map(
  (hanzi): HanziData => ({
    ...hanzi,
    tonePinyin: getTonePinyin(hanzi.char),
  })
);

export const HANZI_DB: Record<string, HanziData> = ALL_DATA.reduce(
  (acc, hanzi) => {
    acc[hanzi.char] = hanzi;
    return acc;
  },
  {} as Record<string, HanziData>
);

export const LEVEL_CHARS: Record<LevelId, string[]> = {
  L1: L1_CHARS,
  L2: L2_CHARS,
  L3: L3_CHARS,
  L4: L4_CHARS,
};

export function getHanzi(char: string): HanziData | undefined {
  return HANZI_DB[char];
}

export function getLevelChars(level: LevelId): HanziData[] {
  return LEVEL_CHARS[level].map((c) => HANZI_DB[c]).filter(Boolean);
}

export function getLevel(id: LevelId): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getAllHanzis(): HanziData[] {
  return ALL_DATA;
}

export function getTotalCharCount(): number {
  return ALL_DATA.length;
}
