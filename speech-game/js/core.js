/* ============================================================
   core.js — общий модуль для "Говорю правильно" v5.0
   Подключается на всех страницах (index, game, research)
   ============================================================ */

export const CORE_VERSION = '5.0.0';

// ------------------------------------------------------------
// ЯЗЫКИ
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

export const TRANSLATIONS = {
  ru: {
    settings: 'Настройки', theme: 'Тема', language: 'Язык', appearance: 'Внешний вид',
    day: 'День', night: 'Ночь', fontSize: 'Размер шрифта', small: 'Мелкий',
    normal: 'Средний', large: 'Крупный', huge: 'Огромный',
    highContrast: 'Высокий контраст', dyslexiaFont: 'Шрифт для дислексии',
    haptics: 'Вибрация', soundEffects: 'Звуковые эффекты', reducedMotion: 'Меньше анимаций',
    bugReport: 'Сообщить о проблеме', bugTitle: 'Что-то сломалось?',
    bugName: 'Ваше имя (необязательно)', bugProblem: 'Опишите проблему',
    bugSteps: 'Что вы делали перед этим?', bugDownload: 'Скачать отчёт',
    bugCopy: 'Скопировать', bugClose: 'Закрыть', bugThanks: 'Спасибо! Отчёт сохранён.',
    bugCopied: 'Скопировано в буфер', bugAuto: 'Автоматически прикреплено',
    achievements: 'Достижения', backup: 'Резервная копия', downloadAll: 'Скачать все данные',
    restore: 'Восстановить из файла', close: 'Закрыть', save: 'Сохранить',
    voiceDownload: 'Скачать русский голос', voiceHint: 'Как установить русскую озвучку',
    aiHelp: 'Помощник', aiPlaceholder: 'Напишите вопрос...', aiSend: 'Отправить',
    fullscreen: 'Полный экран', restoreSuccess: 'Данные восстановлены!',
    restoreError: 'Не удалось прочитать файл', confirmRestore: 'Заменить текущие данные?',
  },
  en: {
    settings: 'Settings', theme: 'Theme', language: 'Language', appearance: 'Appearance',
    day: 'Day', night: 'Night', fontSize: 'Font size', small: 'Small',
    normal: 'Normal', large: 'Large', huge: 'Huge',
    highContrast: 'High contrast', dyslexiaFont: 'Dyslexia-friendly font',
    haptics: 'Vibration', soundEffects: 'Sound effects', reducedMotion: 'Reduce motion',
    bugReport: 'Report a problem', bugTitle: 'Something broke?',
    bugName: 'Your name (optional)', bugProblem: 'Describe the problem',
    bugSteps: 'What were you doing?', bugDownload: 'Download report',
    bugCopy: 'Copy', bugClose: 'Close', bugThanks: 'Thank you! Report saved.',
    bugCopied: 'Copied to clipboard', bugAuto: 'Attached automatically',
    achievements: 'Achievements', backup: 'Backup', downloadAll: 'Download all data',
    restore: 'Restore from file', close: 'Close', save: 'Save',
    voiceDownload: 'Download Russian voice', voiceHint: 'How to install Russian TTS',
    aiHelp: 'Assistant', aiPlaceholder: 'Ask a question...', aiSend: 'Send',
    fullscreen: 'Fullscreen', restoreSuccess: 'Data restored!',
    restoreError: 'Could not read the file', confirmRestore: 'Replace current data?',
  },
  // остальные языки: тот же набор ключей, отличаются переводами (сокращено для размера)
  uk: { settings: 'Налаштування', theme: 'Тема', language: 'Мова', day: 'День', night: 'Ніч', bugReport: 'Повідомити про проблему', achievements: 'Досягнення', backup: 'Резервна копія', close: 'Закрити', save: 'Зберегти', aiHelp: 'Помічник', fullscreen: 'Повний екран' },
  kk: { settings: 'Параметрлер', theme: 'Тақырып', language: 'Тіл', day: 'Күндіз', night: 'Түн', bugReport: 'Мәселе туралы хабарлау', achievements: 'Жетістіктер', backup: 'Сақтық көшірме', close: 'Жабу', save: 'Сақтау', aiHelp: 'Көмекші', fullscreen: 'Толық экран' },
  be: { settings: 'Налады', theme: 'Тэма', language: 'Мова', day: 'Дзень', night: 'Ноч', bugReport: 'Паведаміць пра праблему', achievements: 'Дасягненні', backup: 'Рэзервовая копія', close: 'Закрыць', save: 'Захаваць', aiHelp: 'Памочнік', fullscreen: 'Поўны экран' },
  de: { settings: 'Einstellungen', theme: 'Thema', language: 'Sprache', day: 'Tag', night: 'Nacht', bugReport: 'Problem melden', achievements: 'Erfolge', backup: 'Sicherung', close: 'Schließen', save: 'Speichern', aiHelp: 'Assistent', fullscreen: 'Vollbild' },
  fr: { settings: 'Paramètres', theme: 'Thème', language: 'Langue', day: 'Jour', night: 'Nuit', bugReport: 'Signaler un problème', achievements: 'Succès', backup: 'Sauvegarde', close: 'Fermer', save: 'Enregistrer', aiHelp: 'Assistant', fullscreen: 'Plein écran' },
  es: { settings: 'Ajustes', theme: 'Tema', language: 'Idioma', day: 'Día', night: 'Noche', bugReport: 'Reportar un problema', achievements: 'Logros', backup: 'Copia de seguridad', close: 'Cerrar', save: 'Guardar', aiHelp: 'Asistente', fullscreen: 'Pantalla completa' },
  tr: { settings: 'Ayarlar', theme: 'Tema', language: 'Dil', day: 'Gündüz', night: 'Gece', bugReport: 'Sorun bildir', achievements: 'Başarılar', backup: 'Yedek', close: 'Kapat', save: 'Kaydet', aiHelp: 'Yardımcı', fullscreen: 'Tam ekran' },
  zh: { settings: '设置', theme: '主题', language: '语言', day: '白天', night: '夜晚', bugReport: '报告问题', achievements: '成就', backup: '备份', close: '关闭', save: '保存', aiHelp: '助手', fullscreen: '全屏' },
};

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
  autoDetectTheme: false,
};

