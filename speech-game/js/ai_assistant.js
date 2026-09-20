/* ============================================================
   ai_assistant.js — локальный умный помощник (без API)
   Понимает разные формулировки через:
     - нормализацию (регистр, ё→е, пунктуация)
     - простой стемминг (отрезание окончаний)
     - корневой словарь с весами
     - нечёткое сравнение (расстояние Левенштейна)
     - fallback, если ничего не подошло
   ============================================================ */

import { t, toast, haptic } from './core.js';

// ============================================================
// БАЗА ЗНАНИЙ
// keys — массив корней слов. Если хотя бы один корень встретился
// в нормализованном вопросе, ответ получает очки.
// ============================================================
const KNOWLEDGE = [
  {
    id: 'how_to_play',
    keys: ['игр', 'игра', 'нача', 'запуст', 'стартов', 'как игра', 'правил', 'ход', 'ходить'],
    answer: '🎲 **Как играть**\n\n1. Выбираешь ребёнка из исследования или создаёшь своего.\n2. Отмечаешь звуки, которые отрабатываете.\n3. Бросаешь кубик — фишка двигается по карте.\n4. На каждой клетке появляется задание.\n5. Выполнил — жми ✅, частично — ✏️, не смог — ❌.\n6. Кто первый дошёл до вулкана (клетка 89) — победил!',
  },
  {
    id: 'add_child',
    keys: ['добав', 'ребен', 'ребён', 'нов', 'созд', 'заполн', 'карточк', 'ученик'],
    answer: '👶 **Как добавить ребёнка**\n\n1. Открой страницу «Исследование».\n2. Раздел «Дети» → кнопка «Добавить ребёнка».\n3. Заполни ФИО, возраст (5–15), группу, диагноз, нарушенные звуки.\n4. Сохрани — ребёнок появится в списке и в игре при выборе игрока.',
  },
  {
    id: 'no_voice',
    keys: ['голос', 'озвучк', 'произнос', 'говорит', 'звук не', 'нет голос', 'тишин', 'не слыш', 'speech', 'tts'],
    answer: '🔊 **Нет русской озвучки**\n\nНастройки → «Скачать русский голос».\n\n**Android:** Настройки → Язык и ввод → Синтез речи → Google → установить русский.\nИли скачай [Google TTS из Play Маркета](https://play.google.com/store/apps/details?id=com.google.android.tts).\n\n**iOS:** Настройки → Универсальный доступ → Речь → Голоса → Русский → скачать.\n\n**Windows:** Параметры → Время и язык → Речь → Добавить голоса.',
  },
  {
    id: 'task_not_showing',
    keys: ['задан', 'карточк', 'не показ', 'пусто', 'нет задан', 'задание не'],
    answer: '📋 **Задание не появилось**\n\n1. Проверь, что выбран хотя бы один звук.\n2. Убедись, что файл `data/tasks_by_sound.json` на месте.\n3. Открой консоль (F12) — если там ошибка 404, значит файл не найден.\n4. Если ничего не помогает — нажми 🐞 и пришли отчёт.',
  },
  {
    id: 'child_registered',
    keys: ['ребен не', 'ребён не', 'не вид', 'не наше', 'потер', 'пропал', 'исчез'],
    answer: '👀 **Ребёнок не появился в игре**\n\n1. Убедись, что ты добавил его на странице «Исследование».\n2. Проверь, что браузер не в режиме инкогнито (данные не сохраняются).\n3. Если ты сменил устройство или браузер — данные не переносятся автоматически.\n\n💾 **Решение:** Настройки → «Скачать все данные» на старом устройстве, потом «Восстановить из файла» на новом.',
  },
  {
    id: 'restore_backup',
    keys: ['восстанов', 'бэкап', 'резерв', 'копи', 'сохран', 'перенес', 'бэкап', 'backup'],
    answer: '💾 **Как перенести данные**\n\n**На старом устройстве:** ⚙️ Настройки → «Скачать все данные» → сохранится JSON-файл.\n\n**На новом:** ⚙️ Настройки → «Восстановить из файла» → выбери JSON.\n\nВсе дети, протоколы и сессии перенесутся.',
  },
  {
    id: 'theme_change',
    keys: ['тем', 'цвет', 'оформлен', 'дизайн', 'ноч', 'день', 'фон', 'стиль'],
    answer: '🎨 **Как сменить тему**\n\n1. ⚙️ Настройки → выбери тему из сетки.\n2. У природных тем (Лето, Осень, Зима, Весна, Сакура, Океан, Лес, Минимализм) есть **день и ночь** — переключай кнопками ☀️/🌙.\n3. Всё сохраняется автоматически.',
  },
  {
    id: 'font_size',
    keys: ['шрифт', 'размер', 'мелк', 'крупн', 'плохо вид', 'глаз', 'читать'],
    answer: '🔍 **Размер шрифта**\n\n⚙️ Настройки → «Размер шрифта»: Мелкий / Средний / Крупный / Огромный.\n\nТам же есть:\n• Высокий контраст\n• Шрифт для дислексии\n• Меньше анимаций',
  },
  {
    id: 'bug_report',
    keys: ['баг', 'ошибк', 'сломал', 'не работ', 'глюк', 'проблем', 'не получает', 'не могу', 'неправильн'],
    answer: '🐞 **Что-то сломалось?**\n\nНажми **🐞 в правом нижнем углу**. Опиши, что произошло — данные о системе приложатся автоматически.\n\nСкачай отчёт и отправь разработчику: Telegram / почта указаны в отчёте.',
  },
  {
    id: 'sound_r',
    keys: ['звук р', 'р не', 'рыч', 'картав', 'горлов', 'р тверд', 'р мягк'],
    answer: '🗣 **Звук Р**\n\nНачни с артикуляционной гимнастики:\n• «Лошадка» — поцокать языком\n• «Грибок» — присосать язык к нёбу\n• «Барабанщик» — Д-Д-Д за верхними зубами\n• «Маляр» — погладить нёбо языком\n\nПотом переходи к слогам: РА-РО-РУ-РЫ-РЭ. Только после этого — к словам (лабиринты Р-1…Р-8).',
  },
  {
    id: 'sound_l',
    keys: ['звук л', 'л не', 'л тверд', 'л мягк', 'лэ', 'л вместо'],
    answer: '🗣 **Звук Л**\n\nСначала гимнастика:\n• «Заборчик» — улыбка с сомкнутыми зубами\n• «Лопаточка» — широкий язык на нижнюю губу\n• «Вкусное варенье» — облизать верхнюю губу\n• «Пароход гудит» — Ы-Ы-Ы\n\nПотом слоги: ЛА-ЛО-ЛУ-ЛЫ-ЛЭ. Затем слова: лабиринты Л-1…Л-8.',
  },
  {
    id: 'sound_sh',
    keys: ['звук ш', 'ш не', 'шип', 'ш вместо', 'шепеляв'],
    answer: '🗣 **Звук Ш**\n\nГимнастика:\n• «Чашечка» — язык лодочкой к верхней губе\n• «Вкусное варенье» — облизать верхнюю губу\n• «Индюк» — БЛ-БЛ-БЛ\n• «Грибок» — присосать язык к нёбу\n\nЗатем слоги ША-ШО-ШУ-ШИ и слова с Ш.',
  },
  {
    id: 'sound_s',
    keys: ['звук с', 'с не', 'свист', 'с вместо', 'шепеляв'],
    answer: '🗣 **Звук С**\n\nГимнастика:\n• «Заборчик» — улыбка\n• «Лопаточка» — широкий язык\n• «Почистим зубки» — кончиком языка по нижним зубам\n• «Загнать мяч» — дуть на язык\n\nПотом слоги СА-СО-СУ-СЫ.',
  },
  {
    id: 'how_many_reps',
    keys: ['сколько раз', 'повтор', 'сколько повтор', 'число повтор', 'количество'],
    answer: '🔢 **Сколько повторять**\n\nДля каждого возраста своё число повторений:\n• 5 лет — 3–5 раз\n• 6–7 лет — 4–6 раз\n• 8–10 лет — 6–8 раз\n• 11–15 лет — 8–15 раз\n\nТочное число программа показывает под названием задания.',
  },
  {
    id: 'partial_done',
    keys: ['част', 'не полност', 'частичн', 'половин', 'сколько выпол'],
    answer: '✏️ **Частичное выполнение**\n\nЕсли ребёнок выполнил не все повторения — нажми **✏️ «Частично»** и укажи, сколько раз получилось.\n\nЭто важно для статистики: исследование видит динамику, а не просто «получилось/нет».',
  },
  {
    id: 'lose_progress',
    keys: ['прогресс', 'потер', 'сброс', 'сбросил', 'не сохран', 'потеря', 'слетел'],
    answer: '⚠️ **Прогресс пропал**\n\nПричины:\n• Браузер в режиме инкогнито — данные стираются при закрытии\n• Очистка cookies/сайта — стирает localStorage\n• Разные браузеры — не синхронизируются\n\n💾 Регулярно делай **⚙️ Настройки → Скачать все данные**.\nОдин раз в неделю — точно.',
  },
  {
    id: 'child_cries',
    keys: ['плачет', 'не хочет', 'отказ', 'кричит', 'устал', 'надоел', 'скучн'],
    answer: '😢 **Ребёнок не хочет играть**\n\nСоветы:\n• Играйте не дольше 15–20 минут\n• Делайте перерывы после 5–7 ходов\n• Используйте поощрения (наклейки, «молодец!»)\n• Не давите — лучше 2 короткие сессии, чем 1 длинная\n• Если не идёт конкретный звук — переключитесь на другой\n• Включите 🏅 достижения — детям нравится их собирать',
  },
  {
    id: 'exp_vs_ctrl',
    keys: ['эксперимент', 'контрольн', 'групп', 'сравн', 'исследован', 'статистик'],
    answer: '🔬 **Экспериментальная и контрольная группы**\n\n**Экспериментальная** — дети, которые играют в игру. Собираются протоколы занятий и игровые сессии.\n\n**Контрольная** — дети, которые занимаются традиционно, без игры. Нужны для сравнения результатов.\n\nОбе группы сравниваются в «Итогах» — так видно, помогает ли игра на самом деле.',
  },
  {
    id: 'export_csv',
    keys: ['экспорт', 'скач', 'csv', 'excel', 'выгруз', 'отчет', 'отчёт'],
    answer: '📊 **Как выгрузить данные**\n\nВ каждом разделе «Исследования» есть кнопки:\n• **CSV** — откроется в Excel / Google Таблицах\n• **TXT** — текстовый отчёт\n\nВ разделе «Итоги» есть кнопка **«Скачать всё»** — один JSON-файл со всем.',
  },
  {
    id: 'ai_self',
    keys: ['помощник', 'ии', 'искусствен', 'робот', 'ты кто', 'что ты умеешь', 'ассистент'],
    answer: '🤖 **Я — локальный помощник**\n\nРаботаю **офлайн**, без интернета. Понимаю разные формулировки одного вопроса.\n\nЧто я знаю:\n• Все разделы сайта\n• Все звуки (Л, Р, С, Ш, Ж) и упражнения\n• Как исправить типичные ошибки\n• Как выгрузить и перенести данные\n\nСпрашивай своими словами — «не работает», «не понимаю», «ребёнок не хочет» — я разберусь.',
  },
  {
    id: 'greeting',
    keys: ['привет', 'здравств', 'хай', 'добр', 'hi', 'hello'],
    answer: '👋 Привет! Чем помочь?\n\nМогу рассказать:\n• Как начать игру\n• Что делать с конкретным звуком\n• Как исправить проблему\n• Как выгрузить данные исследования\n\nПросто напиши своими словами.',
  },
  {
    id: 'thanks',
    keys: ['спасиб', 'благодар', 'thanks', 'thank you', 'круто', 'отлично'],
    answer: '😊 Рад помочь! Если что-то ещё — пиши.',
  },
];

