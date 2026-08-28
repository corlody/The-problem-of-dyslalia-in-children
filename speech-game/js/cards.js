import { AppState, markTaskCompleted } from './state.js';

let cardsData = {};
let motorCards = {};

// ========================================================
// ЗАГРУЗКА КАРТОЧЕК
// ========================================================

export async function loadCardsData() {
    try {
        const response = await fetch('data/cards_data.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        cardsData = data.cards || {};
        motorCards = data.motor || {};
        return data;
    } catch (e) {
        console.warn('Не удалось загрузить карточки, используем встроенные');
        // Fallback с вашими данными
        cardsData = {
            blue: [
                { title: "Заборчик", desc: "Улыбнуться, с напряжением обнажив сомкнутые зубы.", confirmed: true },
                { title: "Слоник пьёт", desc: "Вытянуть губы трубочкой — «хобот слоника». Набирать водичку, слегка причмокивая.", confirmed: true },
                { title: "Лошадка", desc: "Поцокать узким языком, как цокают копытами лошадки.", confirmed: true },
                { title: "Чашечка", desc: "Улыбнуться, широко открыть рот. Высунуть широкий язык и придать ему форму «чашечки».", confirmed: true },
                { title: "Дудочка", desc: "С напряжением вытянуть губы вперёд. Зубы сомкнуты.", confirmed: true },
                { title: "Барабанщик", desc: "Улыбнуться, открыть рот. Кончик языка за верхними зубами: «дэ-дэ-дэ...»", confirmed: true },
                { title: "Месим тесто", desc: "Улыбнуться, покусать язык между зубами. Покусать кончик языка зубками.", confirmed: true },
                { title: "Маляр", desc: "Улыбнуться, приоткрыть рот. Кончиком языка погладить нёбо.", confirmed: true },
                { title: "Качели", desc: "Улыбнуться, открыть рот. Кончик языка за верхние зубы, затем за нижние.", confirmed: true },
                { title: "Вкусное варенье", desc: "Улыбнуться, открыть рот. Широким языком облизать верхнюю губу.", confirmed: true },
                { title: "Гармошка", desc: "Сделать «грибочек». Не отрывая языка, открывать и закрывать рот.", confirmed: true },
                { title: "Блинчик", desc: "Улыбнуться, приоткрыть рот. Положить широкий язык на нижнюю губу.", confirmed: true },
                { title: "Окошко (Бегемот)", desc: "Широко открыть рот — «жарко», закрыть рот — «холодно».", confirmed: true },
                { title: "Поймали мышку", desc: "Губы в улыбке, приоткрыть рот. Произнести «а-а» и прикусить широкий кончик языка.", confirmed: true },
                { title: "Масики", desc: "Улыбнуться, открыть рот. Кончик языка переводить из одного уголка рта в другой.", confirmed: true },
                { title: "Грибочек", desc: "Улыбнуться, поцокать языком. Присосать широкий язык к нёбу.", confirmed: true },
                { title: "Индюки болтают", desc: "Языком быстро двигать по верхней губе: «бл-бл-бл-бл...»", confirmed: true },
                { title: "Орешки", desc: "Рот закрыт. Кончик языка с напряжением поочерёдно упирается в щёку.", confirmed: true },
                { title: "Чистим зубки", desc: "Улыбнуться, открыть рот. Кончиком языка почистить зубы изнутри.", confirmed: true }
            ],
            red: [
                { title: "Пароход гудит", desc: "Губы в улыбке, открыть рот. Произнести долгое «ы-ы-ы-ы...»", confirmed: true },
                { title: "Загнать мяч в ворота", desc: "Высунуть широкий язык между зубами. Дуть на язык. Щёки не надувать.", confirmed: true },
                { title: "Киска", desc: "Губы в улыбке, рот открыт. Кончик языка упирается в нижние зубы. Выгнуть язык горкой.", confirmed: true },
                { title: "Парашютик", desc: "На кончик носа положить ватку. Сдуть ватку с носа вверх языком-«чашечкой».", confirmed: true },
                { title: "Чистим зубки", desc: "Улыбнуться, открыть рот. Кончиком языка почистить зубы изнутри.", confirmed: true },
                { title: "Орешки", desc: "Рот закрыт. Кончик языка с напряжением упирается в щёку.", confirmed: true },
                { title: "Индюки болтают", desc: "Языком быстро двигать по верхней губе: «бл-бл-бл...»", confirmed: true },
                { title: "Шарик", desc: "Надуть щёку, затем сдуть щёку.", confirmed: true }
            ],
            green: [
                { title: "Слова на С", desc: "Назови 3 слова со звуком С в начале (сом, сок, сон).", confirmed: false },
                { title: "Слова на З", desc: "Назови 3 слова со звуком З в начале (замок, зуб, зонт).", confirmed: false },
                { title: "Слова на Ш", desc: "Назови 3 слова со звуком Ш в начале (шапка, шар, шум).", confirmed: false },
                { title: "Слова на Ж в середине", desc: "Назови слова с Ж в середине (лужа, ножи, пижама).", confirmed: false },
                { title: "Слова на Р в середине", desc: "Корова, ворона, дерево.", confirmed: false },
                { title: "Слова на Р в конце", desc: "Топор, забор, помидор.", confirmed: false },
                { title: "Слова на Л в начале", desc: "Луна, лук, лапа.", confirmed: false },
                { title: "Слова на Л в середине", desc: "Полка, пила, молоко.", confirmed: false },
                { title: "Слова на Ч в конце", desc: "Мяч, ключ, врач.", confirmed: false },
                { title: "Слова с С и Ш", desc: "Суши, шасси, смешно.", confirmed: false }
            ],
            yellow: [
                { title: "Сашина сушка", desc: "Шла Саша по шоссе и сосала сушку.", confirmed: false },
                { title: "Карл и Клара", desc: "Карл у Клары украл кораллы.", confirmed: false },
                { title: "Грека", desc: "Ехал Грека через реку, видит Грека — в реке рак.", confirmed: false },
                { title: "Бараны", desc: "Белые бараны били в барабаны.", confirmed: false },
                { title: "Мышата", desc: "Шесть мышат в камышах шуршат.", confirmed: false },
                { title: "Ёлки-иголки", desc: "У ёлки иголки колки.", confirmed: false },
                { title: "Пироги", desc: "Съел молодец тридцать три пирога с пирогом, да всё с творогом.", confirmed: false },
                { title: "Жужелица", desc: "Жужжит жужелица, кружится, жужжит.", confirmed: false },
                { title: "Лара и рояль", desc: "Лара играла на рояле, у Лары были алые лалы.", confirmed: false },
                { title: "Трава-дрова", desc: "На дворе трава, на траве дрова.", confirmed: false }
            ]
        };
        motorCards = {
            fine: [
                { title: "Пальчики здороваются", desc: "Соедини большой палец с указательным — «здравствуй», затем со средним, безымянным и мизинцем. Повтори 2 раза." },
                { title: "Колечки", desc: "Сделай колечко из большого и указательного пальцев, затем из большого и среднего, большого и безымянного, большого и мизинца." },
                { title: "Щепотка", desc: "Собери пальцы в щепотку (большой, указательный и средний вместе), затем разожми. Повтори 3 раза." },
                { title: "Сорока-ворона", desc: "Сделай круговые движения указательным пальцем по ладони другой руки — «сорока кашу варила»." },
                { title: "Кулак-ладонь", desc: "Сожми руку в кулак, затем раскрой ладонь. Повтори 3 раза каждой рукой." },
                { title: "Ножницы", desc: "Разведи указательный и средний пальцы в стороны — «ножницы», затем соедини обратно. Повтори 3 раза." },
                { title: "Замок", desc: "Сцепи пальцы в замок, затем разомкни. Повтори 2 раза." },
                { title: "Карандаш-каталка", desc: "Покатай карандаш между ладонями (или вообрази движение)." }
            ],
            gross: [
                { title: "Хлопки над головой", desc: "Подними руки вверх и хлопни в ладоши 3 раза." },
                { title: "Наклоны", desc: "Сделай наклон влево, затем вправо. Повтори 2 раза." },
                { title: "Прыжки на месте", desc: "Попрыгай на месте 3 раза." },
                { title: "Приседания", desc: "Присядь 2 раза, держа спину прямо." },
                { title: "Повороты головы", desc: "Поверни голову влево, затем вправо. Повтори 2 раза." },
                { title: "Потягушки", desc: "Подними руки вверх и потянись, как после сна." },
                { title: "Цапля", desc: "Постой на одной ноге 3 секунды, затем на другой." },
                { title: "Мельница", desc: "Вытяни руки в стороны и вращай ими, как мельница." }
            ]
        };
        return { cards: cardsData, motor: motorCards };
    }
}

// ========================================================
// РЕНДЕРИНГ КАРТОЧЕК (остаётся без изменений)
// ========================================================

export function renderSpeechCards() {
    const colors = ['blue', 'red', 'green', 'yellow'];
    const colorMap = {
        blue: 'card-blue',
        red: 'card-red',
        green: 'card-green',
        yellow: 'card-yellow'
    };
    const labelMap = {
        blue: 'blueCount',
        red: 'redCount',
        green: 'greenCount',
        yellow: 'yellowCount'
    };
    
    for (const color of colors) {
        const container = document.getElementById(`${color}Cards`);
        if (!container) continue;
        
        const cards = cardsData[color] || [];
        let html = '';
        let count = 0;
        
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (AppState.showOnlyConfirmed && !card.confirmed) continue;
            count++;
            
            const badgeClass = card.confirmed ? 'badge-confirmed' : 'badge-developed';
            const badgeText = card.confirmed ? '✓ Подтверждено' : '✎ В разработке';
            const borderClass = colorMap[color];
            const taskId = `${color}_${i}`;
            const isCompleted = AppState.completedTaskIds.includes(taskId);
            
            html += `
                <div class="task-card ${borderClass}" data-task-id="${taskId}">
                    <div class="card-title">
                        ${isCompleted ? '✅ ' : ''}${card.title}
                        <span class="card-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="card-desc">${card.desc}</div>
                    <button class="btn btn-sm btn-success" onclick="window.completeTask('${taskId}')" 
                            style="margin-top:12px; padding:6px 16px; font-size:0.8rem; border-radius:30px;">
                        ✅ Выполнено
                    </button>
                </div>
            `;
        }
        
        if (html === '' && AppState.showOnlyConfirmed) {
            html = '<div style="padding:30px; text-align:center; color:var(--text-muted);">Нет подтверждённых заданий в этой категории</div>';
        }
        
        container.innerHTML = html;
        const countEl = document.getElementById(labelMap[color]);
        if (countEl) countEl.textContent = count;
    }
    
    init3DCards();
}

