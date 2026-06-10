import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LEVELS, getLevelChars, getHanzi } from '@/data/hanziData';
import { useProgressStore } from '@/store/progressStore';
import type { LevelId } from '@/types/global';
import styles from './index.module.scss';

function Map() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { data, setLevel } = useProgressStore();

  const levelId: LevelId = (level as LevelId) ?? data.currentLevel;
  const levelInfo = useMemo(() => LEVELS.find((l) => l.id === levelId) ?? LEVELS[0], [levelId]);
  const chars = useMemo(() => getLevelChars(levelId), [levelId]);

  function switchLevel(lid: LevelId) {
    setLevel(lid);
    navigate(`/map/${lid}`);
  }

  return (
    <div className={styles.mapPage} style={{ background: levelInfo.bgColor }}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← 回家</button>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>{levelInfo.name}</h2>
          <span className={styles.subtitle}>{levelInfo.subtitle}</span>
        </div>
        <div className={styles.starsTag}>⭐ {data.totalStars}</div>
      </header>

      <nav className={styles.levelTabs}>
        {LEVELS.map((lvl) => {
          const locked = data.totalStars < lvl.unlockStars && lvl.id !== 'L1';
          return (
            <button
              key={lvl.id}
              className={`${styles.levelTab} ${lvl.id === levelId ? styles.active : ''} ${locked ? styles.locked : ''}`}
              disabled={locked}
              onClick={() => switchLevel(lvl.id)}
              title={locked ? `累积 ${lvl.unlockStars} 星解锁` : undefined}
            >
              {lvl.name}
              {locked && <span className={styles.lockMini}>🔒</span>}
            </button>
          );
        })}
      </nav>

      <section className={styles.mapArea}>
        <div className={styles.pathLine} />
        {chars.length === 0 ? (
          <div className={styles.empty}>
            <p style={{ fontSize: 24 }}>🌱 汉字勇士们还在赶来这里…</p>
            <p style={{ marginTop: 8, color: '#6b6b6b' }}>
              此岛屿正在开发中，请先挑战前面的岛屿吧！
            </p>
          </div>
        ) : (
          <div className={styles.charGrid}>
            {chars.map((h, idx) => {
              const cp = data.charProgress[h.char];
              const stars = cp?.stars ?? 0;
              const completed = cp?.completed ?? false;
              const isNext = !completed &&
                chars
                  .slice(0, idx)
                  .every((c) => data.charProgress[c.char]?.completed ?? false);
              return (
                <button
                  key={h.char}
                  className={`${styles.charBox} ${completed ? styles.done : ''} ${isNext ? styles.nextOne : ''}`}
                  onClick={() => navigate(`/learn/${encodeURIComponent(h.char)}`)}
                >
                  <div className={styles.charIndex}>{idx + 1}</div>
                  <div className={styles.charEmoji}>{h.emoji}</div>
                  <div className={styles.charBig}>{h.char}</div>
                  <div className={styles.charPinyin}>{h.pinyin}</div>
                  <div className={styles.charStars}>
                    {[1, 2, 3].map((s) => (
                      <span key={s} className={`${styles.star} ${s <= stars ? styles.lit : ''}`}>★</span>
                    ))}
                  </div>
                  {completed && <div className={styles.doneTick}>✓</div>}
                  {isNext && <div className={styles.nextRibbon}>出发！</div>}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <footer className={styles.footHint}>
        点击任意汉字开始学习 · 按顺序挑战会获得更多鼓励哦！
      </footer>
    </div>
  );
}

export default Map;
