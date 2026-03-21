(function () {
    var STORAGE_PROGRESS = 'eduweb-course-progress';
    var STORAGE_BOOKMARKS = 'eduweb-course-bookmarks';

    function readJson(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            /* ignore quota / private mode */
        }
    }

    function initBurger() {
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
    }

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
        var checks = document.querySelectorAll('.lesson-progress-check');
        if (!checks.length) return;

        var saved = readJson(STORAGE_PROGRESS, []);
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
                writeJson(STORAGE_PROGRESS, ids);
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
        var buttons = document.querySelectorAll('.lesson-bookmark-btn');
        if (!buttons.length) return;

        var bookmarkIds = readJson(STORAGE_BOOKMARKS, []);
        var set = {};
        if (Array.isArray(bookmarkIds)) {
            bookmarkIds.forEach(function (id) {
                set[id] = true;
            });
        }

        buttons.forEach(function (btn) {
            var id = btn.getAttribute('data-lesson-id');
            if (id && set[id]) applyBookmarkState(btn, true);

            btn.addEventListener('click', function () {
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

                writeJson(STORAGE_BOOKMARKS, Object.keys(set));
            });
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
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initBurger();
        initProgressBar();
        initBookmarks();
        initTest();
    });
})();
