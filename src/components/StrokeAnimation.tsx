import { useEffect, useRef, useState } from 'react';
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

/**
 * SVG 笔顺动画组件
 * 使用 SVG text + CSS animation 模拟笔顺效果
 */
function StrokeAnimation({
  char,
  size = 300,
  autoPlay = true,
  onComplete,
  strokeColor = '#2d8b57',
  guideColor = 'rgba(255, 138, 61, 0.35)',
  strokeWidth = 12,
}: Props) {
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'done'>('idle');
  const [visible, setVisible] = useState(0); // 当前显示的笔画数
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setPhase('idle');
    setVisible(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [char]);

  function play() {
    setPhase('drawing');
    setVisible(0);

    // 简单的逐笔动画效果
    // 由于没有真实笔顺数据，这里使用字符透明度渐变模拟
    let count = 0;
    const totalPhases = 3; // 模拟3个书写阶段

    function nextPhase() {
      count++;
      setVisible(count);
      if (count < totalPhases) {
        timerRef.current = window.setTimeout(nextPhase, 600);
      } else {
        setPhase('done');
        onComplete?.();
      }
    }

    timerRef.current = window.setTimeout(nextPhase, 400);
  }

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setVisible(0);
  }

  // 根据可见阶段计算动画进度
  const progress = phase === 'idle' ? 0 : phase === 'done' ? 1 : visible / 3;

  // 计算字符的显示样式
  const charStyle: React.CSSProperties = {
    fontSize: size * 0.7,
    fontFamily: '"KaiTi", "STKaiti", "PingFang SC", serif',
    fontWeight: 700,
    dominantBaseline: 'central',
    textAnchor: 'middle',
    userSelect: 'none',
    pointerEvents: 'none',
    transition: 'none',
  };

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.svg}
      >
        {/* 米字格 */}
        <rect x={2} y={2} width={size - 4} height={size - 4} fill="none" stroke={guideColor} strokeWidth={2} rx={8} />
        <line x1={0} y1={0} x2={size} y2={size} stroke={guideColor} strokeWidth={1} />
        <line x1={size} y1={0} x2={0} y2={size} stroke={guideColor} strokeWidth={1} />
        <line x1={size / 2} y1={0} x2={size / 2} y2={size} stroke={guideColor} strokeWidth={1} />
        <line x1={0} y1={size / 2} x2={size} y2={size / 2} stroke={guideColor} strokeWidth={1} />

        {/* 参考字符（半透明） */}
        <text x={size / 2} y={size / 2 + size * 0.03} style={{ ...charStyle, fill: 'rgba(255, 180, 200, 0.3)', fontSize: size * 0.72 }}>
          {char}
        </text>

        {/* 动画字符 */}
        <text
          x={size / 2}
          y={size / 2 + size * 0.03}
          style={{
            ...charStyle,
            fill: phase === 'idle' ? guideColor : strokeColor,
            opacity: phase === 'idle' ? 0.4 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {char}
        </text>

        {/* 笔画进度条 */}
        <g>
          <rect
            x={size / 2 - 50}
            y={size - 24}
            width={100}
            height={8}
            rx={4}
            fill="rgba(255,255,255,0.5)"
          />
          <rect
            x={size / 2 - 50}
            y={size - 24}
            width={100 * progress}
            height={8}
            rx={4}
            fill={strokeColor}
            style={{ transition: 'width 0.3s ease' }}
          />
        </g>
      </svg>

      {/* 控制按钮 */}
      <div className={styles.controls}>
        {phase === 'idle' && (
          <button className={styles.playBtn} onClick={play}>
            ▶ 看笔顺
          </button>
        )}
        {phase === 'drawing' && (
          <button className={styles.resetBtn} onClick={reset}>
            ↺ 重播
          </button>
        )}
        {phase === 'done' && (
          <button className={styles.resetBtn} onClick={play}>
            ↺ 再看一遍
          </button>
        )}
      </div>
    </div>
  );
}

export default StrokeAnimation;
