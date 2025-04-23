import React from "react";
import "./NavMenu.css";
import { useNavigate } from "react-router-dom";

interface Props {
    locationId: string;
}

const menuItems = [
    { name: "Море", icon: "🌊", path: "/sea" },
    { name: "Битвы", icon: "⚔️" },
    { name: "Монстры", icon: "🐙" },
    { name: "Осада порта", icon: "🏴‍☠️" },
    { name: "Путешествие", icon: "🧭" },
    { name: "Таверна", icon: "🍻" },
    { name: "Рынок", icon: "🛒" },
    { name: "Верфь", icon: "🛠️", path: "/shipyard" },

];

const NavMenu: React.FC<Props> = ({ locationId }) => {
    const navigate = useNavigate();

    const handleClick = (item: typeof menuItems[number]) => {
        if (item.path) {
            navigate(item.path);
        } else {
            console.log(`Clicked ${item.name} at ${locationId}`);
        }
    };

    return (
        <nav className="nav-menu">
            {menuItems.map((item) => (
                <button
                    key={item.name}
                    title={item.name}
                    className="nav-button"
                    onClick={() => handleClick(item)}
                >
                    {item.icon} {item.name}
                </button>
            ))}
        </nav>
    );
};

export default NavMenu;
