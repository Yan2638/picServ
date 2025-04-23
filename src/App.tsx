import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import Layout from "./layouts/Layout";
import Tortuga from "./pages/cities/Tortuga";
import Atlantis from "./pages/cities/Atlantis";
import Gavana from "./pages/cities/Gavana";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import { useAuth } from "./context/AuthContext";
import CharacterPage from "./pages/Character/CharacterPage";
import SeaLocations from "./pages/Sea/SeaLocations";
import BattleArena from "./pages/Sea/Battle/BattleArena"; // ✅ Импортируем арену
import ShipyardPage from "./pages/Shipyard/ShipyardPage";

function App() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="splash">Loading the deck...</div>;
    }

    return (
        <Routes>
            {/* 🔓 Публичные маршруты */}
            {!isAuthenticated && (
                <>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            )}

            {/* 🔐 Приватные маршруты */}
            {isAuthenticated && (
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/cities/gavana" replace />} />
                    <Route path="/cities/gavana" element={<Gavana />} />
                    <Route path="/cities/tortuga" element={<Tortuga />} />
                    <Route path="/cities/atlantis" element={<Atlantis />} />
                    <Route path="/character" element={<CharacterPage />} />
                    <Route path="/sea" element={<SeaLocations />} />
                    <Route path="/battle/:locationId" element={<BattleArena />} /> {/* ⚔️ Новый маршрут */}
                    <Route path="/shipyard" element={<ShipyardPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            )}

            {/* 👮‍♂️ Защита от ручного входа на login/register */}
            {isAuthenticated &&
                (location.pathname === "/login" || location.pathname === "/register") && (
                    <Route path="*" element={<Navigate to="/cities/gavana" replace />} />
                )}
        </Routes>
    );
}

export default App;
