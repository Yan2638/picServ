import { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import "./CharacterStatsPanel.css";

interface Resource {
    type: string;
    amount: number;
}

interface StatItem {
    attack: number;
    defense: number;
    speed: number;
    maneuver: number;
    repairSpeed: number;
    luck: number;
}

interface EquippedItem {
    id: number;
    name: string;
    rarity?: string;
    imageUrl: string;
    attack?: number;
    defense?: number;
    speed?: number;
    maneuver?: number;
    repairSpeed?: number;
    luck?: number;
}

const defaultStats: StatItem = {
    attack: 0,
    defense: 0,
    speed: 0,
    maneuver: 0,
    repairSpeed: 0,
    luck: 0,
};

const CharacterStats = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [baseStats, setBaseStats] = useState<StatItem>(defaultStats);
    const [bonusStats, setBonusStats] = useState<StatItem>(defaultStats);

    useEffect(() => {
        const loadStatsAndResources = async () => {
            try {
                const [resRes, statsRes, equipRes] = await Promise.all([
                    useApi.getResources(),
                    useApi.get("/stats/character-stats"),
                    useApi.get("/inventory/equipped-items")
                ]);

                if (resRes.data.success) {
                    setResources(resRes.data.resources);
                }

                if (statsRes.data.success && statsRes.data.stats) {
                    setBaseStats(statsRes.data.stats);
                }

                if (equipRes.data.success && equipRes.data.items) {
                    const bonuses: StatItem = { ...defaultStats };

                    equipRes.data.items.forEach((item: EquippedItem) => {
                        bonuses.attack += item.attack ?? 0;
                        bonuses.defense += item.defense ?? 0;
                        bonuses.speed += item.speed ?? 0;
                        bonuses.maneuver += item.maneuver ?? 0;
                        bonuses.repairSpeed += item.repairSpeed ?? 0;
                        bonuses.luck += item.luck ?? 0;
                    });

                    setBonusStats(bonuses);
                }
            } catch (error) {
                console.error("❌ Ошибка при загрузке характеристик или ресурсов:", error);
            }
        };

        loadStatsAndResources();
    }, []);

    const emojis: Record<string, string> = {
        GOLD: "💰",
        RUM: "🥃",
        PIASTRES: "🪙",
        WOOD: "🪵",
        SUGAR: "🍬",
        CLOTH: "🧵",
        METAL: "🛠️",
        KEY: "🗝️"
    };

    const labels: Record<string, string> = {
        GOLD: "Золото",
        RUM: "Ром",
        PIASTRES: "Дублоны",
        WOOD: "Доски",
        SUGAR: "Сахар",
        CLOTH: "Ткань",
        METAL: "Металл",
        KEY: "Ключи"
    };

    const sortedResources = [...resources].sort((a, b) => a.type.localeCompare(b.type));

    const renderStat = (label: string, base: number, bonus: number) => {
        const total = base + bonus;
        return (
            <li key={label}>
                <strong>{label}:</strong> {total}
                {bonus > 0 && <span className="bonus"> (+{bonus})</span>}
                {bonus < 0 && <span className="malus"> ({bonus})</span>}
            </li>
        );
    };

    return (
        <div className="char-stats-panel">
            <h3>🧔 Характеристики персонажа</h3>
            <ul className="char-stats-list">
                {renderStat("🗡️ Атака", baseStats.attack, bonusStats.attack)}
                {renderStat("🛡️ Защита", baseStats.defense, bonusStats.defense)}
                {renderStat("⚡ Скорость", baseStats.speed, bonusStats.speed)}
                {renderStat("🚢 Маневренность", baseStats.maneuver, bonusStats.maneuver)}
                {renderStat("🔧 Починка", baseStats.repairSpeed, bonusStats.repairSpeed)}
                {renderStat("🍀 Удача", baseStats.luck, bonusStats.luck)}
            </ul>

            <h3>📦 Ресурсы</h3>
            <div className="char-stats-grid">
                {sortedResources.map((res) => (
                    <div className="stat-item" key={res.type}>
                        <span className="stat-emoji">{emojis[res.type] || "❓"}</span>
                        <span className="stat-label">{labels[res.type] || res.type}</span>
                        <span className="stat-amount">{res.amount ?? 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CharacterStats;
