import { readJson, writeJson } from './storage/localStorage.js';
import { apiRequest } from './api/apiService.js';

const CACHE_KEY = 'edu-courses-list';
const CACHE_TTL_MS = 30 * 60 * 1000;  // 1 hour

document.addEventListener('DOMContentLoaded', initCoursesPage);

function initCoursesPage() {
    let grid = document.getElementById('courses-grid');
    if (!grid) return;

    let gridWrap = document.getElementById('courses-grid-wrap');
    let loadingEl = document.getElementById('courses-loading');
    let statusEl = document.getElementById('courses-status');
    let errorEl = document.getElementById('courses-error');
    let catalogRoot = document.querySelector('.courses-catalog');
    let cacheHintEl = document.getElementById('courses-cache-hint');
    let clearBtn = document.getElementById('courses-clear-cache');
    let refreshBtn = document.getElementById('courses-refresh');

    let busy = false;

    function setLoading(on) {
        if (gridWrap) {
            gridWrap.classList.toggle('is-page-loading', on);
            gridWrap.setAttribute('aria-busy', on ? 'true' : 'false');
        }
        if (loadingEl) loadingEl.hidden = !on;
        if (catalogRoot) catalogRoot.classList.toggle('courses-catalog--loading', on);
    }

    function setCacheHint(on) {
        if (!cacheHintEl) return;
        cacheHintEl.hidden = !on;
        cacheHintEl.textContent = on ? 'Показано из кэша' : '';
    }

    function showError(msg) {
        if (!errorEl) return;
        if (msg) {
            errorEl.hidden = false;
            errorEl.textContent = msg;
        } else {
            errorEl.hidden = true;
            errorEl.textContent = '';
        }
    }

    function updateStatus(count, fromCache) {
        if (!statusEl) return;
        let parts = [];
        if (count != null && typeof count === 'number') parts.push('Курсов: ' + count);
        if (fromCache) parts.push('кэш');
        statusEl.textContent = parts.join(' · ');
    }

    async function load(opts) {
        opts = opts || {};
        if (busy) return;
        busy = true;
        showError('');

        let skipCache = !!opts.skipCache;
        if (!skipCache) {
            let cached = readCache();
            if (cached) {
                renderList(cached.courses);
                updateStatus(cached.count, true);
                setCacheHint(true);
                busy = false;
                return;
            }
        }

        setLoading(true);
        setCacheHint(false);

        try {
            let data = await fetchCourses();
            let list = data.courses || [];
            writeCache({ courses: list, count: data.count });
            renderList(list);
            updateStatus(data.count, false);
            setCacheHint(false);
        } catch (err) {
            console.error('courses:', err);
            showError('Ошибка при загрузке курсов: API недоступен.');
        } finally {
            busy = false;
            setLoading(false);
        }
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            load({ skipCache: true });
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            clearCoursesCache();
            setCacheHint(false);
            renderList([]);
            updateStatus(null, false);
            // load({ skipCache: true });
        });
    }

    load({});
}

function readCache() {
    let raw = readJson(CACHE_KEY, null);
    if (!raw || !raw.courses || !raw.savedAt) return null;
    if (Date.now() - raw.savedAt > CACHE_TTL_MS) return null;
    return raw;
}

function writeCache(data) {
    writeJson(CACHE_KEY, {
        savedAt: Date.now(),
        courses: data.courses,
        count: data.count,
    });
}

function clearCoursesCache() {
    try {
        window.localStorage.removeItem(CACHE_KEY);
    } catch (e) {}
}

async function fetchCourses() {
    const res = await apiRequest('/api/courses', {
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

function renderCard(course) {
    let safeId = String(course.id || 'c').replace(/[^a-zA-Z0-9_-]/g, '-');
    let li = document.createElement('li');
    let article = document.createElement('article');
    article.className = 'course-card course-card--edx';
    article.setAttribute('aria-labelledby', 'course-' + safeId);

    if (course.image_url) {
        let media = document.createElement('div');
        media.className = 'course-card__media';
        let img = document.createElement('img');
        img.src = course.image_url;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        media.appendChild(img);
        article.appendChild(media);
    }

    let category = document.createElement('span');
    category.className = 'course-card__category';
    category.textContent = (course.organization || 'Курс').toUpperCase();
    article.appendChild(category);

    let title = document.createElement('h3');
    title.className = 'course-card__title';
    title.id = 'course-' + safeId;
    title.textContent = course.title || 'Курс';
    article.appendChild(title);

    let desc = document.createElement('p');
    desc.className = 'course-card__desc';
    let text = course.short_description || course.description || '';
    desc.textContent = text.substring(0, 220) + '...';
    article.appendChild(desc);

    let pct = Math.min(100, Math.max(0, Number(course.progress_percent) || 0));
    let progress = document.createElement('div');
    progress.className = 'course-card__progress';
    let label = document.createElement('span');
    label.className = 'course-card__progress-label';
    label.textContent = 'Пройдено: ' + pct + '%';
    let bar = document.createElement('div');
    bar.className = 'course-card__progress-bar';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', String(pct));
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    let fill = document.createElement('div');
    fill.className = 'course-card__progress-fill';
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    progress.appendChild(label);
    progress.appendChild(bar);
    article.appendChild(progress);

    let meta = document.createElement('div');
    meta.className = 'course-card__meta';
    meta.setAttribute('role', 'group');
    meta.setAttribute('aria-label', 'Параметры курса');
    let metaText = document.createElement('span');
    metaText.className = 'course-card__duration';
    let parts = [];
    if (course.level) parts.push(String(course.level));
    if (course.duration_weeks) parts.push(course.duration_weeks + ' нед.');
    metaText.textContent = parts.join(' · ');
    meta.appendChild(metaText);
    article.appendChild(meta);

    li.appendChild(article);
    return li;
}

function renderList(courses) {
    let grid = document.getElementById('courses-grid');
    if (!grid) return;
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    (courses || []).forEach(function (c) {
        grid.appendChild(renderCard(c));
    });
}
