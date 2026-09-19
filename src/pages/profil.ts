export function renderProfilePage(version: string, player: any, partnerAccount: any): string {
    const isMarried = player?.marriage?.partnerId && player.marriage.partnerId !== '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Profile: ${player.name || player.username}</title>
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
                    --success: #34d399;
                    --marriage: #ec4899;
                    --marriage-glow: rgba(236, 72, 153, 0.12);
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
                    padding: 20px;
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .panel {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 16px;
                    padding: 24px;
                    width: 400px;
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(12px);
                    transition: border-color 0.3s ease;
                }
                .panel:hover {
                    border-color: var(--card-border-hover);
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

                .profile-header {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 14px;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 16px;
                }

                .profile-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 3px;
                }

                .profile-location {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                }

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

                .section-title {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-bottom: 8px;
                }

                .attributes-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .attribute-item {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 8px 10px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                }

                .attribute-name {
                    color: var(--text-muted);
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .attribute-value {
                    color: var(--text-main);
                    font-weight: 700;
                }

                .marriage-status {
                    background: var(--marriage-glow);
                    border: 1px solid rgba(236, 72, 153, 0.2);
                    border-radius: 10px;
                    padding: 10px;
                    text-align: center;
                    margin-bottom: 16px;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .marriage-status strong {
                    color: var(--marriage);
                    font-weight: 600;
                }

                .footer-link {
                    display: block;
                    text-align: center;
                    font-size: 11px;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-weight: 600;
                    transition: color 0.2s ease;
                }
                .footer-link:hover {
                    color: var(--primary);
                }
            </style>
        </head>
        <body>
            <div class="panel">
                <div class="header-flex">
                    <h1>Adventurer Profile</h1>
                    <span class="badge">v${version}</span>
                </div>

                <div class="profile-header">
                    <div class="profile-name">${player.name || player.username}</div>
                    <div class="profile-location">📍 ${player.location || 'Unknown Location'}</div>
                </div>

                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">Level</div>
                        <div class="stat-value">${player.level || 1}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Health</div>
                        <div class="stat-value" style="color: var(--danger);">${player.health.current ?? 100}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Gold</div>
                        <div class="stat-value" style="color: var(--accent);">${player.gold || 0}</div>
                    </div>
                    <div class="stat-box" style="grid-column: span 3;">
                        <div class="stat-label">Experience (XP)</div>
                        <div class="stat-value" style="color: var(--success);">${player.xp || 0} XP</div>
                    </div>
                </div>

                <div class="section-title">Attributes</div>
                <div class="attributes-grid">
                    ${player.attributes ? Object.entries(player.attributes).map(([key, value]) => `
                        <div class="attribute-item">
                            <span class="attribute-name">${key}</span>
                            <span class="attribute-value">${value}</span>
                        </div>
                    `).join('') : '<div class="attribute-item" style="grid-column: span 2; justify-content: center;"><span class="attribute-name">No attributes assigned</span></div>'}
                </div>

                ${isMarried ? `
                    <div class="marriage-status">
                        Bound in matrimony with <strong>${partnerAccount?.name || partnerAccount?.username || 'an adventurer'}</strong> ❤️
                    </div>
                ` : ''}

                <a href="/" class="footer-link">← Return to Sanctuary</a>
            </div>
        </body>
        </html>
    `;
}