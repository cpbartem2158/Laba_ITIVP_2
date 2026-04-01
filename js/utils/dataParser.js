window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.parseJson = function (raw, fallback) {
    try {
        if (raw == null || raw === '') return fallback;
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
};

Edu.stringifyJson = function (value, fallback) {
    try {
        return JSON.stringify(value);
    } catch (e) {
        return fallback;
    }
};

