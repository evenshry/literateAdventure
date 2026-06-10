/**
 * StepRecognize 组件类型定义
 */

import type { HanziData } from '@/types/global';

export interface StepRecognizeProps {
  hanzi: HanziData;
  completed: boolean;
  onComplete: () => void;
}
