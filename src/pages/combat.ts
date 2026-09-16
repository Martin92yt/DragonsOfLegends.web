export function renderCombatPage(version: string, player: any, combatResult: any): string {
  const monster = combatResult.enemyEntity || combatResult.enemy;

  // Calculate monster HP percentage
  const hpPercent = Math.min(100, Math.round((monster.health / monster.health) * 100));

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Dragons of Legends — Combat</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #030407;
                --card-bg: #0a0d14;
                --card-border: rgba(255, 255, 255, 0.06);
                --card-border-hover: rgba(248, 113, 113, 0.3);
                --text-main: #f8fafc;
                --text-muted: #64748b;
                --primary: #38bdf8;
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

            .panel {
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                border-radius: 16px;
                padding: 24px;
                width: 380px;
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(12px);
                transition: border-color 0.3s ease;
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
                color: var(--danger);
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .badge {
                font-size: 10px;
                background: var(--danger-glow);
                border: 1px solid rgba(248, 113, 113, 0.2);
                color: var(--danger);
                padding: 2px 8px;
                border-radius: 6px;
                font-weight: 600;
                letter-spacing: 0.3px;
            }

            .monster-card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--card-border);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
                text-align: center;
                transition: border-color 0.2s ease;
            }
            .monster-card:hover {
                border-color: var(--card-border-hover);
            }

            .monster-name {
                font-size: 15px;
                font-weight: 700;
                color: var(--text-main);
                margin-bottom: 2px;
                letter-spacing: 0.3px;
            }

            .monster-type {
                font-size: 10px;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.8px;
                margin-bottom: 14px;
                font-weight: 600;
            }

            .progress-container {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--card-border);
                border-radius: 10px;
                padding: 10px 14px;
                margin-bottom: 14px;
                text-align: left;
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

            .progress-fill.hp {
                background: var(--danger);
                height: 100%;
                border-radius: 2px;
                box-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
                transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .stats-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .stat-subbox {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--card-border);
                padding: 8px;
                border-radius: 8px;
                font-size: 11px;
                color: var(--text-muted);
            }

            .stat-subbox strong {
                color: var(--text-main);
                font-weight: 700;
            }

            .actions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .btn {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--card-border);
                color: var(--text-main);
                padding: 12px;
                border-radius: 10px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                text-align: center;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .btn:hover {
                background: rgba(56, 189, 248, 0.05);
                border-color: var(--primary);
                color: var(--primary);
                transform: translateY(-1px);
            }

            .btn.attack {
                background: rgba(248, 113, 113, 0.04);
                border-color: rgba(248, 113, 113, 0.2);
                color: var(--danger);
            }
            .btn.attack:hover {
                background: rgba(248, 113, 113, 0.08);
                border-color: var(--danger);
                color: var(--danger);
                box-shadow: 0 4px 12px rgba(248, 113, 113, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="panel">
            <div class="header-flex">
                <h1>Active Combat</h1>
                <span class="badge">v${version}</span>
            </div>

            <div class="monster-card">
                <div class="monster-name">${monster.name}</div>
                <div class="monster-type">Type: ${monster.type}</div>

                <div class="progress-container">
                    <div class="progress-info">
                        <span>Enemy Health</span>
                        <span>${monster.health} / ${monster.maxHealth}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill hp" style="width: ${hpPercent}%;"></div>
                    </div>
                </div>

                <div class="stats-row">
                    <div class="stat-subbox">Str: <strong>${monster.strength}</strong></div>
                    <div class="stat-subbox">Def: <strong>${monster.defense}</strong></div>
                </div>
            </div>

            <div class="actions-grid">
                <form action="/action/combat/attack" method="POST" style="margin:0;">
                    <button type="submit" class="btn attack" style="width:100%;">Attack ⚔️</button>
                </form>
                <a href="/" class="btn">Flee 🏃‍♂️</a>
            </div>
        </div>
    </body>
    </html>
  `;
}