/**
 * StepWrite 组件类型定义
 */

import type { HanziData } from '@/types/global';

export interface StepWriteProps {
  hanzi: HanziData;
  completed: boolean;
  onComplete: () => void;
}
