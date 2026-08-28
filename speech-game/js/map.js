import { AppState } from './state.js';

let mapCoordinates = { total: 89, cells: [] };
let isEditorMode = false;
let markers = [];
let markerCounter = 0;

// ========================================================
// ЗАГРУЗКА КООРДИНАТ
// ========================================================

export async function loadMapCoordinates() {
    try {
        const response = await fetch('data/map_coordinates.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        mapCoordinates = await response.json();
        return mapCoordinates;
    } catch (e) {
        console.warn('Не удалось загрузить координаты карты');
        return mapCoordinates;
    }
}

// ========================================================
// ОТРИСОВКА МАРКЕРОВ
// ========================================================

export function renderMapMarkers() {
    const overlay = document.getElementById('mapOverlay');
    if (!overlay) return;
    
    overlay.innerHTML = '';
    
    const cells = mapCoordinates.cells || [];
    const specialCells = {
        1: { emoji: '🌿', name: 'Старт — Цветочный луг' },
        18: { emoji: '🦛', name: 'Живот гиганта → клетка 22' },
        22: { emoji: '🏖️', name: 'Пляж' },
        89: { emoji: '🏁', name: '🏆 Жерло вулкана — ПОБЕДА!' },
        17: { emoji: '🌊', name: 'Водопад — вниз по течению' },
        16: { emoji: '🧗', name: 'Верёвочная переправа — скатывание' }
    };
    
    for (const cell of cells) {
        const div = document.createElement('div');
        div.className = 'map-marker';
        div.style.top = cell.top;
        div.style.left = cell.left;
        div.title = `Клетка ${cell.number}`;
        
        let color = 'var(--purple)';
        let emoji = '';
        
        if (specialCells[cell.number]) {
            emoji = specialCells[cell.number].emoji;
            color = 'var(--gold)';
        }
        
        div.innerHTML = `
            <div class="marker-dot" style="background:${color};">
                ${emoji || cell.number}
            </div>
            <span class="marker-label">Клетка ${cell.number}</span>
        `;
        
        if (specialCells[cell.number]) {
            div.addEventListener('click', function() {
                showZoneInfo(
                    specialCells[cell.number].name || `Клетка ${cell.number}`,
                    `Особая клетка #${cell.number} на карте путешествия.`
                );
            });
        }
        
        overlay.appendChild(div);
    }
}

// ========================================================
// РЕДАКТОР КАРТЫ
// ========================================================

export function toggleMapEditor() {
    isEditorMode = !isEditorMode;
    const btn = document.getElementById('toggleEditorBtn');
    const exportBtn = document.getElementById('exportCoordsBtn');
    const clearBtn = document.getElementById('clearMarkersBtn');
    const status = document.getElementById('editorStatus');
    const mapImage = document.getElementById('mapImage');
    const canvas = document.getElementById('particles-canvas');
    
    if (isEditorMode) {
        btn.innerHTML = '<i class="fas fa-eye"></i> Выйти из разметки';
        exportBtn.style.display = 'inline-flex';
        clearBtn.style.display = 'inline-flex';
        status.innerHTML = '📌 <strong>Режим разметки</strong> — кликайте на карту, чтобы добавить новые клетки';
        mapImage.style.cursor = 'crosshair';
        canvas.style.display = 'none';
        
        document.querySelectorAll('.map-marker .marker-dot::after').forEach(el => {
            el.style.animation = 'none';
        });
        
        mapImage.addEventListener('click', onMapClick);
    } else {
        btn.innerHTML = '<i class="fas fa-pen"></i> Режим разметки';
        exportBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        status.innerHTML = '📌 <strong>Все 89 клеток</strong> уже отмечены на карте!';
        mapImage.style.cursor = 'default';
        
        const theme = document.documentElement.getAttribute('data-theme') || 'game';
        if (theme === 'game') {
            canvas.style.display = 'block';
        }
        
        document.querySelectorAll('.map-marker .marker-dot::after').forEach(el => {
            el.style.animation = 'markerPulse 2.5s ease-in-out infinite';
        });
        
        mapImage.removeEventListener('click', onMapClick);
    }
}

function onMapClick(e) {
    if (!isEditorMode) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100);
    const y = ((e.clientY - rect.top) / rect.height * 100);
    
    markerCounter++;
    const newMarker = {
        number: markerCounter,
        top: y + '%',
        left: x + '%'
    };
    
    markers.push(newMarker);
    
    const overlay = document.getElementById('mapOverlay');
    const div = document.createElement('div');
    div.className = 'map-marker editing';
    div.style.top = newMarker.top;
    div.style.left = newMarker.left;
    div.innerHTML = `
        <div class="marker-dot" style="background:var(--gold);">${newMarker.number}</div>
        <span class="marker-label">Клетка ${newMarker.number}</span>
    `;
    overlay.appendChild(div);
    
    document.getElementById('editorStatus').innerHTML = 
        `📌 <strong>Отмечено:</strong> ${markerCounter} клеток (последняя: ${markerCounter})`;
}

export function clearMarkers() {
    if (!confirm('Очистить все добавленные клетки?')) return;
    markers = [];
    markerCounter = 0;
    renderMapMarkers();
    document.getElementById('editorStatus').innerHTML = '📌 <strong>Все клетки очищены</strong>';
}

export function exportCoordinates() {
    if (markers.length === 0) {
        alert('Сначала отметьте новые клетки на карте!');
        return;
    }
    
    const data = {
        total: markers.length,
        cells: markers.map((m, i) => ({
            number: i + 1,
            top: m.top,
            left: m.left
        }))
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'map_coordinates.json';
    link.click();
    URL.revokeObjectURL(link.href);
    
    navigator.clipboard.writeText(json).then(() => {
        console.log('JSON скопирован в буфер обмена');
    }).catch(() => {});
    
    document.getElementById('editorStatus').innerHTML = 
        `✅ <strong>Экспортировано!</strong> ${markers.length} новых клеток.`;
}

// ========================================================
// ЗОНЫ (МОДАЛКА)
// ========================================================

export function showZoneInfo(title, description) {
    document.getElementById('zoneTitle').textContent = title;
    document.getElementById('zoneDescription').textContent = description;
    document.getElementById('zoneModal').classList.add('active');
}

export function closeZoneInfo() {
    document.getElementById('zoneModal').classList.remove('active');
}

// Закрытие по клику вне модалки
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('zoneModal').addEventListener('click', function(e) {
        if (e.target === this) closeZoneInfo();
    });
});