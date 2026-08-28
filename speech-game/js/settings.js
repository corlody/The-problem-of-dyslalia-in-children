import { AppState, saveState } from './state.js';
import { loadTranslations, applyTranslationsToDOM, renderRules } from './i18n.js';

// ========================================================
// УПРАВЛЕНИЕ ТЕМАМИ
// ========================================================

export function changeTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeSelect').value = theme;
    saveState();
    
    const canvas = document.getElementById('particles-canvas');
    if (theme === 'official' || theme === 'elderly') {
        canvas.style.display = 'none';
    } else {
        canvas.style.display = 'block';
    }
}

// ========================================================
// УПРАВЛЕНИЕ ЯЗЫКОМ
// ========================================================

export async function changeLanguage(lang) {
    AppState.lang = lang;
    document.getElementById('langSelect').value = lang;
    saveState();
    
    await loadTranslations(lang);
    applyTranslationsToDOM();
    renderRules();
}

// ========================================================
// ШЕСТЕРЁНКА НАСТРОЕК
// ========================================================

export function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const gear = document.getElementById('settingsGear');
    panel.classList.toggle('open');
    gear.classList.toggle('open');
}

// ========================================================
// ПРИМЕНЕНИЕ ПЕРЕВОДОВ (экспортируем из i18n)
// ========================================================

// Переэкспортируем для удобства
export { applyTranslationsToDOM };