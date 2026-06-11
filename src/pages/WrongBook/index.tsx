import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { getHanzi } from '@/data/hanziData';
import styles from './index.module.scss';

function WrongBook() {
  const navigate = useNavigate();
  const { data, toggleSound, removeFromWrongList } = useProgressStore();

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

  function resetAll() {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销。')) {
      useProgressStore.getState().resetAll();
    }
  }

  function handleRemove(char: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeFromWrongList(char);
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <button className={styles.back} onClick={() => navigate('/')}>← 回首页</button>
        <h1 className={styles.title}>📚 错字本</h1>
        <div className={styles.spacer} />
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{data.learnedChars.length}</div>
          <div className={styles.statLabel}>学会的字</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{learnedStars}</div>
          <div className={styles.statLabel}>总星星</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{data.wrongList.length}</div>
          <div className={styles.statLabel}>待复习</div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 72 }}>🎉</div>
          <h2>错字本空空如也！</h2>
          <p>太棒了，现在没有需要复习的字。继续加油！</p>
        </div>
      ) : (
        <section className={styles.list}>
          <h3 className={styles.listTitle}>点一点，再认一次：</h3>
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
                  title="从错字本移除"
                >
                  ✕
                </button>
                <div className={styles.bigChar}>{it.char}</div>
                <div className={styles.pinyin}>{it.data?.tonePinyin || it.data?.pinyin}</div>
                <div className={styles.meaning}>{it.data?.meaning}</div>
                <div className={styles.smallTag}>复习</div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={styles.danger}>
        <button className={styles.dangerBtn} onClick={resetAll}>
          重置学习进度
        </button>
        <button className={styles.soundBtn} onClick={toggleSound}>
          {data.settings.soundEnabled ? '🔊 声音已开启' : '🔈 声音已关闭'}
        </button>
      </section>
    </div>
  );
}

export default WrongBook;
