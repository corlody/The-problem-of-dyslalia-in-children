// js/tasks.js
// Модуль работы с заданиями по звукам

let tasksData = null;
const usedTaskIds = new Set();

export async function loadTasks() {
    if (tasksData) return tasksData;
    try {
        const r = await fetch('data/tasks_by_sound.json');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        tasksData = await r.json();
        return tasksData;
    } catch (e) {
        console.warn('Не удалось загрузить tasks_by_sound.json:', e);
        tasksData = { sounds: {}, motor: { fine: [], gross: [] } };
        return tasksData;
    }
}

export function getSoundList() {
    if (!tasksData) return [];
    return Object.keys(tasksData.sounds).filter(k => !tasksData.sounds[k]._todo);
}

export function getSoundTasks(sound, type) {
    if (!tasksData || !tasksData.sounds[sound]) return [];
    const s = tasksData.sounds[sound];
    if (type && s[type]) return s[type];
    // Все задания по звуку
    return [
        ...(s.artic || []),
        ...(s.slogi || []),
        ...(s.slova || []),
        ...(s.uprazhneniya || []),
        ...(s.skorogovorki || [])
    ];
}

// Получить все задания по нескольким звукам
export function getTasksForSounds(sounds) {
    const all = [];
    for (const sound of sounds) {
        all.push(...getSoundTasks(sound));
    }
    return all;
}

// Получить следующее задание без повторов
export function getNextTask(sounds, resetIfEmpty = true) {
    const pool = getTasksForSounds(sounds);
    if (pool.length === 0) return null;
    const available = pool.filter(t => !usedTaskIds.has(t.id));
    if (available.length === 0) {
        if (resetIfEmpty) usedTaskIds.clear();
        else return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }
    const task = available[Math.floor(Math.random() * available.length)];
    usedTaskIds.add(task.id);
    return task;
}

export function resetUsedTasks() {
    usedTaskIds.clear();
}

export function getReps(task, age) {
    if (task.reps && task.reps[age] !== undefined) return task.reps[age];
    if (task.reps && task.reps[7] !== undefined) return task.reps[7];
    return 4;
}

export function getMotorTasks(filter) {
    if (!tasksData) return [];
    const m = tasksData.motor;
    if (filter === 'fine') return m.fine || [];
    if (filter === 'gross') return m.gross || [];
    return [...(m.fine || []), ...(m.gross || [])];
}