export function renderMotorCards() {
    const container = document.getElementById('orangeCards');
    if (!container) return;
    
    let cards = [];
    if (AppState.currentMotorFilter === 'all') {
        cards = [...(motorCards.fine || []), ...(motorCards.gross || [])];
    } else if (AppState.currentMotorFilter === 'fine') {
        cards = motorCards.fine || [];
    } else if (AppState.currentMotorFilter === 'gross') {
        cards = motorCards.gross || [];
    }
    
    let html = '';
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const isFine = motorCards.fine && motorCards.fine.includes(card);
        const badgeText = isFine ? '✋ Мелкая моторика' : '🏃 Крупная моторика';
        const badgeClass = isFine ? 'badge-confirmed' : 'badge-developed';
        const taskId = `motor_${i}`;
        const isCompleted = AppState.completedTaskIds.includes(taskId);
        
        html += `
            <div class="task-card card-orange" data-task-id="${taskId}">
                <div class="card-title">
                    ${isCompleted ? '✅ ' : ''}${card.title}
                    <span class="card-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="card-desc">${card.desc}</div>
                <button class="btn btn-sm btn-success" onclick="window.completeTask('${taskId}')" 
                        style="margin-top:12px; padding:6px 16px; font-size:0.8rem; border-radius:30px;">
                    ✅ Выполнено
                </button>
            </div>
        `;
    }
    
    if (html === '') {
        html = '<div style="padding:30px; text-align:center; color:var(--text-muted);">Нет карточек в этой категории</div>';
    }
    
    container.innerHTML = html;
    document.getElementById('orangeCount').textContent = cards.length;
    
    init3DCards();
}

