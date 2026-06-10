import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { getHanzi, LEVELS, getLevelChars } from '@/data/hanziData';
import { ROUTES } from '@/routes';
import styles from './Dashboard.module.scss';

function Dashboard() {
  const navigate = useNavigate();
  const { data } = useProgressStore();

  const stats = useMemo(() => {
    const entries = Object.entries(data.charProgress);
    const total = entries.length;
    const completedCount = entries.filter(([, p]) => p.completed).length;
    let totalStars = 0;
    let totalSteps = 0;
    entries.forEach(([, p]) => {
      totalStars += p.stars;
      if (p.steps.recognize) totalSteps++;
      if (p.steps.write) totalSteps++;
      if (p.steps.practice) totalSteps++;
      if (p.steps.read) totalSteps++;
    });

    const perLevel = LEVELS.map((lvl) => {
      const chars = getLevelChars(lvl.id);
      const done = chars.filter((c) => data.charProgress[c.char]?.completed).length;
      return {
        ...lvl,
        total: chars.length,
        done,
        pct: chars.length ? Math.round((done / chars.length) * 100) : 0,
      };
    });

    const recent = entries
      .filter(([, p]) => p.lastStudiedAt)
      .sort((a, b) => (b[1].lastStudiedAt ?? 0) - (a[1].lastStudiedAt ?? 0))
      .slice(0, 8)
      .map(([char, p]) => ({
        char,
        hanzi: getHanzi(char),
        progress: p,
      }));

    return { total, completedCount, totalStars, totalSteps, perLevel, recent };
  }, [data]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <button className={styles.back} onClick={() => navigate('/')}>← 回首页</button>
        <h1 className={styles.title}>📊 家长看板</h1>
        <div className={styles.spacer} />
      </header>

      <section className={styles.summary}>
        <div className={styles.bigCard}>
          <div className={styles.subtitle}>学习概况</div>
          <div className={styles.summaryGrid}>
            <div>
              <div className={styles.bigNum}>{stats.completedCount}</div>
              <div className={styles.smallLabel}>已学会的汉字</div>
            </div>
            <div>
              <div className={styles.bigNum}>{stats.total}</div>
              <div className={styles.smallLabel}>累计学习过</div>
            </div>
            <div>
              <div className={styles.bigNum}>{stats.totalStars}</div>
              <div className={styles.smallLabel}>获得星星</div>
            </div>
            <div>
              <div className={styles.bigNum}>{stats.totalSteps}</div>
              <div className={styles.smallLabel}>完成的小环节</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.levelSection}>
        <h2>各岛屿进度</h2>
        <div className={styles.levelCards}>
          {stats.perLevel.map((lvl) => (
            <div key={lvl.id} className={styles.levelCard}>
              <div className={styles.levelName}>{lvl.name}</div>
              <div className={styles.levelSub}>{lvl.subtitle}</div>
              <div className={styles.levelBar}>
                <div className={styles.levelFill} style={{ width: `${lvl.pct}%` }} />
                <span className={styles.levelText}>{lvl.done} / {lvl.total}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.recentSection}>
        <h2>最近学习的字</h2>
        {stats.recent.length === 0 ? (
          <div className={styles.empty}>
            还没有学习记录，去冒险地图开始吧！
            <div>
              <button className={styles.goMapBtn} onClick={() => navigate('/map')}>去冒险地图</button>
            </div>
          </div>
        ) : (
          <div className={styles.recentGrid}>
            {stats.recent.map((r) => (
              <div key={r.char} className={styles.recentCard}>
                <div className={styles.recentChar}>{r.char}</div>
                <div className={styles.recentPinyin}>{r.hanzi?.tonePinyin ?? r.hanzi?.pinyin ?? ''}</div>
                <div className={styles.recentStars}>
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={i <= (r.progress?.stars ?? 0) ? styles.on : styles.off}>★</span>
                  ))}
                </div>
                <div className={styles.recentSteps}>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.recognize ? styles.on : ''}`}>识</span>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.write ? styles.on : ''}`}>写</span>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.practice ? styles.on : ''}`}>练</span>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.read ? styles.on : ''}`}>读</span>
                </div>
                <button
                  className={styles.reviewBtn}
                  onClick={() => navigate(`/learn/${encodeURIComponent(r.char)}`)}
                >
                  复习
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.foot}>
        数据全部保存在本地浏览器（IndexedDB），清除浏览器数据会丢失进度哦。
      </footer>
    </div>
  );
}

export default Dashboard;
