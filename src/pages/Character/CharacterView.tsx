import SettingsPanel from "./SettingsPanel";
import TreasureChestPanel from "./TreasureChestPanel"; // 👈 импортируем
import EquippedItemsPanel from "./EquippedItemsPanel";
import CharacterStatsPanel from "./CharacterStatsPanel";


interface Props {
    activeTab: string;
}

const CharacterView: React.FC<Props> = ({ activeTab }) => {
    switch (activeTab) {
        case "inventory":
            return (
                <div className="character-panel">
                    <EquippedItemsPanel />
                </div>
            );
            
        case "mail":
            return <div className="character-panel">📨 Здесь твоя почта</div>;
        case "skills":
            return <div className="character-panel">📜 Тут навыки пирата</div>;
        case "achievements":
            return <div className="character-panel">🏆 А тут достижения</div>;
        
            case "profile":
            return (
                <div className="character-panel">
                    <CharacterStatsPanel />
                </div>
            );

        case "settings":
            return (
                <div className="character-panel">
                    <SettingsPanel />
                </div>
            );
        case "chest":
            return (
                <div className="character-panel">
                    <TreasureChestPanel />
                </div>
            );
        default:
            return <div className="character-panel">🤷‍♂️ Неизвестный раздел</div>;
    }
};

export default CharacterView;
