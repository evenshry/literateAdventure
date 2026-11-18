import { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import { charDataLoader } from '@/utils/hanziLoader';
import styles from './index.module.scss';

interface Props {
  char: string;
  size?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

function StrokeAnimation({ char, size = 300, autoPlay = true, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const totalStrokesRef = useRef(0);

  const play = useCallback(() => {
    if (!writerRef.current) return;
    setIsAnimating(true);
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsAnimating(false);
        setCurrentStroke(totalStrokesRef.current);
        onComplete?.();
      },
    });
  }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setLoadError(false);
    setCurrentStroke(0);
    setTotalStrokes(0);
    totalStrokesRef.current = 0;

    let autoPlayTimer: ReturnType<typeof setTimeout> | undefined;

    const writer = HanziWriter.create(container, char, {
      width: size,
      height: size,
      padding: size * 0.08,
      showOutline: true,
      outlineColor: 'rgba(255, 138, 61, 0.2)',
      strokeColor: '#1a1a1a',
      radicalColor: '#1a1a1a',
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 200,
      strokeWidth: Math.floor(size * 0.025),
      charDataLoader,
      onLoadCharDataSuccess: (data) => {
        totalStrokesRef.current = data.strokes.length;
        setTotalStrokes(data.strokes.length);
        setIsLoading(false);
        if (autoPlay) {
          autoPlayTimer = setTimeout(() => play(), 500);
        }
      },
      onLoadCharDataError: () => {
        setIsLoading(false);
        setLoadError(true);
      },
    });

    writerRef.current = writer;

    return () => {
      if (autoPlayTimer) clearTimeout(autoPlayTimer);
      writer.cancelQuiz();
      container.innerHTML = '';
      if (writerRef.current === writer) {
        writerRef.current = null;
      }
    };
  }, [char, size, autoPlay, play]);

  if (loadError) {
    return (
      <div className={styles.container} style={{ width: size, height: size }}>
        <div className={styles.errorText}>无法加载笔顺数据</div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg
        className={styles.grid}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <line x1="0" y1="0" x2={size} y2={size} stroke="#E8E8E8" strokeWidth="1" />
        <line x1={size} y1="0" x2="0" y2={size} stroke="#E8E8E8" strokeWidth="1" />
        <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke="#E8E8E8" strokeWidth="1" />
        <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke="#E8E8E8" strokeWidth="1" />
        <rect
          x="0"
          y="0"
          width={size}
          height={size}
          fill="none"
          stroke="#DDD"
          strokeWidth="2"
        />
      </svg>
      <div ref={containerRef} className={styles.writerContainer} />

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      )}

      <div className={styles.controls}>
        {!isLoading && !isAnimating && currentStroke === 0 && (
          <button className={styles.playBtn} onClick={play}>
            ▶ 看笔顺
          </button>
        )}
        {!isLoading && (isAnimating || currentStroke > 0) && (
          <button className={styles.resetBtn} onClick={play}>
            ↺ 再看一遍
          </button>
        )}
      </div>

      {!isLoading && totalStrokes > 0 && (
        <div className={styles.strokeInfo}>
          <div className={styles.strokeInfoText}>
            第 {currentStroke > 0 ? currentStroke : 1} 笔 / 共 {totalStrokes} 笔
          </div>
        </div>
      )}
    </div>
  );
}

export default StrokeAnimation;
