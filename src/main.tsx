// 📁 src/index.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LevelUpProvider } from "./context/LevelUpContext";
import { WsProvider } from "./context/WsProvider";  // <-- НОВЫЙ контекст
import "./styles/main.css";
import "./ui/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            {/* 1) Ставим WsProvider НАД AuthProvider,
          чтобы подписка на сокет жила, даже если AuthProvider меняется. */}
            <WsProvider>
                <AuthProvider>
                    <LevelUpProvider>
                        <App />
                    </LevelUpProvider>
                </AuthProvider>
            </WsProvider>
        </BrowserRouter>
    </React.StrictMode>
);
