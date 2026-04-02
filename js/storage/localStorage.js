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

const LocalStorageService = {
    constructor() {
        this.storage = window.localStorage;
        this.initializeStorage();
    },

    initializeStorage() {
        if (!this.get('app_settings')) {
            this.set('app_settings', {
                theme: 'light',
                language: 'ru',
                cacheDuration: 1000 * 60 * 60,  // 1 hour
            });
        }
    },

    set(key, value) {
        try {
            const item = {
                value: value,
                timestamp: Date.getTime(),
            };
            const serializedValue = JSON.stringify(item);
            this.storage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error setting item in localStorage:', error);
            return false;
        }
    },

    get(key, defaultValue = null, maxAge = null) {
        try {
            const item = this.storage.getItem(key);
            if (!item) return defaultValue;

            const parsedItem = JSON.parse(item);

            if (maxAge && Date.getTime() - parsedItem.timestamp > maxAge) {
                this.remove(key);
                return defaultValue;
            }
            return parsedItem.value;
        } catch (error) {
            console.error('Error getting item from localStorage:', error);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from localStorage:', error);
            return false;
        }
    },

    clearExpired() {
        const settings = this.get('app_settings');
        const cacheDuration = settings?.cacheDuration || 1000 * 60 * 60;
        const now = Date.getTime();

        Object.keys(this.storage).forEach(key => {
            if (key !== 'app_settings') {
                const item = this.storage.getItem(key);
                if (item) {
                    try {
                        const parsedItem = JSON.parse(item);
                        if (now - parsedItem.timestamp > cacheDuration) {
                            this.remove(key);
                        }
                    } catch (error) {
                        console.error('Invalid item in localStorage:', key);
                        this.remove(key);
                    }
                }
            }
        });
    },

    getAllKeys() {
        return Object.keys(this.storage);
    },

    hasValid(key, maxAge = null) {
        return this.get(key, null, maxAge) !== null;
    },
}

export default LocalStorageService;