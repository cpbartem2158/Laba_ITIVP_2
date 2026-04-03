import { Edu } from './eduPlatform.js';
import { API_CONFIG } from './api/config.js';
import { ApiService } from './api/apiService.js';
import { LocalStorageService } from './storage/localStorage.js';

Edu.getPhoneValidationError = function (value) {
    let trimmed = (value || '').trim();
    if (!trimmed) return 'Введите номер телефона';

    if (trimmed.length === 12 && trimmed.indexOf('375') === 0) return '';

    let byMobilePrefixes = ['15', '25', '29', '33', '44'];
    let prefix2 = trimmed.substring(3, 5);
    if (trimmed.length === 9 && byMobilePrefixes.indexOf(prefix2) !== -1) return '';

    return 'Укажите корректный номер (например, 375 29 XXX-XX-XX)';
};

Edu.initMobileNav = function () {
    let burgerBtn = document.getElementById('burger-btn');
    let mainNav = document.getElementById('main-nav');
    if (!burgerBtn || !mainNav) return;

    burgerBtn.addEventListener('click', function () {
        let isOpen = mainNav.classList.toggle('header__nav--open');
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

class APIIntegrationManager {
    constructor() {
        this.localStorage = new LocalStorageService();
        this.api = null;
        this.currentData = null;
        this.init();
    }

    async init() {
        await this.initializeApi();
        this.setupEventListeners();
        this.loadCachedData();
        this.setupSecurityMeasures();
    }

    async initializeApi() {
        this.api = new ApiService(API_CONFIG.edxProxy.baseUrl, API_CONFIG.edxProxy.apiKey);
    }

    setupEventListeners() {
        const searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });
        }

        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }
    }

    async handleSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.trim();

        if (!query) {
            this.showError('Пожалуйста, введите поисковый запрос');
            return;
        };

        await this.fetchData({ q: query });
    }
    
    async fetchData(params = {}) {
        this.showLoading(true);

        try {
            const cacheKey = `api_data_${JSON.stringify(params)}`;
            const cachedData = this.localStorage.get(cacheKey, null, 30 * 60 * 1000); // 1 hour

            if (cachedData) {
                this.currentData = cachedData;
                this.renderData(cachedData);
                this.showNotification('Данные загружены из кэша');
                return;
            }

            const data = await this.api.get('/api/v1/courses', params);
            this.currentData = data;

            this.localStorage.set(cacheKey, data);
            this.localStorage.set('last_api_call', new Date().toISOString());
            
            this.renderData(data);
            this.showNotification('Данные загружены успешно');
        } catch (error) {
            this.handleAPIError(error);
        } finally {
            this.showLoading(false);
        }
    }

    loadCachedData() {
        const lastData = this.localStorage.get('last_api_data');
        if (lastData) {
            this.currentData = lastData;
            this.renderData(lastData);
        }
    }

    handleAPIError(error) {
        console.error('API error:', error);

        let errorMessage = 'Произошла ошибка при загрузке данных';

        if (error.message.includes('404')) {
            errorMessage = 'Не найдено данных по вашему запросу';
        } else if (error.message.includes('429')) {
            errorMessage = 'Превышено количество запросов. Пожалуйста, попробуйте позже';
        } else if (error.message.includes('401')) {
            errorMessage = 'Неверный API ключ. Пожалуйста, проверьте ваш ключ в настройках';
        } else if (!navigator.onLine) {
            errorMessage = 'Нет интернет соединения. Пожалуйста, проверьте ваше соединение с интернетом';
        }
        
        this.showError(errorMessage);
        
        const cachedData = this.localStorage.get('last_api_data');
        if (cachedData) {
            this.showNotification('Данные загружены из кэша');
            this.renderData(cachedData);
        }
    }

    renderData(data) {
        const container = document.getElementById('data-container');
        if (!container) return;

        container.innerHTML = '';

        if (data && data.length > 0) {
            data.forEach(item => {
                const element = this.createDataElement(item);
                container.appendChild(element);
            });
        } else {
            container.innerHTML = '<p class="no-data">Нет данных для отображения</p>';
        }
    }

    createDataElement(item) {
        const element = document.createElement('div');
        element.className = 'course-card';

        element.innerHTML = `
            <div class="course-card__category">${item.category}</div>
            <h3 class="course-card__title">${item.title}</h3>
            <p class="course-card__desc">${item.description}</p>
            <div class="course-card__meta">
                <span class="course-card__rating">${item.rating}</span>
                <span class="course-card__students">${item.students}</span>
            </div>
        `;  // TBD

        const saveBtn = element.querySelector('.course-card__save');
        saveBtn.addEventListener('click', () => {
            this.saveCourse(item);
        });

        return element;
    }

    saveCourse(item) {
        const bookmarks = this.localStorage.get('bookmarks', []);
        bookmarks.push({
            ...item,
            savedAt: new Date().toISOString()
        });
        this.localStorage.set('bookmarks', bookmarks);
        this.showNotification('Курс добавлен в закладки');
    }

    async refreshData() {
        this.localStorage.clearExpired();
        await this.fetchData();
    }

    clearCache() {
        const keys = this.localStorage.getAllKeys();
        keys.forEach(key => {
            if (key !== 'app_settings' && key !== 'saved_items') {
                this.localStorage.remove(key);
            }
        });
        this.showNotification('Кэш очищен');
    }

    setupSecurityMeasures() {
        this.localStorage.clearExpired();

        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            console.log('Fetching data:', args[0]);
            return originalFetch.apply(window, args);
        };
    }

    showLoading(show = true) {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification notification-${type}';
        notification.textContent = message;
        notification.stele.sccText = `
            display: block;
            padding: 10px;
            border-radius: 5px;
            background-color: #f0f0f0;
            color: #333;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        `;  // TBD

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    try {
        new APIIntegrationManager();
    } catch (e) {
        console.warn('APIIntegrationManager:', e);
    }
});
