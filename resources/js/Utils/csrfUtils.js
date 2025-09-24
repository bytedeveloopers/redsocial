/**
 * Utilidades para manejo de token CSRF
 */

// Cache del token CSRF
let csrfToken = null;
let lastTokenRefresh = 0;
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutos

/**
 * Obtiene el token CSRF del meta tag
 */
export const getCsrfToken = () => {
    if (!csrfToken || Date.now() - lastTokenRefresh > TOKEN_REFRESH_INTERVAL) {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            csrfToken = metaTag.getAttribute('content');
            lastTokenRefresh = Date.now();
        }
    }
    return csrfToken;
};

/**
 * Actualiza el token CSRF en todos los meta tags
 */
export const updateCsrfToken = (newToken) => {
    csrfToken = newToken;
    lastTokenRefresh = Date.now();
    
    const metaTags = document.querySelectorAll('meta[name="csrf-token"]');
    metaTags.forEach(tag => {
        tag.setAttribute('content', newToken);
    });
};

/**
 * Función para hacer peticiones fetch con manejo automático de CSRF
 */
export const fetchWithCsrf = async (url, options = {}) => {
    const token = getCsrfToken();
    
    const defaultHeaders = {
        'X-CSRF-TOKEN': token,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    };
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, config);
        
        // Si obtenemos 419 (CSRF token mismatch), intentar refrescar el token
        if (response.status === 419) {
            console.warn('CSRF token expired, attempting to refresh...');
            
            // Intentar obtener un nuevo token
            try {
                const refreshResponse = await fetch('/csrf-token', {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });
                
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    updateCsrfToken(data.token);
                    
                    // Reintentar la petición original con el nuevo token
                    config.headers['X-CSRF-TOKEN'] = data.token;
                    return await fetch(url, config);
                }
            } catch (refreshError) {
                console.error('Failed to refresh CSRF token:', refreshError);
            }
            
            // Si no se puede refrescar, recargar la página
            console.warn('CSRF token refresh failed, reloading page...');
            window.location.reload();
            return;
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

/**
 * Interceptor para Axios si se usa en el futuro
 */
export const setupAxiosInterceptor = (axiosInstance) => {
    // Request interceptor - añadir token CSRF
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = getCsrfToken();
            if (token) {
                config.headers['X-CSRF-TOKEN'] = token;
            }
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - manejar errores 419
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 419) {
                console.warn('CSRF token expired, reloading page...');
                window.location.reload();
            }
            return Promise.reject(error);
        }
    );
};