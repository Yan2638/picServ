import { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import "./CharacterAvatar.css";

interface User {
    username: string;
    avatarUrl?: string;
    lastActive?: string;
}

const CharacterAvatar = () => {
    const [user, setUser] = useState<User | null>(null);
    const [hp, setHp] = useState<number>(100);
    const [maxHp, setMaxHp] = useState<number>(100);
    const [level, setLevel] = useState<number>(1);
    const [xp, setXp] = useState<number>(0);
    const [xpToNextLevel, setXpToNextLevel] = useState<number>(100);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchAll = async () => {
            try {
                const [userRes, hpRes, xpRes] = await Promise.all([
                    useApi.getUser(),
                    useApi.getHealth(), // ✅ теперь должен возвращать и hp и maxHp
                    useApi.getXp(),
                ]);

                if (!isMounted) return;

                setUser(userRes.data.user);
                setHp(hpRes.data.hp ?? 100);
                setMaxHp(hpRes.data.maxHp ?? 100); // ✅ используем maxHp с сервера

                const { xp, level, xpToNextLevel } = xpRes.data;
                setXp(xp);
                setLevel(level);
                setXpToNextLevel(xpToNextLevel);

            } catch (err) {
                console.error("❌ Ошибка при загрузке данных:", err);
                if (isMounted) setError("Ошибка при загрузке профиля");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAll();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isLoading) return <p>⏳ Загрузка профиля...</p>;
    if (error) return <p>❌ {error}</p>;

    const avatarSrc = user?.avatarUrl
        ? useApi.fileUrl(user.avatarUrl)
        : "/assets/avatar-pirate.webp";


    const getStatus = () => {
        if (!user?.lastActive) return { label: "offline", color: "gray" };
        const last = new Date(user.lastActive).getTime();
        const now = Date.now();
        const diff = (now - last) / 1000;
        if (diff < 600) return { label: "online", color: "green" };
        if (diff < 900) return { label: "away", color: "yellow" };
        return { label: "offline", color: "gray" };
    };

    const status = getStatus();
    const hpPercent = Math.min(100, (hp / maxHp) * 100);
    const xpPercent = Math.min(100, (xp / (xp + xpToNextLevel)) * 100);

    return (
        <div className="char-avatar">
            <img
                src={avatarSrc}
                alt="Ваш аватар"
                className="char-avatar-img"
                draggable={false}
                onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/avatar-pirate.webp";
                }}
            />
            <div className="char-avatar-info">
                <h3 className="char-avatar-name">{user?.username || "Пират без имени"}</h3>
                <p className="char-avatar-level">⚓ Уровень: {level}</p>
                <div className="char-avatar-status">
                    <span className="status-dot" style={{ backgroundColor: status.color }} />
                    <span className="status-text">{status.label}</span>
                </div>

                {/* 🔴 HP BAR */}
                <div className="hp-bar-wrapper">
                    <div className="hp-bar-bg">
                        <div
                            className="hp-bar-fill"
                            style={{ width: `${hpPercent}%` }}
                        ></div>
                    </div>
                    <div className="hp-bar-text">{hp} / {maxHp} HP</div>
                </div>

                {/* 🔵 XP BAR */}
                <div className="xp-bar-wrapper">
                    <div className="xp-bar-bg">
                        <div
                            className="xp-bar-fill"
                            style={{ width: `${xpPercent}%` }}
                        ></div>
                    </div>
                    <div className="xp-bar-text">{xp} / {xp + xpToNextLevel} XP</div>
                </div>
            </div>
        </div>
    );
};

export default CharacterAvatar;
