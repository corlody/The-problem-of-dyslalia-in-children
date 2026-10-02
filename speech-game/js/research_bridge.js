// js/research_bridge.js v3 — обновление сессии по ID

const RESEARCH_KEY = 'research_data_v3';
const GAME_SESSIONS_KEY = 'speech_game_sessions_v2';

export function getResearchChildren() {
  try {
    const raw = localStorage.getItem(RESEARCH_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.children || [];
  } catch (e) { return []; }
}

export function getResearchChild(childId) {
  return getResearchChildren().find(c => c.id === childId);
}

export function getChildSounds(child) {
  if (!child || !child.sounds) return [];
  return child.sounds.split(/[,\s]+/).filter(s => s.trim().length > 0);
}

/**
 * Сохранить или ОБНОВИТЬ игровую сессию по sessionId.
 * Если сессия с таким ID уже есть — обновляется.
 * Если нет — добавляется в начало (новые сверху).
 */
export function saveGameSession(session) {
  try {
    const sessions = JSON.parse(localStorage.getItem(GAME_SESSIONS_KEY) || '[]');
    const idx = sessions.findIndex(s => s.sessionId === session.sessionId);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
      if (sessions.length > 200) sessions.length = 200;
    }
    localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(sessions));
    return true;
  } catch (e) {
    console.warn('Не удалось сохранить сессию:', e);
    return false;
  }
}

export function getGameSessions(filter = {}) {
  try {
    let sessions = JSON.parse(localStorage.getItem(GAME_SESSIONS_KEY) || '[]');
    if (filter.childId) sessions = sessions.filter(s => s.childId === filter.childId);
    if (filter.dateFrom) sessions = sessions.filter(s => s.date >= filter.dateFrom);
    if (filter.dateTo) sessions = sessions.filter(s => s.date <= filter.dateTo);
    return sessions;
  } catch (e) { return []; }
}

export function deleteGameSession(sessionId) {
  try {
    const sessions = JSON.parse(localStorage.getItem(GAME_SESSIONS_KEY) || '[]');
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    localStorage.setItem(GAME_SESSIONS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) { return false; }
}

export function getChildGameSessions(childId) {
  return getGameSessions({ childId });
}

export function getLatestChildSession(childId) {
  const sessions = getChildGameSessions(childId);
  if (sessions.length === 0) return null;
  return sessions.sort((a, b) => (b.startedAt || '').localeCompare(a.startedAt || ''))[0];
}

export function getChildStats(childId) {
  const sessions = getChildGameSessions(childId);
  const stats = {
    totalSessions: sessions.length,
    totalTasks: 0, doneTasks: 0, partialTasks: 0, failedTasks: 0,
    soundsPracticed: {}, firstSession: null, lastSession: null
  };
  sessions.forEach(s => {
    if (!stats.firstSession || s.date < stats.firstSession) stats.firstSession = s.date;
    if (!stats.lastSession || s.date > stats.lastSession) stats.lastSession = s.date;
    (s.tasks || []).forEach(t => {
      stats.totalTasks++;
      if (t.result === 'done') stats.doneTasks++;
      else if (t.result === 'partial') stats.partialTasks++;
      else if (t.result === 'failed') stats.failedTasks++;
      if (t.sound) stats.soundsPracticed[t.sound] = (stats.soundsPracticed[t.sound] || 0) + 1;
    });
  });
  return stats;
}
