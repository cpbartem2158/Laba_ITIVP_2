window.EduPlatform = window.EduPlatform || {};
var Edu = window.EduPlatform;

Edu.STORAGE_COURSE_PROGRESS = 'eduweb-course-progress';
Edu.STORAGE_COURSE_BOOKMARKS = 'eduweb-course-bookmarks';

Edu.readJson = function (key, fallback) {
    try {
        var raw = window.localStorage.getItem(key);
        return Edu.parseJson ? Edu.parseJson(raw, fallback) : JSON.parse(raw);
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

function LocalStorageService() {
    this.storage = window.localStorage;
    this.initializeStorage();
}

LocalStorageService.prototype.initializeStorage = function () {
    if (!this.get('app_settings')) {
        this.set('app_settings', {
            theme: 'light',
            language: 'ru',
            cacheDuration: 1000 * 60 * 60,
        });
    }
};

LocalStorageService.prototype.set = function (key, value) {
    try {
        var item = {
            value: value,
            timestamp: Date.now(),
        };
        this.storage.setItem(key, JSON.stringify(item));
        return true;
    } catch (error) {
        console.error('Error setting item in localStorage:', error);
        return false;
    }
};

LocalStorageService.prototype.get = function (key, defaultValue, maxAge) {
    if (defaultValue === undefined) defaultValue = null;
    try {
        var raw = this.storage.getItem(key);
        if (!raw) return defaultValue;
        var parsedItem = JSON.parse(raw);
        if (maxAge && Date.now() - parsedItem.timestamp > maxAge) {
            this.remove(key);
            return defaultValue;
        }
        return parsedItem.value;
    } catch (error) {
        console.error('Error getting item from localStorage:', error);
        return defaultValue;
    }
};

LocalStorageService.prototype.remove = function (key) {
    try {
        this.storage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing item from localStorage:', error);
        return false;
    }
};

LocalStorageService.prototype.clearExpired = function () {
    var settings = this.get('app_settings');
    var cacheDuration = settings && settings.cacheDuration ? settings.cacheDuration : 1000 * 60 * 60;
    var now = Date.now();
    var self = this;
    Object.keys(this.storage).forEach(function (key) {
        if (key !== 'app_settings') {
            var item = self.storage.getItem(key);
            if (item) {
                try {
                    var parsedItem = JSON.parse(item);
                    if (now - parsedItem.timestamp > cacheDuration) {
                        self.remove(key);
                    }
                } catch (error) {
                    self.remove(key);
                }
            }
        }
    });
};

LocalStorageService.prototype.getAllKeys = function () {
    return Object.keys(this.storage);
};

LocalStorageService.prototype.hasValid = function (key, maxAge) {
    return this.get(key, null, maxAge) !== null;
};

window.LocalStorageService = LocalStorageService;
