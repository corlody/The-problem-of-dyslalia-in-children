// ========================================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ========================================================

export const AppState = {
    theme: 'game',
    lang: 'ru',
    showOnlyConfirmed: false,
    currentMotorFilter: 'all',
    isEditorMode: false,
    markers: [],
    markerCounter: 0,
    currentCell: 0,
    completedTaskIds: [],
    stats: {
        totalCorrect: 0,
        totalIncorrect: 0,
        gamesPlayed: 0,
        lastPlayed: null
    },
    achievements: []
};

// ========================================================
// СОХРАНЕНИЕ В localStorage
// ========================================================

const STORAGE_KEY = 'speech_game_state';

export function saveState() {
    try {
        const data = {
            theme: AppState.theme,
            lang: AppState.lang,
            showOnlyConfirmed: AppState.showOnlyConfirmed,
            currentMotorFilter: AppState.currentMotorFilter,
            currentCell: AppState.currentCell,
            completedTaskIds: AppState.completedTaskIds,
            stats: AppState.stats,
            achievements: AppState.achievements,
            // Маркеры не сохраняем (они генерируются из JSON)
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Не удалось сохранить состояние:', e);
    }
}

export function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        
        const data = JSON.parse(raw);
        
        // Восстанавливаем только безопасные поля
        if (data.theme) AppState.theme = data.theme;
        if (data.lang) AppState.lang = data.lang;
        if (typeof data.showOnlyConfirmed === 'boolean') AppState.showOnlyConfirmed = data.showOnlyConfirmed;
        if (data.currentMotorFilter) AppState.currentMotorFilter = data.currentMotorFilter;
        if (typeof data.currentCell === 'number') AppState.currentCell = data.currentCell;
        if (Array.isArray(data.completedTaskIds)) AppState.completedTaskIds = data.completedTaskIds;
        if (data.stats) {
            AppState.stats.totalCorrect = data.stats.totalCorrect || 0;
            AppState.stats.totalIncorrect = data.stats.totalIncorrect || 0;
            AppState.stats.gamesPlayed = data.stats.gamesPlayed || 0;
            AppState.stats.lastPlayed = data.stats.lastPlayed || null;
        }
        if (Array.isArray(data.achievements)) AppState.achievements = data.achievements;
        
        console.log('📂 Состояние загружено из localStorage');
    } catch (e) {
        console.warn('Не удалось загрузить состояние:', e);
    }
}

export function resetProgress() {
    AppState.currentCell = 0;
    AppState.completedTaskIds = [];
    AppState.stats.totalCorrect = 0;
    AppState.stats.totalIncorrect = 0;
    AppState.stats.gamesPlayed = 0;
    AppState.stats.lastPlayed = null;
    AppState.achievements = [];
    saveState();
    console.log('🔄 Прогресс сброшен');
}

export function markTaskCompleted(taskId) {
    if (!AppState.completedTaskIds.includes(taskId)) {
        AppState.completedTaskIds.push(taskId);
        AppState.stats.totalCorrect++;
        saveState();
        
        // Проверяем достижения
        checkAchievements();
    }
}

export function markTaskFailed(taskId) {
    AppState.stats.totalIncorrect++;
    saveState();
}

export function moveToCell(cellNumber) {
    AppState.currentCell = cellNumber;
    saveState();
}

// ========================================================
// ДОСТИЖЕНИЯ
// ========================================================

const ACHIEVEMENTS = {
    first_step: { id: 'first_step', name: 'Первый шаг', desc: 'Выполнено первое задание', icon: '🌟' },
    ten_tasks: { id: 'ten_tasks', name: 'Десять заданий', desc: 'Выполнено 10 заданий', icon: '⭐' },
    fifty_tasks: { id: 'fifty_tasks', name: 'Полпути', desc: 'Выполнено 50 заданий', icon: '🏆' },
    hundred_tasks: { id: 'hundred_tasks', name: 'Мастер речи', desc: 'Выполнено 100 заданий', icon: '👑' },
    perfect: { id: 'perfect', name: 'Без ошибок', desc: '10 правильных ответов подряд', icon: '💎' }
};

function checkAchievements() {
    const count = AppState.completedTaskIds.length;
    const correct = AppState.stats.totalCorrect;
    
    if (count >= 1 && !AppState.achievements.includes('first_step')) {
        unlockAchievement('first_step');
    }
    if (count >= 10 && !AppState.achievements.includes('ten_tasks')) {
        unlockAchievement('ten_tasks');
    }
    if (count >= 50 && !AppState.achievements.includes('fifty_tasks')) {
        unlockAchievement('fifty_tasks');
    }
    if (count >= 100 && !AppState.achievements.includes('hundred_tasks')) {
        unlockAchievement('hundred_tasks');
    }
}

function unlockAchievement(id) {
    if (AppState.achievements.includes(id)) return;
    AppState.achievements.push(id);
    saveState();
    
    const ach = ACHIEVEMENTS[id];
    console.log(`🎉 Достижение разблокировано: ${ach.icon} ${ach.name}`);
    
    // Показываем уведомление
    showAchievementNotification(ach);
}

function showAchievementNotification(ach) {
    const existing = document.querySelector('.achievement-notification');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'achievement-notification';
    div.innerHTML = `
        <div style="position:fixed; top:20px; left:50%; transform:translateX(-50%); 
                    background:var(--bg-card); backdrop-filter:blur(40px); 
                    padding:20px 30px; border-radius:20px; border:2px solid var(--gold);
                    box-shadow:0 20px 60px rgba(0,0,0,0.5); z-index:10000;
                    display:flex; align-items:center; gap:16px;
                    animation:slideDown 0.5s ease-out;">
            <span style="font-size:2.5rem;">${ach.icon}</span>
            <div>
                <div style="font-weight:700; font-size:1.1rem;">🏅 ${ach.name}</div>
                <div style="color:var(--text-secondary); font-size:0.9rem;">${ach.desc}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:1.2rem;">✕</button>
        </div>
        <style>
            @keyframes slideDown {
                from { opacity:0; transform:translateX(-50%) translateY(-30px) scale(0.9); }
                to { opacity:1; transform:translateX(-50%) translateY(0) scale(1); }
            }
        </style>
    `;
    document.body.appendChild(div);
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        if (div.parentElement) div.remove();
    }, 5000);
}