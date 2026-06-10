/**
 * StepRead 组件类型定义
 */

import type { HanziData } from '@/types/global';

export interface StepReadProps {
  hanzi: HanziData;
  completed: boolean;
  onComplete: () => void;
}
