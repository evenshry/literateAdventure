import type { HanziData } from '@/types/global';

export interface StepPlayProps {
  hanzi: HanziData;
  completed: boolean;
  onComplete: () => void;
}
