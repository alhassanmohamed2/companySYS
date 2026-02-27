import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = Cookies.get('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refresh = Cookies.get('refresh_token');
            if (refresh) {
                try {
                    const { data } = await axios.post(`${API_BASE}/token/refresh/`, { refresh });
                    Cookies.set('access_token', data.access);
                    original.headers.Authorization = `Bearer ${data.access}`;
                    return api(original);
                } catch {
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// ── Auth ──
export const login = (username: string, password: string) =>
    api.post('/token/', { username, password });

// ── Projects ──
export const getProjects = () => api.get('/projects/');
export const getProject = (id: number) => api.get(`/projects/${id}/`);
export const createProject = (data: Record<string, unknown>) => api.post('/projects/', data);
export const updateProject = (id: number, data: Record<string, unknown>) => api.patch(`/projects/${id}/`, data);
export const deleteProject = (id: number) => api.delete(`/projects/${id}/`);

// ── Tasks ──
export const getTasks = (params?: Record<string, string>) => api.get('/tasks/', { params });
export const getTask = (id: number) => api.get(`/tasks/${id}/`);
export const createTask = (data: Record<string, unknown>) => api.post('/tasks/', data);
export const updateTask = (id: number, data: Record<string, unknown>) => api.patch(`/tasks/${id}/`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}/`);

// ── Notifications ──
export const getNotifications = () => api.get('/notifications/');
export const markNotificationRead = (id: number) => api.post(`/notifications/${id}/mark_read/`);

// ── Assets ──
export const getAssets = (params?: Record<string, string>) => api.get('/assets/', { params });
export const createAsset = (data: Record<string, unknown>) => api.post('/assets/', data);
export const deleteAsset = (id: number) => api.delete(`/assets/${id}/`);

// ── Users ──
export const getUsers = () => api.get('/users/');
export const createUser = (data: Record<string, unknown>) => api.post('/users/', data);
export const updateUser = (id: number, data: Record<string, unknown>) => api.patch(`/users/${id}/`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}/`);
export const getMe = () => api.get('/users/me/');
export const updateMe = (data: Record<string, unknown>) => api.patch('/users/me/', data);
export const changePassword = (oldPassword: string, newPassword: string) =>
    api.post('/users/change-password/', { old_password: oldPassword, new_password: newPassword });

export default api;
