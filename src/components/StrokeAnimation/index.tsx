import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  showOutline?: boolean;
  speed?: number;
}

/**
 * 笔顺动画 —— Canvas 版本
 *
 * 核心设计：
 * - 高频 progress 用 ref，不触发 React rerender
 * - renderFrame 存入 ref，始终调用最新版本（避免闭包捕获旧 state）
 * - RAF/step 直接调 renderFrameRef.current() 绘制，不走 React rerender
 * - char/size change effect 不再清理动画（避免误杀正在进行的 setPhase）
 */
function StrokeAnimation({
  char,
  size = 300,
  autoPlay = true,
  onComplete,
  strokeColor = '#1a1a1a',
  guideColor = 'rgba(255, 138, 61, 0.35)',
  strokeWidth = 8,
  showOutline = true,
  speed = 1.0,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initRef = useRef(false);

  const rafRef = useRef<number | undefined>(undefined);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 高频动画值
  const progressRef = useRef(0);

  // UI 状态
  const [phase, setPhase] = useState<'idle' | 'drawing' | 'done'>('idle');
  const [currentStroke, setCurrentStroke] = useState(0);

  // renderFrame 存入 ref，保证任何时候调用的都是最新版本
  const renderFrameRef = useRef<(time: number) => void>(() => {});

  // 预计算笔画
  const strokes = useMemo(() => {
    const raw = getHanzi(char)?.strokes;
    if (!raw) return null;
    const offsetX = size * 0.12;
    const offsetY = size * 0.1;
    const scaleX = size * 0.76;
    const scaleY = size * 0.8;
    return raw.map((stroke) =>
      stroke.map((p) => ({
        x: (p.x / 100) * scaleX + offsetX,
        y: (p.y / 100) * scaleY + offsetY,
      }))
    );
  }, [char, size]);

  const totalStrokes = strokes?.length ?? 0;

  // ============ 工具函数 ============
  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function cancelAnim() {
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }

  function cleanup() {
    cancelAnim();
    clearTimers();
  }

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function getClippedStroke(
    pts: { x: number; y: number }[],
    progress: number
  ): { x: number; y: number }[] {
    if (progress <= 0) return [];
    if (progress >= 1) return pts;
    let total = 0;
    const segLens: number[] = [0];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
      segLens.push(total);
    }
    if (total === 0) return [pts[0]];
    const target = total * progress;
    for (let i = 1; i < segLens.length; i++) {
      if (segLens[i] >= target) {
        const seg = segLens[i] - segLens[i - 1];
        const t = seg === 0 ? 1 : (target - segLens[i - 1]) / seg;
        return [
          ...pts.slice(0, i),
          {
            x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t,
            y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t,
          },
        ];
      }
    }
    return pts;
  }

  // ============ 绘制函数 ============
  function drawGrid(ctx: CanvasRenderingContext2D) {
    if (!showOutline) return;
    ctx.fillStyle = '#fff8e7';
    ctx.fillRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);
    ctx.strokeStyle = '#e5d4a8';
    ctx.lineWidth = 2;
    ctx.strokeRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(200, 150, 80, 0.25)';
    ctx.beginPath();
    ctx.moveTo(size * 0.04, size / 2);
    ctx.lineTo(size * 0.96, size / 2);
    ctx.moveTo(size / 2, size * 0.04);
    ctx.lineTo(size / 2, size * 0.96);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(200, 150, 80, 0.15)';
    ctx.beginPath();
    ctx.moveTo(size * 0.04, size * 0.04);
    ctx.lineTo(size * 0.96, size * 0.96);
    ctx.moveTo(size * 0.96, size * 0.04);
    ctx.lineTo(size * 0.04, size * 0.96);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawChar(ctx: CanvasRenderingContext2D, color: string, alpha = 1) {
    ctx.save();
    ctx.font = `${Math.floor(size * 0.7)}px "KaiTi", "STKaiti", "楷体", "PingFang SC", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillText(char, size / 2, size / 2 + size * 0.02);
    ctx.restore();
  }

  function drawStroke(
    ctx: CanvasRenderingContext2D,
    pts: { x: number; y: number }[],
    color: string,
    width: number
  ) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  function drawBrushTip(
    ctx: CanvasRenderingContext2D,
    pts: { x: number; y: number }[],
    progress: number,
    time: number
  ) {
    if (progress <= 0 || progress >= 1 || pts.length < 2) return;
    const clipped = getClippedStroke(pts, progress);
    if (clipped.length === 0) return;
    const tip = clipped[clipped.length - 1];
    const pulse = 1 + 0.15 * Math.sin(time * 0.01);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 87, 34, 0.28)';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, strokeWidth * 1.8 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, strokeWidth * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 渲染一帧
  const renderFrame = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);
      drawGrid(ctx);
      drawChar(ctx, 'rgba(180, 120, 60, 0.18)', 1);

      if (strokes) {
        strokes.forEach((stroke) => {
          drawStroke(ctx, stroke, 'rgba(180, 180, 180, 0.35)', strokeWidth + 2);
        });

        for (let i = 0; i < currentStroke; i++) {
          drawStroke(ctx, strokes[i], strokeColor, strokeWidth);
        }

        if (phase === 'drawing' && currentStroke < totalStrokes) {
          const clipped = getClippedStroke(strokes[currentStroke], progressRef.current);
          drawStroke(ctx, clipped, strokeColor, strokeWidth);
          drawBrushTip(ctx, strokes[currentStroke], progressRef.current, time);
        }
      } else {
        drawChar(ctx, phase === 'idle' ? guideColor : strokeColor, phase === 'idle' ? 0.5 : 1);
      }

      const drawn = phase === 'drawing' ? progressRef.current : phase === 'done' ? 1 : 0;
      const overall =
        totalStrokes > 0
          ? (currentStroke + drawn) / totalStrokes
          : phase === 'done'
          ? 1
          : 0;
      ctx.save();
      ctx.fillStyle = 'rgba(200, 150, 80, 0.2)';
      ctx.fillRect(size / 2 - 60, size * 0.92, 120, 6);
      ctx.fillStyle = '#d4a574';
      ctx.fillRect(
        size / 2 - 60,
        size * 0.92,
        120 * Math.max(0, Math.min(1, overall)),
        6
      );
      ctx.restore();
    },
    [strokes, currentStroke, phase, totalStrokes, char, size, strokeColor, guideColor, strokeWidth]
  );

  // 始终保持 renderFrameRef 指向最新版本
  renderFrameRef.current = renderFrame;

  // ============ 动画控制 ============
  function animateStroke(index: number) {
    if (!strokes || index >= totalStrokes) {
      setPhase('done');
      onComplete?.();
      // 用 RAF 而非 setTimeout，确保调用时 phase 已是 'done'
      rafRef.current = requestAnimationFrame(() => renderFrameRef.current(0));
      return;
    }
    setCurrentStroke(index);
    progressRef.current = 0;

    const duration = (700 + Math.random() * 200) / speed;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      progressRef.current = easeInOutCubic(t);
      renderFrameRef.current(now);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = undefined;
        const next = index + 1;
        if (next < totalStrokes) {
          const tid = setTimeout(() => animateStroke(next), (180 + Math.random() * 120) / speed);
          timersRef.current.push(tid);
        } else {
          setPhase('done');
          onComplete?.();
          rafRef.current = requestAnimationFrame(() => renderFrameRef.current(0));
        }
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }

  function play() {
    cleanup();
    setPhase('drawing');
    setCurrentStroke(0);
    progressRef.current = 0;
    const tid = setTimeout(() => animateStroke(0), 200);
    timersRef.current.push(tid);
  }

  // ============ 生命周期 ============
  // 初始化 canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initRef.current) return;
    initRef.current = true;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderFrameRef.current(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 字切换：重设 canvas + 画初始帧（不杀 RAF，因为字变了动画本来就要停）
  useEffect(() => {
    if (!initRef.current) return; // 首次由 init effect 处理
    cleanup();
    setPhase('idle');
    setCurrentStroke(0);
    progressRef.current = 0;
    const tid = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderFrameRef.current(0);
    }, 0);
    timersRef.current.push(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, size]);

  // autoPlay
  useEffect(() => {
    if (autoPlay && phase === 'idle' && strokes) {
      const tid = setTimeout(() => play(), 500);
      timersRef.current.push(tid);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, phase, strokes]);

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width: size, height: size }}
      />

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

      {strokes && (
        <div className={styles.strokeInfo}>
          <div  className={styles.strokeInfoText}>
            第{' '}
            {currentStroke +
              (phase === 'drawing' && progressRef.current > 0 ? 1 : 0)}{' '}
            笔 / 共 {totalStrokes} 笔
          </div>
        </div>
      )}
    </div>
  );
}

export default StrokeAnimation;
