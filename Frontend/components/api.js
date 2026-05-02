// ═══════════════════════════════════════════════════
//  DTCSL SHARED API CLIENT
// ═══════════════════════════════════════════════════

const API_SERVER = 'http://127.0.0.1:5005/api';

const API = {
    // 1. Fetch Helper
    fetch: async (endpoint, options = {}) => {
        const token = localStorage.getItem('dtcsl_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const res = await fetch(`${API_SERVER}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers }
            });

            if (res.status === 401) {
                localStorage.removeItem('dtcsl_token');
                window.location.href = '../AuthScreen/index.html';
                return null;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'API Error');
            }

            return await res.json();
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err.message);
            UI.showAlert(err.message, 'error');
            return null;
        }
    },

    // 2. Auth Actions
    login: (data) => API.fetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => API.fetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

    // 3. Resource Actions
    getBuses: (params) => API.fetch(`/buses${params ? `?${new URLSearchParams(params).toString()}` : ''}`),
    getRoutes: (params) => API.fetch(`/routes${params ? `?${new URLSearchParams(params).toString()}` : ''}`),
    getSchedule: (params) => {
        if (typeof params === 'string') return API.fetch(`/schedule?day=${params}`);
        return API.fetch(`/schedule${params ? `?${new URLSearchParams(params).toString()}` : ''}`);
    },
    getCrew: (params) => {
        if (typeof params === 'string') return API.fetch(`/crew?role=${params}`);
        return API.fetch(`/crew${params ? `?${new URLSearchParams(params).toString()}` : ''}`);
    },
    getDepots: () => API.fetch('/depots'),
    getDashboard: () => API.fetch('/dashboard'),

    // 4. Update/Delete
    updateRes: (path, id, data) => API.fetch(`/${path}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteRes: (path, id) => API.fetch(`/${path}/${id}`, { method: 'DELETE' }),

    // 5. Smart Scheduling
    generateSchedule: (data) => API.fetch('/schedule/auto-generate', { method: 'POST', body: JSON.stringify(data || {}) })
};

// UI Helper within API (for simplicity)
UI.showAlert = (msg, type = 'success') => {
    const banner = document.createElement('div');
    banner.className = `alert-banner ${type === 'error' ? 'alert-error' : 'alert-success'}`;
    banner.style = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 15px 25px; border-radius: 8px; font-weight: 500;
        color: white; background: ${type === 'error' ? '#ef4444' : '#22c55e'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        animation: slideIn 0.3s ease-out;
    `;
    banner.innerText = msg;
    document.body.appendChild(banner);
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 500);
    }, 3000);
};

// Animation keyframes injected dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;
document.head.appendChild(style);
