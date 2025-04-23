import React from 'react';
import './BattleControls.css';

interface Skill {
    id: number;
    type: string;
    name: string;
    iconUrl?: string;
    cooldownLeft: number;
    owned?: boolean;
    disabled?: boolean;
    reason?: string;
    requiredItems?: number[];
    requiredShip?: string;
}

interface BattleControlsProps {
    target: any;
    busy: boolean;
    leave: () => void;
    pickTarget: () => void;
    isEveryoneDead: boolean;
    onUseSkill: (skill: Skill) => void;
    rumAmount: number;
    userShipId?: string | null;
    skills?: Skill[];
    userInventory?: Record<number, number>; // itemId => quantity
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const BattleControls: React.FC<BattleControlsProps> = ({
                                                                  target,
                                                                  busy,
                                                                  leave,
                                                                  pickTarget,
                                                                  isEveryoneDead,
                                                                  onUseSkill,
                                                                  rumAmount,
                                                                  userShipId = null,
                                                                  skills = [],
                                                                  userInventory = {},
                                                              }) => {
    return (
        <div className="battle-controls">
            {skills.map((skill) => {
                const isHeal = skill.type === 'heal';
                const isAttack = skill.type === 'attack' || skill.type === 'damage';

                const owned = skill.owned ?? true;
                const isOnCooldown = skill.cooldownLeft > 0;
                const hasRum = rumAmount > 0;
                const requiredShipMet = !skill.requiredShip || skill.requiredShip === userShipId;

                const hasRequiredItems = skill.requiredItems?.every(itemId => {
                    return userInventory[itemId] && userInventory[itemId] > 0;
                }) ?? true;

                // Индивидуальная проверка по типу
                let isLogicDisabled = false;
                let reason = '';

                if (!owned) {
                    isLogicDisabled = true;
                    reason = 'Недоступно';
                } else if (isHeal && !hasRum) {
                    isLogicDisabled = true;
                    reason = 'Нет рома';
                } else if (skill.requiredShip && !requiredShipMet) {
                    isLogicDisabled = true;
                    reason = `Нужен корабль: ${skill.requiredShip}`;
                } else if (!hasRequiredItems) {
                    isLogicDisabled = true;
                    reason = 'Нет нужных предметов';
                } else if (isAttack && !target) {
                    isLogicDisabled = true;
                    reason = 'Нет цели';
                }

                const isDisabled = busy || skill.disabled || isOnCooldown || isLogicDisabled;
                const grayedOut = isDisabled ? 'grayscale opacity-50' : '';

                const iconSrc = skill.iconUrl?.startsWith('/')
                    ? `${API_BASE}${skill.iconUrl}`
                    : `${API_BASE}/skills/${skill.type}.png`;

                return (
                    <div key={skill.id} className="skill-slot-wrapper">
                        <button
                            className={`skill-slot ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => !isDisabled && onUseSkill(skill)}
                            disabled={isDisabled}
                            title={reason || skill.reason || skill.name}
                        >
                            <img
                                key={iconSrc}
                                src={iconSrc}
                                alt={skill.name}
                                className={grayedOut}
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/icons/default.png';
                                }}
                            />
                            {skill.cooldownLeft > 0 && (
                                <div className="cooldown">{skill.cooldownLeft}s</div>
                            )}
                        </button>

                        {isHeal && (
                            <div className="rum-info">
                                🥃 Рома: <strong>{rumAmount}</strong>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="skill-slot-wrapper">
                <button
                    className="skill-slot"
                    onClick={pickTarget}
                    disabled={isEveryoneDead}
                    title="Ближайший"
                >
                    <img src="/assets/icons/target.png" alt="Ближайший" />
                </button>
            </div>

            <div className="skill-slot-wrapper">
                <button className="skill-slot" onClick={leave} title="Порт">
                    <img src="/assets/icons/leave.png" alt="Порт" />
                </button>
            </div>
        </div>
    );
};
