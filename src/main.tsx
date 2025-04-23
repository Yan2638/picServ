import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LevelUpProvider } from "./context/LevelUpContext.tsx";
import "./styles/main.css";
import "../src/ui/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <LevelUpProvider> {/* 🎉 Оборачиваем App */}
                    <App />
                </LevelUpProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
