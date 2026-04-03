import { Edu } from '../eduPlatform.js';

Edu.sessionReadJson = function (key, fallback) {
    try {
        let raw = window.sessionStorage.getItem(key);
        return (Edu.parseJson ? Edu.parseJson(raw, fallback) : JSON.parse(raw));
    } catch (e) {
        return fallback;
    }
};

Edu.sessionWriteJson = function (key, value) {
    try {
        let raw = Edu.stringifyJson ? Edu.stringifyJson(value, '') : JSON.stringify(value);
        window.sessionStorage.setItem(key, raw);
    } catch (e) {}
};
