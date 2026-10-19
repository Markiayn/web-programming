/*
 * Акустична варта — ЛР4. Аналіз вимірювань шуму (звіт у консолі).
 * Алгоритм не змінює сторінку: результат друкується в DevTools → Console.
 */

// ---------------- Вихідні дані ----------------
const noiseLevels = [
  42, 55, 61, 78, 83, 67, 49, 72, 91, 58, 64, 76,
  53, 47, 88, 69, 74, 82, 95, 51, 71, -1, 85, 63,
  79, 39, 141, 86
];
const warningLevel = 70;
const criticalLevel = 85;
const minValidLevel = 30;
const maxValidLevel = 130;

// ---------------- Arrow Functions ----------------
// один параметр — дужки можна опустити, implicit return
const formatLevel = value => `${value} dB`;
// кілька параметрів — у дужках
const isAbove = (value, threshold) => value > threshold;

// ---------------- Function Declaration ----------------
// Перевірка коректності: скінченне число в межах [min, max].
function isValidLevel(level, min, max) {
  return Number.isFinite(level) && level >= min && level <= max;
}

// Середнє значення коректних вимірювань (for...of + continue).
function calculateAverage(data, min, max) {
  let sum = 0;
  let count = 0;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      continue;                         // некоректний запис пропускаємо
    }
    sum += level;
    count++;
  }
  return count === 0 ? null : sum / count;
}

// Мінімум без Math.min: стартуємо з першого коректного значення.
function findMinimum(data, min, max) {
  let result = null;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    if (result === null || level < result) {
      result = level;
    }
  }
  return result;
}

// Максимум без Math.max.
function findMaximum(data, min, max) {
  let result = null;
  for (const level of data) {
    if (!isValidLevel(level, min, max)) continue;
    if (result === null || level > result) {
      result = level;
    }
  }
  return result;
}

// Перше критичне вимірювання (for з індексом + break).
function findFirstCritical(data, critical, min, max) {
  let found = null;
  for (let i = 0; i < data.length; i++) {
    const level = data[i];
    if (isValidLevel(level, min, max) && isAbove(level, critical)) {
      found = { level, index: i, position: i + 1 };
      break;                            // далі шукати не потрібно
    }
  }
  return found;
}

// Відновлення (while): після першого критичного шукаємо три коректні
// вимірювання <= warning поспіль; некоректне або вище порога — скидає серію.
function findRecovery(data, firstCritical, warning, min, max) {
  if (firstCritical === null) {
    return null;
  }
  let i = firstCritical.index + 1;
  let safeInRow = 0;
  while (i < data.length) {
    const level = data[i];
    if (isValidLevel(level, min, max) && !isAbove(level, warning)) {
      safeInRow++;
      if (safeInRow === 3) {
        return { level, index: i, position: i + 1 };
      }
    } else {
      safeInRow = 0;                    // серію перервано
    }
    i++;                                // гарантує завершення циклу
  }
  return null;
}

// Перше коректне вимірювання (do...while). Для непорожнього масиву
// перший елемент треба перевірити хоча б один раз — тому do...while.
function findFirstValid(data, min, max) {
  if (data.length === 0) {
    return null;
  }
  let i = 0;
  let level;
  do {
    level = data[i];
    if (isValidLevel(level, min, max)) {
      return { level, index: i, position: i + 1 };
    }
    i++;
  } while (i < data.length);
  return null;
}

// Некоректні записи з позиціями (for з індексом).
function findInvalid(data, min, max) {
  const invalid = [];
  for (let i = 0; i < data.length; i++) {
    if (!isValidLevel(data[i], min, max)) {
      invalid.push({ level: data[i], position: i + 1 });
    }
  }
  return invalid;
}

// ---------------- Function Expression ----------------
// Підрахунок за категоріями. Записана в const — доступна лише після цього рядка.
const countByCategory = function (data, warning, critical, min, max) {
  const result = { total: data.length, valid: 0, invalid: 0, normal: 0, warning: 0, critical: 0 };
  for (const level of data) {
    if (!isValidLevel(level, min, max)) {
      result.invalid++;
      continue;
    }
    result.valid++;
    if (level <= warning) {
      result.normal++;
    } else if (level <= critical) {
      result.warning++;
    } else {
      result.critical++;
    }
  }
  return result;
};

// ---------------- Callback ----------------
// Функція вищого порядку: отримує алгоритм через параметр і синхронно викликає його.
function analyze(data, analyzer) {
  return analyzer(data, warningLevel, criticalLevel, minValidLevel, maxValidLevel);
}

