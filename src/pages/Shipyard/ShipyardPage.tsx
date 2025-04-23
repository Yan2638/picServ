import React, { useEffect, useState } from 'react';
import { getStoreItems, buyStoreItem } from '../../api/storeService';
import { useAuth } from '../../context/AuthContext';

interface Item {
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

const categories = ['CANNON', 'SAIL', 'ARMOR', 'HARPOON', 'FIREBALL', 'MORTAR', 'SHIP'];

const categoryLabels: Record<string, string> = {
    CANNON: 'Пушки',
    SAIL: 'Паруса',
    ARMOR: 'Броня',
    HARPOON: 'Гарпуны',
    FIREBALL: 'Огненные ядра',
    MORTAR: 'Мортиры',
    SHIP: 'Корабли',
};

const ShipyardPage: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('CANNON');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingBuy, setLoadingBuy] = useState<number | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const result = await getStoreItems(selectedCategory);
                setItems(result);
            } catch {
                setError('Ошибка при загрузке товаров.');
            }
        };

        fetchItems();
    }, [selectedCategory]);

    const handleBuy = async (itemId: number, itemName: string) => {
        if (!user?.id) {
            setError('⛔ Вы не авторизованы.');
            return;
        }

        try {
            setLoadingBuy(itemId);
            const result = await buyStoreItem(user.id, itemId); // 👈 передаём userId и itemId
            setMessage(result.message || `Куплен ${itemName}`);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Ошибка при покупке.');
            setMessage(null);
        } finally {
            setLoadingBuy(null);
        }
    };

    if (isLoading) return <div className="p-4 text-white">Загрузка...</div>;
    if (!isAuthenticated) return <div className="p-4 text-red-600">⛔ Авторизуйтесь для доступа к магазину.</div>;

    return (
        <div className="shipyard-page p-4">
            <h1 className="text-2xl font-bold mb-6 text-white">⚓ Верфь</h1>

            {message && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded">
                    ✅ {message}
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded">
                    ⚠️ {error}
                </div>
            )}

            <div className="flex flex-wrap gap-3 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                            selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'
                        }`}
                        onClick={() => {
                            setSelectedCategory(cat);
                            setMessage(null);
                            setError(null);
                        }}
                    >
                        {categoryLabels[cat]}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length === 0 ? (
                    <p className="text-gray-400 col-span-full">Нет товаров в этой категории.</p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="store-item-card p-4 bg-gray-800 rounded shadow">
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="mx-auto mb-3 w-24 h-24 object-contain"
                            />
                            <h2 className="text-lg font-bold text-white">{item.name}</h2>
                            <p className="text-gray-400 text-sm mb-1">{item.description}</p>
                            <p className="text-yellow-400 font-semibold">💰 {item.price} золота</p>
                            <p className="text-sm text-white">📈 Уровень: <strong>{item.level}</strong></p>
                            <p className="text-sm text-white">🏷️ Раритетность: <strong>{item.rarity}</strong></p>

                            <div className="mt-3 text-sm space-y-1 text-left text-white">
                                {item.attack !== undefined && <p>⚔ Атака: {item.attack}</p>}
                                {item.defense !== undefined && <p>🛡 Защита: {item.defense}</p>}
                                {item.speed !== undefined && <p>💨 Скорость: {item.speed}</p>}
                                {item.hpBonus !== undefined && <p>❤️ Здоровье: {item.hpBonus}</p>}
                            </div>

                            <button
                                className="buy-button w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                                disabled={loadingBuy === item.id}
                                onClick={() => handleBuy(item.id, item.name)}
                            >
                                {loadingBuy === item.id ? 'Покупка...' : 'Купить'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ShipyardPage;