// ============================================================
// НОРМАЛИЗАЦИЯ И СТЕММИНГ
// ============================================================

function normalize(text) {
  if (!text) return '';
  let s = String(text).toLowerCase();
  s = s.replace(/ё/g, 'е');
  // убираем пунктуацию, оставляем буквы, цифры, пробелы
  s = s.replace(/[^\wа-я0-9\s]/gi, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

// Простой стеммер: убираем частые окончания
function stem(word) {
  if (!word || word.length < 4) return word;
  const suffixes = [
    'иями','ями','ами','ией','иях','иям','ией',
    'ого','его','ому','ему','ыми','ими','ой','ей','ые','ие','ый','ий',
    'ать','ять','ить','еть','уть','аю','яю','ишь','ешь','ите','ете',
    'ла','ло','ли','л',
    'ам','ям','ом','ем','ах','ях','ов','ев','ей','ий','ия','ию',
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

// Расстояние Левенштейна для опечаток
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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

// Похоже ли слово на ключ (для опечаток)
function fuzzyMatch(word, key) {
  if (word === key) return true;
  if (word.length < 3 || key.length < 3) return false;
  // сравниваем только первые 8 символов — окончания не так важны
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

  let best = { score: 0, item: null };

  for (const item of KNOWLEDGE) {
    let score = 0;
    for (const key of item.keys) {
      const keyNorm = normalize(key);
      const keyTokens = keyNorm.split(' ').map(stem);

      // Проверяем, есть ли ключ как подстрока в нормализованном тексте
      if (normalize(question).includes(keyNorm)) {
        score += 5;
        continue;
      }

      // Проверяем токены
      for (const kt of keyTokens) {
        for (const t of tokens) {
          if (fuzzyMatch(t, kt)) {
            score += 2;
            break;
          }
        }
      }
    }
    if (score > best.score) {
      best = { score, item };
    }
  }

  // Порог: если меньше 2 — считаем, что не поняли
  if (best.score < 2) return null;
  return best.item;
}

// ============================================================
// ПАНЕЛЬ ЧАТА
// ============================================================
let panel = null;
let messagesEl = null;
let inputEl = null;
let proactiveTimer = null;
let lastInteraction = Date.now();

function buildPanel() {
  if (panel) return panel;
  panel = document.createElement('div');
  panel.id = 'ai-panel';
  panel.innerHTML = `
    <div class="ai-header">
      <div class="ai-header-title">
        <span class="ai-dot"></span>
        🤖 ${t('aiHelp') || 'Помощник'}
      </div>
      <button class="ai-close" aria-label="Close">✕</button>
    </div>
    <div class="ai-messages" id="ai-messages"></div>
    <div class="ai-quick" id="ai-quick">
      <button data-q="Как начать игру?">Как начать игру?</button>
      <button data-q="Что делать со звуком Р?">Со звуком Р</button>
      <button data-q="Нет русской озвучки">Нет голоса</button>
      <button data-q="Как перенести данные?">Перенос данных</button>
      <button data-q="Ребёнок не хочет играть">Ребёнок не хочет</button>
    </div>
    <div class="ai-input-row">
      <input type="text" id="ai-input" placeholder="${t('aiPlaceholder') || 'Напишите вопрос...'}" autocomplete="off">
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
  panel.querySelectorAll('.ai-quick button').forEach(b => {
    b.onclick = () => {
      inputEl.value = b.dataset.q;
      sendMessage();
    };
  });

  // Приветствие при первом открытии
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
// ПРОАКТИВНЫЕ ПОДСКАЗКИ (следит за пользователем)
// ============================================================
let proactiveShown = new Set();

export function notifyAction(action) {
  lastInteraction = Date.now();
  if (action === 'roll') proactiveShown.delete('idle');
  if (action === 'task_done') proactiveShown.delete('stuck');
}

export function startIdleWatcher() {
  // Следим за «зависанием» — если пользователь не делал ничего 2 минуты
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

// ============================================================
// ЭКСПОРТ ДЛЯ HTML
// ============================================================
window.AIAssistant = { open, close, toggle, notifyAction, startIdleWatcher, showProactive };