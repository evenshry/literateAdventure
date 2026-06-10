/**
 * 步骤组件共享 Props 类型
 */
import type { HanziData } from '@/types/global';

export interface StepProps {
  hanzi: HanziData;
  completed: boolean;
  onComplete: () => void;
}

// 为各步骤组件提供向后兼容的类型别名
export type StepRecognizeProps = StepProps;
export type StepWriteProps = StepProps;
export type StepPracticeProps = StepProps;
export type StepReadProps = StepProps;
