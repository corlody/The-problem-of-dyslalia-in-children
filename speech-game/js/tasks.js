// js/tasks.js v3 — с поддержкой пресетов этапов и фильтрами

let tasksData = null;
const usedTaskIds = new Set();

// ============================================================
// ПРЕСЕТЫ ЭТАПОВ КОРРЕКЦИИ
// ============================================================
export const PRESETS = {
  post: {
    id: 'post', emoji: '🎯', name: 'Постановка',
    desc: 'Только гимнастика и дыхание. Ребёнок ещё не произносит звук.',
    types: ['artic', 'breath', 'motor_fine', 'motor_gross'],
  },
  syll: {
    id: 'syll', emoji: '🔤', name: 'Автоматизация в слогах',
    desc: 'Гимнастика + слоги. Звук появился, закрепляем.',
    types: ['artic', 'breath', 'slogi', 'motor_fine', 'motor_gross'],
  },
  words: {
    id: 'words', emoji: '📝', name: 'Автоматизация в словах',
    desc: 'Плюс слова и лабиринты.',
    types: ['artic', 'breath', 'slogi', 'slova', 'motor_fine', 'motor_gross'],
  },
  phrases: {
    id: 'phrases', emoji: '💬', name: 'Автоматизация во фразах',
    desc: 'Плюс скороговорки и речевые упражнения.',
    types: ['artic', 'breath', 'slogi', 'slova', 'uprazhneniya', 'skorogovorki', 'motor_fine', 'motor_gross'],
  },
  speech: {
    id: 'speech', emoji: '🗣', name: 'Автоматизация в речи',
    desc: 'Всё включено — включая дифференциацию.',
    types: ['artic', 'breath', 'slogi', 'slova', 'uprazhneniya', 'skorogovorki', 'differenciaciya', 'motor_fine', 'motor_gross'],
  },
  artic_only: {
    id: 'artic_only', emoji: '👅', name: 'Только гимнастика',
    desc: 'Артикуляция + дыхание + моторика. Без слов, слогов и песен.',
    types: ['artic', 'breath', 'motor_fine', 'motor_gross'],
  },
  custom: {
    id: 'custom', emoji: '⚙️', name: 'Вручную',
    desc: 'Сам выбираю, какие типы заданий использовать.',
    types: [],
  },
};

// ============================================================
// ЧЕЛОВЕКОЧИТАЕМЫЕ НАЗВАНИЯ ТИПОВ
// ============================================================
export const TYPE_LABELS = {
  artic: '👅 Артикуляционная гимнастика',
  breath: '💨 Дыхательные упражнения',
  slogi: '🔤 Слоги / песенки',
  slova: '📝 Слова и лабиринты',
  uprazhneniya: '💬 Речевые упражнения',
  skorogovorki: '📖 Скороговорки',
  differenciaciya: '⚖️ Дифференциация',
  motor_fine: '✋ Моторика мелкая',
  motor_gross: '🏃 Моторика крупная',
};

