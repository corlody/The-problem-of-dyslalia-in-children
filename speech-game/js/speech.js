/* ============================================================
   speech.js — TTS (озвучка), распознавание речи, запись
   ============================================================ */

let cachedVoice = null;
let voicesLoaded = false;
let recorder = null;
let recordedChunks = [];

// ---------- TTS: озвучка ----------
export function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  voicesLoaded = true;

  // Приоритет: ru-RU → ru → начинается с ru → имя содержит russian
  cachedVoice =
    voices.find(v => v.lang === 'ru-RU') ||
    voices.find(v => v.lang === 'ru') ||
    voices.find(v => v.lang && v.lang.startsWith('ru')) ||
    voices.find(v => v.name && /russian|русск/i.test(v.name)) ||
    null;

  console.log('🎤 Голосов:', voices.length, '| Русский:', cachedVoice ? cachedVoice.name : 'НЕ НАЙДЕН');
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function hasRussianVoice() { return !!cachedVoice; }

export function speak(text, options = {}) {
  if (!('speechSynthesis' in window)) return false;
  if (!voicesLoaded) loadVoices();
  if (!cachedVoice) return false;

  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ru-RU';
  u.voice = cachedVoice;
  u.rate = options.rate ?? 0.9;
  u.pitch = options.pitch ?? 1.1;
  u.volume = options.volume ?? 1;
  if (options.onEnd) u.onend = options.onEnd;
  if (options.onError) u.onerror = options.onError;
  speechSynthesis.speak(u);
  return true;
}

export function stopSpeak() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

// Подробная инструкция по установке голоса
export function getVoiceInstallGuide() {
  return [
    '🔊 Как установить русскую озвучку:',
    '',
    '📱 Android:',
    '1. Настройки → Система → Язык и ввод',
    '2. Синтез речи → Google → установить русский',
    '3. Скачать Google TTS из Play Маркета',
    '',
    '📱 iOS:',
    '1. Настройки → Универсальный доступ → Речь',
    '2. Голоса → Русский → скачать',
    '',
    '💻 Windows:',
    '1. Параметры → Время и язык → Речь',
    '2. Добавить голоса → Русский',
    '',
    '💻 Mac:',
    '1. Системные настройки → Универсальный доступ',
    '2. Устная речь → Системный голос → Русский',
  ].join('\n');
}

// ---------- Распознавание речи (ребёнок говорит) ----------
export function isRecognitionAvailable() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function recognizeOnce(options = {}) {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { reject(new Error('Распознавание не поддерживается')); return; }
    const rec = new SR();
    rec.lang = options.lang || 'ru-RU';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    let done = false;
    rec.onresult = (e) => {
      done = true;
      const text = e.results[0][0].transcript;
      resolve(text);
    };
    rec.onerror = (e) => { if (!done) reject(new Error(e.error || 'recognition error')); };
    rec.onend = () => { if (!done) reject(new Error('no speech')); };

    try { rec.start(); }
    catch (e) { reject(e); }

    if (options.timeout) {
      setTimeout(() => { try { rec.stop(); } catch(e){} if (!done) reject(new Error('timeout')); }, options.timeout);
    }
  });
}

// Сравнение услышанного с ожидаемым словом (простое)
export function compareWords(heard, expected) {
  const norm = s => String(s || '').toLowerCase().replace(/ё/g,'е').replace(/[^\wа-я]/gi,'');
  const a = norm(heard);
  const b = norm(expected);
  if (!a || !b) return { match: false, score: 0 };
  if (a === b) return { match: true, score: 1 };
  // Частичное совпадение — если услышали корень
  if (a.includes(b) || b.includes(a)) return { match: true, score: 0.8 };
  // Расстояние Левенштейна
  const d = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  const score = 1 - d / maxLen;
  return { match: score > 0.7, score };
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    }
  }
  return dp[a.length][b.length];
}

// ---------- Запись голоса (для самоконтроля) ----------
export async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Запись не поддерживается');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);
  recordedChunks = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.push(e.data); };
  recorder.start();
  return true;
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!recorder) { resolve(null); return; }
    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      recorder.stream.getTracks().forEach(t => t.stop());
      recorder = null;
      resolve(blob);
    };
    recorder.stop();
  });
}

export function playRecording(blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  audio.onended = () => URL.revokeObjectURL(url);
  return audio;
}

window.Speech = {
  speak, stopSpeak, hasRussianVoice, getVoiceInstallGuide,
  isRecognitionAvailable, recognizeOnce, compareWords,
  startRecording, stopRecording, playRecording,
};