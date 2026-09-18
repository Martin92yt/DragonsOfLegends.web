export function renderHomePage(version: string, player: any): string {
    const xpPercent = Math.min(100, Math.round((player.experience.current / player.experience.required) * 100));
    const hpPercent = Math.min(100, Math.round((player.health.current / player.health.max) * 100));

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Sanctuary</title>
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
                    --accent: #fbbf24;
                    --danger: #f87171;
                    --danger-glow: rgba(248, 113, 113, 0.12);
                    --success: #34d399;
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

                .game-container {
                    display: flex;
                    gap: 16px;
                }

                .panel {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(12px);
                    transition: border-color 0.3s ease;
                }

                .main-panel {
                    width: 360px;
                }

                .action-panel {
                    width: 220px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
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

                .user-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                }

                .user-info strong {
                    color: var(--text-main);
                    font-weight: 600;
                }

                .logout-btn {
                    color: var(--danger);
                    font-size: 11px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: opacity 0.2s ease;
                }
                .logout-btn:hover { opacity: 0.7; }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .stat-box {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 10px 6px;
                    border-radius: 10px;
                    text-align: center;
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }
                .stat-box:hover {
                    border-color: var(--card-border-hover);
                    transform: translateY(-1px);
                }

                .stat-label {
                    font-size: 9px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-bottom: 3px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--primary);
                }

                .progress-container {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin-bottom: 10px;
                }

                .progress-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                    font-weight: 500;
                }

                .progress-bar {
                    background: rgba(255, 255, 255, 0.05);
                    height: 4px;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .progress-fill.hp { background: var(--success); box-shadow: 0 0 10px rgba(52, 211, 153, 0.3); }
                .progress-fill.xp { background: var(--accent); box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }

                .section-title {
                    font-size: 10px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.8px;
                    margin: 16px 0 8px 0;
                    font-weight: 700;
                }

                .attributes-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 6px;
                }

                .attr-box {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 8px 2px;
                    border-radius: 8px;
                    text-align: center;
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }
                .attr-box:hover {
                    border-color: var(--card-border-hover);
                    transform: translateY(-1px);
                }

                .attr-name {
                    font-size: 9px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .attr-val {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-top: 2px;
                }

                /* --- ACTION PANEL --- */
                .action-title {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin: 0 0 4px 0;
                    border-bottom: 1px solid var(--card-border);
                    padding-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .btn-action {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    color: var(--text-main);
                    padding: 12px 14px;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn-action:hover {
                    background: var(--primary-glow);
                    border-color: var(--primary);
                    color: var(--primary);
                    transform: translateX(3px);
                    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.1);
                }

                .btn-action span.icon {
                    font-size: 13px;
                    transition: transform 0.2s ease;
                }
                .btn-action:hover span.icon {
                    transform: scale(1.15);
                }

                .btn-action.danger:hover {
                    background: var(--danger-glow);
                    border-color: var(--danger);
                    color: var(--danger);
                    box-shadow: 0 4px 12px rgba(248, 113, 113, 0.1);
                }
            </style>
        </head>
        <body>
            <div class="game-container">
                <!-- MAIN PANEL (PLAYER STATS) -->
                <div class="panel main-panel">
                    <div class="header-flex">
                        <h1>Dragons of Legends</h1>
                        <span class="badge">v${version}</span>
                    </div>
                    
                    <div class="user-info">
                        <span><strong>${player.name}</strong> <span style="font-size: 11px; color: var(--text-muted);">(${player.classId})</span></span>
                        <a href="/logout" class="logout-btn">Logout</a>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-label">Level</div>
                            <div class="stat-value">${player.level}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Gold</div>
                            <div class="stat-value" style="color: var(--accent);">${player.gold}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Location</div>
                            <div class="stat-value" style="font-size: 10px; color: #a78bfa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${player.location}">${player.location}</div>
                        </div>
                    </div>

                    <div class="progress-container">
                        <div class="progress-info">
                            <span>Health Points</span>
                            <span>${player.health.current} / ${player.health.max}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill hp" style="width: ${hpPercent}%;"></div>
                        </div>
                    </div>

                    <div class="progress-container" style="margin-bottom: 0;">
                        <div class="progress-info">
                            <span>Experience</span>
                            <span>${player.experience.current} / ${player.experience.required}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill xp" style="width: ${xpPercent}%;"></div>
                        </div>
                    </div>

                    <div class="section-title">Attributes</div>
                    <div class="attributes-grid">
                        <div class="attr-box">
                            <div class="attr-name">STR</div>
                            <div class="attr-val">${player.attributes.strength}</div>
                        </div>
                        <div class="attr-box">
                            <div class="attr-name">AGI</div>
                            <div class="attr-val">${player.attributes.agility}</div>
                        </div>
                        <div class="attr-box">
                            <div class="attr-name">INT</div>
                            <div class="attr-val">${player.attributes.intelligence}</div>
                        </div>
                        <div class="attr-box">
                            <div class="attr-name">DEF</div>
                            <div class="attr-val">${player.attributes.defense}</div>
                        </div>
                        <div class="attr-box">
                            <div class="attr-name">PTS</div>
                            <div class="attr-val" style="color: var(--accent);">${player.attributes.points}</div>
                        </div>
                    </div>
                </div>

                <!-- ACTION PANEL (SIDEBAR) -->
                <div class="panel action-panel">
                    <div class="action-title">Actions</div>
                    
                    <a href="/inventory" class="btn-action">
                        Inventory <span class="icon">🎒</span>
                    </a>

                    <!-- Bouton Bank ajouté ici -->
                    <a href="/action/bank" class="btn-action">
                        Bank <span class="icon">🏦</span>
                    </a>
                    
                    <form action="/action/combat" method="POST" style="margin: 0;">
                        <button type="submit" class="btn-action danger" style="width: 100%;">
                            Combat <span class="icon">⚔️</span>
                        </button>
                    </form>

                    <form action="/action/travel" method="POST" style="margin: 0;">
                        <button type="submit" class="btn-action" style="width: 100%;">
                            Travel <span class="icon">🗺️</span>
                        </button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `;
}