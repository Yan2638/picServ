import { useEffect, useState } from "react";
import { useApi } from "../api/useApi";
import "./ClassSelectionModal.css";

interface Props {
    onClose: () => void;
}

interface CharacterClass {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    bonusStats: {
        attack: number;
        defense: number;
        speed: number;
        maneuver: number;
        repairSpeed: number;
        luck: number;
    };
}

const ClassSelectionModal: React.FC<Props> = ({ onClose }) => {
    const [classes, setClasses] = useState<CharacterClass[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        useApi.getCharacterClasses()
            .then(res => setClasses(res.data.classes))
            .catch(err => {
                console.error("Ошибка при загрузке классов:", err);
                setError("❌ Не удалось загрузить классы.");
            });
    }, []);

    const handleSelect = async (selectedClass: string) => {
        try {
            setLoading(true);
            await useApi.chooseCharacterClass(selectedClass);
            onClose();
            window.location.reload();
        } catch (err) {
            console.error("Ошибка при выборе класса", err);
            setError("❌ Ошибка при выборе класса");
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>🧭 Выбери свой путь</h2>
                <p>Класс можно выбрать <strong>один раз</strong>. Будь внимателен!</p>

                {error && <p className="error-message">{error}</p>}

                <div className="class-grid">
                    {classes.map((cls) => (
                        <div key={cls.id} className="class-card">
                            {cls.imageUrl && (
                                <img
                                    src={`http://localhost:5000${cls.imageUrl}`}
                                    alt={cls.name}
                                    className="class-image"
                                />
                            )}
                            <div className="class-info">
                                <h3>{cls.name}</h3>
                                <p>{cls.description}</p>
                                <ul className="stat-bonuses">
                                    {Object.entries(cls.bonusStats).map(([key, value]) =>
                                        value !== 0 ? (
                                            <li key={key}>
                                                <span>{getStatLabel(key)}:</span> +{value}
                                            </li>
                                        ) : null
                                    )}
                                </ul>
                                <button
                                    className="select-button"
                                    disabled={loading}
                                    onClick={() => handleSelect(cls.id)}
                                >
                                    Выбрать класс
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const getStatLabel = (key: string) => {
    const labels: Record<string, string> = {
        attack: "🗡️ Атака",
        defense: "🛡️ Защита",
        speed: "⚡ Скорость",
        maneuver: "🚢 Маневренность",
        repairSpeed: "🔧 Починка",
        luck: "🍀 Удача"
    };
    return labels[key] || key;
};

export default ClassSelectionModal;
