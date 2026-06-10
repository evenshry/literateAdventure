/**
 * StrokeAnimation 组件类型定义
 */

import type { StrokePoint } from '@/types/global';

export interface StrokeAnimationProps {
  strokes: StrokePoint[][];
  width?: number;
  height?: number;
  onComplete?: () => void;
}
