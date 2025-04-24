// 📁 src/context/WsProvider.tsx
import React, { createContext, ReactNode, useState, useContext, useEffect } from "react";
import { SocketManager } from "../socket/SocketManager";

interface WsContextValue {
    // Держим текущее состояние арены (по желанию).
    arena?: any;
    myResources?: any[];
    mySkills?: any[];
    currentArenaId?: number;
    // Функция для подписки
    subscribeArena: (arenaId: number) => void;
    // Функция для отписки (если надо)
    unsubscribeArena: () => void;
}

// Создаём контекст
const WsContext = createContext<WsContextValue | undefined>(undefined);

// Провайдер
export const WsProvider = ({ children }: { children: ReactNode }) => {
    // Сюда будем сохранять то, что приходят с WebSocket (arena:update).
    const [currentArenaId, setCurrentArenaId] = useState<number | undefined>(undefined);

    // Например, arenaState:
    const [arena, setArena] = useState<any>(null);
    const [myResources, setMyResources] = useState<any[]>([]);
    const [mySkills, setMySkills] = useState<any[]>([]);

    // Подписка. Храним колбэк, чтобы отписаться
    const [handler, setHandler] = useState<((payload: any) => void) | null>(null);

    // Функция подписки
    const subscribeArena = (arenaId: number) => {
        if (currentArenaId === arenaId) {
            // Уже подписаны на тот же arenaId — ничего не делаем
            return;
        }
        // Сначала отписываемся от старого (если был)
        unsubscribeArena();

        const channelKey = `arena:${arenaId}`;
        const newHandler = (payload: any) => {
            // payload: { id, logs, participants, usersData {...} }
            setArena({
                id: payload.id,
                logs: payload.logs,
                participants: payload.participants,
            });
            // Если надо, достаём userId из auth или из localStorage
            // Но для примера будем искать userId=1 (ИЛИ сделаем dynamic)
            // Лучше сделайте userId глобально,
            //   const { user } = useAuth();
            //   const myId = user?.id;

            // Пример: пусть userId = 1 (Замените на реальный)
            const userId = 1;
            if (payload.usersData && payload.usersData[userId]) {
                const myData = payload.usersData[userId];
                setMyResources(myData.resources);
                setMySkills(myData.skills);
            }
        };

        // Запоминаем arenaId
        setCurrentArenaId(arenaId);
        setHandler(() => newHandler);

        // Подписываемся
        SocketManager.subscribe(channelKey, newHandler);
        console.log("WsProvider: Subscribed to", channelKey);
    };

    const unsubscribeArena = () => {
        if (currentArenaId && handler) {
            const key = `arena:${currentArenaId}`;
            SocketManager.unsubscribe(key, handler);
            console.log("WsProvider: Unsubscribed from", key);
        }
        setCurrentArenaId(undefined);
        setHandler(null);
        setArena(null);
        setMyResources([]);
        setMySkills([]);
    };

    // Возвращаем контекст
    return (
        <WsContext.Provider
            value={{
                arena,
                myResources,
                mySkills,
                currentArenaId,
                subscribeArena,
                unsubscribeArena,
            }}
        >
            {children}
        </WsContext.Provider>
    );
};

// Хук для использования контекста
export const useWs = () => {
    const context = useContext(WsContext);
    if (!context) {
        throw new Error("useWs must be used within a WsProvider");
    }
    return context;
};
