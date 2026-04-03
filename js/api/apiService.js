import { Edu } from '../eduPlatform.js';

Edu.apiRequest = function (path, options) {
    let cfg = Edu.apiConfig || {};
    let base = cfg.baseUrl || '';
    let url = (base ? base.replace(/\/$/, '') : '') + (path ? String(path) : '');
    let opts = options || {};
    let headers = opts.headers || {};
    let key = cfg.apiKey;
    if (key && !headers['X-API-Key'] && !headers['x-api-key']) {
        headers = Object.assign({}, headers, { 'X-API-Key': key });
    }
    opts = Object.assign({}, opts, { headers: headers });
    return window.fetch(url, opts);
};

export class ApiService {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async get(endpoint, params = {}) {
        try {
            const queryParams = new URLSearchParams({
                ...params,
                ...(this.apiKey && { api_key: this.apiKey }),
            }).toString();

            const url = `${this.baseUrl}${endpoint}?${queryParams}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    async post(endpoint, data) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }

    async fetchFromAPI(endpoint, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const url = `${this.baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
}

Edu.ApiService = ApiService;
