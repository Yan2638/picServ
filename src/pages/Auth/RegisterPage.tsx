import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "../../assets/logo.webp";
import { registerUser } from "../../api/auth";
import "./RegisterPage.css";

const RegisterPage = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); // 👈 добавили username
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await registerUser(email, password, username); // 👈 передаём username
            if (data.success) {
                navigate("/login");
            } else {
                setError(data.message || "Registration failed.");
            }
        } catch (err) {
            setError("Server error. Try not to sink.");
        }
    };

    return (
        <div className="register-container">
            <motion.div
                className="register-box"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <img src={logo} alt="Pirate Logo" className="register-logo" draggable={false} />
                <h2>Join the Crew</h2>
                <p className="register-slogan">New blood for the black flag 🏴‍☠️</p>

                <form onSubmit={handleRegister}>
                    <label className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose your pirate name"
                        />
                    </label>
                    <label className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="pirate@ocean.com"
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
                    <button type="submit">Enlist</button>
                </form>

                {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

                <div className="register-links">
                    <Link to="/login">Already on board? Log in</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
