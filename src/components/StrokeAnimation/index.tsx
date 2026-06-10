import { useEffect, useRef, useState, useMemo } from 'react';
import { getHanzi } from '@/data/hanziData';
import styles from './StrokeAnimation.module.scss';

interface Props {
  char: string;
  size?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
  strokeColor?: string;
  guideColor?: string;
  strokeWidth?: number;
}

function StrokeAnimation({
  char,
  size = 300,
  autoPlay = true,
  onComplete,
  strokeColor = '#1a1a1a',
  guideColor = 'rgba(255, 138, 61, 0.35)',
  strokeWidth = 8,
}: Props) {
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'done'>('idle');
  const [currentStroke, setCurrentStroke] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const strokeData = useMemo(() => getHanzi(char)?.strokes, [char]);
  const totalStrokes = strokeData?.length || 0;

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    cleanup();
    setPhase('idle');
    setCurrentStroke(0);
    setStrokeProgress(0);
    pathRefs.current = [];
  }, [char]);

  useEffect(() => {
    if (autoPlay && phase === 'idle' && strokeData) {
      const t = window.setTimeout(() => {
        play();
      }, 500);
      timeoutsRef.current.push(t);
    }
  }, [autoPlay, phase, strokeData]);

  function cleanup() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }

  function play() {
    cleanup();
    setPhase('drawing');
    setCurrentStroke(0);
    setStrokeProgress(0);
    const t = window.setTimeout(() => animateStroke(0), 200);
    timeoutsRef.current.push(t);
  }

  function animateStroke(index: number) {
    if (!strokeData || index >= totalStrokes) {
      setPhase('done');
      onComplete?.();
      return;
    }

    setCurrentStroke(index);
    const duration = 700 + Math.random() * 200;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(t);
      setStrokeProgress(eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        const nextIdx = index + 1;
        const pause = nextIdx < totalStrokes ? 180 + Math.random() * 120 : 0;
        const timeoutId = window.setTimeout(() => {
          if (nextIdx < totalStrokes) {
            animateStroke(nextIdx);
          } else {
            setPhase('done');
            onComplete?.();
          }
        }, pause);
        timeoutsRef.current.push(timeoutId);
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function reset() {
    cleanup();
    setPhase('idle');
    setCurrentStroke(0);
    setStrokeProgress(0);
  }

  const overallProgress = totalStrokes > 0
    ? (currentStroke + strokeProgress) / totalStrokes
    : (phase === 'idle' ? 0 : phase === 'done' ? 1 : 0);

  function getStrokePath(stroke: { x: number; y: number }[]): string {
    if (stroke.length < 2) return '';
    const offsetX = size * 0.12;
    const offsetY = size * 0.1;
    const scaleX = size * 0.76;
    const scaleY = size * 0.8;

    if (stroke.length === 2) {
      const p1 = stroke[0];
      const p2 = stroke[1];
      const mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 2;
      const my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 2;
      return `M ${(p1.x / 100) * scaleX + offsetX},${(p1.y / 100) * scaleY + offsetY} Q ${(mx / 100) * scaleX + offsetX},${(my / 100) * scaleY + offsetY} ${(p2.x / 100) * scaleX + offsetX},${(p2.y / 100) * scaleY + offsetY}`;
    }

    let d = `M ${(stroke[0].x / 100) * scaleX + offsetX},${(stroke[0].y / 100) * scaleY + offsetY}`;
    for (let i = 1; i < stroke.length - 1; i++) {
      const prev = stroke[i - 1];
      const curr = stroke[i];
      const next = stroke[i + 1];
      const cx1 = (prev.x + curr.x) / 2;
      const cy1 = (prev.y + curr.y) / 2;
      const cx2 = (curr.x + next.x) / 2;
      const cy2 = (curr.y + next.y) / 2;
      d += ` Q ${(cx1 / 100) * scaleX + offsetX},${(cy1 / 100) * scaleY + offsetY} ${(curr.x / 100) * scaleX + offsetX},${(curr.y / 100) * scaleY + offsetY}`;
      if (i === stroke.length - 2) {
        d += ` Q ${(cx2 / 100) * scaleX + offsetX},${(cy2 / 100) * scaleY + offsetY} ${(next.x / 100) * scaleX + offsetX},${(next.y / 100) * scaleY + offsetY}`;
      }
    }
    return d;
  }

  function getCurrentPoint(): { x: number; y: number } | null {
    if (!strokeData || currentStroke >= totalStrokes) return null;
    const stroke = strokeData[currentStroke];
    if (!stroke || stroke.length < 2) return null;

    const offsetX = size * 0.12;
    const offsetY = size * 0.1;
    const scaleX = size * 0.76;
    const scaleY = size * 0.8;

    const totalSegments = stroke.length - 1;
    const segmentFloat = strokeProgress * totalSegments;
    const segmentIdx = Math.min(Math.floor(segmentFloat), totalSegments - 1);
    const localT = segmentFloat - segmentIdx;

    const p1 = stroke[segmentIdx];
    const p2 = stroke[Math.min(segmentIdx + 1, stroke.length - 1)];

    return {
      x: (p1.x + (p2.x - p1.x) * localT) / 100 * scaleX + offsetX,
      y: (p1.y + (p2.y - p1.y) * localT) / 100 * scaleY + offsetY,
    };
  }

  const currentPoint = phase === 'drawing' ? getCurrentPoint() : null;

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.svg}
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="1" dy="1" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.25" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect
          x={size * 0.04}
          y={size * 0.04}
          width={size * 0.92}
          height={size * 0.92}
          fill="#fff8e7"
          stroke="#e5d4a8"
          strokeWidth={2}
          rx={8}
        />

        <line x1={size * 0.04} y1={size / 2} x2={size * 0.96} y2={size / 2} stroke="rgba(200, 150, 80, 0.25)" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={size / 2} y1={size * 0.04} x2={size / 2} y2={size * 0.96} stroke="rgba(200, 150, 80, 0.25)" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={size * 0.04} y1={size * 0.04} x2={size * 0.96} y2={size * 0.96} stroke="rgba(200, 150, 80, 0.15)" strokeWidth={1} strokeDasharray="4 4" />
        <line x1={size * 0.96} y1={size * 0.04} x2={size * 0.04} y2={size * 0.96} stroke="rgba(200, 150, 80, 0.15)" strokeWidth={1} strokeDasharray="4 4" />

        <text
          x={size / 2}
          y={size / 2 + size * 0.02}
          style={{
            fontSize: size * 0.7,
            fontFamily: '"KaiTi", "STKaiti", "楷体", "PingFang SC", serif',
            fontWeight: 400,
            dominantBaseline: 'central',
            textAnchor: 'middle',
            fill: 'rgba(180, 120, 60, 0.18)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {char}
        </text>

        {strokeData && strokeData.map((stroke, index) => {
          const isDrawn = index < currentStroke;
          const isDrawing = index === currentStroke && phase === 'drawing';
          const path = getStrokePath(stroke);
          const pathEl = pathRefs.current[index];
          const length = pathEl?.getTotalLength() || 300;

          if (!path) return null;

          return (
            <g key={index} filter="url(#shadow)">
              <path
                d={path}
                fill="none"
                stroke="rgba(180, 180, 180, 0.35)"
                strokeWidth={strokeWidth + 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {(isDrawn || isDrawing) && (
                <path
                  ref={(el) => { pathRefs.current[index] = el; }}
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isDrawing ? `${length * strokeProgress} ${length}` : 'none'}
                  style={{
                    transition: isDrawing ? 'none' : 'stroke-dasharray 0.15s ease',
                  }}
                />
              )}
            </g>
          );
        })}

        {currentPoint && (
          <>
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={strokeWidth * 1.8}
              fill="#ff5722"
              opacity={0.25}
            >
              <animate attributeName="r" values={`${strokeWidth * 1.5};${strokeWidth * 2.2};${strokeWidth * 1.5}`} dur="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.15;0.35" dur="0.6s" repeatCount="indefinite" />
            </circle>
            <circle
              cx={currentPoint.x}
              cy={currentPoint.y}
              r={strokeWidth * 0.6}
              fill="#ff5722"
            />
          </>
        )}

        {!strokeData && (
          <text
            x={size / 2}
            y={size / 2 + size * 0.02}
            style={{
              fontSize: size * 0.7,
              fontFamily: '"KaiTi", "STKaiti", "楷体", "PingFang SC", serif',
              fontWeight: 400,
              dominantBaseline: 'central',
              textAnchor: 'middle',
              fill: phase === 'idle' ? guideColor : strokeColor,
              opacity: phase === 'idle' ? 0.4 : 1,
              transition: 'opacity 0.3s ease',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            {char}
          </text>
        )}

        <g>
          <rect
            x={size / 2 - 60}
            y={size * 0.92}
            width={120}
            height={6}
            rx={3}
            fill="rgba(200, 150, 80, 0.2)"
          />
          <rect
            x={size / 2 - 60}
            y={size * 0.92}
            width={120 * overallProgress}
            height={6}
            rx={3}
            fill="#d4a574"
            style={{ transition: 'width 0.1s linear' }}
          />
        </g>
      </svg>

      <div className={styles.controls}>
        {phase === 'idle' && (
          <button className={styles.playBtn} onClick={play}>
            ▶ 看笔顺
          </button>
        )}
        {phase === 'done' && (
          <button className={styles.resetBtn} onClick={play}>
            ↺ 再看一遍
          </button>
        )}
      </div>

      {strokeData && (
        <div className={styles.strokeInfo}>
          <span>
            第 {currentStroke + (phase === 'drawing' && strokeProgress > 0 ? 1 : 0)} 笔 / 共 {totalStrokes} 笔
          </span>
        </div>
      )}
    </div>
  );
}

export default StrokeAnimation;
