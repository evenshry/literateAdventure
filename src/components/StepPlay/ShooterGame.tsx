import { useRef, useEffect, useState, useCallback } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import type { HanziData } from '@/types/global';
import type { ShooterGameState } from './shooterEngine';
import {
  initShooterGame,
  startGame,
  updateEnemies,
  updateCannon,
  updateBullets,
  updateExplosions,
  fire,
  checkBulletCollisions,
  activateHint,
  drawShooterGame,
} from './shooterEngine';
import styles from './index.module.scss';

interface ShooterGameProps {
  hanzi: HanziData;
  onComplete: () => void;
}

function ShooterGame({ hanzi, onComplete }: ShooterGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<ShooterGameState | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const aimLeftRef = useRef<boolean>(false);
  const aimRightRef = useRef<boolean>(false);

  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'victory' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const { playClick, playCorrect, playWrong, playStar, playComplete } = useSound();

  // 初始化游戏
  const initGame = useCallback(() => {
    gameStateRef.current = initShooterGame(hanzi.char);
    setGamePhase('ready');
    setScore(0);
    setMistakes(0);
  }, [hanzi.char]);

  // 开始游戏
  const handleStart = () => {
    if (!gameStateRef.current) {
      initGame();
    }
    startGame(gameStateRef.current!);
    setGamePhase('playing');
    setScore(0);
    setMistakes(0);
    playClick();
    void speak(`捕捉蝴蝶！找到带有${hanzi.char}字的彩色蝴蝶，用捕虫网抓住它们！`, { rate: 0.9 });
  };

  // 瞄准控制
  const handleAimLeft = useCallback(() => {
    if (!gameStateRef.current || gamePhase !== 'playing') return;
    const currentAngle = gameStateRef.current.cannon.targetAngle;
    gameStateRef.current.cannon.targetAngle = Math.max(-50, currentAngle - 8);
  }, [gamePhase]);

  const handleAimRight = useCallback(() => {
    if (!gameStateRef.current || gamePhase !== 'playing') return;
    const currentAngle = gameStateRef.current.cannon.targetAngle;
    gameStateRef.current.cannon.targetAngle = Math.min(50, currentAngle + 8);
  }, [gamePhase]);

  // 按住瞄准
  const handleAimLeftDown = useCallback(() => {
    aimLeftRef.current = true;
  }, []);

  const handleAimLeftUp = useCallback(() => {
    aimLeftRef.current = false;
  }, []);

  const handleAimRightDown = useCallback(() => {
    aimRightRef.current = true;
  }, []);

  const handleAimRightUp = useCallback(() => {
    aimRightRef.current = false;
  }, []);

  // 发射
  const handleFire = useCallback(() => {
    if (gamePhase !== 'playing' || !gameStateRef.current) return;

    fire(gameStateRef.current);
    playClick();
  }, [gamePhase, playClick]);

  // 提示
  const handleHint = () => {
    if (!gameStateRef.current || gamePhase !== 'playing') return;

    playClick();
    activateHint(gameStateRef.current);
    void speak('提示：金色光环的是目标字！', { rate: 0.9 });
  };

  // 游戏循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;
      const time = (currentTime - startTime) / 1000;

      const state = gameStateRef.current;
      if (!state) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // 按住瞄准
      if (state.phase === 'playing') {
        if (aimLeftRef.current) {
          state.cannon.targetAngle = Math.max(-50, state.cannon.targetAngle - 30 * deltaTime);
        }
        if (aimRightRef.current) {
          state.cannon.targetAngle = Math.min(50, state.cannon.targetAngle + 30 * deltaTime);
        }
      }

      // 更新游戏逻辑
      if (state.phase === 'playing') {
        updateEnemies(state, deltaTime);
        updateCannon(state, deltaTime);
        updateBullets(state, deltaTime);
        updateExplosions(state, deltaTime);

        // 检测子弹碰撞
        const hitResult = checkBulletCollisions(state);
        if (hitResult) {
          if (hitResult.isTarget) {
            playCorrect();
            setShowFeedback(`+1分！`);
            void speak('抓到了！', { rate: 1.0 });
          } else {
            playWrong();
            setShowFeedback('抓错了！');
            void speak('抓错了，再找找！', { rate: 1.0 });
          }

          setTimeout(() => setShowFeedback(null), 800);
          setScore(state.score);
          setMistakes(state.mistakes);

          const currentPhase = state.phase as 'ready' | 'playing' | 'victory' | 'gameover';
          if (currentPhase === 'victory') {
            setGamePhase('victory');
            playStar();
            playComplete();
            void speak(`太棒了！${hanzi.char}字辨字成功！`, { rate: 0.85 });
          } else if (currentPhase === 'gameover') {
            setGamePhase('gameover');
            playWrong();
            void speak('失误太多啦，再试一次！', { rate: 0.9 });
          }
        }
      }

      // 绘制
      drawShooterGame(ctx, state, canvas.width, canvas.height, time);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // 初始化
  useEffect(() => {
    initGame();
  }, [initGame]);

  // 完成游戏
  const handleComplete = () => {
    playClick();
    onComplete();
  };

  // 重新开始
  const handleRestart = () => {
    handleStart();
  };

  return (
    <div className={styles.shooterGame}>
      <header className={styles.gameHeader}>
        <h3>🦋 捕捉蝴蝶 · {hanzi.char}</h3>
        <div className={styles.scoreDisplay}>
          <span>捕获 {score}/3</span>
          <span className={styles.mistakeCount}>失误 {mistakes}/3</span>
        </div>
      </header>

      <div className={styles.gameCanvas}>
        <canvas ref={canvasRef} width={400} height={450} className={styles.canvas} />

        {/* 开始界面 */}
        {gamePhase === 'ready' && (
          <div className={styles.overlay}>
            <div className={styles.readyContent}>
              <div className={styles.cannonIcon}>🦋</div>
              <div className={styles.rules}>
                <p>
                  🦋 抓住带有 <span className={styles.targetText}>{hanzi.char}</span>{' '}
                  字的彩色蝴蝶得1分
                </p>
                <p>❌ 抓错蝴蝶失误一次</p>
                <p>⭐ 捕获3只即可过关</p>
              </div>
              <button className={styles.startBtn} onClick={handleStart}>
                🎣 开始捕捉
              </button>
            </div>
          </div>
        )}

        {/* 胜利界面 */}
        {gamePhase === 'victory' && (
          <div className={styles.overlay}>
            <div className={styles.victoryContent}>
              <div className={styles.victoryEmoji}>🎉</div>
              <h4>捕捉成功！</h4>
              <p>{hanzi.char}字的形态记住了吗？</p>
              <div className={styles.victoryStars}>{'⭐'.repeat(score)}</div>
              <button className={styles.nextBtn} onClick={handleComplete}>
                继续学习 →
              </button>
              <button className={styles.retryBtn} onClick={handleRestart}>
                🔄 再玩一次
              </button>
            </div>
          </div>
        )}

        {/* 失败界面 */}
        {gamePhase === 'gameover' && (
          <div className={styles.overlay}>
            <div className={styles.gameoverContent}>
              <div className={styles.gameoverEmoji}>😅</div>
              <h4>失误太多啦！</h4>
              <p>注意区分带有 {hanzi.char} 字的蝴蝶</p>
              <button className={styles.retryFullBtn} onClick={handleRestart}>
                🔄 再试一次
              </button>
            </div>
          </div>
        )}

        {/* 得分反馈 */}
        {showFeedback && (
          <div
            className={`${styles.scoreFeedback} ${showFeedback.includes('错') ? styles.error : styles.success}`}
          >
            {showFeedback}
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      {gamePhase === 'playing' && (
        <div className={styles.controlPanel}>
          <div className={styles.movementControls}>
            <button
              className={styles.aimBtn}
              onClick={handleAimLeft}
              onMouseDown={handleAimLeftDown}
              onMouseUp={handleAimLeftUp}
              onMouseLeave={handleAimLeftUp}
              onTouchStart={handleAimLeftDown}
              onTouchEnd={handleAimLeftUp}
            >
              ⬅️
            </button>

            <button className={styles.fireBtn} onClick={handleFire}>
              🎣 抛出
            </button>

            <button
              className={styles.aimBtn}
              onClick={handleAimRight}
              onMouseDown={handleAimRightDown}
              onMouseUp={handleAimRightUp}
              onMouseLeave={handleAimRightUp}
              onTouchStart={handleAimRightDown}
              onTouchEnd={handleAimRightUp}
            >
              ➡️
            </button>
            <button className={styles.hintBtn} onClick={handleHint}>
              💡提示
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShooterGame;
