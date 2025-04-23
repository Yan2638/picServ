import React, { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import { useNavigate } from "react-router-dom";
import "./SeaLocations.css";

interface Location {
    id: string;
    name: string;
    description: string;
    image: string;
    minLevel?: number;
    minAttack?: number;
    minDefense?: number;
    minSpeed?: number;
    minRepairSpeed?: number;
    cooldownUntil?: string;
}

const SeaLocations: React.FC = () => {
    const [userStats, setUserStats] = useState({
        level: 1,
        attack: 0,
        defense: 0,
        speed: 0,
        repairSpeed: 0,
    });

    const [locations, setLocations] = useState<Location[]>([]);
    const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [xpRes, statsRes, itemsRes, locRes, cooldownRes] = await Promise.all([
                    useApi.getXp(),
                    useApi.get("/stats/character-stats"),
                    useApi.get("/inventory/equipped-items"),
                    useApi.getSeaLocations(),
                    useApi.getLocationCooldowns()
                ]);

                const base = statsRes.data.stats || {};
                const items = itemsRes.data.items || [];

                const bonus = items.reduce(
                    (acc: any, item: any) => {
                        acc.attack += item.attack || 0;
                        acc.defense += item.defense || 0;
                        acc.speed += item.speed || 0;
                        acc.repairSpeed += item.repairSpeed || 0;
                        return acc;
                    },
                    { attack: 0, defense: 0, speed: 0, repairSpeed: 0 }
                );

                setUserStats({
                    level: xpRes.data.level || 1,
                    attack: (base.attack || 0) + bonus.attack,
                    defense: (base.defense || 0) + bonus.defense,
                    speed: (base.speed || 0) + bonus.speed,
                    repairSpeed: (base.repairSpeed || 0) + bonus.repairSpeed,
                });

                const locs: Location[] = locRes.data.locations || [];
                setLocations(locs);

                const now = Date.now();
                const cooldownMap: { [key: string]: number } = {};
                (cooldownRes.data.cooldowns || []).forEach((cd: any) => {
                    const until = new Date(cd.cooldownUntil).getTime();
                    cooldownMap[cd.locationId] = Math.max(0, Math.floor((until - now) / 1000));
                });
                setCooldowns(cooldownMap);
            } catch (error) {
                console.error("Ошибка при получении данных:", error);
                setError("❌ Не удалось загрузить локации.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCooldowns(prev => {
                const updated: { [key: string]: number } = {};
                let changed = false;

                for (const [key, value] of Object.entries(prev)) {
                    const next = Math.max(0, value - 1);
                    updated[key] = next;
                    if (next !== value) changed = true;
                }

                return changed ? updated : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const isLocationUnlocked = (loc: Location) => {
        const { level, attack, defense, speed, repairSpeed } = userStats;
        return (
            (loc.minLevel ?? 0) <= level &&
            (loc.minAttack ?? 0) <= attack &&
            (loc.minDefense ?? 0) <= defense &&
            (loc.minSpeed ?? 0) <= speed &&
            (loc.minRepairSpeed ?? 0) <= repairSpeed
        );
    };

    const handleEnterBattle = (locationId: string) => {
        navigate(`/battle/${locationId}`);
    };

    if (loading) {
        return <div className="sea-locations">Загрузка локаций...</div>;
    }

    if (error) {
        return <div className="sea-locations error">{error}</div>;
    }

    return (
        <div className="sea-locations">
            <h2 className="title">🌊 Морские локации</h2>
            <div className="location-grid">
                {locations.map((loc) => {
                    const unlocked = isLocationUnlocked(loc);
                    const cd = cooldowns[loc.id] ?? 0;
                    const disabled = cd > 0;

                    return (
                        <div
                            key={loc.id}
                            className={`location-card ${unlocked && !disabled ? "" : "locked"}`}
                            title={unlocked && !disabled ? "Доступно" : "Недоступно"}
                            onClick={() => unlocked && !disabled && handleEnterBattle(loc.id)}
                            style={{ cursor: unlocked && !disabled ? "pointer" : "not-allowed" }}
                        >
                            <div className="location-image-wrapper">
                                <img
                                    src={useApi.fileUrl(loc.image)}
                                    alt={loc.name}
                                    className="location-image"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/assets/sea-location-placeholder.webp";
                                    }}
                                />
                            </div>
                            <div className="location-info">
                                <h3 className="location-name">{loc.name}</h3>
                                <p className="location-desc">{loc.description}</p>
                                {disabled && (
                                    <div className="cooldown">⏳ Кулдаун: {cd}s</div>
                                )}
                                {!unlocked && (
                                    <div className="requirements">
                                        {loc.minLevel && <div>🔓 Уровень: {loc.minLevel}+</div>}
                                        {loc.minAttack && <div>🗡️ Атака: {loc.minAttack}+</div>}
                                        {loc.minDefense && <div>🛡️ Защита: {loc.minDefense}+</div>}
                                        {loc.minSpeed && <div>⚡ Скорость: {loc.minSpeed}+</div>}
                                        {loc.minRepairSpeed && <div>🔧 Починка: {loc.minRepairSpeed}+</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SeaLocations;
