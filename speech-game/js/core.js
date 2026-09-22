/* ============================================================
   core.js — общий модуль для "Говорю правильно" v5.2
   - Языки из data/i18n/{code}.json
   - 18 тем с день/ночь
   - Выбор и прослушивание голоса
   - Бэкап, баг-репорт, достижения, ИИ-кнопки
   ============================================================ */

export const CORE_VERSION = '5.2.0';

// ============================================================
// ЯЗЫКИ
// ============================================================
export const LANGUAGES = [
  { code: 'ru', label: '🇷🇺 Русский',    name: 'Русский' },
  { code: 'en', label: '🇬🇧 English',    name: 'English' },
  { code: 'zh', label: '🇨🇳 中文',        name: '中文' },
  { code: 'uk', label: '🇺🇦 Українська', name: 'Українська' },
  { code: 'kk', label: '🇰🇿 Қазақша',    name: 'Қазақша' },
  { code: 'be', label: '🇧🇾 Беларуская', name: 'Беларуская' },
  { code: 'de', label: '🇩🇪 Deutsch',    name: 'Deutsch' },
  { code: 'fr', label: '🇫🇷 Français',   name: 'Français' },
  { code: 'es', label: '🇪🇸 Español',    name: 'Español' },
  { code: 'tr', label: '🇹🇷 Türkçe',     name: 'Türkçe' },
];

// ============================================================
// ТЕМЫ
// ============================================================
export const THEMES = [
  { id: 'game',      label: '🎮 Игровая' },
  { id: 'official',  label: '📄 Официальная' },
  { id: 'elderly',   label: '👴 Для пожилых' },
  { id: 'sakura',    label: '🌸 Сакура',    variants: ['day','night'] },
  { id: 'cosmos',    label: '🌌 Космос' },
  { id: 'hacker',    label: '💻 Хакер' },
  { id: 'summer',    label: '☀️ Лето',      variants: ['day','night'] },
  { id: 'autumn',    label: '🍂 Осень',     variants: ['day','night'] },
  { id: 'winter',    label: '❄️ Зима',      variants: ['day','night'] },
  { id: 'spring',    label: '🌷 Весна',     variants: ['day','night'] },
  { id: 'ocean',     label: '🌊 Океан',     variants: ['day','night'] },
  { id: 'cyberpunk', label: '🌆 Киберпанк' },
  { id: 'forest',    label: '🌲 Лес',       variants: ['day','night'] },
  { id: 'retro',     label: '🎮 Ретро 8-бит' },
  { id: 'minimal',   label: '🧊 Минимализм', variants: ['day','night'] },
  { id: 'pastel',    label: '🌈 Пастель' },
  { id: 'oriental',  label: '🕌 Восток' },
  { id: 'neon',      label: '⚡ Неон' },
];

// ============================================================
// СОСТОЯНИЕ
// ============================================================
const DEFAULTS = {
  theme: 'game',
  dayNight: 'day',
  language: 'ru',
  fontSize: 'normal',
  highContrast: false,
  dyslexiaFont: false,
  haptics: true,
  soundEffects: true,
  reducedMotion: false,
  preferredVoiceURI: '',
};

export const state = { ...DEFAULTS, achievements: [] };

// ============================================================
// ХРАНИЛИЩЕ
// ============================================================
export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('core_state_v5') || '{}');
    Object.assign(state, DEFAULTS, saved);
    if (!Array.isArray(state.achievements)) state.achievements = [];
  } catch (e) {}
  return state;
}

export function saveState() {
  try { localStorage.setItem('core_state_v5', JSON.stringify(state)); } catch (e) {}
}

// ============================================================
// I18N — загрузка языков
// ============================================================
let translations = {};
let fallbackTranslations = null;
let loadingPromise = null;

