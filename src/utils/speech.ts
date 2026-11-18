let voicesReady: Promise<void> | null = null;

const voiceCache = new Map<string, SpeechSynthesisVoice | null>();

function pickVoice(lang: 'zh' | 'en', preferFemale: boolean): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const matched = voices.filter((v) => {
    const value = `${v.lang} ${v.name}`.toLowerCase();
    return lang === 'zh'
      ? value.startsWith('zh') || value.includes('cmn') || value.includes('chinese')
      : value.startsWith('en');
  });

  if (matched.length === 0) return null;

  const genderMatch = matched.find((v) =>
    preferFemale ? v.name.toLowerCase().includes('female') : v.name.toLowerCase().includes('male')
  );
  return genderMatch ?? matched[0];
}

function ensureVoicesLoaded(): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length > 0) {
      resolve();
      return;
    }
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    // 部分浏览器不会触发 voiceschanged，兜底超时
    setTimeout(handler, 1500);
  });

  return voicesReady;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceType?: 'male' | 'female';
  /** 朗读语言，默认中文 */
  lang?: 'zh' | 'en';
}

export async function speak(text: string, opts: SpeakOptions = {}) {
  if (!('speechSynthesis' in window)) return;
  try {
    await ensureVoicesLoaded();
    window.speechSynthesis.cancel();

    const lang = opts.lang ?? 'zh';
    const preferFemale = (opts.voiceType ?? 'female') === 'female';
    const cacheKey = `${lang}:${preferFemale ? 'female' : 'male'}`;

    if (!voiceCache.has(cacheKey)) {
      voiceCache.set(cacheKey, pickVoice(lang, preferFemale));
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'en' ? 'en-US' : 'zh-CN';
    utter.rate = opts.rate ?? 0.85;
    utter.pitch = opts.pitch ?? 1.1;
    const voice = voiceCache.get(cacheKey);
    if (voice) utter.voice = voice;

    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn('[speech] speak failed', e);
  }
}
