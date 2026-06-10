import { useEffect, useRef, useState } from 'react';
import { speak } from '@/utils/speech';
import { useSound } from '@/hooks/useSound';
import type { StepReadProps } from './types';
import styles from './StepRead.module.scss';

function StepRead({ hanzi, completed, onComplete }: StepReadProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(completed);
  const [micSupported, setMicSupported] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { playCorrect, playClick } = useSound();

  useEffect(() => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setMicSupported(false);
    }
  }, []);

  function playSentence(s: string) {
    void speak(s, { rate: 0.8 });
  }

  async function startRecord() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicSupported(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecording(true);
    } catch (e) {
      console.warn('mic error', e);
      setMicSupported(false);
    }
  }

  function stopRecord() {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') {
      rec.stop();
    }
    setRecording(false);
  }

  function toggleRecord() {
    playClick();
    if (recording) stopRecord();
    else startRecord();
  }

  function confirmRead() {
    playCorrect();
    setConfirmed(true);
    onComplete();
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>🔊 读一读这个字</h3>

      <section className={styles.sentenceList}>
        {hanzi.sentences.map((s: string, i: number) => (
          <div key={i} className={styles.sentenceItem}>
            <span className={styles.sentenceNum}>{i + 1}</span>
            <span className={styles.sentenceText}>
              {s.split(hanzi.char).map((part: string, idx: number, arr: string[]) => (
                <span key={idx}>
                  {part}
                  {idx < arr.length - 1 && <span className={styles.hanziChar}>{hanzi.char}</span>}
                </span>
              ))}
            </span>
            <button className={styles.speakBtn} onClick={() => playSentence(s)}>▶ 听</button>
          </div>
        ))}
      </section>

      <section className={styles.recordBox}>
        <div className={styles.recordLabel}>
          {micSupported ? (
            <>
              {recording
                ? '🎤 正在录音…（再次点击结束）'
                : audioUrl
                ? '可以回放啦，或再次录音'
                : '🎤 长按或点击麦克风跟读'}
            </>
          ) : (
            '当前浏览器不支持录音，可以先听一听读一读。'
          )}
        </div>

        {micSupported && (
          <button
            className={`${styles.micBtn} ${recording ? styles.recording : ''}`}
            onClick={toggleRecord}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className={styles.micIcon}>{recording ? '⏺' : '🎙'}</span>
            <span className={styles.micLabel}>{recording ? '停止录音' : '开始录音'}</span>
          </button>
        )}

        {audioUrl && (
          <div className={styles.playerWrap}>
            <audio controls src={audioUrl} className={styles.player} />
          </div>
        )}
      </section>

      <section className={styles.readTips}>
        <div className={styles.tipRow}>
          <span className={styles.icon}>👂</span>
          <span>先听标准朗读，再尝试跟读</span>
        </div>
        <div className={styles.tipRow}>
          <span className={styles.icon}>💪</span>
          <span>大声读出来，更容易记住</span>
        </div>
      </section>

      <div className={styles.footer}>
        {confirmed ? (
          <div className={styles.doneTag}>✓ 我会读啦！</div>
        ) : (
          <button className={styles.primaryBtn} onClick={confirmRead}>
            我会读啦！
          </button>
        )}
      </div>
    </div>
  );
}

export default StepRead;
