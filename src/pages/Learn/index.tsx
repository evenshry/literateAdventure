import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHanzi } from '@/data/hanziData';
import { useProgressStore } from '@/store/progressStore';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import { ROUTES } from '@/routes';
import type { StepId } from '@/types/global';
import StepPlay from '@components/StepPlay';
import StepRecognize from '@components/StepRecognize';
import StepWrite from '@components/StepWrite';
import StepPractice from '@components/StepPractice';
import StepRead from '@components/StepRead';
import StarCelebration from '@components/StarCelebration';
import styles from './index.module.scss';

const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: 'play', label: '玩', icon: '🎮' },
  { id: 'recognize', label: '识', icon: '👀' },
  { id: 'write', label: '写', icon: '✍️' },
  { id: 'practice', label: '练', icon: '🎯' },
  { id: 'read', label: '读', icon: '🔊' },
];

function Learn() {
  const { char } = useParams();
  const navigate = useNavigate();
  const hanzi = useMemo(() => (char ? getHanzi(char) : undefined), [char]);
  const { data, markStepComplete, awardStarsForChar } = useProgressStore();
  const { playCorrect, playStar, playComplete } = useSound();

  const [currentStep, setCurrentStep] = useState<StepId>('play');
  const [celebrate, setCelebrate] = useState<{ stars: number } | null>(null);

  useEffect(() => {
    if (!hanzi) return;
    const cp = data.charProgress[hanzi.char];
    if (cp) {
      if (!cp.steps.play) setCurrentStep('play');
      else if (!cp.steps.recognize) setCurrentStep('recognize');
      else if (!cp.steps.write) setCurrentStep('write');
      else if (!cp.steps.practice) setCurrentStep('practice');
      else if (!cp.steps.read) setCurrentStep('read');
    }
  }, [hanzi, data.charProgress]);

  if (!hanzi) {
    return (
      <div className={styles.fallback}>
        <p>找不到这个汉字，回到地图看看吧～</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          回首页
        </button>
      </div>
    );
  }

  const currentChar = hanzi.char;
  const cp = data.charProgress[currentChar];
  const allDone = cp?.completed ?? false;

  function onStepDone(stepId: StepId) {
    playCorrect();
    markStepComplete(currentChar, stepId);
    void speak('真棒！', { rate: 1.0 });
    const idx = STEPS.findIndex((s) => s.id === stepId);
    if (idx < STEPS.length - 1) {
      setTimeout(() => setCurrentStep(STEPS[idx + 1].id), 800);
    } else {
      awardStarsForChar(currentChar, 3);
      playStar();
      playComplete();
      setCelebrate({ stars: 3 });
      setTimeout(() => {
        setCelebrate(null);
        navigate(`/map/${data.currentLevel}`);
      }, 2800);
    }
  }

  function handleSpeakChar() {
    void speak(currentChar, { rate: 0.7, pitch: 1.15 });
  }

  return (
    <div className={styles.learnPage}>
      <header className={styles.learnHeader}>
        <button className={styles.backBtn} onClick={() => navigate(`/map/${data.currentLevel}`)}>
          ← 回地图
        </button>
        <div className={styles.learnTitleWrap}>
          <button className={styles.bigChar} onClick={handleSpeakChar}>
            {hanzi.char}
          </button>
          <div className={styles.charMeta}>
            <div className={styles.pinyin}>{hanzi.tonePinyin || hanzi.pinyin}</div>
            <div className={styles.meaning}>{hanzi.meaning}</div>
          </div>
        </div>
        <div className={styles.starsTop}>
          {[1, 2, 3].map((s) => (
            <span key={s} className={`${styles.topStar} ${s <= (cp?.stars ?? 0) ? styles.topLit : ''}`}>★</span>
          ))}
        </div>
      </header>

      <nav className={styles.stepTabs}>
        {STEPS.map((s, idx) => {
          const done = cp?.steps[s.id] ?? false;
          const active = currentStep === s.id;
          return (
            <button
              key={s.id}
              className={`${styles.stepTab} ${active ? styles.active : ''} ${done ? styles.done : ''}`}
              onClick={() => setCurrentStep(s.id)}
            >
              <span className={styles.stepIdx}>{idx + 1}</span>
              <span className={styles.stepIcon}>{s.icon}</span>
              <span className={styles.stepLabel}>{s.label}</span>
              {done && <span className={styles.stepCheck}>✓</span>}
            </button>
          );
        })}
      </nav>

      <main className={styles.stepBody}>
        {currentStep === 'play' && (
          <StepPlay
            hanzi={hanzi}
            completed={!!cp?.steps.play}
            onComplete={() => onStepDone('play')}
          />
        )}
        {currentStep === 'recognize' && (
          <StepRecognize
            hanzi={hanzi}
            completed={!!cp?.steps.recognize}
            onComplete={() => onStepDone('recognize')}
          />
        )}
        {currentStep === 'write' && (
          <StepWrite
            hanzi={hanzi}
            completed={!!cp?.steps.write}
            onComplete={() => onStepDone('write')}
          />
        )}
        {currentStep === 'practice' && (
          <StepPractice
            hanzi={hanzi}
            completed={!!cp?.steps.practice}
            onComplete={() => onStepDone('practice')}
          />
        )}
        {currentStep === 'read' && (
          <StepRead
            hanzi={hanzi}
            completed={!!cp?.steps.read}
            onComplete={() => onStepDone('read')}
          />
        )}
      </main>

      {celebrate && <StarCelebration stars={celebrate.stars} />}

      {allDone && !celebrate && (
        <div className={styles.allDoneBanner}>
          🎉 这个字已经全部学会啦！回地图继续冒险吧～
          <button className={styles.btnPrimary} onClick={() => navigate(ROUTES.MAP_LEVEL(data.currentLevel))}>
            回地图
          </button>
        </div>
      )}
    </div>
  );
}

export default Learn;
