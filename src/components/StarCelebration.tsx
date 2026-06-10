import { useEffect, useMemo } from 'react';
import styles from './StarCelebration.module.scss';

interface Props {
  stars: number;
}

function StarCelebration({ stars }: Props) {
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

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.circle}>
        <div className={styles.bigText}>太棒啦！</div>
        <div className={styles.starRow}>
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i} className={styles.starChar} style={{ animationDelay: `${i * 0.2}s` }}>
              ⭐
            </span>
          ))}
        </div>
        <div className={styles.subtext}>你获得了 {stars} 颗星星！</div>
      </div>
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
    </div>
  );
}

export default StarCelebration;