async function fetchJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function ensureFallback() {
  if (fallbackTranslations) return fallbackTranslations;
  try { fallbackTranslations = await fetchJSON('data/i18n/ru.json'); }
  catch (e) { fallbackTranslations = {}; }
  return fallbackTranslations;
}

export async function loadLanguage(code) {
  if (loadingPromise && translations._lang === code) return loadingPromise;

  loadingPromise = (async () => {
    await ensureFallback();
    if (code === 'ru') {
      translations = { ...fallbackTranslations, _lang: 'ru' };
      return translations;
    }
    try {
      const data = await fetchJSON(`data/i18n/${code}.json`);
      translations = { ...data, _lang: code };
    } catch (e) {
      console.warn(`Язык "${code}" не загружен, использую ru`);
      translations = { ...fallbackTranslations, _lang: 'ru' };
    }
    return translations;
  })();

  return loadingPromise;
}

// Умный t() с fallback по секциям
export function t(key, fallbackValue) {
  const parts = String(key).split('.');

  const dig = (obj, path) => {
    let v = obj;
    for (const p of path) {
      if (v && v[p] !== undefined) v = v[p];
      else return undefined;
    }
    return v;
  };

  // 1. Прямой поиск
  let v = dig(translations, parts);
  if (v !== undefined) return v;

  // 2. Если ключ однословный — ищем во всех секциях
  if (parts.length === 1) {
    const sections = ['core', 'header', 'nav', 'about', 'rules', 'cards', 'map', 'parent', 'game', 'research', 'footer'];
    for (const sec of sections) {
      v = dig(translations, [sec, parts[0]]);
      if (v !== undefined) return v;
    }
  }

  // 3. Fallback на ru
  v = dig(fallbackTranslations || {}, parts);
  if (v !== undefined) return v;

  if (parts.length === 1) {
    const sections = ['core', 'header', 'nav', 'about', 'rules', 'cards', 'map', 'parent', 'game', 'research', 'footer'];
    for (const sec of sections) {
      v = dig(fallbackTranslations || {}, [sec, parts[0]]);
      if (v !== undefined) return v;
    }
  }

  return fallbackValue !== undefined ? fallbackValue : key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const v = t(key);
    if (v && v !== key) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const v = t(key);
    if (v && v !== key) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = t(el.dataset.i18nPlaceholder);
    if (v) el.placeholder = v;
  });
}

// ============================================================
// ТЕМА
// ============================================================
export function setTheme(id, options = {}) {
  const theme = THEMES.find(t => t.id === id);
  if (!theme) return;
  state.theme = id;
  const supportsVariants = theme.variants && theme.variants.length;
  let dayNight = state.dayNight;
  if (!supportsVariants) dayNight = 'day';
  if (options.dayNight) dayNight = options.dayNight;
  state.dayNight = dayNight;
  const attr = (dayNight === 'night' && supportsVariants) ? `${id}-night` : id;
  document.documentElement.setAttribute('data-theme', attr);
  document.documentElement.setAttribute('data-theme-base', id);
  document.documentElement.setAttribute('data-daynight', dayNight);
  saveState();
  document.dispatchEvent(new CustomEvent('core:themechange', { detail: { theme: id, dayNight } }));
}

export function setDayNight(mode) { setTheme(state.theme, { dayNight: mode }); }

// ============================================================
// ЯЗЫК
// ============================================================
export async function setLanguage(code) {
  if (!LANGUAGES.find(l => l.code === code)) return;
  state.language = code;
  await loadLanguage(code);
  document.documentElement.lang = code;
  document.documentElement.dir = 'ltr';
  saveState();
  applyTranslations();
  document.dispatchEvent(new CustomEvent('core:languagechange', { detail: { code } }));
}

