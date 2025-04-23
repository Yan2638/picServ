// frontend/src/api/auth.ts
import axios from "../api/axiosInstance"; // 👈 всё верно

/**
 * Вход пользователя по email и паролю.
 */
export const loginUser = async (email: string, password: string) => {
    const res = await axios.post("/auth/login", { email, password });
    return res.data;
};

/**
 * Регистрация нового пользователя с email, паролем и именем.
 */
export const registerUser = async (email: string, password: string, username: string) => {
    const res = await axios.post("/auth/register", {
        email,
        password,
        username
    });
    return res.data;
};
