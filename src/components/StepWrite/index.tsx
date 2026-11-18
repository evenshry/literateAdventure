import { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import { charDataLoader } from '@/utils/hanziLoader';
import type { StepWriteProps } from './types';
import styles from './index.module.scss';

type Assessment = 'none' | 'great' | 'ok' | 'poor';

interface StrokeData {
  strokeNum: number;
  mistakesOnStroke: number;
  totalMistakes: number;
  strokesRemaining: number;
}

interface SummaryData {
  character: string;
  totalMistakes: number;
}

function StepWrite({ hanzi, completed, onComplete }: StepWriteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  // 记录上一笔画的字符，用于在字符切换时重置本地状态
  const [activeChar, setActiveChar] = useState(hanzi.char);
  const totalStrokesRef = useRef(0);
  const [done, setDone] = useState(completed);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [assessment, setAssessment] = useState<Assessment>('none');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [englishFallback, setEnglishFallback] = useState(false);
  const { playCorrect, playClick, playWrong } = useSound();

  const isEnglish = hanzi.level.startsWith('EN');

  // 字符变化时重置本地状态（React 推荐的「渲染期调整 state」写法）
  if (activeChar !== hanzi.char) {
    setActiveChar(hanzi.char);
    setDone(completed);
    setCurrentStroke(0);
    setTotalStrokes(0);
    setTotalMistakes(0);
    setAssessment('none');
    setShowModal(false);
    setIsLoading(true);
    setEnglishFallback(false);
  }

  const onMistake = useCallback(
    (strokeData: StrokeData) => {
      playWrong();
      setTotalMistakes(strokeData.totalMistakes);
      setAssessment('poor');
    },
    [playWrong]
  );

  const onCorrectStroke = useCallback(
    (strokeData: StrokeData) => {
      playCorrect();
      setCurrentStroke(strokeData.strokeNum + 1);
      setTotalMistakes(strokeData.totalMistakes);
      setAssessment(strokeData.mistakesOnStroke === 0 ? 'great' : 'ok');
    },
    [playCorrect]
  );

  const onQuizComplete = useCallback(
    (summaryData: SummaryData) => {
      const strokes = totalStrokesRef.current;
      setTotalMistakes(summaryData.totalMistakes);

      if (summaryData.totalMistakes === 0) {
        setAssessment('great');
        playCorrect();
        void speak('太棒了，完美！', { rate: 0.9 });
      } else if (summaryData.totalMistakes <= strokes / 2) {
        setAssessment('ok');
        playCorrect();
        void speak('写得不错，继续加油！', { rate: 0.9 });
      } else {
        setAssessment('poor');
        playWrong();
        void speak('再试一次，相信你可以做得更好！', { rate: 0.9 });
      }

      setDone(true);
      setShowModal(true);
    },
    [playCorrect, playWrong]
  );

  const resetQuiz = useCallback(() => {
    if (!writerRef.current) return;
    writerRef.current.hideCharacter();
    writerRef.current.quiz({
      onMistake,
      onCorrectStroke,
      onComplete: onQuizComplete,
    });
    setCurrentStroke(0);
    setTotalMistakes(0);
    setAssessment('none');
    setDone(false);
    setShowModal(false);
  }, [onMistake, onCorrectStroke, onQuizComplete]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const continueWriting = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

  const confirmComplete = useCallback(() => {
    setShowModal(false);
    onComplete();
  }, [onComplete]);

  // 初始化笔顺书写器（英文没有笔顺数据，走降级界面）
  useEffect(() => {
    if (isEnglish) {
      setIsLoading(false);
      setEnglishFallback(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setEnglishFallback(false);

    const writer = HanziWriter.create(container, hanzi.char, {
      width: 300,
      height: 300,
      padding: 30,
      showOutline: true,
      outlineColor: 'rgba(255, 180, 200, 0.55)',
      strokeColor: '#2d8b57',
      radicalColor: '#2d8b57',
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 500,
      strokeWidth: 10,
      drawingWidth: 60,
      drawingColor: '#2d8b57',
      highlightColor: 'rgba(255, 138, 61, 0.3)',
      highlightOnComplete: true,
      charDataLoader,
      onLoadCharDataSuccess: (data) => {
        totalStrokesRef.current = data.strokes.length;
        setTotalStrokes(data.strokes.length);
        setIsLoading(false);
        writerRef.current?.quiz({
          onMistake,
          onCorrectStroke,
          onComplete: onQuizComplete,
        });
      },
      onLoadCharDataError: () => {
        setIsLoading(false);
        setEnglishFallback(true);
      },
    });

    writerRef.current = writer;

    return () => {
      writer.cancelQuiz();
      container.innerHTML = '';
      if (writerRef.current === writer) {
        writerRef.current = null;
      }
    };
  }, [hanzi.char, isEnglish, onMistake, onCorrectStroke, onQuizComplete]);

  function englishConfirm() {
    playCorrect();
    void speak(hanzi.char, { rate: 0.85, lang: 'en' });
    setDone(true);
    setShowModal(true);
  }

  function englishListen() {
    playClick();
    void speak(hanzi.char, { rate: 0.75, lang: 'en' });
  }

  function englishMarkComplete() {
    setShowModal(false);
    onComplete();
  }

  function getAssessmentInfo(): { title: string; text: string; icon: string; cls: string } | null {
    if (assessment === 'none') return null;
    if (assessment === 'great') {
      return {
        title: '太棒了！',
        text: `你完美地写出了「${hanzi.char}」，没有任何错误！`,
        icon: '🌟',
        cls: styles.assessmentGreat,
      };
    }
    if (assessment === 'ok') {
      return {
        title: '写得不错！',
        text: `「${hanzi.char}」写得还可以，共出错 ${totalMistakes} 次，继续加油！`,
        icon: '👍',
        cls: styles.assessmentOk,
      };
    }
    return {
      title: '再试一次',
      text: `「${hanzi.char}」需要多加练习，共出错 ${totalMistakes} 次。`,
      icon: '💡',
      cls: styles.assessmentPoor,
    };
  }

  const assessmentInfo = getAssessmentInfo();

  if (englishFallback) {
    const label = isEnglish ? '✍️ Trace & Write' : '✍️ 写一写这个字';
    const subtitle = isEnglish
      ? 'Listen first, then write it out on paper — and tap “I did it!” when finished.'
      : '先听一听笔顺，再自己写一写，完成后点“我写好啦！”';
    const listenBtn = isEnglish ? '🔊 Listen' : '🔊 听一听';
    const confirm = isEnglish ? 'I wrote it!' : '我写好啦！';
    const doneLabel = isEnglish ? '✓ Traced' : '✓ 已经写过啦';
    const tip = isEnglish
      ? '💡 Tip: use a finger or pen to trace the letter on paper, then say it out loud.'
      : '💡 小提示：按照正确的笔顺书写，系统会实时评估你的书写。';

    return (
      <div className={styles.card}>
        <h3 className={styles.title}>{label}</h3>
        <p className={styles.tip}>{subtitle}</p>

        <div className={styles.englishTrace}>
          <div className={styles.englishChar}>{hanzi.char}</div>
          <div className={styles.englishPron}>{hanzi.pinyin}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.ghostBtn} onClick={englishListen}>
            {listenBtn}
          </button>
          {done ? (
            <div className={styles.doneTag}>{doneLabel}</div>
          ) : (
            <button className={styles.primaryBtn} onClick={englishConfirm}>
              {confirm}
            </button>
          )}
        </div>

        <p className={styles.tip}>{tip}</p>

        {showModal && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={`${styles.modalIcon} ${styles.assessmentGreat}`}>🌟</div>
              <h3 className={styles.modalTitle}>{isEnglish ? 'Nice work!' : '太棒了！'}</h3>
              <p className={styles.modalText}>
                {isEnglish
                  ? `Good job tracing “${hanzi.char}”!`
                  : `你完美地写出了「${hanzi.char}」！`}
              </p>
              <div className={styles.modalActions}>
                <button className={styles.modalBtnPrimary} onClick={englishMarkComplete}>
                  {isEnglish ? 'Continue' : '确认完成'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>✍️ 写一写这个字</h3>

      <div className={styles.canvasWrap}>
        <svg
          className={styles.grid}
          width={300}
          height={300}
          viewBox="0 0 300 300"
          aria-hidden="true"
        >
          <line x1="0" y1="0" x2={300} y2={300} stroke="#E8E8E8" strokeWidth="1" />
          <line x1={300} y1="0" x2="0" y2={300} stroke="#E8E8E8" strokeWidth="1" />
          <line x1={150} y1="0" x2={150} y2={300} stroke="#E8E8E8" strokeWidth="1" />
          <line x1="0" y1={150} x2={300} y2={150} stroke="#E8E8E8" strokeWidth="1" />
          <rect x="0" y="0" width={300} height={300} fill="none" stroke="#DDD" strokeWidth="2" />
        </svg>
        <div ref={containerRef} className={styles.writerContainer} />

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        )}

        {!isLoading && !done && currentStroke === 0 && (
          <div className={styles.hintOverlay}>按照提示写出笔画</div>
        )}
      </div>

      <div className={styles.stats}>
        第 <strong>{currentStroke || 1}</strong> 笔 / 共 {totalStrokes} 笔
        {totalMistakes > 0 && (
          <span className={styles.mistakesHint}>（错误 {totalMistakes} 次）</span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.ghostBtn}
          onClick={() => {
            playClick();
            resetQuiz();
          }}
        >
          🧹 重新开始
        </button>
      </div>

      <p className={styles.tip}>💡 小提示：按照正确的笔顺书写，系统会实时评估你的书写。</p>

      {showModal && assessmentInfo && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={`${styles.modalIcon} ${assessmentInfo.cls}`}>{assessmentInfo.icon}</div>
            <h3 className={styles.modalTitle}>{assessmentInfo.title}</h3>
            <p className={styles.modalText}>{assessmentInfo.text}</p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnSecondary} onClick={continueWriting}>
                再写一次
              </button>
              <button className={styles.modalBtnPrimary} onClick={confirmComplete}>
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StepWrite;
