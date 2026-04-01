window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.getPhoneValidationError = function (value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'Введите номер телефона';

    if (trimmed.length === 12 && trimmed.indexOf('375') === 0) return '';

    var byMobilePrefixes = ['15', '25', '29', '33', '44'];
    var prefix2 = trimmed.substring(3, 5);
    if (trimmed.length === 9 && byMobilePrefixes.indexOf(prefix2) !== -1) return '';

    return 'Укажите корректный номер (например, 375 29 XXX-XX-XX)';
};

Edu.initMobileNav = function () {
    var burgerBtn = document.getElementById('burger-btn');
    var mainNav = document.getElementById('main-nav');
    if (!burgerBtn || !mainNav) return;

    burgerBtn.addEventListener('click', function () {
        var isOpen = mainNav.classList.toggle('header__nav--open');
        burgerBtn.classList.toggle('header__burger--active', isOpen);
        burgerBtn.setAttribute('aria-expanded', isOpen);
        burgerBtn.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            mainNav.classList.remove('header__nav--open');
            burgerBtn.classList.remove('header__burger--active');
            burgerBtn.setAttribute('aria-expanded', 'false');
            burgerBtn.setAttribute('aria-label', 'Открыть меню');
        });
    });
};

function updateCourseProgress() {
    let track = document.getElementById('course-progress-track');
    let fill = document.getElementById('course-progress-fill');
    let percentEl = document.getElementById('course-progress-percent');
    let checks = document.querySelectorAll('.lesson-progress-check');
    if (!track || !fill || !percentEl || !checks.length) return;

    let done = 0;
    checks.forEach(function (cb) {
        if (cb.checked) done += 1;
    });
    let pct = Math.round((done / checks.length) * 100);

    fill.style.width = pct + '%';
    track.setAttribute('aria-valuenow', String(pct));
    track.setAttribute('aria-valuetext', pct + '% пройдено');
    percentEl.textContent = pct + '%';
}

function initProgressBar() {
    let readJson = Edu.readJson;
    let writeJson = Edu.writeJson;
    if (!readJson || !writeJson) return;

    let key = Edu.STORAGE_COURSE_PROGRESS;
    let checks = document.querySelectorAll('.lesson-progress-check');
    if (!checks.length) return;

    let saved = readJson(key, []);
    let doneSet = {};
    if (Array.isArray(saved)) {
        saved.forEach(function (id) {
            doneSet[id] = true;
        });
    }

    checks.forEach(function (cb) {
        let id = cb.getAttribute('data-lesson-id');
        if (id && doneSet[id]) cb.checked = true;

        cb.addEventListener('change', function () {
            let ids = [];
            checks.forEach(function (c) {
                let lid = c.getAttribute('data-lesson-id');
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
    let star = btn.querySelector('span[aria-hidden="true"]');
    if (star) star.textContent = active ? '★' : '☆';
    let label = btn.getAttribute('aria-label') || '';
    if (active) {
        label = label.replace('Добавить в закладки', 'Удалить из закладок');
    } else {
        label = label.replace('Удалить из закладок', 'Добавить в закладки');
    }
    btn.setAttribute('aria-label', label);
}

function initBookmarks() {
    let readJson = Edu.readJson;
    let writeJson = Edu.writeJson;
    if (!readJson || !writeJson) return;

    let key = Edu.STORAGE_COURSE_BOOKMARKS;
    let buttons = document.querySelectorAll('.lesson-bookmark-btn');
    if (!buttons.length) return;

    let bookmarkIds = readJson(key, []);
    let set = {};
    if (Array.isArray(bookmarkIds)) {
        bookmarkIds.forEach(function (id) {
            set[id] = true;
        });
    }

    buttons.forEach(function (btn) {
        let id = btn.getAttribute('data-lesson-id');
        if (id && set[id]) applyBookmarkState(btn, true);
    });

    document.addEventListener('click', function (e) {
        let btn = e.target && e.target.closest ? e.target.closest('.lesson-bookmark-btn') : null;
        if (!btn) return;

        let lessonId = btn.getAttribute('data-lesson-id');
        if (!lessonId) return;

        let isActive = btn.classList.contains('lesson-bookmark-btn--active');
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
    let form = document.getElementById('web-dev-test');
    let btn = document.getElementById('test-check-btn');
    let out = document.getElementById('test-results');
    if (!form || !btn || !out) return;

    let correctAnswers = {
        'test-q1': 'b',
        'test-q2': 'b',
        'test-q3': 'b'
    };
    let names = Object.keys(correctAnswers);
    
    btn.addEventListener('click', function () {
        let ok = 0;
        names.forEach(function (name) {
            let picked = form.querySelector('input[name="' + name + '"]:checked');
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
    let heading = document.querySelector('h1');
    if (!heading) return;
    heading.style.transition = 'color 0.3s ease';
    heading.addEventListener('mouseenter', function () {
        this.style.color = '#3498db';
    });
    heading.addEventListener('mouseleave', function () {
        this.style.color = '#2c3e50';
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
    let getErr = Edu.getPhoneValidationError;
    if (!getErr) return;

    let forms = document.querySelectorAll('.footer__form');
    forms.forEach(function (form) {
        let input = form.querySelector('.footer__input');
        let errorEl = form.querySelector('.footer__error');
        if (!input || !errorEl) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            let msg = getErr(input.value);
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
    initProgressBar();
    initBookmarks();
    initTest();
    initFooterCallbackForm();
});
