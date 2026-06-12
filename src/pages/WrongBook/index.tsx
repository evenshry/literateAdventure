import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { useLanguageStore } from '@/store/languageStore';
import { getHanzi } from '@/data/hanziData';
import LanguageSwitcher from '@components/LanguageSwitcher';
import styles from './index.module.scss';

function WrongBook() {
  const navigate = useNavigate();
  const { data, toggleSound, removeFromWrongList, resetAll } = useProgressStore();
  const language = useLanguageStore((s) => s.language);
  const isEnglish = language === 'en';

  const items = useMemo(
    () => data.wrongList.map((c) => ({ char: c, data: getHanzi(c) })).filter((x) => x.data),
    [data.wrongList]
  );

  const learnedStars = useMemo(() => {
    let total = 0;
    Object.values(data.charProgress).forEach((p) => {
      total += p.stars;
    });
    return total;
  }, [data.charProgress]);

  function confirmReset() {
    const msg = isEnglish
      ? 'Reset ALL progress? This cannot be undone.'
      : '确定要重置所有学习进度吗？此操作不可撤销。';
    if (window.confirm(msg)) {
      resetAll();
    }
  }

  function handleRemove(char: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeFromWrongList(char);
  }

  const title = isEnglish ? '📚 Review List' : '📚 错字本';
  const learnedLabel = isEnglish ? 'Learned' : '学会的字';
  const starsTitle = isEnglish ? 'Total stars' : '总星星';
  const pendingLabel = isEnglish ? 'To review' : '待复习';
  const emptyTitle = isEnglish ? 'Nothing to review!' : '错字本空空如也！';
  const emptySub = isEnglish
    ? 'Awesome — all caught up. Keep going!'
    : '太棒了，现在没有需要复习的字。继续加油！';
  const listHint = isEnglish ? 'Tap to review again:' : '点一点，再认一次：';
  const reviewTag = isEnglish ? 'Review' : '复习';
  const resetText = isEnglish ? 'Reset progress' : '重置学习进度';
  const soundText = isEnglish
    ? data.settings.soundEnabled
      ? '🔊 Sound on'
      : '🔈 Sound off'
    : data.settings.soundEnabled
    ? '🔊 声音已开启'
    : '🔈 声音已关闭';

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <button className={styles.back} onClick={() => navigate('/')}>
          {isEnglish ? '← Home' : '← 回首页'}
        </button>
        <h1 className={styles.title}>{title}</h1>
        <LanguageSwitcher compact />
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{data.learnedChars.length}</div>
          <div className={styles.statLabel}>{learnedLabel}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{learnedStars}</div>
          <div className={styles.statLabel}>{starsTitle}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{data.wrongList.length}</div>
          <div className={styles.statLabel}>{pendingLabel}</div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyEmoji}>🎉</div>
          <h2>{emptyTitle}</h2>
          <p>{emptySub}</p>
        </div>
      ) : (
        <section className={styles.list}>
          <h3 className={styles.listTitle}>{listHint}</h3>
          <div className={styles.grid}>
            {items.map((it) => (
              <button
                key={it.char}
                className={styles.charCard}
                onClick={() => navigate(`/learn/${encodeURIComponent(it.char)}`)}
              >
                <button
                  className={styles.removeBtn}
                  onClick={(e) => handleRemove(it.char, e)}
                  title={isEnglish ? 'Remove from review' : '从错字本移除'}
                >
                  ✕
                </button>
                <div className={styles.bigChar}>{it.char}</div>
                <div className={styles.pinyin}>
                  {it.data?.tonePinyin || it.data?.pinyin || ''}
                </div>
                <div className={styles.meaning}>{it.data?.meaning}</div>
                <div className={styles.smallTag}>{reviewTag}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={styles.danger}>
        <button className={styles.dangerBtn} onClick={confirmReset}>
          {resetText}
        </button>
        <button className={styles.soundBtn} onClick={toggleSound}>
          {soundText}
        </button>
      </section>
    </div>
  );
}

export default WrongBook;
