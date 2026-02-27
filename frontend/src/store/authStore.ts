import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin } from '../services/api';

export type UserRole = 'ADMIN' | 'CEO' | 'PM' | 'DEV';

interface DecodedToken {
    user_id: number;
    username: string;
    role: UserRole;
    exp: number;
}

interface AuthState {
    isAuthenticated: boolean;
    userId: number | null;
    username: string | null;
    role: UserRole | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    userId: null,
    username: null,
    role: null,

    login: async (username, password) => {
        const { data } = await apiLogin(username, password);
        Cookies.set('access_token', data.access, { expires: 1 });
        Cookies.set('refresh_token', data.refresh, { expires: 7 });
        const decoded = jwtDecode<DecodedToken>(data.access);
        set({
            isAuthenticated: true,
            userId: decoded.user_id,
            username: decoded.username ?? username,
            role: decoded.role ?? 'DEV',
        });
    },

    logout: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({ isAuthenticated: false, userId: null, username: null, role: null });
    },

    hydrate: () => {
        const token = Cookies.get('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                if (decoded.exp * 1000 > Date.now()) {
                    set({
                        isAuthenticated: true,
                        userId: decoded.user_id,
                        username: decoded.username,
                        role: decoded.role ?? 'DEV',
                    });
                }
            } catch {
                Cookies.remove('access_token');
            }
        }
    },
}));
