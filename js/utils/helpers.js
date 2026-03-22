window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.STORAGE_COURSE_PROGRESS = 'eduweb-course-progress';
Edu.STORAGE_COURSE_BOOKMARKS = 'eduweb-course-bookmarks';

Edu.readJson = function (key, fallback) {
    try {
        var raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
};

Edu.writeJson = function (key, value) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
};

Edu.getPhoneValidationError = function (value) {
    var trimmed = (value || '').trim();
    if (!trimmed) return 'Введите номер телефона';

    if (trimmed.length === 12 && trimmed.indexOf('375') === 0) return '';

    var byMobilePrefixes = ['15', '25', '29', '33', '44'];
    var prefix2 = trimmed.substring(3, 5);
    if (trimmed.length === 9 && byMobilePrefixes.indexOf(prefix2) !== -1) return '';

    return 'Укажите корректный номер (например, 375 29 XXX-XX-XX)';
};
