import { AppState, saveState, loadState, resetProgress } from './state.js';
import { renderSpeechCards, renderMotorCards, init3DCards, renderCardsStats } from './cards.js';
import { renderMapMarkers, toggleMapEditor, exportCoordinates, clearMarkers, showZoneInfo, closeZoneInfo } from './map.js';
import { initParticles } from './particles.js';
import { changeTheme, changeLanguage, toggleSettings, applyTranslations } from './settings.js';
import { openCardsGallery, downloadWordCard } from './utils.js';

// ========================================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================================

// Загружаем сохранённое состояние
loadState();

// Применяем тему и язык
changeTheme(AppState.theme);
changeLanguage(AppState.lang);

// Рендерим карточки
renderSpeechCards();
renderMotorCards();
renderCardsStats();

// Отрисовываем карту
renderMapMarkers();

// Запускаем частицы
initParticles();

// Навигация
document.querySelectorAll('#mainNav button').forEach(btn => {
    btn.addEventListener('click', function() {
        const sectionId = this.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
        document.getElementById(sectionId).classList.add('active-section');
        document.querySelectorAll('#mainNav button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// ========================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ (для вызова из HTML)
// ========================================================

window.toggleSettings = toggleSettings;
window.changeTheme = changeTheme;
window.changeLanguage = changeLanguage;
window.toggleCardFilter = () => {
    AppState.showOnlyConfirmed = !AppState.showOnlyConfirmed;
    const toggle = document.getElementById('toggleCards');
    toggle.classList.toggle('active', AppState.showOnlyConfirmed);
    renderSpeechCards();
    saveState();
};
window.setMotorFilter = (filter, btn) => {
    AppState.currentMotorFilter = filter;
    document.querySelectorAll('.motor-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMotorCards();
    saveState();
};
window.openCardsGallery = openCardsGallery;
window.downloadWordCard = downloadWordCard;
window.showZoneInfo = showZoneInfo;
window.closeZoneInfo = closeZoneInfo;
window.toggleMapEditor = toggleMapEditor;
window.exportCoordinates = exportCoordinates;
window.clearMarkers = clearMarkers;

// Сохраняем состояние при закрытии страницы
window.addEventListener('beforeunload', saveState);

console.log('🎮 Говорю правильно — модульная версия загружена!');
console.log(`🌍 Тема: ${AppState.theme} | Язык: ${AppState.lang}`);
console.log(`📊 Прогресс: ${AppState.stats.totalCorrect} правильных, ${AppState.stats.totalIncorrect} неправильных`);