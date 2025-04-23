import React from 'react';
import './BattleLog.css';

interface BattleLogProps {
    logs: { id: number; message: string; createdAt: string }[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="battle-log">
            <div className="battle-log-header">📜 Журнал событий</div>
            <div className="battle-log-content">
                {logs.length ? (
                    <ul className="log-list">
                        {logs.slice(-30).map((log) => (
                            <li key={log.id} className="log-line">
                                <span className="log-time">[{formatTime(log.createdAt)}]</span>{' '}
                                <span className="log-message">{log.message}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="log-empty">🕸️ Тут пока пусто. Всё слишком спокойно...</p>
                )}
            </div>
        </div>
    );
};
