import "./BottomNav.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentCity } = useAuth();

    const handleGoToCity = () => {
        const cityPath = `/cities/${currentCity}`;
        if (location.pathname === cityPath) {
            // 💫 Просто обновим страницу (рефреш)
            window.location.reload();
        } else {
            navigate(cityPath);
        }
    };

    const handleGoToCharacter = () => {
        navigate("/character");
    };

    const handleGoToFleet = () => {
        navigate("/fleet"); // Можно создать позже
    };

    return (
        <div className="bottom-nav">
            <button
                className="bottom-nav-btn"
                title="Вернуться в город"
                onClick={handleGoToCity}
            >
                🏙️ В город
            </button>
            <button
                className="bottom-nav-btn"
                title="Профиль пирата"
                onClick={handleGoToCharacter}
            >
                🧔 Мой пират
            </button>
            <button
                className="bottom-nav-btn"
                title="Флотилия"
                onClick={handleGoToFleet}
            >
                🚢 Мой флот
            </button>
        </div>
    );
};

export default BottomNav;