// ============================================================
// ДОСТУПНОСТЬ
// ============================================================
export function applyAccessibility() {
  const r = document.documentElement;
  r.classList.toggle('font-small',  state.fontSize === 'small');
  r.classList.toggle('font-normal', state.fontSize === 'normal');
  r.classList.toggle('font-large',  state.fontSize === 'large');
  r.classList.toggle('font-huge',   state.fontSize === 'huge');
  r.classList.toggle('high-contrast', !!state.highContrast);
  r.classList.toggle('dyslexia-font', !!state.dyslexiaFont);
  r.classList.toggle('reduce-motion', !!state.reducedMotion);
}

// ============================================================
// ВИБРАЦИЯ
// ============================================================
export function haptic(pattern = 20) {
  if (!state.haptics) return;
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
}

// ============================================================
// TOAST
// ============================================================
export function toast(message, type = 'info', duration = 3200) {
  let wrap = document.getElementById('core-toasts');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'core-toasts';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = `core-toast core-toast-${type}`;
  el.textContent = message;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 350); }, duration);
}

// ============================================================
// ДОСТИЖЕНИЯ
// ============================================================
export const ACHIEVEMENTS = [
  { id: 'first_move',   emoji: '🎲', name: 'Первый ход' },
  { id: 'first_child',  emoji: '👶', name: 'Первый ребёнок' },
  { id: 'five_right',   emoji: '🌟', name: '5 правильных подряд' },
  { id: 'ten_right',    emoji: '💫', name: '10 правильных подряд' },
  { id: 'all_sounds',   emoji: '🔊', name: 'Все звуки' },
  { id: 'win',          emoji: '🏆', name: 'Победа!' },
  { id: 'marathon',     emoji: '🏃', name: 'Марафон' },
  { id: 'streak_3',     emoji: '📅', name: '3 дня подряд' },
  { id: 'streak_7',     emoji: '🔥', name: 'Неделя занятий' },
  { id: 'night_owl',    emoji: '🦉', name: 'Ночная игра' },
  { id: 'explorer',     emoji: '🧭', name: 'Исследователь (все темы)' },
];

export function unlockAchievement(id) {
  if (state.achievements.includes(id)) return false;
  state.achievements.push(id);
  saveState();
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (a) {
    toast(`${a.emoji} ${a.name}`, 'success', 4000);
    haptic([30, 40, 30]);
  }
  return true;
}

export function getAchievements() { return state.achievements.slice(); }

// ============================================================
// ГOЛОС — выбор и прослушивание
// ============================================================
let allVoices = [];
let voicesLoaded = false;

function loadVoicesInternal() {
  if (!('speechSynthesis' in window)) return;
  const v = speechSynthesis.getVoices();
  if (!v.length) return;
  allVoices = v;
  voicesLoaded = true;
}

if ('speechSynthesis' in window) {
  loadVoicesInternal();
  window.speechSynthesis.onvoiceschanged = loadVoicesInternal;
}

export function getRussianVoices() {
  if (!voicesLoaded) loadVoicesInternal();
  return allVoices.filter(v => v.lang && (v.lang === 'ru-RU' || v.lang === 'ru' || v.lang.startsWith('ru')));
}

export function getAllVoices() {
  if (!voicesLoaded) loadVoicesInternal();
  return allVoices;
}

export function getPreferredVoice() {
  const russian = getRussianVoices();
  if (russian.length === 0) return null;

  // Сохранённый голос
  if (state.preferredVoiceURI) {
    const found = russian.find(v => v.voiceURI === state.preferredVoiceURI);
    if (found) return found;
  }

  // Приоритет: Google → Microsoft (Irina/Svetlana) → Apple (Milena) → любой русский
  const priorities = ['google', 'irina', 'svetlana', 'milena', 'yandex', 'katya', 'microsoft'];
  for (const p of priorities) {
    const found = russian.find(v => v.name.toLowerCase().includes(p));
    if (found) return found;
  }
  return russian[0];
}

export function setPreferredVoice(voiceURI) {
  state.preferredVoiceURI = voiceURI;
  saveState();
}

