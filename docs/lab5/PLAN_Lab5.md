# План выполнения лабораторной работы №5 — EduPlatform (Вариант 8)

## Источники

- [text_lab5.md](text_lab5.md) — цели, задачи, требования к отчёту, варианты
- [photo_lab5.png](photo_lab5.png) — пошаговая структура и подход

---

## Часть 1. Подготовка проекта

### Шаг 1.1. Git-ветка и структура

1. Создать ветку: `git checkout main && git pull origin main && git checkout -b feature/javascript-interactivity`
2. Проверить/создать структуру:
   - `js/script.js` (или использовать существующий `js/scripts.js`)
   - `js/components/` — для компонентов
   - `js/utils/` — для вспомогательных функций
3. Подключить скрипты в `index.html` в конце `<body>`.

**Скриншот 1:** Структура проекта в VS Code (папки `js/`, `js/components/`, `js/utils/`).

---

## Часть 2. Прогресс-бар прохождения курса

### Шаг 2.1. HTML

Добавить в `index.html` в секцию курсов (например, в `#courses` или рядом) блок:

```html
<section id="course-progress" aria-labelledby="progress-title">
  <h2 id="progress-title">Прогресс прохождения курса</h2>
  <div class="progress-bar__container">
    <div class="progress-bar__fill" id="progressFill" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
  </div>
  <p class="progress-bar__label"><span id="progressPercent">0</span>%</p>
  <div class="progress-controls">
    <button id="progressUp">+10%</button>
    <button id="progressDown">-10%</button>
  </div>
</section>
```

**Скриншот 2:** Страница с добавленным блоком прогресс-бара (до стилей или после).

### Шаг 2.2. CSS

Добавить в `css/main.css` или отдельный файл стили для `.progress-bar__container`, `.progress-bar__fill`, `.progress-controls`.

**Скриншот 3:** Прогресс-бар со стилями.

### Шаг 2.3. JavaScript

В `js/script.js` или `js/components/progressBar.js`:

- Получить ссылки: `progressFill`, `progressPercent`, `progressUp`, `progressDown`
- Функция обновления: менять `width`/`aria-valuenow` и текст процента
- Обработчики `click` на кнопки: ±10%, ограничить 0–100

**Скриншот 4:** Работающий прогресс-бар (например, 50% или 100%).

---

## Часть 3. Система закладок для уроков

### Шаг 3.1. HTML

Добавить секцию:

```html
<section id="bookmarks" aria-labelledby="bookmarks-title">
  <h2 id="bookmarks-title">Закладки уроков</h2>
  <div id="controls" class="bookmarks-controls">
    <input type="text" id="itemInput" placeholder="Название урока">
    <button id="addItemBtn">Добавить закладку</button>
    <select id="sortSelect">
      <option value="none">Без сортировки</option>
      <option value="asc">По возрастанию (А-Я)</option>
      <option value="desc">По убыванию (Я-А)</option>
    </select>
    <button id="clearListBtn">Очистить список</button>
  </div>
  <div id="display-area" class="bookmarks-list"></div>
</section>
```

**Скриншот 5:** Блок закладок с элементами управления.

### Шаг 3.2. CSS

Стили для `.bookmarks-controls`, `.bookmarks-list`, карточек закладок (по аналогии с photo_lab5.png).

**Скриншот 6:** Оформленный список закладок.

### Шаг 3.3. JavaScript

В `js/components/bookmarks.js` или `js/script.js`:

- Ссылки: `addItemBtn`, `itemInput`, `sortSelect`, `clearListBtn`, `displayArea`
- Массив `let items = []`
- `renderItems()` — очистка `displayArea`, создание `div` для каждого элемента
- Добавление: по клику на «Добавить закладку» — `push`, `renderItems()`, очистка поля
- Сортировка: `change` на `sortSelect` — сортировка `items`, `renderItems()`
- Очистка: `click` на «Очистить список» — `items = []`, `renderItems()`
- (Опционально) LocalStorage для сохранения закладок

**Скриншот 7:** Список с несколькими добавленными закладками.

**Скриншот 8:** Список после сортировки (по возрастанию или убыванию).

**Скриншот 9:** Пустой список после очистки.

---

## Часть 4. Тест с проверкой ответов

### Шаг 4.1. HTML

Добавить секцию:

```html
<section id="quiz" aria-labelledby="quiz-title">
  <h2 id="quiz-title">Проверка знаний</h2>
  <div id="quiz-container">
    <p id="quiz-question"></p>
    <ul id="quiz-answers"></ul>
    <button id="quiz-submit" disabled>Проверить</button>
    <p id="quiz-result" aria-live="polite"></p>
  </div>
</section>
```

**Скриншот 10:** Блок теста в HTML.

### Шаг 4.2. CSS

Стили для вопросов, вариантов ответа, кнопки «Проверить», сообщения о результате.

**Скриншот 11:** Оформленный тест.

### Шаг 4.3. JavaScript

В `js/components/quiz.js` или `js/script.js`:

- Массив вопросов с вариантами и правильным ответом
- Функция отображения вопроса и вариантов
- Обработчик выбора ответа (radio/click)
- Кнопка «Проверить»: сравнение выбранного с правильным, вывод результата
- (Опционально) переход к следующему вопросу, подсчёт баллов

**Скриншот 12:** Тест с выбранным ответом и сообщением «Верно» или «Неверно».

---

## Часть 5. Интеграция и рефакторинг

### Шаг 5.1. Подключение компонентов

- Убедиться, что все скрипты подключены в `index.html`
- Использовать `DOMContentLoaded` для инициализации
- При необходимости вынести общую логику в `js/utils/`

### Шаг 5.2. События

Проверить использование минимум 3 типов событий (например: `click`, `change`, `keypress`/`keydown`).

**Скриншот 13:** Инструменты разработчика — вкладка Elements, панель Event Listeners для одного из элементов.

**Скриншот 14:** Консоль браузера с выводами `console.log` (если используются).

---

## Часть 6. Тестирование и фиксация

### Шаг 6.1. Проверка

- Добавление/сортировка/очистка закладок
- Изменение прогресс-бара
- Прохождение теста
- Проверка в разных браузерах
- Обработка пустого ввода (alert или сообщение в UI)

### Шаг 6.2. Git

```bash
git add js/ index.html css/
git commit -m "feat: add JavaScript interactivity for EduPlatform (Lab 5)"
git push origin feature/javascript-interactivity
```

**Скриншот 15:** Финальный вид страницы со всеми интерактивными компонентами (прогресс-бар, закладки, тест).

**Скриншот 16:** Ссылка на коммит в репозитории (по требованию отчёта).

---

## Сводка скриншотов для отчёта

| № | Момент |
|---|--------|
| 1 | Структура проекта (js/, components/, utils/) |
| 2 | HTML-блок прогресс-бара |
| 3 | Прогресс-бар со стилями |
| 4 | Работающий прогресс-бар |
| 5 | Блок закладок с элементами управления |
| 6 | Оформленный список закладок |
| 7 | Список с несколькими закладками |
| 8 | Список после сортировки |
| 9 | Пустой список после очистки |
| 10 | HTML-блок теста |
| 11 | Оформленный тест |
| 12 | Тест с результатом проверки |
| 13 | Event Listeners в DevTools |
| 14 | Консоль с console.log |
| 15 | Финальный вид страницы |
| 16 | Коммит в репозитории |

---

## Требования к отчёту (из text_lab5.md)

- Титульный лист
- Цель работы
- Краткие теоретические сведения (DOM, события, JavaScript)
- Ход работы с описанием и скриншотами
- Ответы на контрольные вопросы
- Выводы
