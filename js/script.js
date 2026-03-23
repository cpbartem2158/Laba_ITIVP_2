var Edu = window.EduPlatform || {};

function updateCourseProgress() {
    var track = document.getElementById('course-progress-track');
    var fill = document.getElementById('course-progress-fill');
    var percentEl = document.getElementById('course-progress-percent');
    var checks = document.querySelectorAll('.lesson-progress-check');
    if (!track || !fill || !percentEl || !checks.length) return;

    var done = 0;
    checks.forEach(function (cb) {
        if (cb.checked) done += 1;
    });
    var pct = Math.round((done / checks.length) * 100);

    fill.style.width = pct + '%';
    track.setAttribute('aria-valuenow', String(pct));
    track.setAttribute('aria-valuetext', pct + '% пройдено');
    percentEl.textContent = pct + '%';
}

function initProgressBar() {
    var readJson = Edu.readJson;
    var writeJson = Edu.writeJson;
    if (!readJson || !writeJson) return;

    var key = Edu.STORAGE_COURSE_PROGRESS;
    var checks = document.querySelectorAll('.lesson-progress-check');
    if (!checks.length) return;

    var saved = readJson(key, []);
    var doneSet = {};
    if (Array.isArray(saved)) {
        saved.forEach(function (id) {
            doneSet[id] = true;
        });
    }

    checks.forEach(function (cb) {
        var id = cb.getAttribute('data-lesson-id');
        if (id && doneSet[id]) cb.checked = true;

        cb.addEventListener('change', function () {
            var ids = [];
            checks.forEach(function (c) {
                var lid = c.getAttribute('data-lesson-id');
                if (lid && c.checked) ids.push(lid);
            });
            writeJson(key, ids);
            updateCourseProgress();
        });
    });

    updateCourseProgress();
}

function applyBookmarkState(btn, active) {
    btn.classList.toggle('lesson-bookmark-btn--active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    var star = btn.querySelector('span[aria-hidden="true"]');
    if (star) star.textContent = active ? '★' : '☆';
    var label = btn.getAttribute('aria-label') || '';
    if (active) {
        label = label.replace('Добавить в закладки', 'Удалить из закладок');
    } else {
        label = label.replace('Удалить из закладок', 'Добавить в закладки');
    }
    btn.setAttribute('aria-label', label);
}

function initBookmarks() {
    var readJson = Edu.readJson;
    var writeJson = Edu.writeJson;
    if (!readJson || !writeJson) return;

    var key = Edu.STORAGE_COURSE_BOOKMARKS;
    var buttons = document.querySelectorAll('.lesson-bookmark-btn');
    if (!buttons.length) return;

    var bookmarkIds = readJson(key, []);
    var set = {};
    if (Array.isArray(bookmarkIds)) {
        bookmarkIds.forEach(function (id) {
            set[id] = true;
        });
    }

    buttons.forEach(function (btn) {
        var id = btn.getAttribute('data-lesson-id');
        if (id && set[id]) applyBookmarkState(btn, true);
    });

    // Делегирование событий: один обработчик на document
    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('.lesson-bookmark-btn') : null;
        if (!btn) return;

        var lessonId = btn.getAttribute('data-lesson-id');
        if (!lessonId) return;

        var isActive = btn.classList.contains('lesson-bookmark-btn--active');
        if (isActive) {
            delete set[lessonId];
            applyBookmarkState(btn, false);
        } else {
            set[lessonId] = true;
            applyBookmarkState(btn, true);
        }

        writeJson(key, Object.keys(set));
    });
}

function initTest() {
    var form = document.getElementById('web-dev-test');
    var btn = document.getElementById('test-check-btn');
    var out = document.getElementById('test-results');
    if (!form || !btn || !out) return;

    var correctAnswers = {
        'test-q1': 'b',
        'test-q2': 'b',
        'test-q3': 'b'
    };
    var names = Object.keys(correctAnswers);
    ////+++++
    btn.addEventListener('click', function () {
        var ok = 0;
        names.forEach(function (name) {
            var picked = form.querySelector('input[name="' + name + '"]:checked');
            if (picked && picked.value === correctAnswers[name]) ok += 1;
        });

        out.classList.remove('course-test__results--ok', 'course-test__results--err');
        if (ok === names.length) {
            out.textContent = 'Все ответы верны: ' + ok + ' из ' + names.length + '.';
            out.classList.add('course-test__results--ok');
        } else {
            out.textContent =
                'Правильных ответов: ' + ok + ' из ' + names.length + '. Перепроверьте вопросы с ошибками.';
            out.classList.add('course-test__results--err');
        }
        console.log(out.textContent);
    });
}

function initHomePageExtras() {
    var heading = document.querySelector('h1');
    if (!heading) return;
    heading.style.transition = 'color 0.3s ease';
    heading.addEventListener('mouseenter', function () {
        this.style.color = '#3498db';
    });
    heading.addEventListener('mouseleave', function () {
        this.style.color = '#2c3e50';
    });
}

/**
 * Демо на главной: innerHTML / textContent, createElement + классы,
 * делегирование click — новые «темы» ловятся тем же обработчиком.
 */
