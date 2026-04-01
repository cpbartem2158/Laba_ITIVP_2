window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.sessionReadJson = function (key, fallback) {
    try {
        var raw = window.sessionStorage.getItem(key);
        return (Edu.parseJson ? Edu.parseJson(raw, fallback) : JSON.parse(raw));
    } catch (e) {
        return fallback;
    }
};

Edu.sessionWriteJson = function (key, value) {
    try {
        var raw = Edu.stringifyJson ? Edu.stringifyJson(value, '') : JSON.stringify(value);
        window.sessionStorage.setItem(key, raw);
    } catch (e) {}
};

