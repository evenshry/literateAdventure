import { useCallback } from 'react';
import { useProgressStore } from '@/store/progressStore';
import * as sound from '@/utils/sound';

/**
 * 使用音效的 Hook，自动遵循用户设置
 * 仅在 audioFeedback 为 true 时播放音效
 */
export function useSound() {
  const { data } = useProgressStore();
  const enabled = data.settings.audioFeedback && data.settings.soundEnabled;

  const playCorrect = useCallback(() => {
    if (enabled) sound.playCorrect();
  }, [enabled]);

  const playWrong = useCallback(() => {
    if (enabled) sound.playWrong();
  }, [enabled]);

  const playComplete = useCallback(() => {
    if (enabled) sound.playComplete();
  }, [enabled]);

  const playStar = useCallback(() => {
    if (enabled) sound.playStar();
  }, [enabled]);

  const playClick = useCallback(() => {
    if (enabled) sound.playClick();
  }, [enabled]);

  const playSelect = useCallback(() => {
    if (enabled) sound.playSelect();
  }, [enabled]);

  return { playCorrect, playWrong, playComplete, playStar, playClick, playSelect, enabled };
}
