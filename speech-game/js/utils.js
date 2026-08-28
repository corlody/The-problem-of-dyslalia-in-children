import { AppState } from './state.js';

// ========================================================
// ГАЛЕРЕЯ КАРТОЧЕК (с вашими изображениями)
// ========================================================

export function openCardsGallery() {
    const galleryWindow = window.open('', '_blank');
    if (!galleryWindow) {
        alert('Пожалуйста, разрешите всплывающие окна для этой страницы');
        return;
    }
    
    // Ваши карточки с описаниями
    const cards = [
        { num: 1, title: "Окошко (Бегемот) • Чистим зубки • Месим тесто" },
        { num: 2, title: "Чашечка • Дудочка • Заборчик" },
        { num: 3, title: "Слоник пьёт • Индюки болтают • Орешки" },
        { num: 4, title: "Маляр • Грибочек • Киска" },
        { num: 5, title: "Вкусное варенье • Шарик • Гармошка" },
        { num: 6, title: "Барабанщик • Парашютик • Загнать мяч в ворота" },
        { num: 7, title: "Качели • Масики • Блинчик" },
        { num: 8, title: "Поймали мышку • Лошадка • Пароход гудит" }
    ];
    
    galleryWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Карточки заданий</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body {
                font-family: 'Inter', sans-serif;
                background: #0a0e27;
                color: #f1f5f9;
                padding: 20px;
                min-height: 100vh;
            }
            h1 {
                text-align: center;
                font-family: 'Playfair Display', serif;
                font-size: clamp(1.8rem, 4vw, 2.5rem);
                margin-bottom: 30px;
                background: linear-gradient(135deg, #fff, #a78bfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 25px;
                max-width: 1200px;
                margin: 0 auto;
            }
            .img-card {
                background: rgba(30, 41, 59, 0.6);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                padding: 15px;
                border: 1px solid rgba(255,255,255,0.08);
                transition: 0.3s;
                text-align: center;
            }
            .img-card:hover {
                transform: translateY(-6px);
                border-color: rgba(124, 58, 237, 0.3);
                box-shadow: 0 8px 30px rgba(124, 58, 237, 0.15);
            }
            .img-card img {
                width: 100%;
                border-radius: 12px;
                cursor: pointer;
                transition: 0.3s;
                aspect-ratio: 1 / 1;
                object-fit: cover;
                background: #1a1a2e;
            }
            .img-card img:hover { transform: scale(1.03); }
            .img-card .card-label {
                margin-top: 10px;
                color: #cbd5e1;
                font-size: 0.85rem;
                line-height: 1.4;
            }
            .img-card .card-label strong {
                color: #f1f5f9;
            }
            .download-btn {
                margin-top: 10px;
                padding: 6px 18px;
                border: none;
                border-radius: 30px;
                background: linear-gradient(135deg, #7c3aed, #5b21b6);
                color: white;
                cursor: pointer;
                font-size: 0.85rem;
                transition: 0.3s;
                font-family: 'Inter', sans-serif;
            }
            .download-btn:hover { transform: scale(1.05); box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3); }
            .modal {
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.92);
                backdrop-filter: blur(20px);
                justify-content: center;
                align-items: center;
                z-index: 999;
                padding: 20px;
                cursor: pointer;
            }
            .modal img {
                max-width: 90%;
                max-height: 90%;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.8);
                object-fit: contain;
            }
            .close-gallery {
                position: fixed;
                top: 20px;
                right: 30px;
                font-size: 2rem;
                color: #fff;
                cursor: pointer;
                z-index: 1000;
                transition: 0.3s;
            }
            .close-gallery:hover { transform: rotate(90deg); color: #a78bfa; }
            .gallery-info {
                text-align: center;
                color: var(--text-secondary);
                margin-bottom: 20px;
                font-size: 0.95rem;
            }
            @media (max-width: 600px) {
                body { padding: 10px; }
                .grid { gap: 15px; }
                .img-card { padding: 10px; }
            }
        </style>
    </head>
    <body>
        <span class="close-gallery" onclick="window.close()">✕</span>
        <h1>📸 Артикуляционная гимнастика</h1>
        <p class="gallery-info">Кликните на карточку, чтобы увеличить • Нажмите "Скачать" для сохранения</p>
        <div class="grid">
            ${cards.map(c => `
                <div class="img-card">
                    <img src="images/card${c.num}.jpg" loading="lazy" 
                         onclick="openImage(this.src)" 
                         alt="Карточка ${c.num}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Crect fill=%22%231e293b%22 width=%22300%22 height=%22300%22/%3E%3Ctext x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%2364748b%22 font-size=%2220%22 font-family=%22Inter%22%3EКарточка ${c.num}%3C/text%3E%3C/svg%3E'">
                    <div class="card-label"><strong>Карточка #${c.num}</strong><br>${c.title}</div>
                    <a href="images/card${c.num}.jpg" download="card${c.num}.jpg">
                        <button class="download-btn">⬇ Скачать</button>
                    </a>
                </div>
            `).join('')}
        </div>
        <div class="modal" id="galleryModal" onclick="this.style.display='none'">
            <img id="galleryModalImg" src="">
        </div>
        <script>
            function openImage(src) {
                document.getElementById('galleryModalImg').src = src;
                document.getElementById('galleryModal').style.display = 'flex';
            }
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    document.getElementById('galleryModal').style.display = 'none';
                }
            });
        <\/script>
    </body>
    </html>
    `);
    galleryWindow.document.close();
}

// ========================================================
// СКАЧИВАНИЕ WORD-КАРТЫ (без изменений)
// ========================================================

export function downloadWordCard() {
    const isRu = AppState.lang === 'ru';
    const content = `<!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${isRu ? 'Индивидуальная карта игрока' : 'Player Card'}</title>
    <style>
        body{font-family:'Segoe UI',serif;margin:2cm;background:#fff;color:#1a1a2e;}
        h1{color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:10px;}
        h2{color:#5b21b6;margin-top:25px;}
        table{border-collapse:collapse;width:100%;margin:15px 0;}
        td,th{border:1px solid #ccc;padding:8px;}
        th{background:#f3f0ff;}
        .field{display:inline-block;min-width:150px;border-bottom:1px solid #ccc;margin:0 5px;}
        .progress-bar { background: #e5e7eb; border-radius: 10px; height: 20px; margin: 10px 0; }
        .progress-fill { background: #7c3aed; border-radius: 10px; height: 100%; width: ${Math.min(100, AppState.completedTaskIds.length)}%; }
    </style>
    </head>
    <body>
        <h1>🗺️ ${isRu ? 'Индивидуальная карта игрока' : 'Player Card'}</h1>
        <p><strong>${isRu ? 'Игра:' : 'Game:'}</strong> ${isRu ? '«Говорю правильно: Путешествие к вулкану речи»' : '"Speak Correctly: Journey to the Volcano of Speech"'}</p>
        <p><strong>${isRu ? 'Имя:' : 'Name:'}</strong> _________________ <strong>${isRu ? 'Возраст:' : 'Age:'}</strong> _____ <strong>${isRu ? 'Дата:' : 'Date:'}</strong> _________</p>
        
        <h2>📊 ${isRu ? 'Прогресс' : 'Progress'}</h2>
        <p>${isRu ? 'Выполнено заданий:' : 'Completed tasks:'} ${AppState.completedTaskIds.length}</p>
        <div class="progress-bar"><div class="progress-fill"></div></div>
        <p>${isRu ? 'Правильных ответов:' : 'Correct answers:'} ${AppState.stats.totalCorrect} | ${isRu ? 'Неправильных:' : 'Incorrect:'} ${AppState.stats.totalIncorrect}</p>
        
        <h2>🔊 ${isRu ? 'Нарушенные звуки' : 'Problem Sounds'}</h2>
        <p>□ ${isRu ? 'Свистящие' : 'Sibilants'} □ ${isRu ? 'Шипящие' : 'Hushing'} □ ${isRu ? 'Сонорные' : 'Sonorants'} □ ${isRu ? 'Другие:' : 'Other:'} ___________</p>
        
        <h2>📈 ${isRu ? 'Этап коррекции' : 'Correction Stage'}</h2>
        <p>□ ${isRu ? 'Постановка' : 'Production'} □ ${isRu ? 'Автоматизация в слогах' : 'Automation in syllables'} □ ${isRu ? 'В словах' : 'In words'} □ ${isRu ? 'Во фразах' : 'In phrases'}</p>
        
        <h2>📋 ${isRu ? 'Выполненные задания' : 'Completed Tasks'}</h2>
        <p>${AppState.completedTaskIds.join(', ') || (isRu ? 'Пока нет' : 'None yet')}</p>
        
        <h2>📝 ${isRu ? 'Рекомендации' : 'Recommendations'}</h2>
        <p>_________________________________________________</p>
        <p>_________________________________________________</p>
        
        <h2>🤲 ${isRu ? 'Моторное развитие' : 'Motor Development'}</h2>
        <p>_________________________________________________</p>
        
        <p style="margin-top:40px; color:#64748b; font-size:0.85rem; text-align:center;">
            ${isRu ? 'Карта создана для игры «Говорю правильно» • Москва 2026' : 'Card created for the game "Speak Correctly" • Moscow 2026'}
        </p>
    </body>
    </html>`;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = isRu ? 'Individualnaya_karta.doc' : 'Player_Card.doc';
    link.click();
    URL.revokeObjectURL(link.href);
}