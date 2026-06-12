import { useLanguageStore, type Language } from '@/store/languageStore';
import { t, type DictKey } from './dict';

export function useI18n(): {
  language: Language;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isZh: boolean;
} {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();
  return {
    language,
    t: (key, vars) => t(language, key, vars),
    setLanguage,
    toggleLanguage,
    isZh: language === 'zh',
  };
}
