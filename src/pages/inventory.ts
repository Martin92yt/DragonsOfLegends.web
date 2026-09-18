export function renderInventoryPage(version: string, player: any, items: any[] = []): string {
    
    function getItemIcon(item: any): string {
        const category = (item.category || "").toLowerCase();
        const id = (item.itemId || item.name || "").toLowerCase();

        if (category.includes("consumable") || category.includes("food") || id.includes("potion") || id.includes("meat")) return "🍗";
        if (category.includes("weapon") || id.includes("sword") || id.includes("dagger") || id.includes("bow")) return "⚔️";
        if (category.includes("armor") || id.includes("helmet") || id.includes("chest") || id.includes("shield")) return "🛡️";
        if (category.includes("material") || id.includes("amulet") || id.includes("gem") || id.includes("ore")) return "💎";
        
        return "📦";
    }

    function getRarityColor(rarity: string = ""): string {
        const r = rarity.toLowerCase();
        if (r.includes("legendary")) return "#f97316"; 
        if (r.includes("epic")) return "#a855f7";         
        if (r.includes("rare")) return "#3b82f6";                
        if (r.includes("uncommon")) return "#22c55e"; 
        return "rgba(255, 255, 255, 0.08)"; 
    }

    const equipment = player.equipment || {
        helmet: null, chest: null, leggings: null, boots: null,
        sword: null, shield: null, amulet1: null, amulet2: null, amulet3: null
    };

    const inventoryItems: any[] = [];
    const equippedItemsMap: { [key: string]: any } = {};

    for (const item of items) {
        if (item.isEquipped && item.equipmentSlot) {
            equippedItemsMap[item.equipmentSlot] = item;
        } else {
            inventoryItems.push(item);
        }
    }

    let inventorySlotsHtml = "";
    if (inventoryItems.length === 0) {
        inventorySlotsHtml = `<div style="grid-column: span 4; text-align: center; color: var(--text-muted); font-size: 11px; padding: 30px;">Your inventory is empty.</div>`;
    } else {
        for (const item of inventoryItems) {
            const icon = getItemIcon(item);
            const displayName = item.name || item.itemId || "Item";
            const quantityBadge = item.quantity && item.quantity > 1 ? `<span class="qty">${item.quantity}</span>` : "";
            const itemJson = JSON.stringify(item).replace(/"/g, '&quot;');
            const rarityColor = getRarityColor(item.rarity);

            inventorySlotsHtml += `
                <div class="slot filled" style="border-color: ${rarityColor};" onclick='openModal(${itemJson})'>
                    <span class="icon">${icon}</span>
                    <span class="item-name">${displayName}</span>
                    ${quantityBadge}
                </div>
            `;
        }
    }

    function renderEquipmentSlot(slotKey: string, label: string, defaultIcon: string) {
        const item = equipment[slotKey] || equippedItemsMap[slotKey];
        if (item) {
            const icon = getItemIcon(item);
            const displayName = item.name || item.itemId || label;
            const itemJson = JSON.stringify(item).replace(/"/g, '&quot;');
            const rarityColor = getRarityColor(item.rarity);
            return `
                <div class="slot filled equipment-slot" style="border-color: ${rarityColor};" onclick='openModal(${itemJson})' title="${displayName}">
                    <span class="icon">${icon}</span>
                    <span class="item-name">${displayName}</span>
                </div>
            `;
        }
        return `
            <div class="slot equipment-slot" title="Empty slot: ${label}">
                <span class="icon" style="opacity: 0.2;">${defaultIcon}</span>
                <span class="item-name" style="color: var(--text-muted); opacity: 0.5;">${label}</span>
            </div>
        `;
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Inventory</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-color: #030407;
                    --card-bg: #0a0d14;
                    --card-border: rgba(255, 255, 255, 0.06);
                    --card-border-hover: rgba(56, 189, 248, 0.3);
                    --text-main: #f8fafc;
                    --text-muted: #64748b;
                    --primary: #38bdf8;
                    --primary-glow: rgba(56, 189, 248, 0.12);
                    --danger: #f87171;
                    --danger-glow: rgba(248, 113, 113, 0.12);
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    background-color: var(--bg-color);
                    color: var(--text-main);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    overflow: hidden;
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .container {
                    display: flex;
                    gap: 16px;
                }

                .panel {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 16px;
                    padding: 24px;
                    width: 360px;
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(12px);
                    transition: border-color 0.3s ease;
                }

                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    border-bottom: 1px solid var(--card-border);
                    padding-bottom: 12px;
                }

                h1 {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-main);
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .badge {
                    font-size: 10px;
                    background: var(--primary-glow);
                    border: 1px solid rgba(56, 189, 248, 0.2);
                    color: var(--primary);
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                .back-link {
                    color: var(--primary);
                    font-size: 11px;
                    font-weight: 600;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: opacity 0.2s;
                }
                .back-link:hover { opacity: 0.8; }

                .section-title {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .grid-4 {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                .grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .slot {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    aspect-ratio: 1;
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    font-size: 11px;
                    position: relative;
                    padding: 6px;
                    box-sizing: border-box;
                    user-select: none;
                }

                .slot.filled {
                    background: rgba(255, 255, 255, 0.04);
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .slot.filled:hover {
                    transform: translateY(-2px);
                    border-color: var(--primary);
                    background: rgba(56, 189, 248, 0.04);
                }

                .slot .icon {
                    font-size: 16px;
                    margin-bottom: 3px;
                }

                .slot .item-name {
                    font-size: 8px;
                    color: var(--text-main);
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    width: 100%;
                    line-height: 1.2;
                    font-weight: 600;
                }

                .slot .qty {
                    position: absolute;
                    bottom: 3px;
                    right: 4px;
                    font-size: 8px;
                    font-weight: 700;
                    color: var(--primary);
                    background: rgba(3, 4, 7, 0.85);
                    padding: 1px 4px;
                    border-radius: 4px;
                    border: 1px solid rgba(56, 189, 248, 0.2);
                }

                /* --- MODAL --- */
                .modal-overlay {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(3, 4, 7, 0.8);
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                    backdrop-filter: blur(6px);
                }
                .modal {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 16px;
                    padding: 24px;
                    width: 320px;
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.8);
                    animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .modal-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 6px;
                    letter-spacing: 0.5px;
                }
                .modal-info {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                .modal-stats {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    padding: 12px;
                    margin: 14px 0;
                    font-size: 11px;
                    color: var(--text-main);
                }
                .slot-selector-container {
                    margin-bottom: 14px;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .slot-selector-container select {
                    width: 100%;
                    margin-top: 6px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    color: var(--text-main);
                    padding: 10px 12px;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .slot-selector-container select:focus {
                    border-color: var(--primary);
                }
                .modal-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }
                .btn {
                    flex: 1;
                    padding: 11px;
                    border-radius: 10px;
                    font-size: 12px;
                    font-weight: 600;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    text-align: center;
                    border: 1px solid var(--card-border);
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-equip {
                    background: var(--primary-glow);
                    border-color: rgba(56, 189, 248, 0.3);
                    color: var(--primary);
                }
                .btn-equip:hover { 
                    background: var(--primary);
                    color: var(--bg-color);
                    border-color: var(--primary);
                }
                
                .btn-unequip {
                    background: var(--danger-glow);
                    border-color: rgba(248, 113, 113, 0.3);
                    color: var(--danger);
                }
                .btn-unequip:hover { 
                    background: var(--danger);
                    color: var(--bg-color);
                    border-color: var(--danger);
                }

                .btn-close {
                    background: rgba(255, 255, 255, 0.02);
                    color: var(--text-muted);
                }
                .btn-close:hover { 
                    color: var(--text-main);
                    border-color: rgba(255, 255, 255, 0.2);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- EQUIPMENT PANEL -->
                <div class="panel">
                    <div class="header-flex">
                        <h1>Equipment</h1>
                        <span class="badge">v${version}</span>
                    </div>
                    <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px; font-weight: 500;">Gear worn by ${player.name}.</p>
                    
                    <div class="section-title">Armor & Clothing</div>
                    <div class="grid-3" style="margin-bottom: 14px;">
                        ${renderEquipmentSlot('helmet', 'Helmet', '🪖')}
                        ${renderEquipmentSlot('chest', 'Chest', '🛡️')}
                        ${renderEquipmentSlot('leggings', 'Leggings', '👖')}
                        ${renderEquipmentSlot('boots', 'Boots', '🥾')}
                    </div>

                    <div class="section-title">Weapons & Defense</div>
                    <div class="grid-3" style="margin-bottom: 14px;">
                        ${renderEquipmentSlot('sword', 'Weapon', '⚔️')}
                        ${renderEquipmentSlot('shield', 'Shield', '🛡️')}
                    </div>

                    <div class="section-title">Amulets</div>
                    <div class="grid-3">
                        ${renderEquipmentSlot('amulet1', 'Amulet 1', '💎')}
                        ${renderEquipmentSlot('amulet2', 'Amulet 2', '💎')}
                        ${renderEquipmentSlot('amulet3', 'Amulet 3', '💎')}
                    </div>
                </div>

                <!-- INVENTORY PANEL -->
                <div class="panel">
                    <div class="header-flex">
                        <h1>Inventory</h1>
                        <a href="/" class="back-link">Return →</a>
                    </div>
                    
                    <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px; font-weight: 500;">Manage your items and potions.</p>

                    <div class="grid-4">
                        ${inventorySlotsHtml}
                    </div>
                </div>
            </div>

            <!-- ITEM MODAL -->
            <div class="modal-overlay" id="itemModal" onclick="closeModal(event)">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-title" id="modalName">Item Name</div>
                    <div class="modal-info">Category: <span id="modalCategory" style="color: var(--text-main); font-weight: 600;"></span></div>
                    <div class="modal-info">Rarity: <span id="modalRarity" style="font-weight: 700;"></span></div>
                    
                    <div class="modal-stats" id="modalStats"></div>

                    <div class="slot-selector-container" id="slotSelectorContainer">
                        <label for="targetSlot">Target slot:</label>
                        <select id="targetSlot">
                            <option value="helmet">Helmet</option>
                            <option value="chest">Chest</option>
                            <option value="leggings">Leggings</option>
                            <option value="boots">Boots</option>
                            <option value="sword">Weapon</option>
                            <option value="shield">Shield</option>
                            <option value="amulet1">Amulet 1</option>
                            <option value="amulet2">Amulet 2</option>
                            <option value="amulet3">Amulet 3</option>
                        </select>
                    </div>

                    <div class="modal-buttons">
                        <button class="btn btn-equip" id="actionBtn" onclick="handleItemAction()">Equip</button>
                        <button class="btn btn-close" onclick="closeModal()">Close</button>
                    </div>
                </div>
            </div>

            <script>
                let currentItem = null;

                function getJsRarityColor(rarity) {
                    if (!rarity) return '#64748b';
                    const r = rarity.toLowerCase();
                    if (r.includes('legendary')) return '#f97316';
                    if (r.includes('epic')) return '#a855f7';
                    if (r.includes('rare')) return '#3b82f6';
                    if (r.includes('uncommon')) return '#22c55e';
                    return '#64748b';
                }

                function openModal(item) {
                    currentItem = item;
                    document.getElementById('modalName').innerText = item.name || item.itemId;
                    document.getElementById('modalCategory').innerText = item.category || 'Unknown';
                    
                    const rarityEl = document.getElementById('modalRarity');
                    rarityEl.innerText = item.rarity || 'Common';
                    rarityEl.style.color = getJsRarityColor(item.rarity);

                    let statsHtml = "<strong style='color: var(--text-main);'>Properties:</strong><br><br>";
                    if (item.data && Object.keys(item.data).length > 0) {
                        for (const [key, value] of Object.entries(item.data)) {
                            statsHtml += \`<span style="color: var(--text-muted)">• \${key}:</span> <strong style="color: var(--text-main)">\${value}</strong><br>\`;
                        }
                    } else {
                        statsHtml += "<span style='color: var(--text-muted)'>No special bonuses.</span>";
                    }
                    document.getElementById('modalStats').innerHTML = statsHtml;

                    const actionBtn = document.getElementById('actionBtn');
                    const slotSelectorContainer = document.getElementById('slotSelectorContainer');

                    if (item.isEquipped) {
                        actionBtn.innerText = "Unequip";
                        actionBtn.className = "btn btn-unequip";
                        slotSelectorContainer.style.display = 'none';
                    } else {
                        actionBtn.innerText = "Equip";
                        actionBtn.className = "btn btn-equip";
                        slotSelectorContainer.style.display = 'block';
                        
                        if (item.equipmentSlot) {
                            document.getElementById('targetSlot').value = item.equipmentSlot;
                        }
                    }

                    document.getElementById('itemModal').style.display = 'flex';
                }

                function closeModal(e) {
                    if (!e || e.target.id === 'itemModal' || e.target.classList.contains('btn-close')) {
                        document.getElementById('itemModal').style.display = 'none';
                    }
                }

                async function handleItemAction() {
                    if (!currentItem) return;

                    const isEquipped = currentItem.isEquipped;
                    const endpoint = isEquipped ? '/action/inventory/unequip' : '/action/inventory/equip';
                    
                    const payload = {
                        itemId: currentItem.itemId || currentItem.name
                    };

                    if (!isEquipped) {
                        payload.equipmentSlot = document.getElementById('targetSlot').value;
                    } else {
                        payload.equipmentSlot = currentItem.equipmentSlot;
                    }

                    try {
                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        const result = await response.json();
                        if (result.success) {
                            window.location.reload();
                        } else {
                            alert("Error updating equipment.");
                        }
                    } catch (err) {
                        console.error("Network error:", err);
                        alert("Server connection error.");
                    }

                    closeModal();
                }
            </script>
        </body>
        </html>
    `;
}