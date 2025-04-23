import { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import "./EquippedItemsPanel.css";

interface EquippedItem {
    id: number; // ID экземпляра (inventoryItem)
    itemId: number; // ID из справочника предметов
    name: string;
    imageUrl: string;
    rarity?: string;
}

const normalizeRarity = (rarity?: string): string => {
    return rarity?.trim().toLowerCase() || "";
};

const EquippedItemsPanel = () => {
    const [items, setItems] = useState<EquippedItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<EquippedItem | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchEquippedItems = () => {
        useApi.get("/inventory/equipped-items")
            .then(res => {
                if (res.data.success) {
                    setItems(res.data.items);
                }
            })
            .catch(err => {
                console.error("❌ Ошибка при получении артефактов", err);
            });
    };

    useEffect(() => {
        fetchEquippedItems();
    }, []);

    const handleUnequip = async () => {
        if (!selectedItem) return;

        setLoading(true);
        try {
            const res = await useApi.post("/inventory/use-item", {
                itemId: selectedItem.id,
                unequip: true
            });

            if (res.data.success) {
                setSelectedItem(null);
                fetchEquippedItems();
            } else {
                console.warn("❌ Не удалось снять предмет:", res.data.message);
            }
        } catch (err) {
            console.error("Ошибка при снятии предмета", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="equipped-panel">
            <h3>💎 Активные артефакты</h3>
            <div className="equipped-grid">
                {Array.from({ length: 5 }, (_, i) => {
                    const item = items[i];
                    const rarityClass = normalizeRarity(item?.rarity);

                    return (
                        <div
                            key={i}
                            className={`equipped-slot ${item ? rarityClass : "empty"} ${selectedItem?.id === item?.id ? "selected" : ""}`}
                            onClick={() => setSelectedItem(item || null)}
                        >
                            {item ? (
                                <img
                                    src={`http://localhost:5000${item.imageUrl}`}
                                    alt={item.name}
                                    title={item.name}
                                />
                            ) : (
                                <span>🕳️</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedItem && (
                <div className="unequip-panel">
                    <p>Вы выбрали: <strong>{selectedItem.name}</strong></p>
                    <button onClick={handleUnequip} disabled={loading}>
                        {loading ? "Снимаем..." : "Снять артефакт"}
                    </button>
                    <button onClick={() => setSelectedItem(null)} disabled={loading}>
                        Отмена
                    </button>
                </div>
            )}
        </div>
    );
};

export default EquippedItemsPanel;