export const state = { ...DEFAULTS, achievements: [] };

// ------------------------------------------------------------
// ХРАНИЛИЩЕ
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
  const attr = dayNight === 'night' && supportsVariants ? `${id}-night` : id;
  document.documentElement.setAttribute('data-theme', attr);
  document.documentElement.setAttribute('data-theme-base', id);
  document.documentElement.setAttribute('data-daynight', dayNight);
  saveState();
  document.dispatchEvent(new CustomEvent('core:themechange', { detail: { theme: id, dayNight } }));
}

export function setDayNight(mode) { setTheme(state.theme, { dayNight: mode }); }

export function getThemeVariants(id) {
  const t = THEMES.find(x => x.id === id);
  return t && t.variants ? t.variants : [];
}

// ------------------------------------------------------------
// ЯЗЫК
// ------------------------------------------------------------
export function setLanguage(code) {
  if (!LANGUAGES.find(l => l.code === code)) return;
  state.language = code;
  document.documentElement.lang = code;
  document.documentElement.dir = (code === 'ar' || code === 'he') ? 'rtl' : 'ltr';
  saveState();
  applyTranslations();
  document.dispatchEvent(new CustomEvent('core:languagechange', { detail: { code } }));
}

export function t(key, fallback) {
  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.ru;
  if (dict[key] !== undefined) return dict[key];
  if (TRANSLATIONS.ru[key] !== undefined) return TRANSLATIONS.ru[key];
  return fallback !== undefined ? fallback : key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const v = t(key);
    if (v && v !== key) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const v = t(el.dataset.i18nPlaceholder);
    if (v) el.placeholder = v;
  });
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
    toast(`${a.emoji} Достижение: ${a.name}`, 'success', 4000);
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
  let ua = navigator.userAgent;
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
    ua,
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
        <h3>🐞 ${t('bugTitle')}</h3>
        <label>${t('bugName')}</label>
        <input type="text" id="bugName" placeholder="—">
        <label>${t('bugProblem')}</label>
        <textarea id="bugProblem" rows="4" placeholder="Что не работает?"></textarea>
        <label>${t('bugSteps')}</label>
        <textarea id="bugSteps" rows="3" placeholder="Нажимал... открывал..."></textarea>
        <details style="margin-top:12px;">
          <summary style="cursor:pointer;color:var(--text-secondary);font-size:.9rem;">🔍 ${t('bugAuto')}</summary>
          <pre id="bugDiag" style="font-size:.7rem;overflow:auto;max-height:150px;background:rgba(0,0,0,.25);padding:8px;border-radius:8px;margin-top:6px;"></pre>
        </details>
        <div class="core-modal-actions">
          <button class="core-btn primary" id="bugDownload">⬇ ${t('bugDownload')}</button>
          <button class="core-btn" id="bugCopy">📋 ${t('bugCopy')}</button>
          <button class="core-btn" id="bugCancel">${t('bugClose')}</button>
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
    toast(t('bugThanks'), 'success');
  };
  document.getElementById('bugCopy').onclick = async () => {
    try { await navigator.clipboard.writeText(buildText()); toast(t('bugCopied'), 'success'); }
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
  const payload = {
    exportedAt: new Date().toISOString(),
    version: CORE_VERSION,
    data: dump,
  };
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
      if (!confirm(t('confirmRestore'))) return;
      Object.entries(data).forEach(([k, v]) => {
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
      toast(t('restoreSuccess'), 'success');
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      toast(t('restoreError'), 'error');
    }
  };
  reader.readAsText(file);
}

