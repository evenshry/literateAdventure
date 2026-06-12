import { useLanguageStore, type Language } from '@/store/languageStore';

interface LanguageSwitcherProps {
  compact?: boolean;
}

const buttonBase: React.CSSProperties = {
  borderRadius: 999,
  border: '1px solid #d9d9d9',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  color: '#333',
  padding: '6px 10px',
  fontFamily: 'inherit',
};

const buttonLarge: React.CSSProperties = {
  ...buttonBase,
  padding: '8px 14px',
};

function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore();

  function toggle() {
    const next: Language = language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
  }

  const label = language === 'zh' ? '中 / EN' : 'EN / 中';

  return (
    <button
      onClick={toggle}
      style={compact ? buttonBase : buttonLarge}
      aria-label="switch language"
      type="button"
    >
      {compact ? label : `🌐 ${label}`}
    </button>
  );
}

export default LanguageSwitcher;