// Збирає всі показники в один об'єкт (без виводу в консоль).
function buildReport(data) {
  const categories = analyze(data, countByCategory);   // передаємо функцію без ()
  const firstCritical = findFirstCritical(data, criticalLevel, minValidLevel, maxValidLevel);
  return {
    categories,
    average: calculateAverage(data, minValidLevel, maxValidLevel),
    min: findMinimum(data, minValidLevel, maxValidLevel),
    max: findMaximum(data, minValidLevel, maxValidLevel),
    firstCritical,
    recovery: findRecovery(data, firstCritical, warningLevel, minValidLevel, maxValidLevel),
    firstValid: findFirstValid(data, minValidLevel, maxValidLevel),
    invalid: findInvalid(data, minValidLevel, maxValidLevel),
  };
}

// ---------------- Представлення: друк звіту ----------------
// 1 критичне, 2–4 критичні, 5+ критичних
const criticalWord = n => {
  const last = n % 10;
  const lastTwo = n % 100;
  if (last === 1 && lastTwo !== 11) return `${n} критичне вимірювання`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${n} критичні вимірювання`;
  return `${n} критичних вимірювань`;
};
const formatNumber = value => value === null ? "немає даних" : value.toFixed(2).replace(".", ",");

function printReport(title, data) {
  const r = buildReport(data);
  const c = r.categories;

  console.group(title);
  console.log(`Пороги: попередження > ${warningLevel} dB; критичний рівень > ${criticalLevel} dB`);
  console.log(`Усього вимірювань: ${c.total}`);
  console.log(`Коректних: ${c.valid}`);
  console.log(`Некоректних: ${c.invalid}`);
  console.table([
    { "Категорія": "Без перевищення", "Кількість": c.normal },
    { "Категорія": "Попередження", "Кількість": c.warning },
    { "Категорія": "Критичні", "Кількість": c.critical },
  ]);
  console.log(`Середній рівень: ${r.average === null ? "немає даних" : formatNumber(r.average) + " dB"}`);
  console.log(`Мінімальний рівень: ${r.min === null ? "немає даних" : formatLevel(r.min)}`);
  console.log(`Максимальний рівень: ${r.max === null ? "немає даних" : formatLevel(r.max)}`);
  console.log(`Перше коректне вимірювання: ${r.firstValid === null ? "немає" : `${formatLevel(r.firstValid.level)}, позиція ${r.firstValid.position}`}`);

  if (r.firstCritical === null) {
    console.log("Перше критичне вимірювання: не знайдено");
  } else {
    console.warn(`Перше критичне вимірювання: ${formatLevel(r.firstCritical.level)}, позиція ${r.firstCritical.position}`);
  }
  console.log(`Відновлення — три безпечні вимірювання поспіль: ${r.recovery === null ? "не знайдено" : `позиція ${r.recovery.position}`}`);

  const exceeded = c.warning + c.critical;
  if (exceeded > 0) {
    console.warn(`Поріг ${warningLevel} dB перевищено у ${exceeded} вимірюваннях.`);
  }
  if (r.invalid.length > 0) {
    const list = r.invalid.map(item => `позиція ${item.position} (${item.level} dB)`).join(", ");
    console.error(`Некоректні дані: ${list}.`);   // діагностика вхідних даних, не збій програми
  }

  let conclusion;
  if (c.valid === 0) {
    conclusion = "коректних вимірювань немає — аналіз неможливий.";
  } else if (c.critical === 0) {
    conclusion = "критичних вимірювань не зафіксовано.";
  } else if (r.recovery === null) {
    conclusion = `зафіксовано ${criticalWord(c.critical)}; після першого з них стійкого відновлення не виявлено.`;
  } else {
    conclusion = `зафіксовано ${criticalWord(c.critical)}; відновлення на позиції ${r.recovery.position}.`;
  }
  console.log(`Висновок: ${conclusion}`);
  console.groupEnd();
}

// ---------------- Запуск ----------------
printReport("Акустична варта — звіт моніторингу", noiseLevels);

// Перевірка на окремих наборах (основний масив не змінюється)
console.groupCollapsed("Тестові набори");
printReport("Тест 1: порожній масив []", []);
printReport("Тест 2: лише некоректні [-1, 141]", [-1, 141]);
printReport("Тест 3: межі порогів [70, 85, 86]", [70, 85, 86]);
printReport("Тест 4: серія переривається [90, 60, 65, 75, 50, 55, 60]", [90, 60, 65, 75, 50, 55, 60]);
console.groupEnd();

/*
 * Експерименти з hoisting (виконувались у Console, помилкові виклики прибрано):
 * 1) findFirstCritical(noiseLevels, 85, 30, 130) ДО тексту оголошення працює —
 *    Function Declaration піднімається (hoisting) разом із тілом функції.
 * 2) countByCategory(...) ДО рядка `const countByCategory = function ...`
 *    → ReferenceError: Cannot access 'countByCategory' before initialization —
 *    змінна const існує, але до ініціалізації перебуває в «темпоральній мертвій зоні».
 * 3) formatLevel/isAbove (Arrow Function у const) поводяться так само, як Function Expression.
 */
