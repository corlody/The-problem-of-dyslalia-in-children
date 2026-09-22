/* ============================================================
   core.js — общий модуль для "Говорю правильно" v5.1
   Языки загружаются из data/i18n/{code}.json
   ============================================================ */

export const CORE_VERSION = '5.1.0';

// ------------------------------------------------------------
// ЯЗЫКИ (только метаданные, переводы — в JSON)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ТЕМЫ (с вариациями день/ночь для природных)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// СОСТОЯНИЕ
// ------------------------------------------------------------
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
};

export const state = { ...DEFAULTS, achievements: [] };

// ------------------------------------------------------------
// I18N — ЗАГРУЗКА ЯЗЫКОВ ИЗ data/i18n/{code}.json
// ------------------------------------------------------------
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
    // Всегда держим ru как fallback
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

// Поиск ключа с fallback-цепочкой: текущий язык → ru → default
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

  // 2. Если ключ однословный — ищем во вложенных разделах
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

// ------------------------------------------------------------
// ХРАНИЛИЩЕ СОСТОЯНИЯ
// ------------------------------------------------------------
export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('core_state_v5') || '{}');
    Object.assign(state, DEFAULTS, saved);
  } catch (e) {}
  return state;
}

export function saveState() {
  try { localStorage.setItem('core_state_v5', JSON.stringify(state)); } catch (e) {}
}

// ------------------------------------------------------------
// ТЕМА
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ЯЗЫК
// ------------------------------------------------------------
export async function setLanguage(code) {
  if (!LANGUAGES.find(l => l.code === code)) return;
  state.language = code;
  await loadLanguage(code);
  document.documentElement.lang = code;
  document.documentElement.dir = 'ltr'; // rtl для ar/he, но их нет
  saveState();
  applyTranslations();
  document.dispatchEvent(new CustomEvent('core:languagechange', { detail: { code } }));
}

// ------------------------------------------------------------
// ДОСТУПНОСТЬ
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ВИБРАЦИЯ
// ------------------------------------------------------------
export function haptic(pattern = 20) {
  if (!state.haptics) return;
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
}

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ДОСТИЖЕНИЯ
// ------------------------------------------------------------
export const ACHIEVEMENTS = [
  { id: 'first_move',   emoji: '🎲', name: 'Первый ход' },
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

// ------------------------------------------------------------
// BUG REPORT
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// БЭКАП
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ПЛАВАЮЩИЕ КНОПКИ
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ПАНЕЛЬ НАСТРОЕК
// ------------------------------------------------------------
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
      <label>🔊 ${t('core.voiceDownload', 'Скачать русский голос')}</label>
      <div class="core-voice-hint">
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

  // Бэкап
  panel.querySelector('#core-export').onclick = exportAllData;
  panel.querySelector('#core-import').onchange = (e) => {
    if (e.target.files[0]) importAllData(e.target.files[0]);
  };

  panel.querySelector('#core-close-settings').onclick = () => panel.classList.remove('open');
  return panel;
}

// ------------------------------------------------------------
// ПАНЕЛЬ ДОСТИЖЕНИЙ
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ИНИЦИАЛИЗАЦИЯ
// ------------------------------------------------------------
export async function initCore(options = {}) {
  loadState();

  // Авто-определение тёмной темы
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
};
