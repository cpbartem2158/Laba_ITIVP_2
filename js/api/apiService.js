import { API_CONFIG } from './config.js';

export async function apiRequest(path, options) {
    let baseUrl = API_CONFIG.backend.baseUrl;
    let apiKey = API_CONFIG.backend.apiKey;
    let url = (baseUrl ? baseUrl.replace(/\/$/, '') : '') + (path ? String(path) : '');
    let headers = options.headers || {};
    if (apiKey && !headers['X-API-Key'] && !headers['x-api-key']) {
        headers = Object.assign({}, headers, { 'X-API-Key': apiKey });
    }
    options = Object.assign({}, options, { headers: headers });
    return window.fetch(url, options);
}
