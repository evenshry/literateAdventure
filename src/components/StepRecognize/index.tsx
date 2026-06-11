import { useState } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import StrokeAnimation from '@/components/StrokeAnimation';
import type { StepRecognizeProps } from './types';
import styles from './index.module.scss';

function StepRecognize({ hanzi, completed, onComplete }: StepRecognizeProps) {
  const [watched, setWatched] = useState(completed);
  const { playClick, playSelect } = useSound();

  function playPronunciation() {
    void speak(hanzi.char, { rate: 0.65, pitch: 1.2 });
  }

  function playMeaning() {
    void speak(`${hanzi.char}。${hanzi.meaning}。${hanzi.examples.join('，')}。`, { rate: 0.8 });
  }

  function confirm() {
    playSelect();
    setWatched(true);
    onComplete();
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>👀 认一认这个字</h3>

      <section className={styles.topRow}>
        <div className={styles.charBox}>
          <StrokeAnimation
            char={hanzi.char}
            size={200}
            autoPlay={false}
          />
        </div>

        <div className={styles.meanBox}>
          <div className={styles.emoji} role="img" aria-label="meaning icon">{hanzi.emoji}</div>
          <div className={styles.pinyin}>{hanzi.tonePinyin || hanzi.pinyin}</div>
          <div className={styles.meaning}>{hanzi.meaning}</div>
          <div className={styles.buttonsRow}>
            <button className={styles.speakBtn} onClick={playPronunciation}>🔊 听一听</button>
            <button className={styles.speakBtnGhost} onClick={playMeaning}>💡 讲解</button>
          </div>
        </div>
      </section>

      <section className={styles.examples}>
        <h4>可以组词：</h4>
        <div className={styles.chips}>
          {hanzi.examples.map((w: string) => (
            <button
              key={w}
              className={styles.chip}
              onClick={() => void speak(w)}
            >
              {w}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.sentences}>
        <h4>在句子里看一看：</h4>
        <ul>
          {hanzi.sentences.map((s: string, i: number) => {
          const parts = s.split(hanzi.char);
          return (
            <li key={i} onClick={() => void speak(s)}>
              {parts.map((p: string, idx: number) => (
              <span key={idx}>
                {p}
                {idx < parts.length - 1 && <span className={styles.highlightChar}>{hanzi.char}</span>}
              </span>
            ))}
              <span className={styles.listenHint}>（点一下听）</span>
            </li>
          );
        })}
        </ul>
      </section>

      <section className={styles.footer}>
        {watched ? (
          <div className={styles.doneTag}>✓ 已经认识啦！</div>
        ) : (
          <button className={styles.primaryBtn} onClick={confirm}>
            我认识啦！
          </button>
        )}
      </section>
    </div>
  );
}

export default StepRecognize;
