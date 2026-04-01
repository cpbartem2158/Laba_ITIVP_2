window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.apiRequest = function (path, options) {
    var cfg = Edu.apiConfig || {};
    var base = cfg.baseUrl || '';
    var url = (base ? base.replace(/\/$/, '') : '') + (path ? String(path) : '');
    return window.fetch(url, options || {});
};

