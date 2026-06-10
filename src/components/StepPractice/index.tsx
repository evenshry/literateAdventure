import { useState, useEffect, useRef } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import { useProgressStore } from '@/store/progressStore';
import type { StepPracticeProps } from './types';
import type { PracticeQuestion } from '@/types/global';
import styles from './StepPractice.module.scss';

const WRONG_THRESHOLD = 2; // 连续答错此次数后加入错字本

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getTip(type: PracticeQuestion['type'], char: string): string {
  if (type === 'match') return `💡 读一读每个词语，找找哪个有「${char}」`;
  if (type === 'fill') return '💡 想一想空格里应该填哪个字？';
  return '💡 看看这个字最像哪张图？';
}

function StepPractice({ hanzi, completed, onComplete }: StepPracticeProps) {
  const practiceData = hanzi.practice ?? [];
  const { addWrong } = useProgressStore();

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(completed);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(() =>
    shuffle(practiceData[0]?.options ?? [])
  );
  const { playCorrect, playWrong, playComplete } = useSound();

  // 跟踪连续答错的次数
  const consecutiveWrongRef = useRef(0);

  const needCorrect = Math.min(3, practiceData.length);
  const currentQ = practiceData[idx % practiceData.length];

  // 切换题目时打乱选项
  useEffect(() => {
    setShuffledOptions(shuffle(practiceData[idx % practiceData.length]?.options ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function onPick(option: string) {
    if (picked) return;
    setPicked(option);
    if (option === currentQ.answer) {
      consecutiveWrongRef.current = 0;
      playCorrect();
      const nextScore = score + 1;
      setScore(nextScore);
      void speak('答对啦！', { rate: 1.1 });
      setTimeout(() => {
        if (nextScore >= needCorrect) {
          playComplete();
          setFinished(true);
          onComplete();
        } else {
          setIdx((i) => i + 1);
          setPicked(null);
        }
      }, 900);
    } else {
      consecutiveWrongRef.current += 1;
      // 连续答错达到阈值，加入错字本
      if (consecutiveWrongRef.current >= WRONG_THRESHOLD) {
        addWrong(hanzi.char);
      }
      playWrong();
      setShake(true);
      void speak('再试试！', { rate: 1.1 });
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setPicked(null), 800);
    }
  }

  function resetGame() {
    setIdx(0);
    setScore(0);
    setPicked(null);
    consecutiveWrongRef.current = 0;
    setShuffledOptions(shuffle(practiceData[0]?.options ?? []));
    setFinished(false);
  }

  // 无练习题时的降级
  if (practiceData.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>🎯 练一练，加深记忆</h3>
        <div className={styles.done}>
          <div className={styles.bigIcon}>🎉</div>
          <div className={styles.bigText}>没有练习题！</div>
          <p>这个字已经学会啦！</p>
          <button className={styles.ghostBtn} onClick={onComplete}>
            继续下一环节
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
      <h3 className={styles.title}>🎯 练一练，加深记忆</h3>

      <div className={styles.progress}>
        <span>答对 <strong>{Math.min(score, needCorrect)}</strong> / {needCorrect} 题</span>
        <div className={styles.bar}>
          {Array.from({ length: needCorrect }).map((_, i) => (
            <span key={i} className={`${styles.dot} ${i < score ? styles.dotOn : ''}`} />
          ))}
        </div>
      </div>

      {!finished ? (
        <>
          <div className={styles.prompt}>
            <div className={styles.qLabel}>第 {idx + 1} 题</div>
            <div className={styles.qText}>{currentQ.question}</div>
          </div>

          <div className={styles.options}>
            {shuffledOptions.map((opt) => {
              const isCorrect = picked && opt === currentQ.answer;
              const isWrong = picked === opt && opt !== currentQ.answer;
              return (
                <button
                  key={opt}
                  className={`${styles.option} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
                  onClick={() => onPick(opt)}
                  disabled={!!picked}
                >
                  {opt}
                  {isCorrect && <span className={styles.tag}>✓</span>}
                  {isWrong && <span className={styles.tag}>✗</span>}
                </button>
              );
            })}
          </div>

          <p className={styles.tip}>{getTip(currentQ.type, hanzi.char)}</p>
        </>
      ) : (
        <div className={styles.done}>
          <div className={styles.bigIcon}>🌟</div>
          <div className={styles.bigText}>练习完成！</div>
          <p>一共答对了 {needCorrect} 道题，真棒！</p>
          <button className={styles.ghostBtn} onClick={resetGame}>再练一次</button>
        </div>
      )}
    </div>
  );
}

export default StepPractice;
