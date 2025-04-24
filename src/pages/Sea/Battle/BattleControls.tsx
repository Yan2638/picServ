import React from 'react';
import './BattleControls.css';

interface Skill {
    id: number;
    type: string;
    name: string;
    iconUrl?: string;
    cooldownLeft: number;
    owned?: boolean;
    disabled?: boolean;  // приходит с сервера
    reason?: string;     // причина недоступности
}

/** Пропы для нашего компонента кнопок */
interface BattleControlsProps {
    target: any;
    busy: boolean;
    leave: () => void;
    pickTarget: () => void;
    isEveryoneDead: boolean;
    onUseSkill: (skill: Skill) => void;

    // Ресурсы (для отображения)
    rumAmount: number;
    gunpowderAmount?: number;

    // Список скиллов
    skills?: Skill[];
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
                                                                  gunpowderAmount = 0,
                                                                  skills = [],
                                                              }) => {
    return (
        <div className="battle-controls">
            {/* Перебираем массив skills */}
            {skills.map((skill) => {
                const isHeal = skill.type === 'heal';
                const isAttack = skill.type === 'attack' || skill.type === 'damage';
                const isMortar = skill.type === 'mortar_fire';

                // Если skill.owned === false, значит нет этого скилла
                const owned = skill.owned ?? true;
                // Если skill.cooldownLeft > 0, то на кулдауне
                const isOnCooldown = skill.cooldownLeft > 0;

                // Проверяем логику недоступности
                let isLogicDisabled = false;
                let reason = skill.reason || '';

                if (!owned) {
                    isLogicDisabled = true;
                    reason = 'Скилл не изучен';
                }
                if (isHeal && rumAmount <= 0) {
                    isLogicDisabled = true;
                    reason = 'Нет рома';
                }
                if (isMortar && gunpowderAmount <= 0) {
                    isLogicDisabled = true;
                    reason = 'Нет пороха';
                }
                if (isAttack && !target) {
                    isLogicDisabled = true;
                    reason = 'Нет цели';
                }

                // Итоговый флаг disabled
                const isDisabled = busy || skill.disabled || isOnCooldown || isLogicDisabled;

                // Для серого эффекта
                const grayedOut = isDisabled ? 'grayscale opacity-50' : '';

                // Иконка — если skill.iconUrl начинается на "/", подставляем API_BASE
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
                                src={iconSrc}
                                alt={skill.name}
                                className={grayedOut}
                                onError={(e) => {
                                    // Если не нашли иконку, подставим дефолт
                                    e.currentTarget.src = '/assets/icons/default.png';
                                }}
                            />
                            {/* Если есть кулдаун, показываем оставшееся время */}
                            {skill.cooldownLeft > 0 && (
                                <div className="cooldown">{skill.cooldownLeft}s</div>
                            )}
                        </button>

                        {/* Если это heal, показываем количество рома */}
                        {isHeal && (
                            <div className="rum-info">
                                🥃 Рома: <strong>{rumAmount}</strong>
                            </div>
                        )}
                        {/* Если это mortar_fire, показываем количество пороха */}
                        {isMortar && (
                            <div className="rum-info">
                                Порох: <strong>{gunpowderAmount}</strong>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Кнопка «Выбрать ближайшего врага» */}
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

            {/* Кнопка «Выйти из арены» */}
            <div className="skill-slot-wrapper">
                <button
                    className="skill-slot"
                    onClick={leave}
                    title="Порт"
                >
                    <img src="/assets/icons/leave.png" alt="Порт" />
                </button>
            </div>
        </div>
    );
};
