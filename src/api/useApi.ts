import axios, { FILE_BASE } from './axiosInstance';

/**
 * Одна точка правды для REST‑запросов фронта.
 */
export const useApi = {
    /* ───────── helpers ───────── */
    get:    (path: string, cfg = {})             => axios.get(path, cfg),
    post:   (path: string, data?: any, cfg = {}) => axios.post(path, data, cfg),
    put:    (path: string, data?: any, cfg = {}) => axios.put(path, data, cfg),
    delete: (path: string, cfg = {})             => axios.delete(path, cfg),

    /** Построить абсолютный URL к файлу, который бекенд отдаёт как статику. */
    fileUrl: (relative: string) =>
        `${FILE_BASE}${relative.startsWith('/') ? '' : '/'}${relative}`,

    /* ───────── ресурсы ───────── */
    getResources: () => axios.get('/resources'),
    updateResources: (resources: { type: string; amount: number }[]) =>
        axios.post('/resources/update', { resources }),

    /* ───────── XP / HP ───────── */
    getXp: () => axios.get('/xp'),
    addXp: (amount: number) => axios.post('/xp/gain', { amount }),
    getHealth: () => axios.get('/health'),
    healFull: () => axios.post('/health/heal/full'),
    dealDamage: (amount: number) => axios.post('/health/damage', { amount }),

    /* ───────── пользователь ───────── */
    getUser: () => axios.get('/user/me'),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return axios.post('/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /* ───────── классы ───────── */
    getCharacterClasses: () => axios.get('/class'),
    chooseCharacterClass: (id: string) =>
        axios.put('/class', { classId: id }),

    /* ───────── локации ───────── */
    getSeaLocations: () => axios.get('/locations'),
    getLocationCooldowns: () => axios.get('/cooldowns'),
    setLocationCooldown: (locationId: string, seconds: number) =>
        axios.post('/cooldowns/set', { locationId, seconds }),

    /* ───────── старый бой с ботами ───────── */
    getBattleBots: (locationId: string) =>
        axios.get(`/battle/${locationId}/bots`),
    attackBot: (botId: string) => axios.post('/battle/attack', { botId }),
    healPlayer: () => axios.post('/battle/heal'),
    fleeBattle: () => axios.post('/battle/flee'),

    /* ───────── новая мульти‑арена ───────── */
    joinArena: async (locationId: string) => {
        try {
            const res = await axios.post(`/arena/${locationId}/join`);
            return res.data;
        } catch (error: any) {
            if (error.response?.data) return error.response.data;
            throw error;
        }
    },

    getArenaState: async (arenaId: number | string) => {
        try {
            const res = await axios.get(`/arena/${arenaId}`);
            return res.data;
        } catch (error: any) {
            if (error.response?.data) return error.response.data;
            throw error;
        }
    },

    attackArenaTarget: async (arenaId: number | string, targetParticipantId: number) => {
        try {
            const res = await axios.post(`/arena/${arenaId}/attack`, { targetParticipantId });
            return res.data;
        } catch (error: any) {
            if (error.response?.data) return error.response.data;
            throw error;
        }
    },

    leaveArena: async (arenaId: number | string) => {
        try {
            const res = await axios.post(`/arena/${arenaId}/leave`);
            return res.data;
        } catch (error: any) {
            if (error.response?.data) return error.response.data;
            throw error;
        }
    },

    /* ───────── скиллы ───────── */
    getSkills: async () => {
        try {
            const res = await axios.get('/skills');
            return res.data;
        } catch (error: any) {
            if (error.response?.data) return error.response.data;
            throw error;
        }
    },

    useSkill: async (skillType: string, arenaId: number | string, targetId?: number) => {
        try {
            const res = await axios.post(`/skills/use`, { skillType, arenaId, targetId });
            return res.data;
        } catch (error: any) {
            if (error.response?.data) return error.response.data;
            throw error;
        }
    },
};