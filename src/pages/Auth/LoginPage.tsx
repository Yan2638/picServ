import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "../../assets/logo.webp";
import axios from "../../api/axiosInstance";
import "./LoginPage.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await axios.post("/auth/login", { email, password });
            if (data.success) {
                login();
                setTimeout(() => {
                    setLoading(false);
                    navigate("/");
                }, 1000);
            } else {
                setError("Invalid login.");
                setLoading(false);
            }
        } catch (err: any) {
            setError("Server error. Check your sails.");
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                className="login-box"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <img src={logo} alt="Pirate Logo" className="login-logo" draggable={false} />
                <h2>Welcome aboard!</h2>
                <p className="login-slogan">Only real pirates allowed ⚓</p>

                {loading ? (
                    <div className="loader">Preparing your ship...</div>
                ) : (
                    <form onSubmit={handleLogin}>
                        <label className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@ship.com"
                            />
                        </label>
                        <label className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </label>
                        <button type="submit">Set Sail</button>
                    </form>
                )}

                {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

                <div className="login-links">
                    <Link to="/register">No account? Join the crew</Link>
                    <br />
                    <Link to="/forgot-password">Forgot password?</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
