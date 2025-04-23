import axiosInstance from './axiosInstance';

export interface ShipEquipment {
    name: string;
    imageUrl: string;
    battleRating: number;
    speed: number;
    sail: any | null;
    armor: any | null;
    cannon: any | null;
    mortar: any | null;
    fireAmmo: any | null;
    harpoon: any | null;
}

export async function getMyShip(): Promise<ShipEquipment | null> {
    try {
        const res = await axiosInstance.get('/ship/me');
        return res.data;
    } catch (error) {
        console.error('❌ Ошибка при получении корабля:', error);
        return null;
    }
}
