window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

(function () {
    var PAGE_SIZE = 12;
    var EDX_ORIGIN = 'https://courses.edx.org';
    var CACHE_KEY = 'edu-edx-catalog-pages';
    var CACHE_TTL_MS = 30 * 60 * 1000;

    function ensureApiConfig() {
        Edu.apiConfig = Edu.apiConfig || {};
        var proxy = Edu.API_CONFIG && Edu.API_CONFIG.edxProxy;
        var base = Edu.EDX_API_BASE;
        var key = Edu.EDX_PROXY_API_KEY || '';
        if (!base && proxy && proxy.baseUrl) {
            base = proxy.baseUrl;
            if (!key && proxy.apiKey) key = proxy.apiKey;
        }
        if (!base) base = EDX_ORIGIN;
        Edu.apiConfig.baseUrl = String(base).replace(/\/$/, '');
        Edu.apiConfig.apiKey = key || '';
    }

    function readCacheStore() {
        var read = Edu.readJson;
        if (!read) return { pages: {}, meta: {} };
        return read(CACHE_KEY, { pages: {}, meta: {} });
    }

    function writeCacheStore(store) {
        if (Edu.writeJson) Edu.writeJson(CACHE_KEY, store);
    }

    function getPageFromCache(pageNum) {
        var store = readCacheStore();
        var entry = store.pages[String(pageNum)];
        if (!entry || !entry.data) return null;
        if (Date.now() - entry.savedAt > CACHE_TTL_MS) return null;
        return entry.data;
    }

    function savePageToCache(pageNum, data) {
        var store = readCacheStore();
        store.pages[String(pageNum)] = { savedAt: Date.now(), data: data };
        if (data && data.pagination) {
            store.meta.count = data.pagination.count;
            store.meta.num_pages = data.pagination.num_pages;
        }
        writeCacheStore(store);
    }

    function clearCatalogCache() {
        writeCacheStore({ pages: {}, meta: {} });
    }

    function pathFromPaginationNext(fullUrl) {
        if (!fullUrl) return null;
        try {
            var u = new URL(fullUrl);
            if (u.origin === EDX_ORIGIN) {
                return u.pathname + u.search;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function pathForPage(pageNum) {
        var qs = Edu.buildQueryString({
            page_size: PAGE_SIZE,
            page: pageNum,
        });
        return '/api/courses/v1/courses/?' + qs;
    }

    function fetchEdxJson(pathWithQuery) {
        return Edu.apiRequest(pathWithQuery, {
            headers: { Accept: 'application/json' },
        })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.text();
            })
            .then(function (text) {
                var data = Edu.parseJson(text, null);
                if (data === null && text && text.trim()) {
                    throw new Error('Invalid JSON');
                }
                return data;
            });
    }

    function buildAboutUrl(course) {
        var key = course.course_id || course.id;
        if (!key) return 'https://www.edx.org';
        return EDX_ORIGIN + '/courses/' + encodeURIComponent(key) + '/about';
    }

    function pickCourseImage(course) {
        return (
            Edu.getNestedValue(course, 'media.image.raw', '') ||
            Edu.getNestedValue(course, 'media.image.large', '') ||
            Edu.getNestedValue(course, 'media.image.small', '')
        );
    }

    function renderCard(course) {
        var rawId = course.course_id || course.id || course.slug || 'c';
        var safeId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '-');
        var li = document.createElement('li');
        var article = document.createElement('article');
        article.className = 'course-card course-card--edx';
        article.setAttribute('aria-labelledby', 'edx-card-' + safeId);

        var imgUrl = pickCourseImage(course);
        if (imgUrl) {
            var media = document.createElement('div');
            media.className = 'course-card__media';
            var img = document.createElement('img');
            img.src = imgUrl;
            img.alt = '';
            img.loading = 'lazy';
            img.decoding = 'async';
            media.appendChild(img);
            article.appendChild(media);
        }

        var category = document.createElement('span');
        category.className = 'course-card__category';
        category.textContent = course.org ? String(course.org).toUpperCase() : 'edX';
        article.appendChild(category);

        var title = document.createElement('h3');
        title.className = 'course-card__title';
        title.id = 'edx-card-' + safeId;
        title.textContent = course.name || course.number || 'Курс';
        article.appendChild(title);

        var desc = document.createElement('p');
        desc.className = 'course-card__desc';
        var shortDesc = course.short_description || '';
        desc.textContent = Edu.truncateText(shortDesc, 220, true) || '';
        article.appendChild(desc);

        var meta = document.createElement('div');
        meta.className = 'course-card__meta';
        meta.setAttribute('role', 'group');
        meta.setAttribute('aria-label', 'Параметры курса');

        var typeEl = document.createElement('span');
        typeEl.className = 'course-card__duration';
        typeEl.textContent = course.start_display || course.number || '';
        meta.appendChild(typeEl);

        var badge = document.createElement('span');
        badge.className = 'course-card__badge';
        badge.textContent = 'edX';
        meta.appendChild(badge);

        article.appendChild(meta);

        var cta = document.createElement('a');
        cta.className = 'course-card__cta';
        cta.href = buildAboutUrl(course);
        cta.target = '_blank';
        cta.rel = 'noopener noreferrer';
        cta.textContent = 'Страница курса на edX';
        article.appendChild(cta);

        li.appendChild(article);
        return li;
    }

    function initEdxCatalog() {
        var grid = document.getElementById('edx-courses-grid');
        var gridWrap = document.getElementById('edx-grid-wrap');
        var pageLoadingEl = document.getElementById('edx-page-loading');
        var statusEl = document.getElementById('edx-status');
        var errorEl = document.getElementById('edx-error');
        var catalogRoot = document.querySelector('.edx-catalog');
        var cacheHintEl = document.getElementById('edx-cache-hint');
        var clearBtn = document.getElementById('edx-clear-cache');
        var paginationNav = document.getElementById('edx-pagination');
        var numbersEl = document.getElementById('edx-pagination-numbers');
        var btnFirst = document.getElementById('edx-page-first');
        var btnPrev = document.getElementById('edx-page-prev');
        var btnNext = document.getElementById('edx-page-next');
        var btnLast = document.getElementById('edx-page-last');
        if (!grid) return;

        ensureApiConfig();

        var currentPage = 1;
        var totalPages = 0;
        var totalCount = null;
        var requestBusy = false;

        function setPageLoading(on) {
            if (gridWrap) {
                gridWrap.classList.toggle('is-page-loading', on);
                gridWrap.setAttribute('aria-busy', on ? 'true' : 'false');
            }
            if (pageLoadingEl) pageLoadingEl.hidden = !on;
            if (catalogRoot) catalogRoot.classList.toggle('edx-catalog--loading', on);
        }

        function updateNavDisabled() {
            var dis = requestBusy;
            if (btnFirst) btnFirst.disabled = dis || currentPage <= 1;
            if (btnPrev) btnPrev.disabled = dis || currentPage <= 1;
            if (btnNext) btnNext.disabled = dis || !totalPages || currentPage >= totalPages;
            if (btnLast) btnLast.disabled = dis || !totalPages || currentPage >= totalPages;
        }

        function setCacheHint(fromCache) {
            if (!cacheHintEl) return;
            cacheHintEl.hidden = !fromCache;
            cacheHintEl.textContent = fromCache ? 'Показано из кэша (обновляется…)' : '';
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

        function updateStatus() {
            if (!statusEl) return;
            var parts = [];
            if (totalPages > 0) {
                parts.push('Страница ' + currentPage + ' из ' + totalPages);
            }
            if (totalCount != null) {
                parts.push('курсов в каталоге: ' + totalCount);
            }
            statusEl.textContent = parts.join(' · ');
        }

        function applyResponse(data) {
            while (grid.firstChild) grid.removeChild(grid.firstChild);
            var results = (data && data.results) || [];
            results.forEach(function (c) {
                grid.appendChild(renderCard(c));
            });
            var p = data && data.pagination;
            if (p) {
                if (typeof p.count === 'number') totalCount = p.count;
                if (typeof p.num_pages === 'number') totalPages = p.num_pages;
            }
            renderPagination();
            updateStatus();
        }

        function renderPagination() {
            if (!paginationNav || !numbersEl) return;
            if (!totalPages || totalPages < 1) {
                paginationNav.hidden = true;
                return;
            }
            paginationNav.hidden = false;
            while (numbersEl.firstChild) numbersEl.removeChild(numbersEl.firstChild);

            var maxBtns = 7;
            var start = 1;
            var end = totalPages;
            if (totalPages > maxBtns) {
                var half = Math.floor(maxBtns / 2);
                start = Math.max(1, currentPage - half);
                end = Math.min(totalPages, start + maxBtns - 1);
                if (end - start < maxBtns - 1) {
                    start = Math.max(1, end - maxBtns + 1);
                }
            }

            function addEllipsis() {
                var span = document.createElement('span');
                span.className = 'edx-pagination__ellipsis';
                span.setAttribute('aria-hidden', 'true');
                span.textContent = '…';
                numbersEl.appendChild(span);
            }

            function addNum(p) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'edx-pagination__num';
                if (p === currentPage) btn.classList.add('is-active');
                btn.textContent = String(p);
                btn.setAttribute('aria-label', 'Страница ' + p);
                btn.setAttribute('aria-current', p === currentPage ? 'page' : 'false');
                btn.addEventListener('click', function () {
                    loadPage(p, {});
                });
                numbersEl.appendChild(btn);
            }

            if (start > 1) {
                addNum(1);
                if (start > 2) addEllipsis();
            }
            for (var i = start; i <= end; i++) {
                addNum(i);
            }
            if (end < totalPages) {
                if (end < totalPages - 1) addEllipsis();
                addNum(totalPages);
            }

            updateNavDisabled();
        }

        function loadPage(pageNum, opts) {
            opts = opts || {};
            if (requestBusy && !opts.force) return;
            requestBusy = true;
            currentPage = pageNum;
            showError('');

            if (totalPages > 0) {
                renderPagination();
            }

            requestAnimationFrame(function () {
                setPageLoading(true);
                setCacheHint(false);

                var cached = null;
                if (!opts.skipCache) {
                    cached = getPageFromCache(pageNum);
                    if (cached) {
                        applyResponse(cached);
                        setCacheHint(true);
                    } else {
                        while (grid.firstChild) grid.removeChild(grid.firstChild);
                    }
                } else {
                    while (grid.firstChild) grid.removeChild(grid.firstChild);
                }

                updateNavDisabled();

                fetchEdxJson(pathForPage(pageNum))
                    .then(function (data) {
                        savePageToCache(pageNum, data);
                        applyResponse(data);
                        setCacheHint(false);
                    })
                    .catch(function (err) {
                        console.error('edX catalog:', err);
                        if (!cached) {
                            showError(
                                'Не удалось загрузить каталог. Проверьте backend, ключ API и сеть.'
                            );
                        }
                    })
                    .finally(function () {
                        requestBusy = false;
                        setPageLoading(false);
                        setCacheHint(false);
                        renderPagination();
                    });
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                clearCatalogCache();
                setCacheHint(false);
                while (grid.firstChild) grid.removeChild(grid.firstChild);
                totalPages = 0;
                totalCount = null;
                currentPage = 1;
                if (paginationNav) paginationNav.hidden = true;
                updateStatus();
                loadPage(1, { skipCache: true, force: true });
            });
        }

        if (btnFirst) {
            btnFirst.addEventListener('click', function () {
                if (currentPage > 1) loadPage(1, {});
            });
        }
        if (btnPrev) {
            btnPrev.addEventListener('click', function () {
                if (currentPage > 1) loadPage(currentPage - 1, {});
            });
        }
        if (btnNext) {
            btnNext.addEventListener('click', function () {
                if (currentPage < totalPages) loadPage(currentPage + 1, {});
            });
        }
        if (btnLast) {
            btnLast.addEventListener('click', function () {
                if (totalPages && currentPage < totalPages) loadPage(totalPages, {});
            });
        }

        loadPage(1, {});
    }

    document.addEventListener('DOMContentLoaded', function () {
        initEdxCatalog();
    });
})();
