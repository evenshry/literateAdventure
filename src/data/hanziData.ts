import type { LevelInfo, HanziData, LevelId, Language } from '@/types/global';
import { L1_DATA } from './levels/L1';
import { L2_DATA } from './levels/L2';
import { L3_DATA } from './levels/L3';
import { L4_DATA } from './levels/L4';
import { EN1_DATA } from './levels/EN1';
import { EN2_DATA } from './levels/EN2';
import { EN3_DATA } from './levels/EN3';
import { EN4_DATA } from './levels/EN4';
import { getTonePinyin } from '@/utils/pinyin';

/**
 * 关卡信息（数据里的名字只作为默认值，界面按语言用 i18n 的 island.<ID> 覆盖）
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

const LEVEL_ORDER: LevelId[] = ['L1', 'L2', 'L3', 'L4', 'EN1', 'EN2', 'EN3', 'EN4'];

/** 为中文字符补充带声调的拼音（英文数据保留原有音标） */
function withTonePinyin(data: HanziData[]): HanziData[] {
  return data.map((item) => ({
    ...item,
    tonePinyin:
      item.level.startsWith('EN') || !item.char ? undefined : getTonePinyin(item.char),
  }));
}

const RAW_BY_LEVEL: Record<LevelId, HanziData[]> = {
  L1: withTonePinyin(L1_DATA),
  L2: withTonePinyin(L2_DATA),
  L3: withTonePinyin(L3_DATA),
  L4: withTonePinyin(L4_DATA),
  EN1: EN1_DATA,
  EN2: EN2_DATA,
  EN3: EN3_DATA,
  EN4: EN4_DATA,
};

/**
 * 每个字只归属一个关卡：后出现的重复字（如 L1/L2 都有「水」）会被去掉，
 * 否则 HANZI_DB 会被后者覆盖，学习进度也会因为按字符记录而互相串联。
 */
const DATA_BY_LEVEL = (() => {
  const seen = new Set<string>();
  const result = {} as Record<LevelId, HanziData[]>;
  for (const level of LEVEL_ORDER) {
    result[level] = RAW_BY_LEVEL[level].filter((item) => {
      if (seen.has(item.char)) return false;
      seen.add(item.char);
      return true;
    });
  }
  return result;
})();

const ALL_DATA: HanziData[] = LEVEL_ORDER.flatMap((level) => DATA_BY_LEVEL[level]);

export const HANZI_DB: Record<string, HanziData> = ALL_DATA.reduce(
  (acc, hanzi) => {
    acc[hanzi.char] = hanzi;
    return acc;
  },
  {} as Record<string, HanziData>
);

export function getHanzi(char: string): HanziData | undefined {
  return HANZI_DB[char];
}

export function getLevelChars(level: LevelId): HanziData[] {
  return DATA_BY_LEVEL[level] ?? [];
}

export function getLevel(id: LevelId): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getLevelsForLanguage(language: Language): LevelInfo[] {
  return LEVELS.filter((l) =>
    language === 'zh' ? !l.id.startsWith('EN') : l.id.startsWith('EN')
  );
}
