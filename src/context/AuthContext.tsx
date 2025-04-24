import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import axiosInstance from "../api/axiosInstance";

interface User {
    id: number;
    email: string;
    username: string;
    role: string;
    createdAt: string;
    avatarUrl?: string;
    city?: string;
    xp?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    currentCity: string;
    setCurrentCity: (city: string) => void;
    refreshUser: () => Promise<void>; // 👈 на случай ручной перезагрузки
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentCity, setCurrentCityState] = useState("gavana");

    const setCurrentCity = (city: string) => {
        setCurrentCityState(city);
        localStorage.setItem("currentCity", city);
    };

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (err) {
            console.warn("Logout failed", err);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("currentCity");
        }
    };

    const refreshUser = async () => {
        try {
            const res = await axiosInstance.get("/user/me");
            if (res.data?.success) {
                setUser(res.data.user);
                setIsAuthenticated(true);
                const userCity = res.data.user.city || "gavana";
                setCurrentCityState(userCity);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error("❌ Ошибка при обновлении пользователя:", err);
            setUser(null);
            setIsAuthenticated(true);
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                currentCity,
                setCurrentCity,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within AuthProvider");
    return context;
};