export function speakTest(text = 'Привет! Так звучит этот голос. Раз, два, три.', voiceURI = null) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  const voices = getRussianVoices();
  const voice = voiceURI ? voices.find(v => v.voiceURI === voiceURI) : getPreferredVoice();
  if (!voice) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = 'ru-RU';
  u.rate = 0.9;
  u.pitch = 1.05;
  u.volume = 1;
  speechSynthesis.speak(u);
  return true;
}

function openVoicePicker() {
  let modal = document.getElementById('core-voice-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'core-voice-modal';
    modal.className = 'core-modal';
    document.body.appendChild(modal);
  }

  const voices = getRussianVoices();
  const currentURI = state.preferredVoiceURI || (getPreferredVoice()?.voiceURI || '');

  const voicesHtml = voices.length === 0
    ? `<div style="padding:20px;text-align:center;color:var(--text-muted);">
        <p style="font-size:2rem;margin-bottom:12px;">🔇</p>
        <p><strong>Русские голоса не найдены на этом устройстве.</strong></p>
        <p style="font-size:.85rem;margin-top:8px;">Установите Google TTS (Android) или скачайте голос в настройках системы.</p>
        <p style="font-size:.85rem;margin-top:12px;">Подробная инструкция — в разделе «Скачать русский голос».</p>
      </div>`
    : voices.map(v => {
        const isSelected = v.voiceURI === currentURI;
        const isGoogle = v.name.toLowerCase().includes('google');
        const isMicrosoft = v.name.toLowerCase().includes('microsoft') || v.name.toLowerCase().includes('irina') || v.name.toLowerCase().includes('svetlana');
        const isApple = v.name.toLowerCase().includes('milena') || v.name.toLowerCase().includes('katya');
        let badge = '';
        if (isGoogle) badge = '<span style="background:rgba(16,185,129,.2);color:var(--green);padding:2px 10px;border-radius:30px;font-size:.7rem;font-weight:600;">Рекомендую</span>';
        else if (isMicrosoft) badge = '<span style="background:rgba(124,58,237,.2);color:var(--purple-light);padding:2px 10px;border-radius:30px;font-size:.7rem;font-weight:600;">Хороший</span>';
        else if (isApple) badge = '<span style="background:rgba(245,158,11,.2);color:var(--gold);padding:2px 10px;border-radius:30px;font-size:.7rem;font-weight:600;">Неплохой</span>';
        return `
          <div class="core-voice-item ${isSelected ? 'selected' : ''}" data-voice-uri="${v.voiceURI}">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${v.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px;">${v.lang} ${badge}</div>
            </div>
            <button class="core-btn voice-test-btn" data-test-uri="${v.voiceURI}" style="padding:6px 14px;font-size:.8rem;">▶ Прослушать</button>
          </div>
        `;
      }).join('');

  modal.innerHTML = `
    <div class="core-modal-box">
      <h3>🎙 Выбор голоса для озвучки</h3>
      <p style="color:var(--text-secondary);font-size:.85rem;margin-bottom:14px;">
        ${voices.length > 0 ? `Найдено русских голосов: <strong>${voices.length}</strong>. Нажмите ▶, чтобы услышать, как звучит голос.` : ''}
      </p>
      <div class="core-voice-list">${voicesHtml}</div>

      <div style="margin-top:16px;padding:12px 14px;background:rgba(124,58,237,.08);border-left:3px solid var(--purple);border-radius:0 10px 10px 0;font-size:.8rem;color:var(--text-secondary);">
        💡 <strong>Совет:</strong> лучший русский голос — <strong>Google TTS</strong> (Android). На iOS — <strong>Milena</strong>. На Windows — <strong>Irina Online</strong>. Если голос «противный», скорее всего стоит дефолтный — установите Google TTS.
      </div>

      <button class="core-btn primary" id="core-voice-close" style="margin-top:16px;">Готово</button>
    </div>
  `;

  modal.classList.add('active');

  // Клик по голосу — выбрать
  modal.querySelectorAll('.core-voice-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('voice-test-btn')) return;
      const uri = item.dataset.voiceUri;
      setPreferredVoice(uri);
      modal.querySelectorAll('.core-voice-item').forEach(x => x.classList.remove('selected'));
      item.classList.add('selected');
      toast('Голос выбран', 'success', 2000);
    });
  });

  // Прослушать
  modal.querySelectorAll('.voice-test-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uri = btn.dataset.testUri;
      btn.textContent = '🔊 Звучит...';
      speakTest('Раз, два, три. Так звучит этот голос.', uri);
      setTimeout(() => { btn.textContent = '▶ Прослушать'; }, 3000);
    });
  });

  modal.querySelector('#core-voice-close').onclick = () => modal.classList.remove('active');
  modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
}

