// ==========================================================
// ПАДАЮЩИЕ ЛЕПЕСТКИ САКУРЫ
// Работают только когда активна тема "sakura"
// ==========================================================

let sakuraCanvas = null;
let sakuraCtx = null;
let sakuraParticles = [];
let sakuraAnimId = null;
let sakuraEnabled = true;

const SAKURA_COUNT = 40;       // количество лепестков (можно уменьшить для слабых ПК)
const SAKURA_COLORS = ['#fbcfe8', '#f9a8d4', '#f472b6', '#fce7f3', '#fb7185'];

function initSakuraParticles() {
    // Создаём canvas, если его нет
    if (!sakuraCanvas) {
        sakuraCanvas = document.createElement('canvas');
        sakuraCanvas.id = 'sakura-canvas';
        document.body.appendChild(sakuraCanvas);
        sakuraCtx = sakuraCanvas.getContext('2d');
    }
    
    resizeSakura();
    createSakuraParticles();
    drawSakuraParticles();
    
    window.addEventListener('resize', () => {
        resizeSakura();
        createSakuraParticles();
    });
}

function resizeSakura() {
    if (!sakuraCanvas) return;
    sakuraCanvas.width = window.innerWidth;
    sakuraCanvas.height = window.innerHeight;
}

function createSakuraParticles() {
    sakuraParticles = [];
    const w = sakuraCanvas.width;
    const h = sakuraCanvas.height;
    
    for (let i = 0; i < SAKURA_COUNT; i++) {
        sakuraParticles.push({
            x: Math.random() * w,
            y: Math.random() * h - h,
            size: Math.random() * 8 + 6,
            speedY: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.8,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 2,
            sway: Math.random() * Math.PI * 2,   // фаза покачивания
            swaySpeed: Math.random() * 0.02 + 0.01,
            color: SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)],
            opacity: Math.random() * 0.5 + 0.5
        });
    }
}

function drawSakuraParticles() {
    if (!sakuraCtx) return;
    
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme !== 'sakura' || !sakuraEnabled) {
        sakuraCtx.clearRect(0, 0, sakuraCanvas.width, sakuraCanvas.height);
        sakuraAnimId = requestAnimationFrame(drawSakuraParticles);
        return;
    }
    
    const w = sakuraCanvas.width;
    const h = sakuraCanvas.height;
    sakuraCtx.clearRect(0, 0, w, h);
    
    for (const p of sakuraParticles) {
        // Покачивание
        p.sway += p.swaySpeed;
        const swayX = Math.sin(p.sway) * 0.6;
        
        p.x += p.speedX + swayX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        
        // Если лепесток улетел вниз — возвращаем наверх
        if (p.y > h + 20) {
            p.y = -20;
            p.x = Math.random() * w;
        }
        // Если улетел в сторону
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        
        // Рисуем лепесток
        sakuraCtx.save();
        sakuraCtx.translate(p.x, p.y);
        sakuraCtx.rotate((p.rotation * Math.PI) / 180);
        sakuraCtx.globalAlpha = p.opacity;
        sakuraCtx.fillStyle = p.color;
        
        // Форма лепестка — эллипс с лёгкой асимметрией
        sakuraCtx.beginPath();
        sakuraCtx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        sakuraCtx.fill();
        
        // Лёгкая обводка для объёма
        sakuraCtx.strokeStyle = 'rgba(190, 24, 93, 0.15)';
        sakuraCtx.lineWidth = 0.5;
        sakuraCtx.stroke();
        
        sakuraCtx.restore();
    }
    
    sakuraAnimId = requestAnimationFrame(drawSakuraParticles);
}

// ==========================================================
// АВТОЗАПУСК ПРИ ЗАГРУЗКЕ
// ==========================================================
document.addEventListener('DOMContentLoaded', function() {
    initSakuraParticles();
});

// Перезапуск при смене темы
const originalChangeTheme = window.changeTheme;
window.changeTheme = function(theme) {
    if (typeof originalChangeTheme === 'function') {
        originalChangeTheme(theme);
    }
    // Небольшая пауза, чтобы данные темы применились
    setTimeout(() => {
        if (theme === 'sakura') {
            if (!sakuraCanvas) initSakuraParticles();
            sakuraEnabled = true;
        } else {
            sakuraEnabled = false;
        }
    }, 100);
};

// Глобальные функции (если нужны)
window.toggleSakura = function(enabled) {
    sakuraEnabled = enabled;
};