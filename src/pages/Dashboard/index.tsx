import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { useLanguageStore } from '@/store/languageStore';
import { getHanzi, LEVELS, getLevelChars } from '@/data/hanziData';
import LanguageSwitcher from '@components/LanguageSwitcher';
import styles from './index.module.scss';

function Dashboard() {
  const navigate = useNavigate();
  const { data } = useProgressStore();
  const language = useLanguageStore((s) => s.language);
  const isEnglish = language === 'en';

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

  const title = isEnglish ? '📊 Parent Dashboard' : '📊 家长看板';
  const learnedLabel = isEnglish ? 'Learned' : '已学会的汉字';
  const touchedLabel = isEnglish ? 'Total touched' : '累计学习过';
  const starsLabel = isEnglish ? 'Stars earned' : '获得星星';
  const stepsLabel = isEnglish ? 'Steps completed' : '完成的小环节';
  const islandsLabel = isEnglish ? 'Progress by island' : '各岛屿进度';
  const recentLabel = isEnglish ? 'Recently studied' : '最近学习的字';
  const emptyText = isEnglish
    ? 'No study records yet — go have fun learning!'
    : '还没有学习记录，去冒险地图开始吧！';
  const goMapBtn = isEnglish ? 'Go to map' : '去冒险地图';
  const reviewLabel = isEnglish ? 'Review' : '复习';
  const footerText = isEnglish
    ? 'All progress is stored locally in your browser (IndexedDB). Clearing browser data will erase it.'
    : '数据全部保存在本地浏览器（IndexedDB），清除浏览器数据会丢失进度哦。';

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <button className={styles.back} onClick={() => navigate('/')}>
          {isEnglish ? '← Home' : '← 回首页'}
        </button>
        <h1 className={styles.title}>{title}</h1>
        <LanguageSwitcher compact />
      </header>

      <section className={styles.summary}>
        <div className={styles.bigCard}>
          <div className={styles.subtitle}>{isEnglish ? 'Learning summary' : '学习概况'}</div>
          <div className={styles.summaryGrid}>
            <div>
              <div className={styles.bigNum}>{stats.completedCount}</div>
              <div className={styles.smallLabel}>{learnedLabel}</div>
            </div>
            <div>
              <div className={styles.bigNum}>{stats.total}</div>
              <div className={styles.smallLabel}>{touchedLabel}</div>
            </div>
            <div>
              <div className={styles.bigNum}>{stats.totalStars}</div>
              <div className={styles.smallLabel}>{starsLabel}</div>
            </div>
            <div>
              <div className={styles.bigNum}>{stats.totalSteps}</div>
              <div className={styles.smallLabel}>{stepsLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.levelSection}>
        <h2>{islandsLabel}</h2>
        <div className={styles.levelCards}>
          {stats.perLevel.map((lvl) => (
            <div key={lvl.id} className={styles.levelCard}>
              <div className={styles.levelName}>{lvl.name}</div>
              <div className={styles.levelSub}>{lvl.subtitle}</div>
              <div className={styles.levelBar}>
                <div className={styles.levelFill} style={{ width: `${lvl.pct}%` }} />
                <span className={styles.levelText}>
                  {lvl.done} / {lvl.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.recentSection}>
        <h2>{recentLabel}</h2>
        {stats.recent.length === 0 ? (
          <div className={styles.empty}>
            {emptyText}
            <div>
              <button className={styles.goMapBtn} onClick={() => navigate('/map')}>
                {goMapBtn}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.recentGrid}>
            {stats.recent.map((r) => (
              <div key={r.char} className={styles.recentCard}>
                <div className={styles.recentChar}>{r.char}</div>
                <div className={styles.recentPinyin}>
                  {r.hanzi?.tonePinyin ?? r.hanzi?.pinyin ?? ''}
                </div>
                <div className={styles.recentStars}>
                  {[1, 2, 3].map((i) => (
                    <span key={i} className={i <= (r.progress?.stars ?? 0) ? styles.on : styles.off}>
                      ★
                    </span>
                  ))}
                </div>
                <div className={styles.recentSteps}>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.recognize ? styles.on : ''}`}>
                    {isEnglish ? 'R' : '识'}
                  </span>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.write ? styles.on : ''}`}>
                    {isEnglish ? 'W' : '写'}
                  </span>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.practice ? styles.on : ''}`}>
                    {isEnglish ? 'P' : '练'}
                  </span>
                  <span className={`${styles.stepBadge} ${r.progress?.steps.read ? styles.on : ''}`}>
                    {isEnglish ? 'S' : '读'}
                  </span>
                </div>
                <button
                  className={styles.reviewBtn}
                  onClick={() => navigate(`/learn/${encodeURIComponent(r.char)}`)}
                >
                  {reviewLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className={styles.foot}>{footerText}</footer>
    </div>
  );
}

export default Dashboard;
