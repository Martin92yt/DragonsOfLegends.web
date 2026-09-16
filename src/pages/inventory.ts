import { Item, InventoryItemRecord } from "dragons-of-legends.js/dist/inventory/inventory.interface";

export function renderInventoryPage(version: string, player: any, items: InventoryItemRecord[] = []): string {
  
  function getItemIcon(item: Item): string {
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
    return "#64748b"; 
  }

  const equipment = player.equipment || {
    helmet: null, chest: null, leggings: null, boots: null,
    sword: null, shield: null, amulet1: null, amulet2: null, amulet3: null
  };

  const inventoryItems: InventoryItemRecord[] = [];
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
    inventorySlotsHtml = `<div style="grid-column: span 4; text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px;">Your inventory is empty.</div>`;
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
        <span class="icon" style="opacity: 0.3;">${defaultIcon}</span>
        <span class="item-name" style="color: var(--text-muted);">${label}</span>
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #090a0f;
                --card-bg: #12151c;
                --card-border: #1e222b;
                --text-main: #f3f4f6;
                --text-muted: #9ca3af;
                --accent: #38bdf8;
                --danger: #ef4444;
            }

            body {
                background-color: var(--bg-color);
                color: var(--text-main);
                font-family: 'Inter', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                animation: fadeIn 0.4s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .container {
                display: flex;
                gap: 20px;
            }

            .panel {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 10px;
                padding: 24px;
                width: 340px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(8px);
            }

            .header-flex {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 14px;
                border-bottom: 1px solid var(--card-border);
                padding-bottom: 10px;
            }

            h1 {
                font-size: 15px;
                font-weight: 600;
                letter-spacing: 0.8px;
                color: var(--text-main);
                margin: 0;
                text-transform: uppercase;
            }

            .back-link {
                color: var(--accent);
                font-size: 12px;
                font-weight: 500;
                text-decoration: none;
                transition: opacity 0.2s;
            }
            .back-link:hover { opacity: 0.8; }

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
                background: #050608;
                border: 1px solid var(--card-border);
                aspect-ratio: 1;
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: var(--text-muted);
                font-size: 11px;
                position: relative;
                padding: 4px;
                box-sizing: border-box;
                user-select: none;
            }

            .slot.filled {
                background: #12151c;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .slot.filled:hover {
                transform: translateY(-2px);
                border-color: var(--accent);
            }

            .slot .icon {
                font-size: 16px;
                margin-bottom: 2px;
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
                line-height: 1.1;
            }

            .slot .qty {
                position: absolute;
                bottom: 2px;
                right: 4px;
                font-size: 8px;
                font-weight: 700;
                color: var(--accent);
                background: rgba(0, 0, 0, 0.7);
                padding: 1px 3px;
                border-radius: 3px;
            }

            /* --- MODAL --- */
            .modal-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.7);
                justify-content: center;
                align-items: center;
                z-index: 100;
                backdrop-filter: blur(4px);
            }
            .modal {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 10px;
                padding: 24px;
                width: 300px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                animation: fadeIn 0.2s ease-out;
            }
            .modal-title {
                font-size: 15px;
                font-weight: 600;
                color: var(--text-main);
                margin-bottom: 6px;
                letter-spacing: 0.5px;
            }
            .modal-info {
                font-size: 12px;
                color: var(--text-muted);
                margin-bottom: 4px;
            }
            .modal-stats {
                background: #050608;
                border: 1px solid var(--card-border);
                border-radius: 6px;
                padding: 10px;
                margin: 12px 0;
                font-size: 11px;
                color: var(--text-main);
            }
            .slot-selector-container {
                margin-bottom: 12px;
                font-size: 11px;
                color: var(--text-muted);
            }
            .slot-selector-container select {
                width: 100%;
                margin-top: 4px;
                background: #050608;
                border: 1px solid var(--card-border);
                color: var(--text-main);
                padding: 8px;
                border-radius: 6px;
                font-family: 'Inter', sans-serif;
                font-size: 12px;
            }
            .modal-buttons {
                display: flex;
                gap: 8px;
                margin-top: 16px;
            }
            .btn {
                flex: 1;
                padding: 9px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                text-align: center;
                border: 1px solid var(--card-border);
                transition: all 0.2s ease;
            }
            .btn-equip {
                background: rgba(56, 189, 248, 0.1);
                border-color: rgba(56, 189, 248, 0.3);
                color: var(--accent);
            }
            .btn-equip:hover { background: rgba(56, 189, 248, 0.2); }
            
            .btn-unequip {
                background: rgba(239, 68, 68, 0.1);
                border-color: rgba(239, 68, 68, 0.3);
                color: var(--danger);
            }
            .btn-unequip:hover { background: rgba(239, 68, 68, 0.2); }

            .btn-close {
                background: #050608;
                color: var(--text-muted);
            }
            .btn-close:hover { color: var(--text-main); }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- EQUIPMENT PANEL -->
            <div class="panel">
                <div class="header-flex">
                    <h1>Equipment</h1>
                </div>
                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px;">Gear worn by ${player.name}.</p>
                
                <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Armor & Clothing</div>
                <div class="grid-3" style="margin-bottom: 14px;">
                    ${renderEquipmentSlot('helmet', 'Helmet', '🪖')}
                    ${renderEquipmentSlot('chest', 'Chest', '🛡️')}
                    ${renderEquipmentSlot('leggings', 'Leggings', '👖')}
                    ${renderEquipmentSlot('boots', 'Boots', '🥾')}
                </div>

                <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Weapons & Defense</div>
                <div class="grid-3" style="margin-bottom: 14px;">
                    ${renderEquipmentSlot('sword', 'Weapon', '⚔️')}
                    ${renderEquipmentSlot('shield', 'Shield', '🛡️')}
                </div>

                <div style="font-size: 10px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Amulets</div>
                <div class="grid-3">
                    ${renderEquipmentSlot('amulet1', 'Amulet 1', '💎')}
                    ${renderEquipmentSlot('amulet2', 'Amulet 2', '💎')}
                    ${renderEquipmentSlot('amulet3', 'Amulet 3', '💎')}
                </div>
            </div>

            <!-- INVENTORY PANEL -->
            <div class="panel">
                <div class="header-flex">
                    <h1>${player.name}'s Inventory</h1>
                    <a href="/" class="back-link">← Return</a>
                </div>
                
                <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 14px;">Manage your items and potions.</p>

                <div class="grid-4">
                    ${inventorySlotsHtml}
                </div>
            </div>
        </div>

        <!-- ITEM MODAL -->
        <div class="modal-overlay" id="itemModal" onclick="closeModal(event)">
            <div class="modal" onclick="event.stopPropagation()">
                <div class="modal-title" id="modalName">Item Name</div>
                <div class="modal-info">Category: <span id="modalCategory" style="color: var(--text-main);"></span></div>
                <div class="modal-info">Rarity: <span id="modalRarity" style="font-weight: 600;"></span></div>
                
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

                let statsHtml = "<strong>Properties:</strong><br>";
                if (item.data && Object.keys(item.data).length > 0) {
                    for (const [key, value] of Object.entries(item.data)) {
                        statsHtml += \`- \${key}: <strong>\${value}</strong><br>\`;
                    }
                } else {
                    statsHtml += "No special bonuses.";
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