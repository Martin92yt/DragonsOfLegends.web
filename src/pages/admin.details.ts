export function renderPlayerDetailPage(
	version: string,
	currentAdminUser: any,
	playerWithData: any,
): string {
	const char = playerWithData.character;
	return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dragons of Legends — ${playerWithData.username}</title>

    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-main: #06080c;
            --bg-card: #0d111a;
            --bg-soft: rgba(255,255,255,.025);
            --bg-hover: rgba(255,255,255,.05);

            --border: rgba(255,255,255,.07);
            --border-hover: rgba(56,189,248,.35);

            --text: #f1f5f9;
            --muted: #64748b;

            --primary: #38bdf8;
            --primary-soft: rgba(56,189,248,.12);

            --success: #10b981;
            --success-soft: rgba(16,185,129,.12);

            --warning: #f59e0b;
            --warning-soft: rgba(245,158,11,.12);

            --danger: #ef4444;
            --danger-soft: rgba(239,68,68,.12);

            --radius: 14px;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            min-height: 100vh;
            padding: 30px;
            background:
                radial-gradient(circle at top right, rgba(56,189,248,.05), transparent 30%),
                var(--bg-main);
            color: var(--text);
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        button,
        input,
        select,
        textarea {
            font-family: inherit;
        }

        .container {
            width: 100%;
            max-width: 1350px;
            margin: auto;
        }

        /* ==============================
           HEADER
        ============================== */

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
        }

        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .admin-status {
            color: var(--muted);
            font-size: 12px;
        }

        /* ==============================
           BUTTONS
        ============================== */

        .btn {
            border: 1px solid var(--border);
            background: var(--bg-soft);
            color: var(--text);
            padding: 10px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            transition: .2s ease;
        }

        .btn:hover {
            background: var(--primary-soft);
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-1px);
        }

        .btn-primary {
            background: var(--primary-soft);
            border-color: rgba(56,189,248,.35);
            color: var(--primary);
        }

        .btn-danger {
            color: var(--danger);
            border-color: rgba(239,68,68,.3);
        }

        .btn-danger:hover {
            background: var(--danger-soft);
            border-color: var(--danger);
            color: var(--danger);
        }

        /* ==============================
           CARDS
        ============================== */

        .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 22px;
            margin-bottom: 20px;
            box-shadow: 0 12px 35px rgba(0,0,0,.25);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-bottom: 18px;
        }

        .card-title {
            font-size: 15px;
            font-weight: 800;
        }

        .card-subtitle {
            color: var(--muted);
            font-size: 11px;
            margin-top: 4px;
        }

        /* ==============================
           PLAYER HEADER
        ============================== */

        .player-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
        }

        .player-info {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .player-avatar {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-soft);
            border: 1px solid rgba(56,189,248,.2);
            font-size: 23px;
        }

        .player-name {
            font-size: 22px;
            font-weight: 800;
        }

        .player-meta {
            color: var(--muted);
            font-size: 11px;
            margin-top: 5px;
            font-family: monospace;
        }

        .badge {
            padding: 7px 11px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .badge-player {
            color: var(--primary);
            background: var(--primary-soft);
            border: 1px solid rgba(56,189,248,.25);
        }

        .badge-admin {
            color: var(--warning);
            background: var(--warning-soft);
            border: 1px solid rgba(245,158,11,.25);
        }

        /* ==============================
           LAYOUT
        ============================== */

        .dashboard-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.55fr) minmax(350px, .9fr);
            gap: 20px;
            align-items: start;
        }

        @media(max-width: 1050px) {
            .dashboard-grid {
                grid-template-columns: 1fr;
            }
        }

        @media(max-width: 600px) {
            body {
                padding: 15px;
            }

            .page-header,
            .player-card {
                align-items: flex-start;
                flex-direction: column;
            }
        }

        /* ==============================
           STATS
        ============================== */

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .stat-card {
            background: rgba(0,0,0,.2);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 15px;
        }

        .stat-label {
            color: var(--muted);
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
            letter-spacing: .5px;
        }

        .stat-value {
            margin-top: 7px;
            font-size: 18px;
            font-weight: 800;
            color: var(--primary);
        }

        .stat-value.gold {
            color: var(--warning);
        }

        .stat-value.hp {
            color: var(--success);
        }

        @media(max-width: 700px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* ==============================
           CHARACTER INFO
        ============================== */

        .info-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 18px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 11px 13px;
            border-radius: 10px;
            background: var(--bg-soft);
            border: 1px solid var(--border);
            font-size: 12px;
        }

        .info-item span:first-child {
            color: var(--muted);
        }

        .info-item strong {
            color: var(--text);
        }

        @media(max-width: 650px) {
            .info-list {
                grid-template-columns: 1fr;
            }
        }

        /* ==============================
           ATTRIBUTES
        ============================== */

        .attributes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 18px;
        }

        .attribute {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 10px;
            padding: 13px;
            border-radius: 12px;
            background: rgba(0,0,0,.2);
            border: 1px solid var(--border);
        }

        .attribute-name {
            color: var(--muted);
            font-size: 12px;
            font-weight: 700;
        }

        .attribute-value {
            color: var(--text);
            font-size: 16px;
            font-weight: 800;
        }

        .attribute-controls {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .attribute-btn {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            border: 1px solid var(--border);
            background: rgba(255,255,255,.03);
            color: var(--text);
            font-size: 18px;
            cursor: pointer;
            transition: .15s ease;
        }

        .attribute-btn:hover {
            background: var(--primary-soft);
            border-color: var(--primary);
            color: var(--primary);
        }

        .points-box {
            margin-top: 12px;
            padding: 12px 14px;
            border-radius: 10px;
            background: var(--warning-soft);
            border: 1px solid rgba(245,158,11,.2);
            color: var(--warning);
            font-size: 12px;
            font-weight: 700;
            text-align: center;
        }

        /* ==============================
           INVENTORY
        ============================== */

        .inventory-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.inventory-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    padding: 13px 15px;

    background: rgba(0, 0, 0, .20);
    border: 1px solid var(--border);
    border-radius: 11px;

    transition: .15s ease;
}

