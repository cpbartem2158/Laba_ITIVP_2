import { parseJson, stringifyJson } from '../utils/dataParser.js';

export const STORAGE_COURSE_PROGRESS = 'eduweb-course-progress';
export const STORAGE_COURSE_BOOKMARKS = 'eduweb-course-bookmarks';

export function readJson(key, fallback) {
    try {
        let raw = window.localStorage.getItem(key);
        return parseJson(raw, fallback);
    } catch (e) {
        return fallback;
    }
}

export function writeJson(key, value) {
    try {
        let raw = stringifyJson(value, '');
        window.localStorage.setItem(key, raw);
    } catch (e) {}
}

export class LocalStorageService {
    constructor() {
        this.storage = window.localStorage;
        this.initializeStorage();
    }

    initializeStorage = function () {
        if (!this.get('app_settings')) {
            this.set('app_settings', {
                theme: 'light',
                language: 'ru',
                cacheDuration: 1000 * 60 * 60,  // 1 hour
            });
        }
    };

    set = function (key, value) {
        try {
            let item = {
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

    get = function (key, defaultValue, maxAge) {
        if (defaultValue === undefined) defaultValue = null;
        try {
            let raw = this.storage.getItem(key);
            if (!raw) return defaultValue;
            let parsedItem = JSON.parse(raw);
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

    remove = function (key) {
        try {
            this.storage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from localStorage:', error);
            return false;
        }
    };

    clearExpired = function () {
        let settings = this.get('app_settings');
        let cacheDuration = settings && settings.cacheDuration ? settings.cacheDuration : 1000 * 60 * 60;
        Object.keys(this.storage).forEach(key => {
            if (key !== 'app_settings') {
                let item = this.storage.getItem(key);
                if (item) {
                    try {
                        let parsedItem = JSON.parse(item);
                        if (Date.now() - parsedItem.timestamp > cacheDuration) {
                            this.remove(key);
                        }
                    } catch (error) {
                        this.remove(key);
                    }
                }
            }
        });
    };

    getAllKeys = function () {
        return Object.keys(this.storage);
    };

    hasValid = function (key, maxAge) {
        return this.get(key, null, maxAge) !== null;
    };
}
