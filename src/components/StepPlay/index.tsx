import { useState } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import type { StepPlayProps } from './types';
import ShooterGame from './ShooterGame';
import styles from './index.module.scss';

function StepPlay({ hanzi, completed, onComplete }: StepPlayProps) {
  const [gameCompleted, setGameCompleted] = useState(false);
  const { playClick } = useSound();

  function handleGameComplete() {
    playClick();
    setGameCompleted(true);
    void speak(`太棒了！${hanzi.char}字打靶成功！继续学习吧！`, { rate: 0.9 });
    onComplete();
  }

  function handleSkip() {
    playClick();
    void speak('跳过游戏，直接开始学习。', { rate: 0.9 });
    onComplete();
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>🎯 先玩一玩</h3>
      <p className={styles.subtitle}>汉字打靶：瞄准正确的字，击中得分！</p>

      <div className={styles.gameArea}>
        <ShooterGame
          hanzi={hanzi}
          onComplete={handleGameComplete}
        />
      </div>

      {completed && !gameCompleted && (
        <div className={styles.alreadyDone}>
          <span className={styles.doneIcon}>✓</span>
          <span>游戏已完成</span>
          <button className={styles.skipBtn} onClick={handleSkip}>
            跳过游戏
          </button>
        </div>
      )}
    </div>
  );
}

export default StepPlay;