.inventory-item:hover {
    background: rgba(255, 255, 255, .035);
    border-color: rgba(56, 189, 248, .25);
}

.inventory-main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.inventory-icon {
    width: 38px;
    height: 38px;

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    border-radius: 9px;

    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);

    font-size: 17px;
}

.inventory-info {
    min-width: 0;
}

.inventory-name {
    display: flex;
    align-items: center;
    gap: 8px;

    font-size: 13px;
    font-weight: 700;

    color: var(--text);
}

.inventory-meta {
    display: flex;
    align-items: center;
    gap: 6px;

    margin-top: 4px;

    color: var(--muted);

    font-size: 10px;
}

.item-id {
    font-family: monospace;
    opacity: .7;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.equipped-badge {
    padding: 3px 6px;

    border-radius: 5px;

    background: var(--success-soft);
    border: 1px solid rgba(16,185,129,.2);

    color: var(--success);

    font-size: 9px;
    font-weight: 800;

    text-transform: uppercase;
}

.inventory-right {
    flex-shrink: 0;
}

.item-stack {
    display: flex;
    align-items: baseline;
    gap: 3px;

    padding: 7px 10px;

    border-radius: 8px;

    background: rgba(56,189,248,.06);
    border: 1px solid rgba(56,189,248,.1);
}

.item-stack strong {
    color: var(--primary);
    font-size: 14px;
}

.quantity-label {
    display: none;
}

.max-stack {
    color: var(--muted);
    font-size: 10px;
}

@media(max-width: 600px) {

    .inventory-item {
        align-items: flex-start;
    }

    .inventory-meta {
        flex-wrap: wrap;
    }

    .inventory-right {
        align-self: center;
    }

}


        /* ==============================
           FORM
        ============================== */

        .form-section {
            padding: 15px;
            margin-bottom: 12px;
            background: rgba(0,0,0,.16);
            border: 1px solid var(--border);
            border-radius: 12px;
        }

        .form-section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 13px;
            font-size: 12px;
            font-weight: 800;
            color: var(--text);
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .form-grid.three {
            grid-template-columns: repeat(3, 1fr);
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .field.full {
            grid-column: 1 / -1;
        }

        .field label {
            color: var(--muted);
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
        }

        input,
        select,
        textarea {
            width: 100%;
            background: rgba(255,255,255,.025);
            border: 1px solid var(--border);
            color: white;
            padding: 10px 12px;
            border-radius: 9px;
            font-size: 12px;
            outline: none;
            transition: .2s ease;
        }

        input:focus,
        select:focus,
        textarea:focus {
            border-color: var(--primary);
            background: rgba(56,189,248,.03);
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

        .save-btn {
            width: 100%;
            margin-top: 5px;
            padding: 12px;
        }

        @media(max-width: 650px) {
            .form-grid,
            .form-grid.three {
                grid-template-columns: 1fr;
            }

            .field.full {
                grid-column: auto;
            }

            .attributes-grid {
                grid-template-columns: 1fr;
            }
        }

        /* ==============================
           DANGER
        ============================== */

        .danger-zone {
            margin-top: 20px;
            padding-top: 18px;
            border-top: 1px solid var(--border);
        }

        .danger-title {
            color: var(--danger);
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        /* ==============================
           EMPTY CHARACTER
        ============================== */

        .no-character {
            text-align: center;
            padding: 50px 20px;
        }

        .no-character-icon {
            font-size: 40px;
            margin-bottom: 15px;
        }

        .no-character-title {
            font-size: 16px;
            font-weight: 800;
            margin-bottom: 7px;
        }

        .no-character-text {
            color: var(--muted);
            font-size: 12px;
        }
    </style>
</head>

<body>
<div class="container">

    <!-- ==============================
         HEADER
    ============================== -->

    <div class="page-header">
        <a href="/admin" class="btn back-btn">
            ← Retour aux joueurs
        </a>

        <div class="admin-status">
            🛡️ Connecté en tant que Maître du Jeu
        </div>
    </div>

    <!-- ==============================
         PLAYER
    ============================== -->

    <div class="card player-card">
        <div class="player-info">
            <div class="player-avatar">👤</div>

            <div>
                <div class="player-name">
                    ${playerWithData.username}
                </div>

                <div class="player-meta">
                    ID : ${playerWithData.id}
                    &nbsp;•&nbsp;
                    Créé le : ${new Date(playerWithData.createdAt).toLocaleDateString("fr-FR")}
                </div>
            </div>
        </div>

        <span class="badge ${playerWithData.role === "admin" ? "badge-admin" : "badge-player"}">
            ${playerWithData.role || "player"}
        </span>
    </div>

    ${
			char
				? `

    <div class="dashboard-grid">

        <!-- ======================================
             COLONNE GAUCHE
        ======================================= -->

        <main>

            <!-- STATS -->
            <div class="card">

                <div class="card-header">
                    <div>
                        <div class="card-title">📊 Statistiques du personnage</div>
                        <div class="card-subtitle">
                            Vue générale de l'état actuel du personnage
                        </div>
                    </div>
                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <div class="stat-label">Niveau</div>
                        <div class="stat-value">${char.level || 1}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Or</div>
                        <div class="stat-value gold">${char.gold || 0} 🪙</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Banque</div>
                        <div class="stat-value gold">${char.bankGold || 0} 🪙</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Points de vie</div>
                        <div class="stat-value hp">
                            ${char.health?.current || 0}/${char.health?.max || 0}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Expérience</div>
                        <div class="stat-value">
                            ${char.experience?.current || 0}/${char.experience?.required || 0}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-label">Classe</div>
                        <div class="stat-value" style="font-size:14px;text-transform:capitalize;">
                            ${char.classId || "N/A"}
                        </div>
                    </div>

                </div>

                <!-- INFOS -->
                <div class="info-list">

                    <div class="info-item">
                        <span>📍 Position</span>
                        <strong>${char.location || "Inconnue"}</strong>
                    </div>

                    <div class="info-item">
                        <span>⚔️ Combat</span>
                        <strong style="color:${char.inCombat ? "var(--danger)" : "var(--success)"}">
                            ${char.inCombat ? "Oui" : "Non"}
                        </strong>
                    </div>

                    <div class="info-item">
                        <span>🏃 Voyage</span>
                        <strong>${char.isTravelling ? "Oui" : "Non"}</strong>
                    </div>

                    <div class="info-item">
                        <span>💀 État</span>
                        <strong style="color:${char.isDead ? "var(--danger)" : "var(--success)"}">
                            ${char.isDead ? "Mort" : "Vivant"}
                        </strong>
                    </div>

                    <div class="info-item">
                        <span>🏦 Banque</span>
                        <strong style="color:${char.bankUnlocked ? "var(--success)" : "var(--danger)"}">
                            ${char.bankUnlocked ? "Débloquée" : "Bloquée"}
                        </strong>
                    </div>

                    <div class="info-item">
                        <span>💍 Mariage</span>
                        <strong>
                            ${char.marriedTo || "Célibataire"}
                        </strong>
                    </div>

                </div>

                <!-- ATTRIBUTS -->
                <div style="margin-top:22px;">

                    <div class="card-header" style="margin-bottom:0;">
                        <div>
                            <div class="card-title">💪 Attributs</div>
                            <div class="card-subtitle">
                                Répartition des caractéristiques du personnage
                            </div>
                        </div>
                    </div>

                    <div class="attributes-grid">

                        <div class="attribute">
                            <div class="attribute-name">Force</div>

                            <div class="attribute-controls">
                                <button type="button" class="attribute-btn" onclick="changeAttribute('str', -1)">−</button>
                                <span class="attribute-value" id="display-str">
                                    ${char.attributes?.strength || 0}
                                </span>
                                <button type="button" class="attribute-btn" onclick="changeAttribute('str', 1)">+</button>
                            </div>

                            <input
                                type="hidden"
                                id="input-str"
                                name="str"
                                value="${char.attributes?.strength || 0}"
                                form="full-profile-form"
                            >
                        </div>

                        <div class="attribute">
                            <div class="attribute-name">Agilité</div>

                            <div class="attribute-controls">
                                <button type="button" class="attribute-btn" onclick="changeAttribute('agi', -1)">−</button>
                                <span class="attribute-value" id="display-agi">
                                    ${char.attributes?.agility || 0}
                                </span>
                                <button type="button" class="attribute-btn" onclick="changeAttribute('agi', 1)">+</button>
                            </div>

                            <input
                                type="hidden"
                                id="input-agi"
                                name="agi"
                                value="${char.attributes?.agility || 0}"
                                form="full-profile-form"
                            >
                        </div>

                        <div class="attribute">
                            <div class="attribute-name">Intelligence</div>

                            <div class="attribute-controls">
                                <button type="button" class="attribute-btn" onclick="changeAttribute('int', -1)">−</button>
                                <span class="attribute-value" id="display-int">
                                    ${char.attributes?.intelligence || 0}
                                </span>
                                <button type="button" class="attribute-btn" onclick="changeAttribute('int', 1)">+</button>
                            </div>

                            <input
                                type="hidden"
                                id="input-int"
                                name="int"
                                value="${char.attributes?.intelligence || 0}"
                                form="full-profile-form"
                            >
                        </div>

                        <div class="attribute">
                            <div class="attribute-name">Défense</div>

                            <div class="attribute-controls">
                                <button type="button" class="attribute-btn" onclick="changeAttribute('def', -1)">−</button>
                                <span class="attribute-value" id="display-def">
                                    ${char.attributes?.defense || 0}
                                </span>
                                <button type="button" class="attribute-btn" onclick="changeAttribute('def', 1)">+</button>
                            </div>

                            <input
                                type="hidden"
                                id="input-def"
                                name="def"
                                value="${char.attributes?.defense || 0}"
                                form="full-profile-form"
                            >
                        </div>

                    </div>

                    <div class="points-box">
                        ⭐ ${char.attributes?.points || 0} point(s) d'attribut disponible(s)
                    </div>

                </div>

            </div>

            <!-- INVENTAIRE -->

            <div class="card">

                <div class="card-header">
                    <div>
                        <div class="card-title">🎒 Inventaire</div>
                        <div class="card-subtitle">
                            ${Array.isArray(char.inventory) ? char.inventory.length : 0} type(s) d'objet
                        </div>
                    </div>
                </div>

                ${
									Array.isArray(char.inventory) && char.inventory.length > 0
										? `
        <div class="inventory-list">

            ${char.inventory
							.map((item: any) => {
								const rarityColors: Record<string, string> = {
									common: "#94a3b8",
									uncommon: "#22c55e",
									rare: "#3b82f6",
									epic: "#a855f7",
									legendary: "#f59e0b",
									mythic: "#ef4444",
								};

								const rarityLabels: Record<string, string> = {
									common: "Commun",
									uncommon: "Peu commun",
									rare: "Rare",
									epic: "Épique",
									legendary: "Légendaire",
									mythic: "Mythique",
								};

								const categoryLabels: Record<string, string> = {
									materials: "Matériau",
									weapon: "Arme",
									armor: "Armure",
									consumable: "Consommable",
									quest: "Quête",
									misc: "Divers",
								};

								const rarity = item.rarity || "common";
								const rarityColor = rarityColors[rarity] || rarityColors.common;
								const rarityLabel = rarityLabels[rarity] || rarity;
								const categoryLabel =
									categoryLabels[item.category] || item.category || "Divers";

								return `
                    <div class="inventory-item">

                        <div class="inventory-main">

                            <div class="inventory-icon">
                                📦
                            </div>

                            <div class="inventory-info">

                                <div class="inventory-name">
                                    ${item.name || item.itemId || "Objet inconnu"}

                                    ${
																			item.isEquipped
																				? `
                                        <span class="equipped-badge">
                                            Équipé
                                        </span>
                                    `
																				: ""
																		}
                                </div>

                                <div class="inventory-meta">

                                    <span>
                                        ${categoryLabel}
                                    </span>

                                    <span>•</span>

                                    <span style="color: ${rarityColor};">
                                        ${rarityLabel}
                                    </span>

                                    <span>•</span>

                                    <span class="item-id">
                                        ${item.itemId || "ID inconnu"}
                                    </span>

                                </div>

                            </div>

                        </div>

                        <div class="inventory-right">

                            <div class="item-stack">
                                <span class="quantity-label">Quantité</span>
                                <strong>
                                    ${item.quantity || 1}
                                </strong>
                                <span class="max-stack">
                                    / ${item.maxStack || 1}
                                </span>
                            </div>

                        </div>

                    </div>
                `;
							})
							.join("")}

        </div>
    `
										: `
        <div class="empty-state">
            🎒 L'inventaire est vide.
        </div>
    `
								}


            </div>

        </main>

        <!-- ======================================
             COLONNE DROITE
        ======================================= -->

        <aside>

            <div class="card">

                <div class="card-header">
                    <div>
                        <div class="card-title">⚙️ Modifier le personnage</div>
                        <div class="card-subtitle">
                            Modifiez les données directement depuis cette page
                        </div>
                    </div>
                </div>

                <form
                    id="full-profile-form"
                    action="/admin/action/${playerWithData.id}"
                    method="POST"
                >

                    


                    <!-- COMPTE -->
                    <div class="form-section">

                        <div class="form-section-title">
                            👤 Compte
                        </div>

                        <div class="form-grid">

                            <div class="field">
                                <label>ID du compte</label>
                                <input
                                    type="text"
                                    name="id"
                                    value="${playerWithData.id}"
                                    required
                                >
                            </div>

                            <div class="field">
                                <label>Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    name="username"
                                    value="${playerWithData.username}"
                                    required
                                >
                            </div>

                            <div class="field full">
                                <label>Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Laisser vide pour conserver l'actuel"
                                >
                            </div>

                        </div>

                    </div>

                    <!-- PERSONNAGE -->
                    <div class="form-section">

                        <div class="form-section-title">
                            🧙 Personnage
                        </div>

                        <div class="form-grid">

                            <div class="field">
                                <label>Classe</label>
                                <input
                                    type="text"
                                    name="classId"
                                    value="${char.classId || ""}"
                                >
                            </div>

                            <div class="field">
                                <label>Position</label>
                                <input
                                    type="text"
                                    name="location"
                                    value="${char.location || ""}"
                                >
                            </div>

                        </div>

                    </div>

                    <!-- PROGRESSION -->
                    <div class="form-section">

                        <div class="form-section-title">
                            📈 Progression
                        </div>

                        <div class="form-grid">

                            <div class="field">
                                <label>Niveau</label>
                                <input
                                    type="number"
                                    name="level"
                                    value="${char.level || 1}"
                                    min="1"
                                >
                            </div>

                            <div class="field">
                                <label>Or</label>
                                <input
                                    type="number"
                                    name="gold"
                                    value="${char.gold || 0}"
                                    min="0"
                                >
                            </div>

                            <div class="field">
                                <label>XP actuelle</label>
                                <input
                                    type="number"
                                    name="expCurrent"
                                    value="${char.experience?.current || 0}"
                                    min="0"
                                >
                            </div>

                            <div class="field">
                                <label>XP requise</label>
                                <input
                                    type="number"
                                    name="expRequired"
                                    value="${char.experience?.required || 100}"
                                    min="1"
                                >
                            </div>

                        </div>

                    </div>

                    <!-- SANTE -->
                    <div class="form-section">

                        <div class="form-section-title">
                            ❤️ Santé
                        </div>

                        <div class="form-grid">

                            <div class="field">
                                <label>HP actuels</label>
                                <input
                                    type="number"
                                    name="hpCurrent"
                                    value="${char.health?.current || 100}"
                                    min="0"
                                >
                            </div>

                            <div class="field">
                                <label>HP maximum</label>
                                <input
                                    type="number"
                                    name="hpMax"
                                    value="${char.health?.max || 100}"
                                    min="1"
                                >
                            </div>

                        </div>

                    </div>

                    <!-- BANQUE -->
                    <div class="form-section">

                        <div class="form-section-title">
                            🏦 Banque
                        </div>

                        <div class="form-grid">

                            <div class="field">
                                <label>Or en banque</label>
                                <input
                                    type="number"
                                    name="bankGold"
                                    value="${char.bankGold || 0}"
                                    min="0"
                                >
                            </div>

                            <div class="field">
                                <label>Banque débloquée</label>
                                <select name="bankUnlocked">
                                    <option value="true" ${char.bankUnlocked ? "selected" : ""}>
                                        Oui
                                    </option>
                                    <option value="false" ${!char.bankUnlocked ? "selected" : ""}>
                                        Non
                                    </option>
                                </select>
                            </div>

                        </div>

                    </div>

                    <!-- RELATIONS -->
                    <div class="form-section">

                        <div class="form-section-title">
                            💍 Relations
                        </div>

                        <div class="field">
                            <label>Marié(e) à</label>
                            <input
                                type="text"
                                name="marriedTo"
                                value="${char.marriedTo || ""}"
                                placeholder="Nom ou ID du personnage"
                            >
                        </div>

                    </div>

                    


                    <button type="submit" class="btn btn-primary save-btn">
                        💾 Enregistrer les modifications
                    </button>

                </form>

            </div>

            <!-- PARAMETRES COMPTE -->

            <div class="card">

                <div class="card-header">
                    <div>
                        <div class="card-title">🔐 Compte</div>
                        <div class="card-subtitle">
                            Paramètres administratifs
                        </div>
                    </div>
                </div>

                <div class="form-section">

                    <div class="form-section-title">
                        🛡️ Rôle
                    </div>

                    <form
                        action="/admin/action/${playerWithData.id}"
                        method="POST"
                    >
                        <input
                            type="hidden"
                            name="actionType"
                            value="change_role"
                        >

                        <select
                            name="value"
                            onchange="this.form.submit()"
                        >
                            <option
                                value="player"
                                ${playerWithData.role !== "admin" ? "selected" : ""}
                            >
                                Joueur
                            </option>

                            <option
                                value="admin"
                                ${playerWithData.role === "admin" ? "selected" : ""}
                            >
                                Administrateur
                            </option>
                        </select>
                    </form>

                </div>

                ${
									playerWithData.id !== currentAdminUser?.id
										? `
                    <div class="danger-zone">

                        <div class="danger-title">
                            ⚠️ Zone dangereuse
                        </div>

                        <form
                            action="/admin/action/${playerWithData.id}"
                            method="POST"
                            onsubmit="return confirm('Attention : Voulez-vous vraiment supprimer définitivement ce compte ?');"
                        >
                            <input
                                type="hidden"
                                name="actionType"
                                value="delete_account"
                            >

                            <button
                                type="submit"
                                class="btn btn-danger"
                                style="width:100%;"
                            >
                                🗑️ Supprimer définitivement
                            </button>
                        </form>

                    </div>
                    `
										: ""
								}

            </div>

        </aside>

    </div>

    `
				: `

    <!-- ======================================
         PAS DE PERSONNAGE
    ======================================= -->

    <div class="card no-character">

        <div class="no-character-icon">
            🧙
        </div>

        <div class="no-character-title">
            Aucun personnage
        </div>

        <div class="no-character-text">
            Aucun personnage de jeu n'est actuellement initialisé pour ce compte.
        </div>

        ${
					playerWithData.id !== currentAdminUser?.id
						? `
            <form
                action="/admin/action/${playerWithData.id}"
                method="POST"
                onsubmit="return confirm('Attention : Voulez-vous vraiment supprimer définitivement ce compte ?');"
                style="margin-top:20px;"
            >
                <input
                    type="hidden"
                    name="actionType"
                    value="delete_account"
                >

                <button type="submit" class="btn btn-danger">
                    🗑️ Supprimer le compte
                </button>
            </form>
            `
						: ""
				}

    </div>

    `
		}

</div>

<script>
    function changeAttribute(attribute, amount) {
        const input = document.getElementById('input-' + attribute);
        const display = document.getElementById('display-' + attribute);

        if (!input || !display) return;

        let value = parseInt(input.value || '0', 10);

        value += amount;

        // Impossible de descendre sous 0
        if (value < 0) {
            value = 0;
        }

        input.value = value;
        display.textContent = value;
    }
</script>

</body>
</html>
    `;
}
