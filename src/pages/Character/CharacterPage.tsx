import "./Character.css";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import CharacterView from "./CharacterView";
import BottomNav from "../../components/BottomNav.tsx"; // ← подключаем кнопки
import { useState, useEffect } from "react";

const DEFAULT_TAB = "inventory";

const CharacterPage = () => {
    const [activeTab, setActiveTab] = useState<string>(() => {
        return localStorage.getItem("activeCharacterTab") || DEFAULT_TAB;
    });

    useEffect(() => {
        localStorage.setItem("activeCharacterTab", activeTab);
    }, [activeTab]);

    return (
        <div className="character-layout">
            <LeftPanel onTabChange={setActiveTab} activeTab={activeTab} />

            <div className="character-center">
                <CharacterView activeTab={activeTab} />
            </div>

            <RightPanel setActiveTab={setActiveTab} activeTab={activeTab} />

            <BottomNav /> {/* ← вот оно */}
        </div>
    );
};

export default CharacterPage;