export function renderCardsStats() {
    const total = Object.values(cardsData).reduce((acc, arr) => acc + arr.length, 0) + 
                  (motorCards.fine?.length || 0) + (motorCards.gross?.length || 0);
    const completed = AppState.completedTaskIds.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const statCards = document.getElementById('statCards');
    const statProgress = document.getElementById('statProgress');
    if (statCards) statCards.textContent = total;
    if (statProgress) statProgress.textContent = `${progress}%`;
}

// ========================================================
// 3D-ЭФФЕКТ
// ========================================================

export function init3DCards() {
    const theme = document.documentElement.getAttribute('data-theme') || 'game';
    if (theme === 'official' || theme === 'elderly') return;
    
    document.querySelectorAll('.task-card').forEach(card => {
        card.removeEventListener('mousemove', card._mouseMove);
        card.removeEventListener('mouseleave', card._mouseLeave);
        
        const mouseMove = function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;
            this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        };
        
        const mouseLeave = function() {
            this.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        };
        
        card._mouseMove = mouseMove;
        card._mouseLeave = mouseLeave;
        card.addEventListener('mousemove', mouseMove);
        card.addEventListener('mouseleave', mouseLeave);
    });
}

// Глобальная функция для выполнения задания
window.completeTask = function(taskId) {
    if (!AppState.completedTaskIds.includes(taskId)) {
        markTaskCompleted(taskId);
        renderSpeechCards();
        renderMotorCards();
        renderCardsStats();
        
        const btn = document.querySelector(`[data-task-id="${taskId}"] .btn`);
        if (btn) {
            btn.textContent = '✅ Готово!';
            btn.style.background = 'var(--green)';
            setTimeout(() => {
                btn.textContent = '✅ Выполнено';
            }, 1500);
        }
    }
};