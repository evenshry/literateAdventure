import { useEffect, useRef, useState, useCallback } from 'react';
import HanziWriter from 'hanzi-writer';
import styles from './index.module.scss';

interface Props {
  char: string;
  size?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}

function StrokeAnimation({ char, size = 300, autoPlay = true, onComplete }: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const writerRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const play = useCallback(() => {
    if (!writerRef.current) return;
    setIsAnimating(true);
    writerRef.current.animateCharacter({
      onStrokeComplete: (strokeData: { strokeNum: number }) => {
        setCurrentStroke(strokeData.strokeNum);
      },
      onComplete: () => {
        setIsAnimating(false);
        setCurrentStroke(totalStrokes);
        onComplete?.();
      },
    });
  }, [totalStrokes, onComplete]);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;

    initializedRef.current = true;
    setIsLoading(true);
    setLoadError(false);

    const writer = HanziWriter.create(containerRef.current!, char, {
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
      onLoadCharDataSuccess: (data) => {
        setTotalStrokes(data.strokes.length);
        setIsLoading(false);
        if (autoPlay) {
          setTimeout(() => play(), 500);
        }
      },
    });

    writerRef.current = writer;

    return () => {
      if (writerRef.current) {
        writerRef.current.destroy?.();
      }
    };
  }, []);

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
        ref={containerRef as any}
        className={styles.writerContainer}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
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
          radius={18}
        />
      </svg>

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
