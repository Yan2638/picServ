import { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import "./CharacterStats.css";

interface Resource {
    type: string;
    amount: number;
}

const CharacterStats = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        useApi.getResources()
            .then(res => {
                if (res.data.success) {
                    setResources(res.data.resources);
                }
            })
            .catch(() => {
                console.error("❌ Ошибка при получении ресурсов");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const emojis: Record<string, string> = {
        GOLD: "💰",
        RUM: "🥃",
        PIASTRES: "🪙"
    };

    const labels: Record<string, string> = {
        GOLD: "Золото",
        RUM: "Ром",
        PIASTRES: "Дублоны"
    };

    const displayTypes = ["GOLD", "RUM", "PIASTRES"];

    const filtered = resources.filter(res => displayTypes.includes(res.type));

    if (isLoading) {
        return <div className="char-stats-text">⏳ Загрузка ресурсов...</div>;
    }

    if (!filtered.length) {
        return <div className="char-stats-text">🕳️ У вас пока нет ресурсов.</div>;
    }

    return (
        <div
            className="char-stats-text"
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${filtered.length}, 1fr)`,
                gap: "8px",
                paddingLeft: "8px",
                maxWidth: "100%",
                color: "#fff"
            }}
        >
            {filtered.map((res) => (
                <div
                    key={res.type}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "0.85rem"
                    }}
                >
                    <div style={{ fontSize: "1.25rem" }}>{emojis[res.type] || "❓"}</div>
                    <div style={{ fontWeight: 600 }}>{res.amount ?? 0}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                        {labels[res.type] || res.type}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CharacterStats;
