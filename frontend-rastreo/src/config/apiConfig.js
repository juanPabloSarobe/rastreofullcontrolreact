/**
 * Configuración centralizada de APIs
 * Define qué backend usar para cada endpoint
 */

// URLs de los backends
const API_URLS = {
  NEW_BACKEND: import.meta.env.VITE_API_NEW_BACKEND || 'http://localhost:3002',
  OLD_BACKEND: import.meta.env.VITE_API_OLD_BACKEND || 'http://localhost:3000',
};

function resolveLocalhostForLan(url) {
  if (typeof window === 'undefined' || !url) return url;

  try {
    const parsed = new URL(url);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const currentHost = window.location.hostname;
    const isCurrentHostLocal = currentHost === 'localhost' || currentHost === '127.0.0.1';

    if (isLocalHost && !isCurrentHostLocal) {
      parsed.hostname = currentHost;
      return parsed.toString().replace(/\/$/, '');
    }

    return url;
  } catch {
    return url;
  }
}

// Mapeo de endpoints a su backend correspondiente
// 'new' = nuevo backend (backend-informes/src)
// 'old' = backend viejo (actualmente en uso)
const ENDPOINT_MAP = {
  // Ralentís - nuevo backend
  ralentis: 'new',
  conductores: 'new',
  
  // Otros endpoints seguirán aquí conforme migremos
  // informes: 'new',
};

/**
 * Obtiene la URL base para un endpoint específico
 * @param {string} endpoint - Nombre del endpoint (ej: 'ralentis', 'informes')
 * @returns {string} URL base del backend correspondiente
 */
export function getBackendUrl(endpoint) {
  const backendType = ENDPOINT_MAP[endpoint] || 'old';
  const key = backendType === 'new' ? 'NEW_BACKEND' : 'OLD_BACKEND';
  const baseUrl = API_URLS[key];

  if (key === 'NEW_BACKEND') {
    return resolveLocalhostForLan(baseUrl);
  }

  return baseUrl;
}

/**
 * Realiza un fetch con el backend apropiado
 * @param {string} endpoint - Nombre del endpoint
 * @param {string} path - Ruta dentro del endpoint (ej: '/api/ralentis')
 * @param {object} options - Opciones fetch (method, body, headers, etc)
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, path, options = {}) {
  const baseUrl = getBackendUrl(endpoint);
  const url = `${baseUrl}${path}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    error.status = response.status;
    error.response = response;
    throw error;
  }
  
  return response.json();
}

/**
 * Obtiene la configuración actual (útil para debugging)
 */
export function getApiConfig() {
  return {
    urls: API_URLS,
    endpoints: ENDPOINT_MAP,
  };
}

export default {
  getBackendUrl,
  apiFetch,
  getApiConfig,
  API_URLS,
  ENDPOINT_MAP,
};
