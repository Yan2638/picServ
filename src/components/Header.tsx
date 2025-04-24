import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useApi } from "../api/useApi";
import BottomNav from "./BottomNav";

const Header = () => {
    const [messages, setMessages] = useState(false);

    const [level, setLevel] = useState<number>(1);
    const [xp, setXp] = useState<number>(0);
    const [xpToNextLevel, setXpToNextLevel] = useState<number>(100);
    const [progressPercent, setProgressPercent] = useState<number>(0);

    const [rum, setRum] = useState<number>(0);
    const [gold, setGold] = useState<number>(0);
    const [doubloons, setDoubloons] = useState<number>(0);

    const fetchData = async () => {
        try {
            const [xpRes, resRes] = await Promise.all([
                useApi.getXp(),
                useApi.getResources()
            ]);

            const { xp, level, xpToNextLevel } = xpRes.data;
            const percent = Math.min(100, Math.floor((xp / (xp + xpToNextLevel)) * 100));
            setXp(xp);
            setLevel(level);
            setXpToNextLevel(xpToNextLevel);
            setProgressPercent(percent);

            const list = resRes.data.resources || [];
            const resourceMap = Object.fromEntries(
                list.map((r: { type: string; amount: number }) => [r.type.toUpperCase(), r.amount])
            );

            setRum(resourceMap.RUM || 0);
            setGold(resourceMap.GOLD || 0);
            setDoubloons(resourceMap.PIASTRES || 0);
        } catch (err) {
            console.error("Ошибка при получении данных:", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // автообновление

        const handleUpdateResources = () => {
            fetchData(); // ручной вызов по событию
        };

        window.addEventListener("update-resources", handleUpdateResources);

        return () => {
            clearInterval(interval);
            window.removeEventListener("update-resources", handleUpdateResources);
        };
    }, []);

    return (
        <header
            style={{
                backgroundColor: "#0d0d0d",
                color: "#d2b48c",
                padding: "0.5rem 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                borderBottom: "1px solid #e1a948",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                position: "relative", // для позиционирования нижней навигации внутри хедера
            }}
        >
            <div style={{ fontWeight: "bold", fontSize: "1rem" }}>🏴‍☠️ Pirate Game</div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* 🧠 Уровень и опыт */}
                <div title={`Level ${level}, XP: ${xp} / ${xp + xpToNextLevel}`}>
                    <div style={{ fontSize: "0.7rem", color: "#ccc" }}>
                        Level {level} — {progressPercent}%
                    </div>
                    <div style={{ background: "#333", borderRadius: "5px", width: "100px", height: "8px", overflow: "hidden" }}>
                        <div
                            style={{
                                width: `${progressPercent}%`,
                                height: "100%",
                                backgroundColor: "#e1a948",
                                transition: "width 0.3s ease-in-out"
                            }}
                        />
                    </div>
                </div>

                {/* 💰 Ресурсы */}
                <div title="Ром">🥃 {rum}</div>
                <div title="Золото">💰 {gold}</div>
                <div title="Дублоны">🪙 {doubloons}</div>

                <div title={messages ? "У вас есть новые сообщения" : "Нет новых сообщений"}>
                    <FaEnvelope
                        color={messages ? "#e1a948" : "#555"}
                        size={16}
                        style={{ cursor: "pointer" }}
                    />
                </div>
            </div>

            {/* BottomNav */}
            <div style={{
                position: "absolute",
                bottom: "0", // прижимаем к низу хедера
                left: "0",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                zIndex: 1, // выше чем все элементы хедера
            }}>
                <BottomNav />
            </div>
        </header>
    );
};

export default Header;