// ============================================================
// BUG REPORT
// ============================================================
let actionLog = [];
export function logAction(action) {
  actionLog.push({ t: new Date().toISOString(), a: action });
  if (actionLog.length > 30) actionLog.shift();
}

function collectDiagnostics() {
  return {
    version: CORE_VERSION,
    page: location.pathname,
    theme: state.theme,
    dayNight: state.dayNight,
    language: state.language,
    fontSize: state.fontSize,
    highContrast: state.highContrast,
    dyslexiaFont: state.dyslexiaFont,
    reducedMotion: state.reducedMotion,
    voiceURI: state.preferredVoiceURI || '(авто)',
    ua: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${innerWidth}x${innerHeight}`,
    dpr: window.devicePixelRatio || 1,
    time: new Date().toISOString(),
    actions: actionLog.slice(-20),
    storageKeys: Object.keys(localStorage).slice(0, 40),
  };
}

export function openBugReport() {
  let modal = document.getElementById('core-bug-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'core-bug-modal';
    modal.className = 'core-modal';
    modal.innerHTML = `
      <div class="core-modal-box">
        <h3>🐞 ${t('core.bugTitle', 'Что-то сломалось?')}</h3>
        <label>${t('core.bugName', 'Ваше имя (необязательно)')}</label>
        <input type="text" id="bugName" placeholder="—">
        <label>${t('core.bugProblem', 'Опишите проблему')}</label>
        <textarea id="bugProblem" rows="4" placeholder="Что не работает?"></textarea>
        <label>${t('core.bugSteps', 'Что вы делали перед этим?')}</label>
        <textarea id="bugSteps" rows="3" placeholder="Нажимал... открывал..."></textarea>
        <details style="margin-top:12px;">
          <summary style="cursor:pointer;color:var(--text-secondary);font-size:.9rem;">🔍 ${t('core.bugAuto', 'Автоматически прикреплено')}</summary>
          <pre id="bugDiag" style="font-size:.7rem;overflow:auto;max-height:150px;background:rgba(0,0,0,.25);padding:8px;border-radius:8px;margin-top:6px;"></pre>
        </details>
        <div class="core-modal-actions">
          <button class="core-btn primary" id="bugDownload">⬇ ${t('core.bugDownload', 'Скачать отчёт')}</button>
          <button class="core-btn" id="bugCopy">📋 ${t('core.bugCopy', 'Скопировать')}</button>
          <button class="core-btn" id="bugCancel">${t('core.bugClose', 'Закрыть')}</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
  const diag = collectDiagnostics();
  document.getElementById('bugDiag').textContent = JSON.stringify(diag, null, 2);

  const buildText = () => {
    const name = document.getElementById('bugName').value.trim() || '—';
    const problem = document.getElementById('bugProblem').value.trim() || '—';
    const steps = document.getElementById('bugSteps').value.trim() || '—';
    return [
      '=== ОТЧЁТ О ПРОБЛЕМЕ ===',
      `Имя: ${name}`,
      `Проблема: ${problem}`,
      `Что делал: ${steps}`,
      '',
      '=== ДИАГНОСТИКА ===',
      JSON.stringify(diag, null, 2),
    ].join('\n');
  };

  document.getElementById('bugDownload').onclick = () => {
    const blob = new Blob([buildText()], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = URL.createObjectURL(blob);
    a.download = `bug_${stamp}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(t('core.bugThanks', 'Спасибо! Отчёт сохранён.'), 'success');
  };
  document.getElementById('bugCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(buildText()); toast(t('core.bugCopied', 'Скопировано'), 'success'); }
    catch (e) { toast('Не удалось скопировать', 'error'); }
  };
  document.getElementById('bugCancel').onclick = () => modal.classList.remove('active');
  modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
}

// ============================================================
// БЭКАП
// ============================================================
export function exportAllData() {
  const dump = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    try { dump[k] = JSON.parse(localStorage.getItem(k)); }
    catch (e) { dump[k] = localStorage.getItem(k); }
  }
  const payload = { exportedAt: new Date().toISOString(), version: CORE_VERSION, data: dump };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = URL.createObjectURL(blob);
  a.download = `backup_govoryu_pravilno_${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Резервная копия сохранена', 'success');
}

export function importAllData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const data = parsed.data || parsed;
      if (!confirm(t('core.confirmRestore', 'Заменить текущие данные?'))) return;
      Object.entries(data).forEach(([k, v]) => {
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
      toast(t('core.restoreSuccess', 'Данные восстановлены!'), 'success');
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      toast(t('core.restoreError', 'Ошибка чтения файла'), 'error');
    }
  };
  reader.readAsText(file);
}

// ============================================================
// ПЛАВАЮЩИЕ КНОПКИ
// ============================================================
function buildFloatingButtons() {
  let wrap = document.getElementById('core-float-buttons');
  if (wrap) return wrap;
  wrap = document.createElement('div');
  wrap.id = 'core-float-buttons';
  wrap.innerHTML = `
    <button id="core-btn-ai" class="core-fab" title="${t('core.aiHelp', 'Помощник')}">🤖</button>
    <button id="core-btn-achievements" class="core-fab" title="${t('core.achievements', 'Достижения')}">🏅</button>
    <button id="core-btn-bug" class="core-fab bug" title="${t('core.bugReport', 'Сообщить о проблеме')}">🐞</button>
    <button id="core-btn-settings" class="core-fab" title="${t('core.settings', 'Настройки')}">⚙️</button>
  `;
  document.body.appendChild(wrap);
  document.getElementById('core-btn-bug').onclick = openBugReport;
  document.getElementById('core-btn-settings').onclick = toggleSettingsPanel;
  document.getElementById('core-btn-achievements').onclick = openAchievementsPanel;
  document.getElementById('core-btn-ai').onclick = () => {
    if (window.AIAssistant && typeof window.AIAssistant.open === 'function') window.AIAssistant.open();
    else toast('Помощник загружается...', 'info');
  };
  return wrap;
}

// ============================================================
// ПАНЕЛЬ НАСТРОЕК
// ============================================================
export function toggleSettingsPanel() {
  let panel = document.getElementById('core-settings-panel');
  if (!panel) panel = buildSettingsPanel();
  panel.classList.toggle('open');
}

function buildSettingsPanel() {
  const panel = document.createElement('div');
  panel.id = 'core-settings-panel';
  panel.className = 'core-settings-panel';

  const themeOptions = THEMES.map(th => {
    const variants = th.variants || [];
    return `<div class="core-theme-card" data-theme="${th.id}">
      <div class="core-theme-label">${th.label}</div>
      ${variants.length ? `<div class="core-daynight">
        <button data-daynight="day" class="core-dn-btn">☀️ ${t('core.day', 'День')}</button>
        <button data-daynight="night" class="core-dn-btn">🌙 ${t('core.night', 'Ночь')}</button>
      </div>` : ''}
    </div>`;
  }).join('');

  const langOptions = LANGUAGES.map(l => `<option value="${l.code}">${l.label}</option>`).join('');

  panel.innerHTML = `
    <h3>⚙️ ${t('core.settings', 'Настройки')}</h3>

    <div class="core-setting">
      <label>${t('core.theme', 'Тема')}</label>
      <div class="core-theme-grid">${themeOptions}</div>
    </div>

    <div class="core-setting">
      <label>${t('core.language', 'Язык')}</label>
      <select id="core-lang-select">${langOptions}</select>
    </div>

    <div class="core-setting">
      <label>${t('core.fontSize', 'Размер шрифта')}</label>
      <div class="core-btn-row">
        <button data-fs="small">${t('core.small', 'Мелкий')}</button>
        <button data-fs="normal">${t('core.normal', 'Средний')}</button>
        <button data-fs="large">${t('core.large', 'Крупный')}</button>
        <button data-fs="huge">${t('core.huge', 'Огромный')}</button>
      </div>
    </div>

    <div class="core-setting core-switches">
      <label class="core-switch"><input type="checkbox" id="core-hc"><span class="core-switch-label">${t('core.highContrast', 'Высокий контраст')}</span><span></span></label>
      <label class="core-switch"><input type="checkbox" id="core-df"><span class="core-switch-label">${t('core.dyslexiaFont', 'Шрифт для дислексии')}</span><span></span></label>
      <label class="core-switch"><input type="checkbox" id="core-hp"><span class="core-switch-label">${t('core.haptics', 'Вибрация')}</span><span></span></label>
      <label class="core-switch"><input type="checkbox" id="core-se"><span class="core-switch-label">${t('core.soundEffects', 'Звуковые эффекты')}</span><span></span></label>
      <label class="core-switch"><input type="checkbox" id="core-rm"><span class="core-switch-label">${t('core.reducedMotion', 'Меньше анимаций')}</span><span></span></label>
    </div>

    <div class="core-setting">
      <label>🎙 Голос для озвучки</label>
      <div class="core-btn-row">
        <button id="core-voice-picker" style="flex:1;">Выбрать голос и прослушать</button>
      </div>
      <div class="core-voice-hint" style="margin-top:8px;">
        ${t('core.voiceHint', 'Как установить русскую озвучку')}:<br>
        • Android: Настройки → Язык и ввод → Синтез речи → Google → Русский<br>
        • iOS: Настройки → Универсальный доступ → Речь → Голоса → Русский<br>
        • <a href="https://play.google.com/store/apps/details?id=com.google.android.tts" target="_blank">Google TTS</a>
      </div>
    </div>

    <div class="core-setting">
      <label>💾 ${t('core.backup', 'Резервная копия')}</label>
      <div class="core-btn-row">
        <button id="core-export">${t('core.downloadAll', 'Скачать все данные')}</button>
        <label class="core-btn" style="cursor:pointer;">${t('core.restore', 'Восстановить из файла')}<input type="file" id="core-import" accept=".json" hidden></label>
      </div>
    </div>

    <button class="core-btn primary" id="core-close-settings">${t('core.close', 'Закрыть')}</button>
  `;
  document.body.appendChild(panel);

  // Темы
  panel.querySelectorAll('.core-theme-card').forEach(card => {
    const id = card.dataset.theme;
    const theme = THEMES.find(th => th.id === id);
    if (state.theme === id) card.classList.add('active');

    card.querySelector('.core-theme-label').onclick = () => {
      setTheme(id);
      panel.querySelectorAll('.core-theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const supports = theme.variants && theme.variants.length;
      card.querySelectorAll('.core-dn-btn').forEach(b => b.classList.toggle('active', supports && b.dataset.daynight === state.dayNight));
    };
    card.querySelectorAll('.core-dn-btn').forEach(b => {
      b.classList.toggle('active', state.dayNight === b.dataset.daynight);
      b.onclick = (e) => {
        e.stopPropagation();
        setTheme(id, { dayNight: b.dataset.daynight });
        card.querySelectorAll('.core-dn-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
      };
    });
  });

  // Язык
  const langSel = panel.querySelector('#core-lang-select');
  langSel.value = state.language;
  langSel.onchange = (e) => setLanguage(e.target.value);

  // Шрифт
  panel.querySelectorAll('[data-fs]').forEach(b => {
    b.classList.toggle('active', state.fontSize === b.dataset.fs);
    b.onclick = () => {
      state.fontSize = b.dataset.fs; saveState(); applyAccessibility();
      panel.querySelectorAll('[data-fs]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    };
  });

  // Свитчи
  const bind = (sel, key) => {
    const el = panel.querySelector(sel);
    el.checked = !!state[key];
    el.onchange = () => { state[key] = el.checked; saveState(); applyAccessibility(); };
  };
  bind('#core-hc', 'highContrast');
  bind('#core-df', 'dyslexiaFont');
  bind('#core-hp', 'haptics');
  bind('#core-se', 'soundEffects');
  bind('#core-rm', 'reducedMotion');

  // Голос
  panel.querySelector('#core-voice-picker').onclick = openVoicePicker;

  // Бэкап
  panel.querySelector('#core-export').onclick = exportAllData;
  panel.querySelector('#core-import').onchange = (e) => {
    if (e.target.files[0]) importAllData(e.target.files[0]);
  };

  panel.querySelector('#core-close-settings').onclick = () => panel.classList.remove('open');
  return panel;
}

// ============================================================
// ПАНЕЛЬ ДОСТИЖЕНИЙ
// ============================================================
export function openAchievementsPanel() {
  let p = document.getElementById('core-achievements-panel');
  if (!p) {
    p = document.createElement('div');
    p.id = 'core-achievements-panel';
    p.className = 'core-modal';
    document.body.appendChild(p);
  }
  const list = ACHIEVEMENTS.map(a => {
    const got = state.achievements.includes(a.id);
    return `<div class="core-ach ${got ? 'got' : ''}">
      <div class="core-ach-emoji">${a.emoji}</div>
      <div class="core-ach-name">${a.name}</div>
      <div class="core-ach-status">${got ? '✅' : '🔒'}</div>
    </div>`;
  }).join('');
  p.innerHTML = `
    <div class="core-modal-box">
      <h3>🏅 ${t('core.achievements', 'Достижения')} (${state.achievements.length}/${ACHIEVEMENTS.length})</h3>
      <div class="core-ach-grid">${list}</div>
      <button class="core-btn primary" id="core-ach-close">${t('core.close', 'Закрыть')}</button>
    </div>`;
  p.classList.add('active');
  p.querySelector('#core-ach-close').onclick = () => p.classList.remove('active');
  p.onclick = (e) => { if (e.target === p) p.classList.remove('active'); };
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================
export async function initCore(options = {}) {
  loadState();

  if (options.autoDetectTheme && !localStorage.getItem('core_state_v5')) {
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    state.dayNight = prefersDark ? 'night' : 'day';
  }

  await loadLanguage(state.language);
  setTheme(state.theme, { dayNight: state.dayNight });
  applyAccessibility();
  buildFloatingButtons();
  applyTranslations();

  document.addEventListener('click', e => {
    const el = e.target.closest('button, a, [role="button"]');
    if (el) logAction('click:' + (el.id || el.textContent || '').toString().slice(0, 40));
  }, true);

  document.dispatchEvent(new CustomEvent('core:ready'));
}

// Глобальный доступ
window.Core = {
  initCore, setTheme, setDayNight, setLanguage, t, toast,
  exportAllData, importAllData, openBugReport, unlockAchievement,
  getAchievements, logAction, haptic, state, loadLanguage,
  getRussianVoices, getAllVoices, getPreferredVoice, setPreferredVoice,
  speakTest, openVoicePicker,
};
