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

Edu.parseJSON = function (joinString) {
    try {
        return JSON.parse(joinString);
    } catch (e) {
        return fallback;
    }
};

Edu.formatDate = function (dateString) {
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

Edu.truncateText = function (text, maxLength, useWordBoundary = true) {
    if (!text || text.length <= maxLength) return text;

    let truncatedText = text.substring(0, maxLength);

    if (useWordBoundary) {
        truncatedText = truncatedText.substring(
            0,
            Math.min(truncatedText.length, truncatedText.lastIndexOf(' '))
        );
    }

    return truncatedText + '...';
}

Edu.createElementFromData = function (data, template) {
    try {
        let html = template;

        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            const value = data[key] || '';
            html = html.replace(new RegExp(placeholder, 'g'), value);
        });

        const templateElement = document.createElement('template');
        templateElement.innerHTML = html.trim();
        return templateElement.content.firstElementChild;
    } catch (error) {
        console.error('Error creating element from template:', error);
        return document.createElement('div');
    }
}

Edu.formatPhoneNumber = function (number, options = {}) {
    const defaults = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    };

    return new Intl.NumberFormat('ru-RU', { ...defaults, ...options }).format(number);
}

Edu.formatCurrency = function (amount, currency = 'BYN') {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(amount);
}

Edu.buildQueryString = function (params) {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
        }
    });

    return searchParams.toString();
}

Edu.getNestedValue = function (obj, path, defaultValue = null) {
    try {
        const value = path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);

        return value !== undefined ? value : defaultValue;
    } catch (error) {
        console.error('Error getting nested value:', error);
        return defaultValue;
    }
}

Edu.filterData = function (data, filters) {
    return data.filter((item) => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            const itemValue = item(key);

            if (filterValue === '' || filterValue === null || filterValue === undefined) {
                return true;
            }

            if (typeof filterValue === 'string') {
                return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
            }

            return itemValue === filterValue;
        });
    });
}

Edu.sortData = function (data, key, direction = 'asc') {
    return [...data].sort((a, b) => {
        const aValue = a(key);
        const bValue = b(key);

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

Edu.generateId = function (prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

Edu.isObject = function (value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

Edu.isArray = function (value) {
    return Array.isArray(value);
}

Edu.isEmpty = function (value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}
