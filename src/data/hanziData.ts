import type { LevelInfo, HanziData, LevelId, Language } from '@/types/global';
import { L1_DATA, L1_CHARS } from './levels/L1';
import { L2_DATA, L2_CHARS } from './levels/L2';
import { L3_DATA, L3_CHARS } from './levels/L3';
import { L4_DATA, L4_CHARS } from './levels/L4';
import { EN1_DATA, EN1_CHARS } from './levels/EN1';
import { EN2_DATA, EN2_CHARS } from './levels/EN2';
import { EN3_DATA, EN3_CHARS } from './levels/EN3';
import { EN4_DATA, EN4_CHARS } from './levels/EN4';
import { getTonePinyin } from '@/utils/pinyin';

/**
 * Raw level infos (English display names). UI should localize via i18n if
 * needed by reading LEVELS[i].id → `island.<ID>.name/subtitle` keys.
 */
export const LEVELS: LevelInfo[] = [
  { id: 'L1', name: '启蒙岛', subtitle: '认识最基础的汉字', unlockStars: 0, bgColor: '#e8f5e0' },
  { id: 'L2', name: '基础岛', subtitle: '日常生活常用字', unlockStars: 30, bgColor: '#fff5d6' },
  { id: 'L3', name: '成长岛', subtitle: '动物花草好伙伴', unlockStars: 90, bgColor: '#f5e0ff' },
  { id: 'L4', name: '进阶岛', subtitle: '动作情感真丰富', unlockStars: 180, bgColor: '#e0f0ff' },
  { id: 'EN1', name: 'ABC Island', subtitle: 'Meet the 26 letters', unlockStars: 0, bgColor: '#d9f3ff' },
  { id: 'EN2', name: 'Word Garden', subtitle: 'Easy 3-letter words', unlockStars: 30, bgColor: '#ffe2d9' },
  { id: 'EN3', name: 'Sight-World', subtitle: 'Common sight words', unlockStars: 90, bgColor: '#e6ffe0' },
  { id: 'EN4', name: 'Story Cove', subtitle: 'Short phrases & sentences', unlockStars: 180, bgColor: '#f5e6ff' },
];

/** Attach tonePinyin for Chinese characters (English data leaves pinyin as IPA). */
function withTonePinyin(data: HanziData[]): HanziData[] {
  return data.map((item) => ({
    ...item,
    tonePinyin:
      item.level.startsWith('EN') || !item.char ? undefined : getTonePinyin(item.char),
  }));
}

const ALL_DATA: HanziData[] = [
  ...withTonePinyin([...L1_DATA, ...L2_DATA, ...L3_DATA, ...L4_DATA]),
  ...EN1_DATA,
  ...EN2_DATA,
  ...EN3_DATA,
  ...EN4_DATA,
];

export const HANZI_DB: Record<string, HanziData> = ALL_DATA.reduce(
  (acc, hanzi) => {
    acc[hanzi.char] = hanzi;
    return acc;
  },
  {} as Record<string, HanziData>
);

const CHARS_BY_LEVEL: Record<LevelId, string[]> = {
  L1: L1_CHARS,
  L2: L2_CHARS,
  L3: L3_CHARS,
  L4: L4_CHARS,
  EN1: EN1_CHARS,
  EN2: EN2_CHARS,
  EN3: EN3_CHARS,
  EN4: EN4_CHARS,
};

const DATA_BY_LEVEL: Record<LevelId, HanziData[]> = {
  L1: withTonePinyin(L1_DATA),
  L2: withTonePinyin(L2_DATA),
  L3: withTonePinyin(L3_DATA),
  L4: withTonePinyin(L4_DATA),
  EN1: EN1_DATA,
  EN2: EN2_DATA,
  EN3: EN3_DATA,
  EN4: EN4_DATA,
};

export function getHanzi(char: string): HanziData | undefined {
  return HANZI_DB[char];
}

export function getLevelChars(level: LevelId): HanziData[] {
  return DATA_BY_LEVEL[level] ?? [];
}

export function getLevel(id: LevelId): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getAllHanzis(language?: Language): HanziData[] {
  if (!language) return ALL_DATA;
  return ALL_DATA.filter((h) =>
    language === 'zh' ? !h.level.startsWith('EN') : h.level.startsWith('EN')
  );
}

export function getTotalCharCount(language?: Language): number {
  return getAllHanzis(language).length;
}

export function getLevelsForLanguage(language: Language): LevelInfo[] {
  return LEVELS.filter((l) =>
    language === 'zh' ? !l.id.startsWith('EN') : l.id.startsWith('EN')
  );
}

export function isEnglishChar(char: string): boolean {
  const h = HANZI_DB[char];
  return !!h && h.level.startsWith('EN');
}
