// 📁 TargetCard.tsx
import React from 'react';
import ProgressBar from '../../../components/ProgressBar';
import './TargetCard.css';

export const TargetCard = ({ target }) => {
    if (!target) return (
        <div className="target-card empty">
            <p className="no-target">Нет цели для атаки</p>
        </div>
    );

    return (
        <div className="target-card">
            <div className="target-avatar-wrapper">
                <img
                    src={target.avatarUrl}
                    alt={target.name}
                    className="target-avatar"
                />
            </div>
            <div className="target-info">
                <h3 className="target-name">{target.name}</h3>
                <p className="target-hp">
                    {target.currentHealth} / {target.maxHealth} HP
                </p>
                <ProgressBar
                    value={target.currentHealth}
                    max={target.maxHealth}
                    label={target.isBot ? '🤖 Бот' : '🧑 Игрок'}
                    color="bg-yellow-500"
                />
            </div>
        </div>
    );
};
