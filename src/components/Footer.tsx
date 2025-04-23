import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Footer = () => {
    const { logout, isAuthenticated } = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const moscowTime = new Date(time.getTime() + (3 * 60 * 60 * 1000));
    const formattedTime = moscowTime.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    return (
        <footer style={{
            backgroundColor: '#0d0d0d',
            color: '#d2b48c',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            borderTop: '1px solid #e1a948',
            boxShadow: '0 -1px 3px rgba(0,0,0,0.2)'
        }}>
            <p style={{ margin: 0 }}>&copy; 2025 Pirates Inc. — All Rums Reserved 🦜</p>
            <p style={{ margin: '0.25rem 0' }}>Moscow Time: <strong>{formattedTime}</strong></p>
            {isAuthenticated && (
                <button
                    onClick={logout}
                    style={{
                        backgroundColor: "#e1a948",
                        color: "#0d0d0d",
                        border: "none",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        marginTop: "0.3rem"
                    }}
                >
                    ⚓ Log out
                </button>
            )}
        </footer>
    );
};

export default Footer;