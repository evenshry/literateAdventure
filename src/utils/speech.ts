let cachedVoice: SpeechSynthesisVoice | null = null;

function pickChineseVoice(preferFemale: boolean = true): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 优先选择中文语音
  const zhVoices = voices.filter(
    (v) =>
      v.lang &&
      (v.lang.toLowerCase().startsWith('zh') ||
        v.lang.toLowerCase().includes('cmn') ||
        v.lang.toLowerCase().includes('chinese'))
  );

  if (zhVoices.length > 0) {
    // 尝试按性别筛选（部分语音有 female/male 标识）
    const genderMatch = zhVoices.find(v => 
      preferFemale 
        ? v.name.toLowerCase().includes('female')
        : v.name.toLowerCase().includes('male')
    );
    return genderMatch ?? zhVoices[0];
  }

  return voices[0] ?? null;
}

function ensureVoicesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
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
    setTimeout(resolve, 1500);
  });
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceType?: 'male' | 'female';
}

export async function speak(text: string, opts: SpeakOptions = {}) {
  if (!('speechSynthesis' in window)) return;
  try {
    await ensureVoicesLoaded();
    window.speechSynthesis.cancel();

    const preferFemale = (opts.voiceType ?? 'female') === 'female';
    if (!cachedVoice) cachedVoice = pickChineseVoice(preferFemale);

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = opts.rate ?? 0.85;
    utter.pitch = opts.pitch ?? 1.1;
    if (cachedVoice) utter.voice = cachedVoice;

    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn('[speech] speak failed', e);
  }
}

export function stopSpeak() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}
