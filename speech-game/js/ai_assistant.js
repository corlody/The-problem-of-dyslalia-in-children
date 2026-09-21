/* ============================================================
   ai_assistant.js v2 — умный локальный помощник (офлайн)
   Ключевые улучшения:
     - Кнопки быстрых вопросов дают ТОЧНЫЙ ответ (по id)
     - Длинные фразы (с пробелами) весят больше одиночных слов
     - Отрицания ("не хочу", "не работает") приоритетнее
     - Правильные ключи i18n (core.aiHelp, core.aiPlaceholder)
   ============================================================ */

import { t, toast, haptic } from './core.js';

// ============================================================
// БАЗА ЗНАНИЙ
// ============================================================
const KNOWLEDGE = [
  {
    id: 'greeting',
    keys: ['привет', 'здравств', 'хай', 'добрый день', 'добрый вечер', 'hi', 'hello'],
    answer: '👋 Привет! Я помогу разобраться.\n\nСпроси своими словами — «не работает», «ребёнок не хочет», «что со звуком Р» — я пойму.\n\nИли выбери быстрый вопрос ниже 👇',
  },
  {
    id: 'how_to_play',
    keys: ['как начать игру', 'как играть', 'как начать', 'правила игры', 'запустить игру', 'начать игру', 'как запустить'],
    answer: '🎲 **Как начать игру**\n\n1. Открой страницу «Игра».\n2. Выбери ребёнка из списка исследования или создай своего.\n3. Отметь звуки, которые отрабатываете.\n4. Бросай кубик — фишка двигается по карте.\n5. На каждой клетке появляется задание.\n6. Выполнил — жми ✅, частично — ✏️, не смог — ❌.\n7. Кто первый дошёл до вулкана (клетка 89) — победил!',
  },
  {
    id: 'child_cries',
    keys: ['ребёнок не хочет играть', 'ребёнок не хочет', 'не хочет играть', 'отказывается', 'плачет', 'кричит', 'устал', 'надоело', 'скучно', 'не нравится играть', 'капризничает'],
    answer: '😊 **Ребёнок не хочет играть**\n\nЭто нормально — важно не давить. Что помогает:\n\n• **Короткие сессии** — 10–15 минут, не больше.\n• **Перерывы** после 5–7 ходов.\n• **Поощрения** — наклейки, «молодец!», маленькие призы.\n• **Смена режима** — попробуй «Тренировку» (без кубика) или «На время».\n• **Пусть выбирает сам** — дай выбрать звук или фишку.\n• **Играйте вместе** — если можно, сядьте рядом, комментируйте.\n• **Достижения** — дети любят их собирать (🏅 в правом углу).\n• **Не ругай за ошибки** — хвали за попытки.\n\n💡 Если ребёнок устал — лучше закончить раньше, чем заставлять. 2 короткие сессии лучше 1 длинной.',
  },
  {
    id: 'no_voice',
    keys: ['нет озвучки', 'нет голоса', 'не работает озвучка', 'не слышно', 'нет звука', 'говорит тихо', 'русский голос', 'speech', 'tts'],
    answer: '🔊 **Нет русской озвучки**\n\nЗайди в ⚙️ Настройки → раздел «Скачать русский голос». Там подробная инструкция.\n\n**Коротко:**\n• **Android:** Настройки → Язык и ввод → Синтез речи → Google → установить русский\n• **iOS:** Настройки → Универсальный доступ → Речь → Голоса → Русский → скачать\n• **Windows:** Параметры → Время и язык → Речь → Добавить голоса\n\nТакже можно скачать **Google TTS** из Play Маркета.',
  },
  {
    id: 'no_tasks',
    keys: ['нет заданий', 'не показываются задания', 'пустое задание', 'задание не появляется', 'tasks_by_sound'],
    answer: '📋 **Нет заданий**\n\nПричины и решения:\n\n1. **Не выбраны звуки** — закрой игру и отметь хотя бы один звук.\n2. **Файл не найден** — проверь, что `data/tasks_by_sound.json` лежит в папке проекта.\n3. **Открыт через file://** — некоторые браузеры блокируют загрузку. Запусти локальный сервер (см. README).\n4. **Открой консоль (F12)** — если там ошибка 404, файл не найден.\n\nЕсли ничего не помогает — нажми 🐞 и пришли отчёт.',
  },
  {
    id: 'add_child',
    keys: ['добавить ребёнка', 'добавить ребенка', 'новый ребёнок', 'новый ребенок', 'создать ребёнка', 'создать ребенка', 'карточка ребёнка', 'куда вписать'],
    answer: '👶 **Как добавить ребёнка**\n\n1. Открой страницу «Исследование».\n2. Раздел «Дети».\n3. Кнопка «Добавить ребёнка».\n4. Заполни: ФИО, возраст (5–15), класс, группу исследования, диагноз, нарушенные звуки.\n5. Сохрани — ребёнок появится в списке и в игре при выборе игрока.',
  },
  {
    id: 'child_missing',
    keys: ['ребёнок не появился', 'ребёнок пропал', 'не вижу ребёнка', 'потерялся ребёнок', 'исчез ребёнок', 'не находит ребёнка'],
    answer: '👀 **Ребёнок не появился в игре**\n\n1. Проверь, что он добавлен на странице «Исследование» → «Дети».\n2. Не открыт ли браузер в режиме инкогнито (данные не сохраняются).\n3. Если ты на другом устройстве или в другом браузере — данные не переносятся автоматически.\n\n💾 **Решение:** На старом устройстве ⚙️ Настройки → «Скачать все данные». На новом → «Восстановить из файла».',
  },
  {
    id: 'restore_backup',
    keys: ['перенести данные', 'бэкап', 'резервная копия', 'сохранить данные', 'восстановить данные', 'перенос данных', 'backup'],
    answer: '💾 **Как перенести данные**\n\n**На старом устройстве:**\n⚙️ Настройки → «Скачать все данные» → сохранится JSON.\n\n**На новом:**\n⚙️ Настройки → «Восстановить из файла» → выбери этот JSON.\n\nПереносятся: дети, протоколы, игровые сессии, настройки.',
  },
  {
    id: 'theme_change',
    keys: ['сменить тему', 'поменять тему', 'тёмная тема', 'темная тема', 'светлая тема', 'ночная тема', 'дизайн', 'оформление', 'цвет сайта'],
    answer: '🎨 **Как сменить тему**\n\n1. ⚙️ Настройки (в правом нижнем углу).\n2. Выбери тему из сетки.\n3. У природных тем (Сакура, Лето, Осень, Зима, Весна, Океан, Лес, Минимализм) есть **день ☀️ и ночь 🌙**.\n\nВсего 18 тем. Всё сохраняется автоматически.',
  },
  {
    id: 'font_size',
    keys: ['шрифт мелкий', 'крупный шрифт', 'плохо видно', 'размер шрифта', 'сделать крупнее', 'глаза устают'],
    answer: '🔍 **Размер шрифта**\n\n⚙️ Настройки → «Размер шрифта»: Мелкий / Средний / Крупный / Огромный.\n\nТам же есть:\n• Высокий контраст\n• Шрифт для дислексии\n• Меньше анимаций',
  },
  {
    id: 'bug_report',
    keys: ['баг', 'ошибка', 'сломалось', 'не работает', 'глючит', 'проблема', 'не получается', 'не могу'],
    answer: '🐞 **Что-то сломалось?**\n\nНажми **🐞 в правом нижнем углу**. Опиши, что произошло — данные о системе приложатся автоматически.\n\nСкачай отчёт и отправь разработчику.',
  },
  {
    id: 'sound_r',
    keys: ['звук р', 'р не получается', 'не выговаривает р', 'картавит', 'горловой р', 'рычать'],
    answer: '🗣 **Звук Р**\n\nНачни с артикуляционной гимнастики:\n• «Лошадка» — поцокать языком\n• «Грибок» — присосать язык к нёбу\n• «Барабанщик» — Д-Д-Д за верхними зубами\n• «Маляр» — погладить нёбо языком\n• «Кто дальше загонит мяч» — дуть на язык\n\nПотом слоги: РА-РО-РУ-РЫ-РЭ. Затем слова (лабиринты Р-1…Р-8).',
  },
  {
    id: 'sound_l',
    keys: ['звук л', 'л не получается', 'не выговаривает л', 'л мягкий', 'л твёрдый'],
    answer: '🗣 **Звук Л**\n\nГимнастика:\n• «Заборчик» — улыбка с сомкнутыми зубами\n• «Лопаточка» — широкий язык на нижнюю губу\n• «Вкусное варенье» — облизать верхнюю губу\n• «Пароход гудит» — Ы-Ы-Ы\n• «Чашечка» — язык лодочкой\n\nСлоги: ЛА-ЛО-ЛУ-ЛЫ-ЛЭ. Затем слова: лабиринты Л-1…Л-8.',
  },
  {
    id: 'sound_sh',
    keys: ['звук ш', 'ш не получается', 'шипит неправильно', 'шепелявит', 'ш вместо'],
    answer: '🗣 **Звук Ш**\n\nГимнастика:\n• «Чашечка» — язык лодочкой к верхней губе\n• «Вкусное варенье» — облизать верхнюю губу\n• «Индюк» — БЛ-БЛ-БЛ\n• «Грибок» — присосать язык к нёбу\n• «Фокус» — сдуть ватку с носа\n\nСлоги: ША-ШО-ШУ-ШИ и слова с Ш.',
  },
  {
    id: 'sound_s',
    keys: ['звук с', 'с не получается', 'свистит неправильно', 'с вместо ш', 'шепелявит на с'],
    answer: '🗣 **Звук С**\n\nГимнастика:\n• «Заборчик» — улыбка\n• «Лопаточка» — широкий язык\n• «Почистим зубки» — кончиком языка по нижним зубам\n• «Загнать мяч» — дуть на язык\n\nЗатем слоги СА-СО-СУ-СЫ и слова.',
  },
  {
    id: 'sound_zh',
    keys: ['звук ж', 'ж не получается', 'ж вместо ш'],
    answer: '🗣 **Звук Ж**\n\nЖ — это озвонченный Ш. Сначала поставь Ш, потом добавь голос.\n\nГимнастика как для Ш:\n• «Чашечка», «Вкусное варенье», «Индюк», «Грибок».\n\nСлоги: ЖА-ЖО-ЖУ-ЖИ, слова: жук, жаба, жёлудь, ножи, лужа.',
  },
  {
    id: 'how_many_reps',
    keys: ['сколько раз повторять', 'сколько повторений', 'число повторений', 'количество повторов'],
    answer: '🔢 **Сколько повторять**\n\nПрограмма считает автоматически по возрасту:\n• 5 лет — 3–5 раз\n• 6–7 лет — 4–6 раз\n• 8–10 лет — 6–8 раз\n• 11–15 лет — 8–15 раз\n\nТочное число показано под названием задания.',
  },
  {
    id: 'partial_done',
    keys: ['частично выполнено', 'не полностью', 'сколько выполнено', 'частичное выполнение'],
    answer: '✏️ **Частичное выполнение**\n\nЕсли ребёнок выполнил не все повторения — нажми **✏️ «Частично»** и укажи сколько получилось.\n\nЭто важно для статистики исследования — видна динамика.',
  },
  {
    id: 'lose_progress',
    keys: ['прогресс пропал', 'данные исчезли', 'сбросились данные', 'потерял прогресс', 'не сохраняется'],
    answer: '⚠️ **Прогресс пропал**\n\nПричины:\n• Режим инкогнито — данные стираются при закрытии.\n• Очистка cookies/сайта — стирает localStorage.\n• Другой браузер/устройство — не синхронизируется.\n\n💾 **Решение:** регулярно делай бэкап ⚙️ Настройки → «Скачать все данные».',
  },
  {
    id: 'exp_vs_ctrl',
    keys: ['экспериментальная группа', 'контрольная группа', 'группа исследования', 'сравнение групп'],
    answer: '🔬 **Экспериментальная и контрольная группы**\n\n**Экспериментальная** — дети, которые играют. Собираются протоколы и игровые сессии.\n\n**Контрольная** — дети, которые занимаются традиционно. Нужны для сравнения.\n\nОбе группы сравниваются в «Итогах» — так видно, помогает ли игра.',
  },
  {
    id: 'export_csv',
    keys: ['экспорт данных', 'скачать csv', 'выгрузить excel', 'отчёт', 'отчет', 'выгрузка'],
    answer: '📊 **Как выгрузить данные**\n\nВ каждом разделе «Исследования» есть кнопки:\n• **CSV** — откроется в Excel / Google Таблицах.\n• **TXT** — текстовый отчёт.\n\nВ разделе «Итоги» — кнопка **«Скачать всё»** (один JSON со всем).\n\nТакже ⚙️ Настройки → «Скачать все данные».',
  },
  {
    id: 'ai_self',
    keys: ['кто ты', 'что ты умеешь', 'ты робот', 'ты ии', 'помощник что'],
    answer: '🤖 **Я — локальный помощник**\n\nРаботаю **офлайн**, без интернета. Понимаю разные формулировки.\n\nЗнаю всё о:\n• Игре и её режимах\n• Звуках и упражнениях\n• Исследовании и экспорте данных\n• Настройках и темах\n\nСпрашивай своими словами.',
  },
  {
    id: 'thanks',
    keys: ['спасибо', 'благодарю', 'круто', 'отлично', 'супер'],
    answer: '😊 Рад помочь! Если что-то ещё — пиши.',
  },
];

