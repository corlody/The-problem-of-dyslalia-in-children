// js/tasks.js — модуль работы с заданиями
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
        tasksData = { artic: [], slogi: [], slova: [], uprazhneniya: [], skorogovorki: [], differenciaciya: [], motor: { fine: [], gross: [] } };
        return tasksData;
    }
}

export function getAllTasksForSounds(sounds, includeMotor = false) {
  if (!tasksData) return [];
  const result = [];
  const addFrom = (arr) => {
    if (!arr) return;
    for (const t of arr) {
      if (!t.applies_to) continue;
      // "all" — подходит всем
      if (t.applies_to.includes('all')) { result.push(t); continue; }
      // Если звуки не выбраны — не фильтруем
      if (sounds.length === 0) { result.push(t); continue; }
      // Ищем совпадение
      if (sounds.some(s => t.applies_to.includes(s))) result.push(t);
    }
  };
  addFrom(tasksData.artic);
  addFrom(tasksData.slogi);
  addFrom(tasksData.slova);
  addFrom(tasksData.uprazhneniya);
  addFrom(tasksData.skorogovorki);
  addFrom(tasksData.differenciaciya);
  if (includeMotor) {
    addFrom(tasksData.motor?.fine);
    addFrom(tasksData.motor?.gross);
  }
  const seen = new Set();
  return result.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export function getNextTask(sounds, options = {}) {
  const { includeMotor = false, resetIfEmpty = true } = options;
  const pool = getAllTasksForSounds(sounds, includeMotor);
  if (pool.length === 0) return null;
  const available = pool.filter(t => !usedTaskIds.has(t.id));
  if (available.length === 0) {
    if (resetIfEmpty) {
      usedTaskIds.clear();
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return null;
  }
  const task = available[Math.floor(Math.random() * available.length)];
  usedTaskIds.add(task.id);
  return task;
}

export function resetUsedTasks() { usedTaskIds.clear(); }

export function getReps(task, age) {
    if (task.reps && task.reps[age] !== undefined) return task.reps[age];
    if (task.reps && task.reps[7] !== undefined) return task.reps[7];
    return 4;
}
