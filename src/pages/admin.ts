export function renderAdminPage(version: string, user: any, allAccounts: any[], stats: any, search: string, message?: { type: 'success' | 'error', text: string }): string {
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Sanctuary Admin</title>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
    --bg-main: #06080c;
    --bg-card: #0d111a;
    --border-color: rgba(255, 255, 255, 0.06);
    --border-glow: rgba(56, 189, 248, 0.2);
    --text-main: #f1f5f9;
    --text-muted: #64748b;
    --primary: #38bdf8;
    --primary-glow: rgba(56, 189, 248, 0.12);
    --accent: #f59e0b;
    --danger: #ef4444;
    --danger-glow: rgba(239, 68, 68, 0.15);
    --success: #10b981;
    --success-glow: rgba(16, 185, 129, 0.15);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    min-height: 100vh;
}

.admin-container {
    width: 100%;
    max-width: 1000px;
}

/* Header Panel */
.header-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 24px 30px;
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}

.header-panel h1 {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-main);
    letter-spacing: -0.5px;
}

/* Alert Boxes */
.alert-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 24px;
    border: 1px solid transparent;
}
.alert-success {
    background: var(--success-glow);
    border-color: rgba(16, 185, 129, 0.3);
    color: var(--success);
}
.alert-error {
    background: var(--danger-glow);
    border-color: rgba(239, 68, 68, 0.3);
    color: var(--danger);
}

/* Stats Bar */
.stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 20px;
    border-radius: 14px;
}

.stat-lbl {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.stat-num {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary);
    margin-top: 6px;
}

/* Toolbar & Search */
.toolbar {
    margin-bottom: 24px;
}

.search-form {
    display: flex;
    gap: 10px;
}

input[type="text"], input[type="number"], select {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-color);
    color: white;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    transition: all 0.2s ease;
    flex: 1;
}

input:focus, select:focus {
    border-color: var(--primary);
    background: rgba(56, 189, 248, 0.02);
}

/* Buttons */
.btn {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn:hover {
    background: var(--primary-glow);
    border-color: var(--primary);
    color: var(--primary);
}

.btn-danger {
    color: var(--danger);
    border-color: rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
    background: var(--danger-glow);
    border-color: var(--danger);
}

/* Players Grid */
.players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}

.player-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 14px;
}

.player-card:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -10px rgba(56, 189, 248, 0.15);
}

.player-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.player-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-main);
}

.player-id {
    font-size: 10px;
    color: var(--text-muted);
    font-family: monospace;
    margin-top: 2px;
}

/* Role Badges */
.role-badge {
    font-size: 9px;
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 700;
    text-transform: uppercase;
}

.role-admin {
    background: rgba(245, 158, 11, 0.12);
    color: var(--accent);
    border: 1px solid rgba(245, 158, 11, 0.3);
}

.role-player {
    background: rgba(56, 189, 248, 0.12);
    color: var(--primary);
    border: 1px solid rgba(56, 189, 248, 0.3);
}
                .player-card {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .player-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="admin-container">
                <div class="header-panel">
                    <div>
                        <h1>Sanctuary Control</h1>
                        <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Maître du Jeu : ${user.username}</p>
                    </div>
                    <a href="/" class="btn">← Retour au Jeu</a>
                </div>

                ${message ? `
                    <div class="alert-box ${message.type === 'success' ? 'alert-success' : 'alert-error'}">
                        <span>${message.type === 'success' ? '✨' : '⚠️'}</span>
                        <span>${message.text}</span>
                    </div>
                ` : ''}

                <!-- Stats Globales -->
                <div class="stats-bar">
                    <div class="stat-card">
                        <div class="stat-lbl">Total Aventuriers</div>
                        <div class="stat-num">${stats.totalAccounts}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-lbl">Or Global en Circulation</div>
                        <div class="stat-num" style="color: var(--success);">${stats.totalGold} 🪙</div>
                    </div>
                </div>

                <!-- Recherche -->
                <div class="toolbar">
                    <form action="/admin" method="GET" class="search-form">
                        <input type="text" name="search" placeholder="Rechercher un aventurier..." value="${search || ''}">
                        <button type="submit" class="btn">Rechercher</button>
                        ${search ? `<a href="/admin" class="btn" style="display:flex; align-items:center;">Effacer</a>` : ''}
                    </form>
                </div>

                <!-- Grille des Joueurs -->
                <div class="players-grid">
                    ${allAccounts.map(acc => `
                        <div class="player-card" onclick="window.location.href='/admin/player/${acc.id}'">
                            <div class="player-header">
                                <div>
                                    <div class="player-name">${acc.username}</div>
                                    <div class="player-id">ID: ${acc.id.substring(0, 8)}...</div>
                                </div>
                                <span class="role-badge ${acc.role === 'admin' ? 'role-admin' : 'role-player'}">${acc.role || 'player'}</span>
                            </div>
                            <div style="font-size: 11px; color: var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
                                <span>Niveau : <strong style="color:var(--text-main);">${acc.character?.level || 'N/A'}</strong></span>
                                <span style="color: var(--primary);">Gérer le profil →</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `;
}