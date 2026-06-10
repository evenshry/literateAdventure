import type { StrokePoint } from '@/types/global';
import { L1_STROKES } from './strokes/L1';
import { L2_STROKES } from './strokes/L2';
import { L3_STROKES } from './strokes/L3';
import { L4_STROKES } from './strokes/L4';

/**
 * 笔顺数据（合并所有级别）
 * 坐标系：左上 (0,0) → 右下 (100,100)
 * 每条笔画的起点为起笔位置，按真实书写顺序排列
 */
export const STROKES: Record<string, StrokePoint[][]> = {
  ...L1_STROKES,
  ...L2_STROKES,
  ...L3_STROKES,
  ...L4_STROKES,
};

export function getStrokeData(char: string): StrokePoint[][] | undefined {
  return STROKES[char];
}

export function getStrokeCount(char: string): number {
  return STROKES[char]?.length || 0;
}
