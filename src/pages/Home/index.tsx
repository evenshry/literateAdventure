import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { LEVELS, getLevelChars } from '@/data/hanziData';
import { ROUTES } from '@/routes';
import type { LevelId } from '@/types/global';
import styles from './index.module.scss';

function Home() {
  const navigate = useNavigate();
  const { data, setLevel } = useProgressStore();

  function startLevel(levelId: string) {
    setLevel(levelId as LevelId);
    navigate(ROUTES.MAP_LEVEL(levelId));
  }

  function continueLast() {
    navigate(ROUTES.MAP_LEVEL(data.currentLevel));
  }

  return (
    <div className={styles.home}>
      <div className={styles.bubble} />
      <div className={styles.cloud1}>☁️</div>
      <div className={styles.cloud2}>☁️</div>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span role="img" aria-label="sparkle">✨</span> 识字冒险 <span role="img" aria-label="sparkle">✨</span>
        </h1>
        <p className={styles.subtitle}>— 点亮汉字，成为汉字勇士 —</p>
      </header>

      <section className={styles.starsRow}>
        <div className={styles.starBadge}>
          <span>⭐</span>
          <span className={styles.starNum}>{data.totalStars}</span>
          <span className={styles.starLabel}>星星</span>
        </div>
        <div className={styles.starBadge}>
          <span>📖</span>
          <span className={styles.starNum}>{data.learnedChars.length}</span>
          <span className={styles.starLabel}>学会</span>
        </div>
        <div className={styles.starBadge}>
          <span>🔖</span>
          <span className={styles.starNum}>{data.wrongList.length}</span>
          <span className={styles.starLabel}>错字</span>
        </div>
      </section>

      <section className={styles.actions}>
        <button className={styles.btnPrimary} onClick={continueLast}>
          继续冒险（{getLevelChars(data.currentLevel).length} 字）
        </button>
        <div className={styles.subActions}>
          <button className={styles.btnGhost} onClick={() => navigate(ROUTES.WRONG)}>
            错字本
          </button>
          <button className={styles.btnGhost} onClick={() => navigate(ROUTES.DASHBOARD)}>
            家长看板
          </button>
        </div>
      </section>

      <section className={styles.islands}>
        <h2 className={styles.islandsTitle}>选择岛屿</h2>
        <div className={styles.islandGrid}>
          {LEVELS.map((lvl) => {
            const chars = getLevelChars(lvl.id);
            const locked = data.totalStars < lvl.unlockStars && lvl.id !== 'L1';
            const doneCount = chars.filter((c) => data.charProgress[c.char]?.completed).length;
            const pct = chars.length ? Math.round((doneCount / chars.length) * 100) : 0;
            return (
              <button
                key={lvl.id}
                className={`${styles.islandCard} ${locked ? styles.locked : ''}`}
                style={{ background: lvl.bgColor }}
                disabled={locked}
                onClick={() => startLevel(lvl.id)}
              >
                <div className={styles.islandIcon}>
                  {lvl.id === 'L1' && '🏝️'}
                  {lvl.id === 'L2' && '🏞️'}
                  {lvl.id === 'L3' && '🌴'}
                  {lvl.id === 'L4' && '🗻'}
                </div>
                <div className={styles.islandName}>{lvl.name}</div>
                <div className={styles.islandSub}>{lvl.subtitle}</div>
                {locked ? (
                  <div className={styles.lockHint}>🔒 累积 {lvl.unlockStars} ⭐ 解锁</div>
                ) : (
                  <>
                    <div className={styles.progressWrap}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                      <div className={styles.progressText}>{doneCount}/{chars.length} 字</div>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>· 每天学几个，汉字勇士就是你！ ·</p>
      </footer>
    </div>
  );
}

export default Home;
