export function parseJson(raw, fallback) {
    try {
        if (raw == null || raw === '') return fallback;
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}

export function stringifyJson(value, fallback) {
    try {
        return JSON.stringify(value);
    } catch (e) {
        return fallback;
    }
}

export function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Wrong date format';
        }
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (e) {
        console.error('Error formatting date:', e);
        return 'Wrong date format';
    }
}
