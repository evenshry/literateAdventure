import { useMemo, useState } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import type { StepPracticeProps } from './StepPractice/types';
import type { HanziData } from '@/types/global';
import styles from './StepPractice.module.scss';

type GameType = 'match' | 'fill' | 'puzzle';

interface Question {
  type: GameType;
  prompt: string;
  options: string[];
  answer: string;
}

function buildQuestions(hanzi: HanziData): Question[] {
  const qs: Question[] = [];
  // Match: pick correct word containing the char
  const correctExamples = hanzi.examples.slice(0, 3);
  const distractorsPool = ['大山', '小河', '天上', '地下', '红花', '绿叶', '白云', '黑土', '快跑', '慢走'];
  
  for (let i = 0; i < correctExamples.length; i++) {
    const correctWord = correctExamples[i];
    // 从干扰池中选两个不包含当前字的词
    const availableDistractors = distractorsPool.filter(d => !d.includes(hanzi.char));
    const wrong1 = availableDistractors[i % availableDistractors.length];
    const wrong2 = availableDistractors[(i + 1) % availableDistractors.length];
    qs.push({
      type: 'match',
      prompt: `找出包含「${hanzi.char}」的词语`,
      options: shuffle([correctWord, wrong1, wrong2]),
      answer: correctWord,
    });
  }

  // Fill: sentence with blank
  for (const sentence of hanzi.sentences) {
    if (!sentence.includes(hanzi.char)) continue;
    const blankSentence = sentence.replace(hanzi.char, '___');
    // 动态生成干扰选项（从其他已学汉字中选）
    const distractors = ['木', '土', '日', '月', '水', '火', '山', '石']
      .filter(c => c !== hanzi.char)
      .slice(0, 2);
    qs.push({
      type: 'fill',
      prompt: `填空：${blankSentence}`,
      options: shuffle([hanzi.char, ...distractors]),
      answer: hanzi.char,
    });
  }

  // Puzzle: pick emoji matching the character
  const emojiDistractors = ['🌳', '🐟', '⚡', '🌈', '🏠', '🚗', '📚', '🎵']
    .filter(e => e !== hanzi.emoji)
    .slice(0, 3);
  qs.push({
    type: 'puzzle',
    prompt: `下面哪个图画最像「${hanzi.char}」？`,
    options: shuffle([hanzi.emoji, ...emojiDistractors]),
    answer: hanzi.emoji,
  });

  return qs;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function StepPractice({ hanzi, completed, onComplete }: StepPracticeProps) {
  const questions = useMemo(() => buildQuestions(hanzi), [hanzi]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(completed);
  const { playCorrect, playWrong, playComplete } = useSound();

  const needCorrect = 3;
  const q = questions[idx % questions.length];

  function onPick(option: string) {
    if (picked) return;
    setPicked(option);
    if (option === q.answer) {
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
          setIdx(idx + 1);
          setPicked(null);
        }
      }, 900);
    } else {
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
    setFinished(false);
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
            <div className={styles.qText}>{q.prompt}</div>
          </div>

          <div className={styles.options}>
            {q.options.map((opt) => {
              const isCorrect = picked && opt === q.answer;
              const isWrong = picked === opt && opt !== q.answer;
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

          <p className={styles.tip}>
            {q.type === 'match' && '💡 读一读每个词语，找找哪个有「' + hanzi.char + '」'}
            {q.type === 'fill' && '💡 想一想空格里应该填哪个字？'}
            {q.type === 'puzzle' && '💡 看看这个字最像哪张图？'}
          </p>
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
