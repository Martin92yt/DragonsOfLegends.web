export function renderBankPage(version: string, player: any, unlockCost: number = 0): string {
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Royal Bank</title>
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
                    width: 360px;
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

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .stat-box {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 12px 8px;
                    border-radius: 10px;
                    text-align: center;
                }

                .stat-label {
                    font-size: 9px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-bottom: 4px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--accent);
                }

                .section-title {
                    font-size: 10px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.8px;
                    margin: 16px 0 8px 0;
                    font-weight: 700;
                }

                .form-group {
                    margin-bottom: 12px;
                }

                input[type="number"] {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    padding: 10px 12px;
                    border-radius: 10px;
                    color: var(--text-main);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    outline: none;
                }

                input[type="number"]:focus {
                    border-color: var(--accent);
                    background: rgba(255, 255, 255, 0.04);
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
                    width: 100%;
                    text-align: center;
                    cursor: pointer;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.25s ease;
                    margin-top: 6px;
                }

                .btn-action:hover {
                    background: rgba(251, 191, 36, 0.12);
                    border-color: var(--accent);
                    color: var(--accent);
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 16px;
                    display: block;
                    text-align: center;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .btn-secondary:hover {
                    color: var(--text-main);
                }
            </style>
        </head>
        <body>
            <div class="game-container">
                <div class="panel">
                    <div class="header-flex">
                        <h1>Banque Royale</h1>
                        <span class="badge">v${version}</span>
                    </div>
                    
                    <div class="user-info">
                        <span><strong>${player.name}</strong></span>
                        <span style="font-size: 11px; color: var(--accent);">🏦 Coffre-fort</span>
                    </div>

                    ${!player.bankUnlocked ? `
                        <!-- Section : Banque non débloquée -->
                        <div style="text-align: center; padding: 20px 0;">
                            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
                                Votre compte en banque n'est pas encore ouvert. ${unlockCost > 0 ? `Frais d'ouverture : <strong style="color: var(--accent);">${unlockCost} 🪙</strong>` : 'L\'ouverture est gratuite !'}
                            </p>
                            <form action="/action/bank/unlock" method="POST">
                                <button type="submit" class="btn-action" style="border-color: var(--accent); color: var(--accent);">
                                    Débloquer le compte 🔓
                                </button>
                            </form>
                        </div>
                    ` : `
                        <!-- Section : Banque débloquée -->
                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="stat-label">Or sur vous</div>
                                <div class="stat-value" style="color: var(--primary);">${player.gold ?? 0} 🪙</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">Or en banque</div>
                                <div class="stat-value">${player.bank?.balance ?? 0} 🪙</div>
                            </div>
                        </div>

                        <!-- Formulaire de Dépôt -->
                        <form action="/action/bank/deposit" method="POST">
                            <div class="section-title">Déposer de l'or</div>
                            <div class="form-group">
                                <input type="number" name="amount" min="1" max="${player.gold ?? 0}" placeholder="Montant à déposer..." required>
                            </div>
                            <button type="submit" class="btn-action">
                                Déposer <span class="icon">📥</span>
                            </button>
                        </form>

                        <!-- Formulaire de Retrait -->
                        <form action="/action/bank/withdraw" method="POST" style="margin-top: 16px;">
                            <div class="section-title">Retirer de l'or</div>
                            <div class="form-group">
                                <input type="number" name="amount" min="1" max="${player.bank?.balance ?? 0}" placeholder="Montant à retirer..." required>
                            </div>
                            <button type="submit" class="btn-action">
                                Retirer <span class="icon">📤</span>
                            </button>
                        </form>
                    `}

                    <a href="/" class="btn-secondary">← Retour à l'accueil</a>
                </div>
            </div>
        </body>
        </html>
    `;
}