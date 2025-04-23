import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ClassSelectionModal from "../components/ClassSelectionModal";
import { useApi } from "../api/useApi";

const Layout = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await useApi.getUser();
                const userClass = res.data.user?.class;
                if (!userClass) {
                    setShowModal(true);
                }
            } catch (err) {
                console.error("Ошибка при получении пользователя:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#e1a948"
            }}>
                ⚓ Загружаем палубу...
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <main style={{ flex: 1, padding: "2rem", width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
                <Outlet />
            </main>
            <Footer />
            {showModal && <ClassSelectionModal onClose={() => setShowModal(false)} />}
        </div>
    );
};

export default Layout;
