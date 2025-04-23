import CharacterAvatar from "./CharacterAvatar";
import CharacterStats from "./CharacterStats";
import CharacterNav from "./CharacterNav";

interface Props {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const LeftPanel = ({ activeTab, onTabChange }: Props) => {
    return (
        <div className="character-left">
            <CharacterAvatar />
            <CharacterStats />
            <CharacterNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
};

export default LeftPanel;