function initHtmlContentExample() {
    var heroContent = document.querySelector('.hero .hero__content');
    if (!heroContent || document.getElementById('js-html-demo')) return;

    var moduleThemes = ['Вёрстка', 'Стили', 'JavaScript', 'Доступность'];

    var aside = document.createElement('aside');
    aside.id = 'js-html-demo';
    aside.className = 'js-dom-demo';
    aside.setAttribute('aria-label', 'Демо: как JavaScript меняет страницу');

    var caption = document.createElement('p');
    caption.className = 'course-card__category';
    caption.textContent = 'Интерактив';

    var target = document.createElement('p');
    target.className = 'js-dom-demo__target';
    target.id = 'js-html-demo-target';
    target.textContent =
        'Текст карточки курса как обычная строка: теги <strong>не оформляются</strong>, ссылка не кликабельна.';

    var row = document.createElement('div');
    row.className = 'js-dom-demo__row';

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'js-dom-demo__btn';
    toggleBtn.setAttribute('data-demo-action', 'toggle-html');
    toggleBtn.textContent = 'С разметкой';

    var addChipBtn = document.createElement('button');
    addChipBtn.type = 'button';
    addChipBtn.className = 'js-dom-demo__btn';
    addChipBtn.setAttribute('data-demo-action', 'add-chip');
    addChipBtn.textContent = '+ тема';

    row.appendChild(toggleBtn);
    row.appendChild(addChipBtn);

    var chipHost = document.createElement('div');
    chipHost.id = 'js-html-demo-chip-host';
    chipHost.className = 'js-dom-demo__tags';
    chipHost.setAttribute('role', 'group');
    chipHost.setAttribute('aria-label', 'Темы модуля (пример динамического списка)');

    var hint = document.createElement('p');
    hint.className = 'js-dom-demo__hint';
    hint.textContent = 'Нажмите тему, чтобы отметить как пройденную — один обработчик на весь блок.';

    aside.appendChild(caption);
    aside.appendChild(target);
    aside.appendChild(row);
    aside.appendChild(chipHost);
    aside.appendChild(hint);

    var actions = heroContent.querySelector('.hero__actions');
    if (actions) {
        actions.insertAdjacentElement('afterend', aside);
    } else {
        heroContent.appendChild(aside);
    }

    var showingMarkup = false;

    aside.addEventListener('click', function (e) {
        var t = e.target;
        if (t.closest('[data-demo-action="toggle-html"]')) {
            e.preventDefault();
            if (!showingMarkup) {
                target.innerHTML =
                    'Описание модуля с <strong>выделением</strong> и рабочей ' +
                    '<a href="#courses">ссылкой на каталог</a> — через innerHTML.';
                toggleBtn.textContent = 'Как текст';
            } else {
                target.textContent =
                    'Текст карточки курса как обычная строка: теги <strong>не оформляются</strong>, ссылка не кликабельна.';
                toggleBtn.textContent = 'С разметкой';
            }
            showingMarkup = !showingMarkup;
            return;
        }

        if (t.closest('[data-demo-action="add-chip"]')) {
            e.preventDefault();
            var idx = chipHost.children.length;
            var chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'js-dom-demo__tag';
            chip.setAttribute('aria-pressed', 'false');
            chip.textContent = idx < moduleThemes.length ? moduleThemes[idx] : 'Тема ' + (idx + 1);
            chipHost.appendChild(chip);
            return;
        }

        var chipEl = t.closest('.js-dom-demo__tag');
        if (chipEl && chipHost.contains(chipEl)) {
            e.preventDefault();
            var done = chipEl.classList.toggle('js-dom-demo__tag--done');
            chipEl.setAttribute('aria-pressed', done ? 'true' : 'false');
        }
    });
}

function setFooterPhoneError(input, errorEl, message) {
    if (message) {
        input.classList.add('footer__input--error');
        input.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
        errorEl.hidden = false;
    } else {
        input.classList.remove('footer__input--error');
        input.setAttribute('aria-invalid', 'false');
        errorEl.textContent = '';
        errorEl.hidden = true;
    }
}

function initFooterCallbackForm() {
    var getErr = Edu.getPhoneValidationError;
    if (!getErr) return;

    var forms = document.querySelectorAll('.footer__form');
    forms.forEach(function (form) {
        var input = form.querySelector('.footer__input');
        var errorEl = form.querySelector('.footer__error');
        if (!input || !errorEl) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var msg = getErr(input.value);
            if (msg) {
                setFooterPhoneError(input, errorEl, msg);
                input.focus();
                return;
            }
            setFooterPhoneError(input, errorEl, '');
            console.log('Заявка на звонок:', input.value.trim());
        });

        input.addEventListener('input', function () {
            if (input.classList.contains('footer__input--error')) {
                setFooterPhoneError(input, errorEl, '');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    if (Edu.initMobileNav) Edu.initMobileNav();
    initHomePageExtras();
    initHtmlContentExample();
    initProgressBar();
    initBookmarks();
    initTest();
    initFooterCallbackForm();
});
