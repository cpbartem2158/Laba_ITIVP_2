window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.STORAGE_COURSE_PROGRESS = 'eduweb-course-progress';
Edu.STORAGE_COURSE_BOOKMARKS = 'eduweb-course-bookmarks';

Edu.readJson = function (key, fallback) {
    try {
        var raw = window.localStorage.getItem(key);
        return (Edu.parseJson ? Edu.parseJson(raw, fallback) : JSON.parse(raw));
    } catch (e) {
        return fallback;
    }
};

Edu.writeJson = function (key, value) {
    try {
        var raw = Edu.stringifyJson ? Edu.stringifyJson(value, '') : JSON.stringify(value);
        window.localStorage.setItem(key, raw);
    } catch (e) {}
};

