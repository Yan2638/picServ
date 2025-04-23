import "./CharacterNav.css";

interface NavItem {
    icon: string;
    label: string;
    value: string;
}

const navItems: NavItem[] = [
    { icon: "✉️", label: "Почта", value: "mail" },
    { icon: "📦", label: "Трюм", value: "hold" },
    { icon: "🧰", label: "Сундук", value: "chest" }, // 👈 добавлено
    { icon: "💎", label: "Артефакты", value: "inventory" },
    { icon: "🛳️", label: "Корабль", value: "ship" },
    { icon: "🧠", label: "Таланты", value: "skills" },
    { icon: "🧔", label: "Профиль", value: "profile" },
    { icon: "⚙️", label: "Настройки", value: "settings" },
    { icon: "🏆", label: "Достижения", value: "achievements" },
];

interface Props {
    onTabChange: (tab: string) => void;
    activeTab: string;
}

const CharacterNav = ({ onTabChange, activeTab }: Props) => {
    return (
        <div className="char-nav">
            {navItems.map((item) => (
                <button
                    key={item.value}
                    className={`char-nav-btn ${activeTab === item.value ? "active" : ""}`}
                    onClick={() => onTabChange(item.value)}
                    title={item.label}
                >
                    {item.icon} {item.label}
                </button>
            ))}
        </div>
    );
};

export default CharacterNav;
