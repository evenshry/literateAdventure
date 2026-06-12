import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHanzi } from '@/data/hanziData';
import { useProgressStore } from '@/store/progressStore';
import { useLanguageStore } from '@/store/languageStore';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import { ROUTES } from '@/routes';
import LanguageSwitcher from '@components/LanguageSwitcher';
import type { StepId } from '@/types/global';
import StepPlay from '@components/StepPlay';
import StepRecognize from '@components/StepRecognize';
import StepWrite from '@components/StepWrite';
import StepPractice from '@components/StepPractice';
import StepRead from '@components/StepRead';
import StarCelebration from '@components/StarCelebration';
import styles from './index.module.scss';

const STEPS: { id: StepId; labelZh: string; labelEn: string; icon: string }[] = [
  { id: 'play', labelZh: '玩', labelEn: 'Play', icon: '🎮' },
  { id: 'recognize', labelZh: '识', labelEn: 'Meet', icon: '👀' },
  { id: 'write', labelZh: '写', labelEn: 'Write', icon: '✍️' },
  { id: 'practice', labelZh: '练', labelEn: 'Practice', icon: '🎯' },
  { id: 'read', labelZh: '读', labelEn: 'Read', icon: '🔊' },
];

function Learn() {
  const { char } = useParams();
  const navigate = useNavigate();
  const hanzi = useMemo(() => (char ? getHanzi(char) : undefined), [char]);
  const language = useLanguageStore((s) => s.language);
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
    const msg = language === 'zh' ? '找不到这个字，回到首页看看吧～' : "Hmm, can't find this word — back home?";
    const back = language === 'zh' ? '回首页' : 'Back home';
    return (
      <div className={styles.fallback}>
        <p>{msg}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          {back}
        </button>
      </div>
    );
  }

  const currentChar = hanzi.char;
  const cp = data.charProgress[currentChar];
  const allDone = cp?.completed ?? false;
  const isEnglish = hanzi.level.startsWith('EN');

  function onStepDone(stepId: StepId) {
    playCorrect();
    markStepComplete(currentChar, stepId);
    void speak(language === 'zh' ? '真棒！' : 'Great job!', { rate: 1.0 });
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
    void speak(isEnglish ? currentChar : currentChar, { rate: isEnglish ? 0.85 : 0.7, pitch: 1.15 });
  }

  const backLabel = language === 'zh' ? '← 回地图' : '← Back to map';
  const allDoneLabel =
    language === 'zh'
      ? '🎉 这个字已经全部学会啦！回地图继续冒险吧～'
      : '🎉 All steps done! Head back to the map for more adventure～';
  const backMapBtn = language === 'zh' ? '回地图' : 'Map';

  return (
    <div className={styles.learnPage}>
      <header className={styles.learnHeader}>
        <button className={styles.backBtn} onClick={() => navigate(`/map/${data.currentLevel}`)}>
          {backLabel}
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <LanguageSwitcher compact />
          <div className={styles.starsTop}>
            {[1, 2, 3].map((s) => (
              <span key={s} className={`${styles.topStar} ${s <= (cp?.stars ?? 0) ? styles.topLit : ''}`}>
                ★
              </span>
            ))}
          </div>
        </div>
      </header>

      <nav className={styles.stepTabs}>
        {STEPS.map((s, idx) => {
          const done = cp?.steps[s.id] ?? false;
          const active = currentStep === s.id;
          const label = language === 'zh' ? s.labelZh : s.labelEn;
          return (
            <button
              key={s.id}
              className={`${styles.stepTab} ${active ? styles.active : ''} ${done ? styles.done : ''}`}
              onClick={() => setCurrentStep(s.id)}
            >
              <span className={styles.stepIdx}>{idx + 1}</span>
              <span className={styles.stepIcon}>{s.icon}</span>
              <span className={styles.stepLabel}>{label}</span>
              {done && <span className={styles.stepCheck}>✓</span>}
            </button>
          );
        })}
      </nav>

      <main className={styles.stepBody}>
        {currentStep === 'play' && (
          <StepPlay hanzi={hanzi} completed={!!cp?.steps.play} onComplete={() => onStepDone('play')} />
        )}
        {currentStep === 'recognize' && (
          <StepRecognize
            hanzi={hanzi}
            completed={!!cp?.steps.recognize}
            onComplete={() => onStepDone('recognize')}
          />
        )}
        {currentStep === 'write' && (
          <StepWrite hanzi={hanzi} completed={!!cp?.steps.write} onComplete={() => onStepDone('write')} />
        )}
        {currentStep === 'practice' && (
          <StepPractice
            hanzi={hanzi}
            completed={!!cp?.steps.practice}
            onComplete={() => onStepDone('practice')}
          />
        )}
        {currentStep === 'read' && (
          <StepRead hanzi={hanzi} completed={!!cp?.steps.read} onComplete={() => onStepDone('read')} />
        )}
      </main>

      {celebrate && <StarCelebration stars={celebrate.stars} />}

      {allDone && !celebrate && (
        <div className={styles.allDoneBanner}>
          <span>{allDoneLabel}</span>
          <button className={styles.btnPrimary} onClick={() => navigate(ROUTES.MAP_LEVEL(data.currentLevel))}>
            {backMapBtn}
          </button>
        </div>
      )}
    </div>
  );
}

export default Learn;
