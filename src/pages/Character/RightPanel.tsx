import "./RightPanel.css";
import SailingIcon from "@mui/icons-material/Sailing";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { useEffect, useState } from "react";
import { getMyShip, ShipEquipment } from "../../api/ship.ts"; // не забудь создать

const RightPanel = () => {
    const [ship, setShip] = useState<ShipEquipment | null>(null);

    useEffect(() => {
        getMyShip().then(setShip);
    }, []);

    if (!ship) return <div className="character-right">Загрузка корабля...</div>;

    const modules = [
        { label: "Парус", item: ship.sail },
        { label: "Броня", item: ship.armor },
        { label: "Пушка", item: ship.cannon },
        { label: "Мортира", item: ship.mortar },
        { label: "Гарпун", item: ship.harpoon },
        { label: "Ядра", item: ship.fireAmmo },
    ];

    return (
        <div className="character-right">
            <div className="ship-wrapper">
                <img
                    src={ship.imageUrl}
                    alt="Your Ship"
                    className="character-ship-img"
                    draggable={false}
                />
                <div className="ship-overlay" />
            </div>

            <div className="ship-description">
                <h4>{ship.name}</h4>
                <p>
                    <MilitaryTechIcon fontSize="small" />
                    Боевой рейтинг: <span className="stat-value">{ship.battleRating}</span>
                </p>
                <p>
                    <SailingIcon fontSize="small" />
                    Скорость: <span className="stat-value">{ship.speed} узлов</span>
                </p>
            </div>

            <div className="modules-grid">
                {modules.map(({ label, item }) => (
                    <div className="module-slot" key={label}>
                        <span className="slot-label">{label}</span>
                        {item ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                title={item.name}
                                className="slot-image"
                            />
                        ) : (
                            <div className="slot-placeholder">—</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RightPanel;