// ------------------------------------------------------------
// КНОПКИ В УГЛУ (шестерёнка, баг, достижения, ИИ)
// ------------------------------------------------------------
function buildFloatingButtons() {
  let wrap = document.getElementById('core-float-buttons');
  if (wrap) return wrap;
  wrap = document.createElement('div');
  wrap.id = 'core-float-buttons';
  wrap.innerHTML = `
    <button id="core-btn-ai" class="core-fab" title="${t('aiHelp')}">🤖</button>
    <button id="core-btn-achievements" class="core-fab" title="${t('achievements')}">🏅</button>
    <button id="core-btn-bug" class="core-fab bug" title="${t('bugReport')}">🐞</button>
    <button id="core-btn-settings" class="core-fab" title="${t('settings')}">⚙️</button>
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
    const variants = th.variants ? th.variants : [];
    return `<div class="core-theme-card" data-theme="${th.id}">
      <div class="core-theme-label">${th.label}</div>
      ${variants.length ? `<div class="core-daynight">
        <button data-daynight="day" class="core-dn-btn">☀️ ${t('day')}</button>
        <button data-daynight="night" class="core-dn-btn">🌙 ${t('night')}</button>
      </div>` : ''}
    </div>`;
  }).join('');
  const langOptions = LANGUAGES.map(l => `<option value="${l.code}">${l.label}</option>`).join('');
  panel.innerHTML = `
    <h3>⚙️ ${t('settings')}</h3>

    <div class="core-setting">
      <label>${t('theme')}</label>
      <div class="core-theme-grid">${themeOptions}</div>
    </div>

    <div class="core-setting">
      <label>${t('language')}</label>
      <select id="core-lang-select">${langOptions}</select>
    </div>

    <div class="core-setting">
      <label>${t('fontSize')}</label>
      <div class="core-btn-row">
        <button data-fs="small">${t('small')}</button>
        <button data-fs="normal">${t('normal')}</button>
        <button data-fs="large">${t('large')}</button>
        <button data-fs="huge">${t('huge')}</button>
      </div>
    </div>

    <div class="core-setting core-switches">
      <label class="core-switch"><input type="checkbox" id="core-hc"><span></span>${t('highContrast')}</label>
      <label class="core-switch"><input type="checkbox" id="core-df"><span></span>${t('dyslexiaFont')}</label>
      <label class="core-switch"><input type="checkbox" id="core-hp"><span></span>${t('haptics')}</label>
      <label class="core-switch"><input type="checkbox" id="core-se"><span></span>${t('soundEffects')}</label>
      <label class="core-switch"><input type="checkbox" id="core-rm"><span></span>${t('reducedMotion')}</label>
    </div>

    <div class="core-setting">
      <label>🔊 ${t('voiceDownload')}</label>
      <div class="core-voice-hint">${t('voiceHint')}:<br>
        • Android: Настройки → Язык и ввод → Синтез речи → Google → Русский<br>
        • iOS: Настройки → Универсальный доступ → Речь → Голоса → Русский<br>
        • <a href="https://play.google.com/store/apps/details?id=com.google.android.tts" target="_blank">Google TTS</a>
      </div>
    </div>

    <div class="core-setting">
      <label>💾 ${t('backup')}</label>
      <div class="core-btn-row">
        <button id="core-export">${t('downloadAll')}</button>
        <label class="core-btn" style="cursor:pointer;">${t('restore')}<input type="file" id="core-import" accept=".json" hidden></label>
      </div>
    </div>

    <button class="core-btn primary" id="core-close-settings">${t('close')}</button>
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
  const bind = (id, key) => {
    const el = panel.querySelector(id);
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
      <h3>🏅 ${t('achievements')} (${state.achievements.length}/${ACHIEVEMENTS.length})</h3>
      <div class="core-ach-grid">${list}</div>
      <button class="core-btn primary" id="core-ach-close">${t('close')}</button>
    </div>`;
  p.classList.add('active');
  p.querySelector('#core-ach-close').onclick = () => p.classList.remove('active');
  p.onclick = (e) => { if (e.target === p) p.classList.remove('active'); };
}

// ------------------------------------------------------------
// ИНИЦИАЛИЗАЦИЯ
// ------------------------------------------------------------
export function initCore(options = {}) {
  loadState();
  if (options.autoDetectTheme && !localStorage.getItem('core_state_v5')) {
    const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    state.dayNight = prefersDark ? 'night' : 'day';
  }
  setTheme(state.theme, { dayNight: state.dayNight });
  setLanguage(state.language);
  applyAccessibility();
  buildFloatingButtons();
  applyTranslations();

  // Лог действий
  document.addEventListener('click', e => {
    const t2 = e.target.closest('button, a, [role="button"]');
    if (t2) logAction('click:' + (t2.id || t2.textContent || '').toString().slice(0, 40));
  }, true);

  document.dispatchEvent(new CustomEvent('core:ready'));
}

// Экспорт для глобального доступа
window.Core = {
  initCore, setTheme, setDayNight, setLanguage, t, toast,
  exportAllData, importAllData, openBugReport, unlockAchievement,
  getAchievements, logAction, haptic, state,
};