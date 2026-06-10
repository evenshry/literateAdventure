import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import type { StepWriteProps } from './types';
import styles from './StepWrite.module.scss';

type Mode = 'trace' | 'free';

type Assessment = 'none' | 'great' | 'ok' | 'poor';

function getAssessment(userStrokes: number, expectedStrokes: number): Assessment {
  if (expectedStrokes <= 0) return 'none';
  if (userStrokes >= expectedStrokes) return 'great';
  if (userStrokes >= expectedStrokes - 1) return 'ok';
  return 'poor';
}

function StepWrite({ hanzi, completed, onComplete }: StepWriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const pathsRef = useRef<{ x: number; y: number }[][]>([]);
  const currentStroke = useRef<{ x: number; y: number }[]>([]);
  const [mode, setMode] = useState<Mode>('trace');
  const [done, setDone] = useState(completed);
  const [strokeCount, setStrokeCount] = useState(0);
  const [assessment, setAssessment] = useState<Assessment>('none');
  const { playCorrect, playClick, playWrong } = useSound();

  const expectedStrokes = hanzi.strokes?.length ?? 0;

  function drawGuide(ctx: CanvasRenderingContext2D, w: number, h: number, showChar: boolean) {
    ctx.clearRect(0, 0, w, h);
    // 米字格
    ctx.strokeStyle = 'rgba(255,138,61,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, h);
    ctx.moveTo(w, 0); ctx.lineTo(0, h);
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (showChar) {
      ctx.save();
      ctx.font = `${Math.floor(h * 0.7)}px "KaiTi", "STKaiti", "PingFang SC", serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 180, 200, 0.55)';
      ctx.fillText(hanzi.char, w / 2, h / 2 + h * 0.03);
      ctx.restore();
    }
  }

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGuide(ctx, canvas.width, canvas.height, mode === 'trace');

    ctx.strokeStyle = '#2d8b57';
    ctx.lineWidth = Math.max(6, canvas.width / 60);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const allStrokes = [...pathsRef.current, currentStroke.current];
    for (const stroke of allStrokes) {
      if (stroke.length === 0) continue;
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
    }
    ctx.stroke();
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const box = containerRef.current;
    if (!canvas || !box) return;
    const size = Math.min(box.clientWidth, 420);
    canvas.width = size;
    canvas.height = size;
    redraw();
  }

  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    pathsRef.current = [];
    currentStroke.current = [];
    setStrokeCount(0);
    setAssessment('none');
    redraw();
  }, [mode]);

  function getPos(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onDown(e: PointerEvent<HTMLCanvasElement>) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const p = getPos(e);
    currentStroke.current = [p];
    redraw();
  }

  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = getPos(e);
    currentStroke.current.push(p);
    redraw();
  }

  function onUp() {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentStroke.current.length > 2) {
      pathsRef.current.push(currentStroke.current);
      setStrokeCount(pathsRef.current.length);
      setAssessment(getAssessment(pathsRef.current.length, expectedStrokes));
    }
    currentStroke.current = [];
    redraw();
  }

  function clearCanvas() {
    pathsRef.current = [];
    currentStroke.current = [];
    setStrokeCount(0);
    setAssessment('none');
    redraw();
  }

  function submit() {
    if (pathsRef.current.length === 0) {
      void speak('请先写一写！', { rate: 0.9 });
      return;
    }

    const result = getAssessment(pathsRef.current.length, expectedStrokes);
    setAssessment(result);

    if (result === 'great') {
      playCorrect();
      void speak('太棒了，笔画完整！', { rate: 0.9 });
      setDone(true);
      onComplete();
    } else if (result === 'ok') {
      playCorrect();
      void speak('写得不错，注意笔画顺序哦！', { rate: 0.9 });
      setDone(true);
      onComplete();
    } else {
      playWrong();
      void speak('注意笔画数哦，再试试！', { rate: 0.9 });
    }
  }

  function getAssessmentText(): { text: string; icon: string; cls: string } | null {
    if (assessment === 'none' || done) return null;
    if (assessment === 'great') return { text: '笔画完整 ✓', icon: '🌟', cls: styles.assessmentGreat };
    if (assessment === 'ok') return { text: '基本正确 ✓', icon: '👍', cls: styles.assessmentOk };
    return { text: `笔画偏少 (${strokeCount}/${expectedStrokes})`, icon: '💡', cls: styles.assessmentPoor };
  }

  const assessmentInfo = getAssessmentText();

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>✍️ 写一写这个字</h3>

      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeBtn} ${mode === 'trace' ? styles.active : ''}`}
          onClick={() => { playClick(); setMode('trace'); }}
        >
          描红模式
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'free' ? styles.active : ''}`}
          onClick={() => { playClick(); setMode('free'); }}
        >
          自由书写
        </button>
      </div>

      <div className={styles.canvasWrap} ref={containerRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
          style={{ touchAction: 'none' }}
        />
        {strokeCount === 0 && !done && (
          <div className={styles.hintOverlay}>
            用手指或鼠标 {mode === 'trace' ? '跟着红字描写' : '写出这个字'}
          </div>
        )}
      </div>

      <div className={styles.stats}>
        已写 <strong>{strokeCount}</strong> 笔
        {expectedStrokes > 0 && <span className={styles.expectedHint}>（目标 {expectedStrokes} 笔）</span>}
      </div>

      {assessmentInfo && (
        <div className={`${styles.assessment} ${assessmentInfo.cls}`}>
          <span>{assessmentInfo.icon}</span>
          <span>{assessmentInfo.text}</span>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.ghostBtn} onClick={clearCanvas}>🧹 清空重来</button>
        {done ? (
          <div className={styles.doneTag}>✓ 写得真棒！</div>
        ) : (
          <button className={styles.primaryBtn} onClick={submit}>
            写好了！
          </button>
        )}
      </div>

      <p className={styles.tip}>
        💡 小提示：先按住鼠标/手指，沿笔画走向书写；写完一笔会自动断开。
      </p>
    </div>
  );
}

export default StepWrite;
