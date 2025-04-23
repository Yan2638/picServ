// 📁 PlayerBar.tsx
import React from 'react';
import './PlayerCard.css';

const PlayerBar = ({ player }) => {
    if (!player) return null;

    const percent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

    return (
        <div className="player-bar">
            <div className="player-info">
                <img
                    src="/assets/avatar-pirate.webp"
                    alt={player.username}
                    className="player-avatar"
                />
                <div className="player-meta">
                    <div className="player-name">{player.username}</div>
                    <div className="player-hp">
                        {player.hp} / {player.maxHp} HP
                    </div>
                </div>
            </div>
            <div className="player-healthbar">
                <div
                    className="player-healthfill"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

export default PlayerBar;
