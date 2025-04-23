import { useEffect, useState } from "react";
import { useApi } from "../../api/useApi";
import "./TreasureChestPanel.css";

interface Item {
    id: number;
    itemId: number;
    name: string;
    imageUrl: string;
    slot: number;
    equipped?: boolean;
    quantity?: number;
    description?: string;
    rarity?: string;
    level?: number;
    price?: number;
    attack?: number;
    speed?: number;
    defense?: number;
    maneuver?: number;
    luck?: number;
    repairSpeed?: number;
}

const TOTAL_SLOTS = 20;

const TreasureChestPanel = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
    const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const fetchItems = () => {
        useApi.get("/inventory")
            .then((res) => {
                if (res.data.success) {
                    const unequippedItems = res.data.items.filter((i: Item) => !i.equipped);
                    setItems(unequippedItems);
                }
            })
            .catch((err) => {
                console.error("❌ Ошибка при получении инвентаря:", err);
            });
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLImageElement>, item: Item) => {
        e.dataTransfer.setData("text/plain", item.id.toString());
        setDraggedItemId(item.id);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSlot: number) => {
        e.preventDefault();
        const itemId = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const draggedItem = items.find((i) => i.id === itemId);
        if (!draggedItem || draggedItem.slot === targetSlot) return;

        const isTargetOccupied = items.some(i => i.slot === targetSlot);
        if (isTargetOccupied) return;

        const updatedItems = items.map((i) =>
            i.id === draggedItem.id ? { ...i, slot: targetSlot } : i
        );
        setItems(updatedItems);
        setDraggedItemId(null);

        useApi.post("/inventory/move-item", {
            itemId: draggedItem.id,
            newSlot: targetSlot,
        }).catch((err) => {
            console.error("❌ Ошибка при перемещении предмета:", err);
        });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
    };

    const normalizeRarity = (rarity?: string): string => {
        return rarity?.trim().toLowerCase() || "";
    };

    const grid = Array.from({ length: TOTAL_SLOTS }, (_, index) => {
        const item = items.find((i) => i.slot === index);
        const isDraggingFrom = item?.id === draggedItemId;
        const isOccupied = !!item;
        const rarityClass = normalizeRarity(item?.rarity);

        return (
            <div
                key={index}
                className={`grid-slot ${isOccupied ? "filled" : "empty"} ${isDraggingFrom ? "dragging-from" : ""} ${rarityClass}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
            >
                {item && (
                    <div className="item-wrapper">
                        <img
                            src={`http://localhost:5000${item.imageUrl}`}
                            alt={item.name}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            onMouseEnter={() => setHoveredItem(item)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => setSelectedItem(item)}
                            className="item-img"
                        />
                        {item.quantity && item.quantity > 1 && (
                            <div className="item-quantity">x{item.quantity}</div>
                        )}
                    </div>
                )}
            </div>
        );
    });

    return (
        <div className="chest-panel">
            <h3>🧰 Твой сундук</h3>
            <div className="grid-container">{grid}</div>

            {hoveredItem && (
                <div className="item-tooltip">
                    <strong>{hoveredItem.name}</strong><br />
                    {hoveredItem.rarity && <span className="rarity">{hoveredItem.rarity}</span>}<br />
                    {hoveredItem.description}
                </div>
            )}

            {selectedItem && (
                <div className="item-details-popup">
                    <div className="item-header">
                        <img
                            src={`http://localhost:5000${selectedItem.imageUrl}`}
                            alt={selectedItem.name}
                            className="item-detail-img"
                        />
                        <div>
                            <h4>{selectedItem.name}</h4>
                            <p className={`rarity-tag ${normalizeRarity(selectedItem.rarity)}`}>
                                {selectedItem.rarity}
                            </p>
                        </div>
                    </div>

                    <p className="item-description">{selectedItem.description}</p>

                    <ul className="item-stats">
                        {selectedItem.attack && <li>🗡️ Атака: {selectedItem.attack}</li>}
                        {selectedItem.defense && <li>🛡️ Защита: {selectedItem.defense}</li>}
                        {selectedItem.speed && <li>⚡ Скорость: {selectedItem.speed}</li>}
                        {selectedItem.maneuver && <li>🚢 Маневренность: {selectedItem.maneuver}</li>}
                        {selectedItem.luck && <li>🍀 Удача: {selectedItem.luck}</li>}
                        {selectedItem.repairSpeed && <li>🔧 Починка: {selectedItem.repairSpeed}</li>}
                        {selectedItem.level && <li>🎚️ Уровень: {selectedItem.level}</li>}
                        {selectedItem.price !== undefined && <li>💰 Цена: {selectedItem.price} золота</li>}
                        {selectedItem.quantity && selectedItem.quantity > 1 && (
                            <li>📦 Кол-во: {selectedItem.quantity}</li>
                        )}
                    </ul>

                    <div className="item-actions">
                        <button onClick={() => {
                            useApi.post("/inventory/use-item", { itemId: selectedItem.id })
                                .then(() => {
                                    alert("🧪 Использовано!");
                                    fetchItems();
                                    setSelectedItem(null);
                                })
                                .catch(() => alert("Ошибка использования"));
                        }}>🧪 Использовать</button>
                        <button onClick={() => setSelectedItem(null)}>❌ Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreasureChestPanel;
