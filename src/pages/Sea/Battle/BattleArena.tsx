import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../../api/useApi';
import PlayerBar from './PlayerBar';
import { TargetCard } from './TargetCard';
import { BattleControls } from './BattleControls';
import { SocketManager } from '../../../socket/SocketManager.ts';
import { BattleLog } from './BattleLog';
import './BattleArena.css';

/** Типы логов, участников, стейта, скиллов. */
interface ArenaLog {
    id: number;
    type: string;
    actorId: number | null;
    targetId: number | null;
    value: number | null;
    meta: any;
    createdAt: string;
}

interface Participant {
    id: number;
    isBot: boolean;
    name: string;
    avatarUrl: string;
    currentHealth: number;
    maxHealth: number;
    userId?: number;
}

interface ArenaState {
    id: number;
    logs: ArenaLog[];
    participants: Participant[];
}

interface Me {
    id: number;
    hp: number;
    maxHp: number;
    username: string;
}

interface Skill {
    id: number;
    type: string;
    name: string;
    iconUrl?: string;
    cooldownLeft: number;
    owned?: boolean;
    disabled?: boolean;
    reason?: string;
    tags?: string[];
}

const BattleArena: React.FC = () => {
    const { locationId } = useParams<{ locationId: string }>();
    const navigate = useNavigate();

    // Стейт арены
    const [arena, setArena] = useState<ArenaState | null>(null);
    // Текущий игрок
    const [me, setMe] = useState<Me | null>(null);
    // Цель
    const [target, setTarget] = useState<Participant | null>(null);
    // Флаги
    const [busy, setBusy] = useState(false);
    const [dead, setDead] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    // Ресурсы (RUM, GUNPOWDER)
    const [rumAmount, setRumAmount] = useState(0);
    const [gunpowderAmount, setGunpowderAmount] = useState(0);

    // Скиллы
    const [skills, setSkills] = useState<Skill[]>([]);

    // Проверка: это я?
    const isMe = (p: Participant) => !p.isBot && p.userId === me?.id;

    /* Работа с целью */
    const saveTargetId = (id: number) => localStorage.setItem('arena_target_id', String(id));
    const clearTargetId = () => localStorage.removeItem('arena_target_id');
    const getSavedTargetId = (): number | null => {
        const raw = localStorage.getItem('arena_target_id');
        if (!raw) return null;
        const num = parseInt(raw, 10);
        return isNaN(num) ? null : num;
    };

    // Выбираем ближайшего врага
    const pickNearestEnemy = (participants: Participant[]) => {
        if (!me) return;
        const enemies = participants.filter((p) => p.currentHealth > 0 && !isMe(p));
        if (!enemies.length) {
            setTarget(null);
            clearTargetId();
            return;
        }
        const nearest = enemies.reduce((a, b) =>
            a.currentHealth < b.currentHealth ? a : b
        );
        setTarget(nearest);
        saveTargetId(nearest.id);
    };

    // Восстанавливаем сохранённую цель
    const restoreTarget = (participants: Participant[]) => {
        const savedId = getSavedTargetId();
        if (!savedId) return pickNearestEnemy(participants);
        const found = participants.find(
            (p) => p.id === savedId && p.currentHealth > 0 && !isMe(p)
        );
        if (found) {
            setTarget(found);
        } else {
            pickNearestEnemy(participants);
        }
    };

    /** При первом рендере — заходим на арену (REST) */
    const joinArena = async () => {
        if (!locationId) return;
        const res = await useApi.joinArena(locationId);
        if (!res.success) {
            setDead(true);
            setCooldown(true);
            return;
        }

        // Получаем user из /user/me
        const userRes = await useApi.getUser();
        const userId = userRes.data.user.id;

        // Ищем запись в списке участников
        const mePart = res.arena.participants.find((p: Participant) => p.userId === userId);

        // Запоминаем арену
        setArena(res.arena);
        // Запоминаем себя
        setMe({
            id: userId,
            hp: mePart?.currentHealth || userRes.data.user.hp,
            maxHp: mePart?.maxHealth || userRes.data.user.maxHp,
            username: userRes.data.user.username,
        });

        // Можно было бы сразу считать res.arena.usersData[userId],
        // если вы решите вложить его в joinArena. Иначе ждём arena:update.
        restoreTarget(res.arena.participants);
    };

    useEffect(() => {
        joinArena();
    }, [locationId]);

    /** Подписка на WebSocket arena:${arena.id} */
    useEffect(() => {
        if (!arena?.id || !me?.id) return;

        const channelKey = `arena:${arena.id}`;

        const handler = (updatedPayload: any) => {
            // updatedPayload = { id, logs, participants, usersData: {...} }
            const mePart = updatedPayload.participants.find((p: Participant) => p.userId === me.id);
            if (!mePart || mePart.currentHealth <= 0) {
                setDead(true);
                setCooldown(true);
                clearTargetId();
                return;
            }

            // Обновляем me
            setMe(prev =>
                prev ? { ...prev, hp: mePart.currentHealth, maxHp: mePart.maxHealth } : null
            );

            // Обновляем арену
            setArena({
                id: updatedPayload.id,
                logs: updatedPayload.logs,
                participants: updatedPayload.participants,
            });

            // Восстанавливаем цель (если надо)
            restoreTarget(updatedPayload.participants);

            // Парсим resources/skills из usersData
            if (updatedPayload.usersData && updatedPayload.usersData[me.id]) {
                const myData = updatedPayload.usersData[me.id];
                const rum = myData.resources.find((r: any) => r.type === 'RUM');
                setRumAmount(rum?.amount ?? 0);

                const gp = myData.resources.find((r: any) => r.type === 'GUNPOWDER');
                setGunpowderAmount(gp?.amount ?? 0);

                // Скиллы
                setSkills(myData.skills);
            }
        };

        SocketManager.subscribe(channelKey, handler);

        return () => {
            SocketManager.unsubscribe(channelKey, handler);
        };
    }, [arena?.id, me?.id]);

    /** Использование скилла */
    const handleUseSkill = async (skill: Skill) => {
        if (!arena || busy || skill.disabled) return;
        setBusy(true);
        try {
            await useApi.useSkill(skill.type, arena.id, target?.id);
            // Ждём arena:update
        } catch (err) {
            console.error('Ошибка при использовании скилла:', err);
        } finally {
            setBusy(false);
        }
    };

    /** Покинуть арену */
    const leave = async () => {
        if (arena) {
            await useApi.leaveArena(arena.id);
        }
        clearTargetId();
        navigate('/sea');
    };

    /** Формат лога */
    const formatLog = (log: ArenaLog) => {
        switch (log.type) {
            case 'JOIN':
                return `✅ Игрок #${log.actorId} присоединился`;
            case 'LEAVE':
                return `🚪 Игрок #${log.actorId} покинул арену`;
            case 'ATTACK':
                return `🗡️ Игрок #${log.actorId} бьёт #${log.targetId} на ${log.value}`;
            case 'DODGE':
                return `🌀 Игрок #${log.actorId} промахнулся по #${log.targetId}`;
            case 'HEAL':
                return `💖 Игрок #${log.actorId} восстановил ${log.value} HP`;
            case 'DEATH':
                return `☠️ Игрок #${log.actorId} погиб`;
            case 'BOT_REWARD':
                return `💰 #${log.actorId} получил ${log.value} GOLD`;
            default:
                return `[${log.type}]`;
        }
    };

    if (dead && cooldown) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-xl font-bold mb-4">☠️ Вы терпите крушение</h1>
                <p className="mb-4 text-lg">Часть ваших ресурсов была утеряна.</p>
                <p className="mb-6 text-md">Вы можете вернуться в порт, чтобы восстановиться.</p>
                <button
                    onClick={leave}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                >
                    ⚓ Вернуться в порт
                </button>
            </div>
        );
    }

    if (!arena || !me) {
        return <p className="p-4 text-center">⏳ Загрузка…</p>;
    }

    const playerCount = arena.participants.filter((p) => !p.isBot).length;

    return (
        <div className="max-w-5xl mx-auto p-4 select-none">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">⚔️ Арена · {locationId}</h1>
                <span className="text-sm text-gray-500">🏴‍☠️ В море: {playerCount}</span>
            </div>

            <div className="vs-layout">
                <div className="vs-player">
                    <PlayerBar player={me} />
                </div>
                <div className="vs-label">VS</div>
                <div className="vs-target">
                    {target && !isMe(target) && <TargetCard target={target} />}
                </div>
            </div>

            <BattleControls
                target={target && !isMe(target) ? target : null}
                busy={busy}
                leave={leave}
                pickTarget={() => pickNearestEnemy(arena.participants)}
                isEveryoneDead={arena.participants.filter((p) => !isMe(p)).length === 0}
                onUseSkill={handleUseSkill}
                rumAmount={rumAmount}
                gunpowderAmount={gunpowderAmount}
                skills={skills} // <- передаём скиллы
            />

            <BattleLog
                logs={arena.logs.map((log) => ({
                    id: log.id,
                    message: formatLog(log),
                    createdAt: log.createdAt,
                }))}
            />
        </div>
    );
};

export default BattleArena;