// ============================================================
// НОРМАЛИЗАЦИЯ
// ============================================================
function normalize(text) {
  if (!text) return '';
  let s = String(text).toLowerCase();
  s = s.replace(/ё/g, 'е');
  s = s.replace(/[^\wа-я0-9\s]/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function stem(word) {
  if (!word || word.length < 4) return word;
  const suffixes = [
    'иями','ями','ами','ией','иях','иям',
    'ого','его','ому','ему','ыми','ими','ой','ей','ые','ие','ый','ий',
    'ать','ять','ить','еть','уть','аю','яю','ишь','ешь','ите','ете',
    'ла','ло','ли','л',
    'ам','ям','ом','ем','ах','ях','ов','ев','ий','ия','ию',
    'а','я','о','е','у','ю','ы','и','ь',
  ];
  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length - suf.length >= 3) {
      return word.slice(0, -suf.length);
    }
  }
  return word;
}

function tokenize(text) {
  return normalize(text).split(' ').filter(Boolean).map(stem);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyMatch(word, key) {
  if (word === key) return true;
  if (word.length < 3 || key.length < 3) return false;
  const w = word.slice(0, 8);
  const k = key.slice(0, 8);
  return levenshtein(w, k) <= 1;
}

// ============================================================
// ПОИСК ОТВЕТА
// ============================================================
function findAnswer(question) {
  const tokens = tokenize(question);
  if (tokens.length === 0) return null;
  const normQ = normalize(question);

  let best = { score: 0, item: null };

  for (const item of KNOWLEDGE) {
    let score = 0;
    for (const key of item.keys) {
      const keyNorm = normalize(key);
      const hasSpace = keyNorm.includes(' ');

      // 1. Прямое вхождение (фраза или слово)
      if (normQ.includes(keyNorm)) {
        // Фраза с пробелами весит в 3 раза больше одиночного слова
        score += hasSpace ? 15 : 3;
        // Чем длиннее совпадение — тем важнее
        score += keyNorm.length * 0.1;
        continue;
      }

      // 2. Fuzzy по токенам
      const keyTokens = keyNorm.split(' ').map(stem);
      for (const kt of keyTokens) {
        for (const t of tokens) {
          if (fuzzyMatch(t, kt)) {
            score += hasSpace ? 4 : 1;
            break;
          }
        }
      }
    }
    if (score > best.score) best = { score, item };
  }

  if (best.score < 3) return null;
  return best.item;
}

// ============================================================
// ПАНЕЛЬ ЧАТА
// ============================================================
let panel = null;
let messagesEl = null;
let inputEl = null;
let lastInteraction = Date.now();

const QUICK_QUESTIONS = [
  { id: 'how_to_play', text: 'Как начать игру?' },
  { id: 'child_cries', text: 'Ребёнок не хочет играть' },
  { id: 'no_voice', text: 'Нет русской озвучки' },
  { id: 'sound_r', text: 'Что делать со звуком Р?' },
  { id: 'restore_backup', text: 'Как перенести данные?' },
  { id: 'add_child', text: 'Как добавить ребёнка?' },
];

function buildPanel() {
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'ai-panel';

  const quickHtml = QUICK_QUESTIONS.map(q =>
    `<button data-qid="${q.id}">${q.text}</button>`
  ).join('');

  panel.innerHTML = `
    <div class="ai-header">
      <div class="ai-header-title">
        <span class="ai-dot"></span>
        🤖 ${t('core.aiHelp', 'Помощник')}
      </div>
      <button class="ai-close" aria-label="Close">✕</button>
    </div>
    <div class="ai-messages" id="ai-messages"></div>
    <div class="ai-quick" id="ai-quick">${quickHtml}</div>
    <div class="ai-input-row">
      <input type="text" id="ai-input" placeholder="${t('core.aiPlaceholder', 'Напишите вопрос...')}" autocomplete="off">
      <button class="ai-send" aria-label="Send">➤</button>
    </div>
  `;
  document.body.appendChild(panel);

  messagesEl = panel.querySelector('#ai-messages');
  inputEl = panel.querySelector('#ai-input');

  panel.querySelector('.ai-close').onclick = close;
  panel.querySelector('.ai-send').onclick = sendMessage;
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // Быстрые вопросы — точный ответ по id
  panel.querySelectorAll('.ai-quick button').forEach(b => {
    b.onclick = () => {
      const qid = b.dataset.qid;
      const item = KNOWLEDGE.find(k => k.id === qid);
      if (!item) return;

      addMessage('user', b.textContent.trim());
      lastInteraction = Date.now();

      const typing = addTyping();
      setTimeout(() => {
        typing.remove();
        addMessage('bot', item.answer);
      }, 350);
    };
  });

  // Приветствие
  addMessage('bot', '👋 Привет! Я помогу разобраться.\n\nСпроси своими словами — «не работает», «ребёнок не хочет», «что со звуком Р» — я пойму.\n\nИли выбери быстрый вопрос ниже 👇');

  return panel;
}

function addMessage(who, text) {
  const el = document.createElement('div');
  el.className = `ai-msg ${who}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function addTyping() {
  const el = document.createElement('div');
  el.className = 'ai-msg bot typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage('user', text);
  inputEl.value = '';
  lastInteraction = Date.now();

  const typing = addTyping();
  const delay = 350 + Math.random() * 400;
  setTimeout(() => {
    typing.remove();
    const item = findAnswer(text);
    if (item) {
      addMessage('bot', item.answer);
    } else {
      addMessage('bot',
        '🤔 Не совсем понял вопрос.\n\n' +
        'Попробуй переформулировать или выбери быстрый вопрос ниже 👇\n\n' +
        'Если что-то сломалось — нажми 🐞 и пришли отчёт.'
      );
    }
  }, delay);
}

export function open() {
  buildPanel();
  panel.classList.add('open');
  haptic(15);
  setTimeout(() => inputEl?.focus(), 300);
}
export function close() {
  if (panel) panel.classList.remove('open');
}
export function toggle() {
  if (panel && panel.classList.contains('open')) close();
  else open();
}

// ============================================================
// ПРОАКТИВНЫЕ ПОДСКАЗКИ
// ============================================================
let proactiveShown = new Set();

export function notifyAction(action) {
  lastInteraction = Date.now();
  if (action === 'roll') proactiveShown.delete('idle');
  if (action === 'task_done') proactiveShown.delete('stuck');
}

export function startIdleWatcher() {
  setInterval(() => {
    const idle = Date.now() - lastInteraction;
    if (idle > 120000 && !proactiveShown.has('idle')) {
      proactiveShown.add('idle');
      showProactive('Не получается сделать ход? Нажми 🎲 «Бросить кубик».');
    }
  }, 15000);
}

export function showProactive(text) {
  const el = document.createElement('div');
  el.className = 'ai-proactive';
  el.textContent = text;
  el.onclick = () => { el.remove(); open(); };
  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) {
      el.style.transition = 'opacity .4s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }
  }, 8000);
}

window.AIAssistant = { open, close, toggle, notifyAction, startIdleWatcher, showProactive };
