import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'zh' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'zh',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set({ language: get().language === 'zh' ? 'en' : 'zh' }),
    }),
    {
      name: 'la-language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