// ============================================================
// ЗАГРУЗКА
// ============================================================
export async function loadTasks() {
  if (tasksData) return tasksData;
  try {
    const r = await fetch('data/tasks_by_sound.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    tasksData = await r.json();
    return tasksData;
  } catch (e) {
    console.warn('Не удалось загрузить tasks_by_sound.json:', e);
    tasksData = { artic: [], breath: [], slogi: [], slova: [], uprazhneniya: [], skorogovorki: [], differenciaciya: [], motor: { fine: [], gross: [] } };
    return tasksData;
  }
}

// ============================================================
// ПОЛУЧИТЬ ВСЕ ЗАДАНИЯ ПО ТИПУ
// ============================================================
function getTasksByType(type) {
  if (!tasksData) return [];
  switch (type) {
    case 'artic': return tasksData.artic || [];
    case 'breath': return tasksData.breath || [];
    case 'slogi': return tasksData.slogi || [];
    case 'slova': return tasksData.slova || [];
    case 'uprazhneniya': return tasksData.uprazhneniya || [];
    case 'skorogovorki': return tasksData.skorogovorki || [];
    case 'differenciaciya': return tasksData.differenciaciya || [];
    case 'motor_fine': return tasksData.motor?.fine || [];
    case 'motor_gross': return tasksData.motor?.gross || [];
    default: return [];
  }
}

// ============================================================
// ФИЛЬТРАЦИЯ ПО ЗВУКАМ
// ============================================================
function taskMatchesSounds(task, sounds) {
  if (!task.applies_to) return false;
  if (task.applies_to.includes('all')) return true;
  if (sounds.length === 0) return true;
  return sounds.some(s => task.applies_to.includes(s));
}

// ============================================================
// ПОЛУЧИТЬ ВСЕ ЗАДАНИЯ ПО ЗВУКАМ И ТИПАМ
// ============================================================
export function getTasksByFilter(sounds, types) {
  if (!tasksData) return [];
  const result = [];
  const typeList = types && types.length > 0
    ? types
    : Object.keys(TYPE_LABELS); // все типы

  for (const type of typeList) {
    const arr = getTasksByType(type);
    for (const t of arr) {
      if (taskMatchesSounds(t, sounds)) {
        result.push({ ...t, _type: type });
      }
    }
  }

  // Дедупликация по id
  const seen = new Set();
  return result.filter(t => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

// ============================================================
// ПОДСЧЁТ ЗАДАНИЙ
// ============================================================
export function countTasksForSounds(sounds, types) {
  return getTasksByFilter(sounds, types).length;
}

// Подсчёт по каждому типу (для чекбоксов с цифрами)
export function getAvailableTypesWithCounts(sounds) {
  if (!tasksData) return [];
  const result = [];
  for (const type of Object.keys(TYPE_LABELS)) {
    const arr = getTasksByType(type);
    const count = arr.filter(t => taskMatchesSounds(t, sounds)).length;
    result.push({ type, label: TYPE_LABELS[type], count });
  }
  return result;
}

// Подсчёт по звукам (для бейджей у звуков в модалке)
export function countTasksForSound(sound, types) {
  if (!tasksData) return 0;
  const typeList = types && types.length > 0
    ? types
    : Object.keys(TYPE_LABELS);
  let count = 0;
  for (const type of typeList) {
    const arr = getTasksByType(type);
    for (const t of arr) {
      if (!t.applies_to) continue;
      if (t.applies_to.includes('all') || t.applies_to.includes(sound)) count++;
    }
  }
  return count;
}

// ============================================================
// ПОЛУЧИТЬ СЛЕДУЮЩЕЕ ЗАДАНИЕ (с фильтром по типам)
// ============================================================
export function getNextTaskByFilter(sounds, types) {
  const pool = getTasksByFilter(sounds, types);
  if (pool.length === 0) return null;

  const available = pool.filter(t => !usedTaskIds.has(t.id));
  if (available.length === 0) {
    usedTaskIds.clear();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const task = available[Math.floor(Math.random() * available.length)];
  usedTaskIds.add(task.id);
  return task;
}

// ============================================================
// СТАРЫЕ ФУНКЦИИ (для совместимости)
// ============================================================
export function getAllTasksForSounds(sounds, includeMotor = false) {
  const types = ['artic', 'breath', 'slogi', 'slova', 'uprazhneniya', 'skorogovorki', 'differenciaciya'];
  if (includeMotor) types.push('motor_fine', 'motor_gross');
  return getTasksByFilter(sounds, types);
}

export function getNextTask(sounds, options = {}) {
  const { includeMotor = false, resetIfEmpty = true } = options;
  const types = ['artic', 'breath', 'slogi', 'slova', 'uprazhneniya', 'skorogovorki', 'differenciaciya'];
  if (includeMotor) types.push('motor_fine', 'motor_gross');
  const pool = getTasksByFilter(sounds, types);
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
  if (task && task.reps && task.reps[age] !== undefined) return task.reps[age];
  if (task && task.reps && task.reps[7] !== undefined) return task.reps[7];
  return 4;
}

export function getAllTasks() {
  if (!tasksData) return [];
  const all = [];
  for (const type of Object.keys(TYPE_LABELS)) {
    all.push(...getTasksByType(type).map(t => ({ ...t, _type: type })));
  }
  return all;
}
