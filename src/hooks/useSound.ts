import { useCallback } from 'react';
import { useProgressStore } from '@/store/progressStore';
import * as sound from '@/utils/sound';

/**
 * 使用音效的 Hook，自动遵循用户设置
 * 仅在 audioFeedback 为 true 时播放音效
 */
export function useSound() {
  // 只订阅设置项，避免进度数据更新时所有使用音效的组件重渲染
  const audioFeedback = useProgressStore((s) => s.data.settings.audioFeedback);
  const soundEnabled = useProgressStore((s) => s.data.settings.soundEnabled);

  const enabled = audioFeedback && soundEnabled;

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
