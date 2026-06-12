import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { useLanguageStore } from '@/store/languageStore';
import { getLevelChars, getLevelsForLanguage } from '@/data/hanziData';
import { ROUTES } from '@/routes';
import LanguageSwitcher from '@components/LanguageSwitcher';
import type { LevelId } from '@/types/global';
import { t } from '@/i18n/dict';
import styles from './index.module.scss';

function Home() {
  const navigate = useNavigate();
  const { data, setLevel } = useProgressStore();
  const language = useLanguageStore((s) => s.language);
  const levels = useMemo(() => getLevelsForLanguage(language), [language]);

  function startLevel(levelId: string) {
    setLevel(levelId as LevelId);
    navigate(ROUTES.MAP_LEVEL(levelId));
  }

  function continueLast() {
    // Prefer the current language’s starting level if the saved one is from another language
    const savedLevel = data.currentLevel;
    const savedIsSameLang =
      (language === 'zh' && !savedLevel.startsWith('EN')) ||
      (language === 'en' && savedLevel.startsWith('EN'));
    const target = savedIsSameLang ? savedLevel : (levels[0]?.id as LevelId);
    if (!savedIsSameLang && target) {
      setLevel(target);
    }
    navigate(ROUTES.MAP_LEVEL(target ?? savedLevel));
  }

  const title = language === 'zh' ? '识字冒险' : 'Literate Adventure';
  const subtitle = language === 'zh' ? '— 点亮汉字，成为汉字勇士 —' : '— Light up letters & words, become a word hero —';
  const starsLabel = language === 'zh' ? '星星' : 'Stars';
  const learnedLabel = language === 'zh' ? '学会' : 'Learned';
  const wrongLabel = language === 'zh' ? '错字' : 'Review';
  const wrongBtn = language === 'zh' ? '错字本' : 'Review';
  const dashBtn = language === 'zh' ? '家长看板' : 'Dashboard';
  const islandsTitle = language === 'zh' ? '选择岛屿' : 'Pick an island';
  const unit = language === 'zh' ? '字' : 'words';
  const countLabel = language === 'zh' ? `继续冒险（{n} ${unit}）` : `Continue ({n} ${unit})`;
  const lockHint = language === 'zh' ? '🔒 累积 {n} ⭐ 解锁' : '🔒 Earn {n} ⭐ to unlock';
  const footer = language === 'zh' ? '每天学几个，汉字勇士就是你！' : 'Learn a few every day — you’ll be a word hero!';

  const islandIcons: Record<string, string> = {
    L1: '🏝️',
    L2: '🏞️',
    L3: '🌴',
    L4: '🗻',
    EN1: '🅰️',
    EN2: '🌳',
    EN3: '👀',
    EN4: '📚',
  };

  const continueLabel = countLabel.replace(
    '{n}',
    String(getLevelChars(data.currentLevel).length || getLevelChars(levels[0]?.id as LevelId).length)
  );

  return (
    <div className={styles.home}>
      <div className={styles.bubble} />
      <div className={styles.cloud1}>☁️</div>
      <div className={styles.cloud2}>☁️</div>

      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <LanguageSwitcher compact />
        </div>
        <h1 className={styles.title}>
          <span role="img" aria-label="sparkle">✨</span> {title}{' '}
          <span role="img" aria-label="sparkle">✨</span>
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>

      <section className={styles.starsRow}>
        <div className={styles.starBadge}>
          <span>⭐</span>
          <span className={styles.starNum}>{data.totalStars}</span>
          <span className={styles.starLabel}>{starsLabel}</span>
        </div>
        <div className={styles.starBadge}>
          <span>📖</span>
          <span className={styles.starNum}>{data.learnedChars.length}</span>
          <span className={styles.starLabel}>{learnedLabel}</span>
        </div>
        <div className={styles.starBadge}>
          <span>🔖</span>
          <span className={styles.starNum}>{data.wrongList.length}</span>
          <span className={styles.starLabel}>{wrongLabel}</span>
        </div>
      </section>

      <section className={styles.actions}>
        <button className={styles.btnPrimary} onClick={continueLast}>
          {continueLabel}
        </button>
        <div className={styles.subActions}>
          <button className={styles.btnGhost} onClick={() => navigate(ROUTES.WRONG)}>
            {wrongBtn}
          </button>
          <button className={styles.btnGhost} onClick={() => navigate(ROUTES.DASHBOARD)}>
            {dashBtn}
          </button>
        </div>
      </section>

      <section className={styles.islands}>
        <h2 className={styles.islandsTitle}>{islandsTitle}</h2>
        <div className={styles.islandGrid}>
          {levels.map((lvl) => {
            const chars = getLevelChars(lvl.id);
            const locked = data.totalStars < lvl.unlockStars && lvl.id !== levels[0]?.id;
            const doneCount = chars.filter((c) => data.charProgress[c.char]?.completed).length;
            const pct = chars.length ? Math.round((doneCount / chars.length) * 100) : 0;
            // Localized name/subtitle via i18n dictionary (fallback to raw).
            const localizedName =
              (t(language, `island.${lvl.id}.name` as any) !== `island.${lvl.id}.name`
                ? t(language, `island.${lvl.id}.name` as any)
                : lvl.name) || lvl.name;
            const localizedSub =
              (t(language, `island.${lvl.id}.subtitle` as any) !== `island.${lvl.id}.subtitle`
                ? t(language, `island.${lvl.id}.subtitle` as any)
                : lvl.subtitle) || lvl.subtitle;
            return (
              <button
                key={lvl.id}
                className={`${styles.islandCard} ${locked ? styles.locked : ''}`}
                style={{ background: lvl.bgColor }}
                disabled={locked}
                onClick={() => startLevel(lvl.id)}
              >
                <div className={styles.islandIcon}>
                  {islandIcons[lvl.id] || '🏝️'}
                </div>
                <div className={styles.islandName}>{localizedName}</div>
                <div className={styles.islandSub}>{localizedSub}</div>
                {locked ? (
                  <div className={styles.lockHint}>{lockHint.replace('{n}', String(lvl.unlockStars))}</div>
                ) : (
                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <div className={styles.progressText}>
                      {doneCount}/{chars.length} {unit}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>· {footer} ·</p>
      </footer>
    </div>
  );
}

export default Home;
