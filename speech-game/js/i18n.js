import { AppState, saveState } from './state.js';

let currentTranslations = {};

// ========================================================
// ЗАГРУЗКА ПЕРЕВОДОВ
// ========================================================

export async function loadTranslations(lang) {
    try {
        const response = await fetch(`data/i18n/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        currentTranslations = await response.json();
        return currentTranslations;
    } catch (e) {
        console.warn(`Не удалось загрузить переводы для ${lang}, используем fallback`);
        // Fallback — пробуем русский
        if (lang !== 'ru') {
            return loadTranslations('ru');
        }
        // Если и русский не загрузился — пустой объект
        return {};
    }
}

export function getTranslation(key) {
    const keys = key.split('.');
    let value = currentTranslations;
    for (const k of keys) {
        if (value && value[k] !== undefined) {
            value = value[k];
        } else {
            return key; // возвращаем ключ, если перевода нет
        }
    }
    return value;
}

export function applyTranslationsToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const value = getTranslation(key);
        if (value !== key) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = value;
            } else {
                el.innerHTML = value;
            }
        }
    });
    
    // Обновляем правила
    renderRules();
}

// ========================================================
// ПРАВИЛА (генерируются из переводов)
// ========================================================

export function renderRules() {
    const container = document.getElementById('rulesContent');
    if (!container) return;
    
    const isRu = AppState.lang === 'ru';
    
    container.innerHTML = `
        <h3>${isRu ? '1. Общая информация' : '1. General Information'}</h3>
        <p><strong>${isRu ? 'Название игры:' : 'Game name:'}</strong> ${isRu ? '«Говорю правильно: Путешествие к вулкану речи»' : '"Speak Correctly: Journey to the Volcano of Speech"'}<br>
        <strong>${isRu ? 'Тип:' : 'Type:'}</strong> ${isRu ? 'Настольная логопедическая игра' : 'Board speech therapy game'}<br>
        <strong>${isRu ? 'Количество игроков:' : 'Number of players:'}</strong> ${isRu ? '1–4 ребёнка + 1 взрослый (ведущий, «Хранитель речи»)' : '1–4 children + 1 adult (host, "Guardian of Speech")'}<br>
        <strong>${isRu ? 'Возраст:' : 'Age:'}</strong> 5–7 ${isRu ? 'лет' : 'years'}<br>
        <strong>${isRu ? 'Цель игры:' : 'Goal:'}</strong> ${isRu ? 'Первым добраться до финиша (жерло вулкана), правильно выполняя задания.' : 'Be the first to reach the finish (volcano crater) by completing tasks correctly.'}</p>

        <h3>${isRu ? '2. Комплектация' : '2. Contents'}</h3>
        <ul>
            <li><strong>${isRu ? 'Игровое поле' : 'Game board'}</strong> — ${isRu ? 'карта-змейка с маршрутом из 89 клеток.' : 'snake map with 89 cells.'}</li>
            <li><strong>${isRu ? '4 фигурки игроков' : '4 player pieces'}</strong></li>
            <li><strong>${isRu ? 'Игральный кубик' : 'Dice'}</strong> (1-6)</li>
            <li><strong>${isRu ? '5 колод карточек' : '5 decks of cards'}</strong> ${isRu ? 'в цифровом формате: синие, красные, зелёные, жёлтые, оранжевые (моторные).' : 'in digital format: blue, red, green, yellow, orange (motor).'}</li>
            <li><strong>${isRu ? 'Зеркало' : 'Mirror'}</strong> — ${isRu ? 'для контроля артикуляции.' : 'for articulation control.'}</li>
            <li><strong>${isRu ? 'Индивидуальная карта игрока' : 'Player card'}</strong> — ${isRu ? 'создаётся для отслеживания прогресса.' : 'created to track progress.'}</li>
        </ul>

        <h3>${isRu ? '3. Подготовка к игре' : '3. Preparation'}</h3>
        <ol>
            <li>${isRu ? 'Взрослый вместе с ребёнком готовит индивидуальную карту.' : 'Adult and child prepare a player card.'}</li>
            <li>${isRu ? 'Карточки открываются на цифровом устройстве.' : 'Cards are opened on a digital device.'}</li>
            <li>${isRu ? 'Зеркало кладётся рядом с полем.' : 'Mirror is placed next to the board.'}</li>
            <li>${isRu ? 'Каждый ребёнок выбирает фигурку и ставит её на СТАРТ.' : 'Each child chooses a piece and places it on START.'}</li>
            <li>${isRu ? 'Взрослый объясняет правила.' : 'Adult explains the rules.'}</li>
        </ol>

        <h3>${isRu ? '4. Ход игры' : '4. Gameplay'}</h3>
        <p><strong>${isRu ? '4.1. Бросок кубика' : '4.1. Dice roll'}</strong><br>${isRu ? 'Игрок бросает кубик и передвигает фигурку вперёд на выпавшее количество клеток.' : 'Player rolls the dice and moves forward the number of cells shown.'}</p>
        <p><strong>${isRu ? '4.2. Что делать на клетке' : '4.2. What to do on a cell'}</strong></p>
        <table>
            <tr><th>${isRu ? 'Что на клетке' : 'On the cell'}</th><th>${isRu ? 'Что происходит' : 'What happens'}</th></tr>
            <tr><td>${isRu ? 'Обычная клетка (нет знаков)' : 'Regular cell (no symbols)'}</td><td>${isRu ? 'Ничего. Ход переходит к следующему игроку.' : 'Nothing. Turn passes to the next player.'}</td></tr>
            <tr><td>${isRu ? 'Знак «?»' : 'Symbol "?"'}</td><td>${isRu ? 'Взрослый берёт карточку (цвет по зоне). Ребёнок выполняет задание. Если правильно — остаётся на клетке. Если с ошибкой — возвращается на 2 клетки назад.' : 'Adult takes a card (color by zone). Child completes the task. If correct — stays on the cell. If wrong — moves 2 cells back.'}</td></tr>
            <tr><td>${isRu ? 'Крест' : 'Cross'}</td><td>${isRu ? 'Ведущий проверяет: выполнял ли игрок задание. Если не выполнял — игрок отправляется на СТАРТ.' : 'Host checks: did player complete a task. If not — player goes to START.'}</td></tr>
            <tr><td>${isRu ? 'Костёр' : 'Campfire'}</td><td>${isRu ? 'Лагерь отдыха. Игрок получает дополнительный ход.' : 'Rest camp. Player gets an extra turn.'}</td></tr>
            <tr><td>${isRu ? 'Волшебники' : 'Wizards'}</td><td>${isRu ? 'Игрок может выбрать карточку полегче или пропустить ход.' : 'Player can choose an easier card or skip the turn.'}</td></tr>
            <tr><td>${isRu ? 'Водопад' : 'Waterfall'}</td><td>${isRu ? 'Игрок перемещается на клетку дорога у водопада.' : 'Player moves to the waterfall road cell.'}</td></tr>
            <tr><td>${isRu ? 'Верёвочная переправа' : 'Rope crossing'}</td><td>${isRu ? 'Игрок перемещается на клетку ниже по карте.' : 'Player moves to a lower cell on the map.'}</td></tr>
            <tr><td>${isRu ? 'Живот гиганта (клетка 18)' : 'Giant\'s belly (cell 18)'}</td><td>${isRu ? 'Игрок перемещается на клетку 22 (пляж).' : 'Player moves to cell 22 (beach).'}</td></tr>
            <tr><td>${isRu ? 'Жерло вулкана' : 'Volcano crater'}</td><td><strong>${isRu ? 'ФИНИШ! Победа.' : 'FINISH! Victory.'}</strong></td></tr>
        </table>
        <p><em>${isRu ? 'Если ребёнок ошибся — взрослый показывает правильную артикуляцию в зеркале.' : 'If child makes a mistake — adult shows correct articulation in the mirror.'}</em></p>
    `;
}