/**
 * Cliente API optimizado para manejar peticiones con CSRF y errores
 */
class ApiClient {
    constructor() {
        this.csrfToken = null;
        this.refreshPromise = null;
    }

    async getCsrfToken() {
        if (!this.csrfToken) {
            const metaToken = document.querySelector('meta[name="csrf-token"]');
            this.csrfToken = metaToken ? metaToken.getAttribute('content') : null;
        }
        return this.csrfToken;
    }

    async refreshCsrfToken() {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = fetch('/csrf-token', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            this.csrfToken = data.token;
            // Actualizar el meta tag
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.token);
            }
            return data.token;
        })
        .finally(() => {
            this.refreshPromise = null;
        });

        return this.refreshPromise;
    }

    async request(url, options = {}) {
        const token = await this.getCsrfToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': token
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            
            // Si es 419 (CSRF token mismatch), intentar refrescar el token
            if (response.status === 419) {
                console.log('CSRF token expired, refreshing...');
                await this.refreshCsrfToken();
                
                // Reintentar con el nuevo token
                finalOptions.headers['X-CSRF-TOKEN'] = this.csrfToken;
                return fetch(url, finalOptions);
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    async post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}

// Instancia global
export const apiClient = new ApiClient();
export default apiClient;