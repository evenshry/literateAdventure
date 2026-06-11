import { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
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
  const containerRef = useRef<HTMLElement>(null);
  const writerRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [done, setDone] = useState(completed);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [assessment, setAssessment] = useState<Assessment>('none');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { playCorrect, playClick, playWrong } = useSound();

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
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const continueWriting = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

  const onMistake = useCallback(
    (strokeData: StrokeData) => {
      console.log('Oh no! you made a mistake on stroke ' + (strokeData.strokeNum + 1));
      console.log("You've made " + strokeData.mistakesOnStroke + ' mistakes on this stroke so far');
      console.log("You've made " + strokeData.totalMistakes + ' total mistakes on this quiz');
      console.log(
        'There are ' + strokeData.strokesRemaining + ' strokes remaining in this character'
      );

      playWrong();
      setTotalMistakes(strokeData.totalMistakes);
      setAssessment('poor');
    },
    [playWrong]
  );

  const onCorrectStroke = useCallback(
    (strokeData: StrokeData) => {
      const displayStrokeNum = strokeData.strokeNum + 1;
      console.log('Yes!!! You got stroke ' + displayStrokeNum + ' correct!');
      console.log('You made ' + strokeData.mistakesOnStroke + ' mistakes on this stroke');
      console.log("You've made " + strokeData.totalMistakes + ' total mistakes on this quiz');
      console.log(
        'There are ' + strokeData.strokesRemaining + ' strokes remaining in this character'
      );

      playCorrect();
      setCurrentStroke(displayStrokeNum);
      setTotalMistakes(strokeData.totalMistakes);

      if (strokeData.mistakesOnStroke === 0) {
        setAssessment('great');
      } else {
        setAssessment('ok');
      }
    },
    [playCorrect]
  );

  const onQuizComplete = useCallback(
    (summaryData: SummaryData) => {
      console.log('You did it! You finished drawing ' + summaryData.character);
      console.log('You made ' + summaryData.totalMistakes + ' total mistakes on this quiz');

      setTotalMistakes(summaryData.totalMistakes);

      if (summaryData.totalMistakes === 0) {
        setAssessment('great');
        playCorrect();
        void speak('太棒了，完美！', { rate: 0.9 });
      } else if (summaryData.totalMistakes <= totalStrokes / 2) {
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
    [totalStrokes, playCorrect, playWrong]
  );

  const confirmComplete = useCallback(() => {
    setShowModal(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    initializedRef.current = true;
    setIsLoading(true);

    const writer = HanziWriter.create(containerRef.current!, hanzi.char, {
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
      onLoadCharDataSuccess: (data) => {
        setTotalStrokes(data.strokes.length);
        setIsLoading(false);
        setTimeout(() => {
          writer.quiz({
            onMistake,
            onCorrectStroke,
            onComplete: onQuizComplete,
          });
        }, 300);
      },
    });

    writerRef.current = writer;

    return () => {
      if (writerRef.current) {
        writerRef.current.destroy?.();
      }
    };
  }, [onMistake, onCorrectStroke, onQuizComplete]);

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

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>✍️ 写一写这个字</h3>

      <div className={styles.canvasWrap}>
        <svg
          ref={containerRef as any}
          className={styles.writerContainer}
          width={300}
          height={300}
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="0" x2={300} y2={300} stroke="#E8E8E8" strokeWidth="1" />
          <line x1={300} y1="0" x2="0" y2={300} stroke="#E8E8E8" strokeWidth="1" />
          <line x1={150} y1="0" x2={150} y2={300} stroke="#E8E8E8" strokeWidth="1" />
          <line x1="0" y1={150} x2={300} y2={150} stroke="#E8E8E8" strokeWidth="1" />
          <rect x="0" y="0" width={300} height={300} fill="none" stroke="#DDD" strokeWidth="2" />
        </svg>

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
