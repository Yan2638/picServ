import axiosInstance from './axiosInstance';

export interface StoreItem {
    id: number;
    name: string;
    imageUrl: string;
    description: string;
    price: number;
    level: number;
    rarity: string;
    attack?: number;
    defense?: number;
    speed?: number;
    hpBonus?: number;
    type: string;
}

export async function getStoreItems(type?: string): Promise<StoreItem[]> {
    try {
        const url = type ? `/store/items?type=${encodeURIComponent(type)}` : '/store/items';
        const response = await axiosInstance.get(url);

        const data = response.data;

        if (Array.isArray(data)) return data;
        if (Array.isArray(data.items)) return data.items;

        console.warn('⚠️ API вернул неожиданный формат:', data);
        return [];
    } catch (error: any) {
        console.error('❌ Ошибка при получении товаров из магазина:', error.message || error);
        return [];
    }
}

interface BuyResponse {
    success: boolean;
    message: string;
}

export async function buyStoreItem(userId: number, itemId: number): Promise<BuyResponse> {
    try {
        const response = await axiosInstance.post('/store/buy', {
            userId,
            itemId,
        });

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.error;
        const message = serverError || 'Ошибка при покупке товара.';

        console.error('❌ Ошибка при покупке:', message);
        throw new Error(message);
    }
}
