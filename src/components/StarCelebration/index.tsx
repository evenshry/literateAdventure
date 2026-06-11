import { useEffect, useMemo } from 'react';
import { playComplete, playStar } from '@/utils/sound';
import styles from './index.module.scss';

interface Props {
  stars: number;
}

function StarCelebration({ stars }: Props) {
  // 星星粒子
  const items = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.4 + Math.random() * 1.2,
        size: 20 + Math.random() * 28,
        rotate: Math.random() * 360,
      })),
    []
  );

  // 彩色粒子
  const particles = useMemo(() => {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8a3d', '#c44dff'];
    return Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const distance = 80 + Math.random() * 120;
      return {
        id: i,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        size: 4 + Math.random() * 6,
      };
    });
  }, []);

  // 光芒射线
  const rays = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        rotate: (i / 12) * 360,
      })),
    []
  );

  // 纸屑效果
  const confetti = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1.5,
        color: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff8a3d'][
          Math.floor(Math.random() * 5)
        ],
        size: 8 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    []
  );

  useEffect(() => {
    playComplete();
    // 逐个播放星星音效
    for (let i = 0; i < stars; i++) {
      setTimeout(() => playStar(), i * 250 + 500);
    }
  }, [stars]);

  return (
    <div className={styles.overlay}>
      {/* 光芒射线 */}
      <div className={styles.rays}>
        {rays.map((ray, i) => (
          <div
            key={i}
            className={styles.ray}
            style={{
              transform: `translateX(-50%) rotate(${ray.rotate}deg)`,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* 彩色粒子 */}
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: '50%',
              top: '50%',
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              width: p.size,
              height: p.size,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 星星雨 */}
      {items.map((it, i) => (
        <span
          key={i}
          className={styles.fallingStar}
          style={{
            left: `${it.left}%`,
            animationDelay: `${it.delay}s`,
            animationDuration: `${it.duration}s`,
            fontSize: it.size,
            transform: `rotate(${it.rotate}deg)`,
          }}
        >
          ✨
        </span>
      ))}

      {/* 纸屑 */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className={styles.confetti}
          style={{
            left: `${c.left}%`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            backgroundColor: c.color,
            width: c.size,
            height: c.size,
            transform: `rotate(${c.rotate}deg)`,
          }}
        />
      ))}

      {/* 中央圆形 */}
      <div className={styles.circle}>
        <div className={styles.bigText}>太棒啦！</div>
        <div className={styles.starRow}>
          {Array.from({ length: stars }).map((_, i) => (
            <span
              key={i}
              className={styles.starChar}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ⭐
            </span>
          ))}
        </div>
        <div className={styles.subtext}>你获得了 {stars} 颗星星！</div>
      </div>
    </div>
  );
}

export default StarCelebration;
