import axios from 'axios';

// 📦 Адрес API (можно задать через .env)
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
export const FILE_BASE = import.meta.env.VITE_FILE_URL ?? 'http://localhost:5000';

// ⚙️ Создаём инстанс axios с поддержкой куки
const axiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // 👈 это позволяет отправлять и принимать cookie
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // ⏱️ на всякий пожарный, чтобы не висло вечно
});

// 🧯 Глобальная обработка ошибок (можно добавить если надо)

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('🚨 Axios error:', error);
        return Promise.reject(error);
    }
);


export default axiosInstance;
