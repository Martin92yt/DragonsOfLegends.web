export function renderMarriagePage(version: string, user: any, player: any, partnerAccount: any): string {
    const isMarried = player?.marriage?.partnerId && player.marriage.partnerId !== '';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Sanctuary of Bonds</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                :root {
                    --bg-color: #030407;
                    --card-bg: #0a0d14;
                    --card-border: rgba(255, 255, 255, 0.06);
                    --card-border-hover: rgba(236, 72, 153, 0.3);
                    --text-main: #f8fafc;
                    --text-muted: #64748b;
                    --primary: #38bdf8;
                    --marriage: #ec4899;
                    --marriage-glow: rgba(236, 72, 153, 0.12);
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
                    color: var(--marriage);
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .badge {
                    font-size: 10px;
                    background: var(--marriage-glow);
                    border: 1px solid rgba(236, 72, 153, 0.2);
                    color: var(--marriage);
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                .description {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                    line-height: 1.5;
                }

                .status-box {
                    background: rgba(236, 72, 153, 0.02);
                    border: 1px solid rgba(236, 72, 153, 0.2);
                    border-radius: 10px;
                    padding: 14px;
                    margin-bottom: 16px;
                    text-align: center;
                }

                .status-box p {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .status-box h3 {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--marriage);
                }

                .form-group {
                    margin-bottom: 12px;
                    text-align: left;
                }

                label {
                    display: block;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-bottom: 6px;
                }

                input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    padding: 10px 12px;
                    color: var(--text-main);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    outline: none;
                    transition: border-color 0.2s ease, background 0.2s ease;
                }

                input:focus {
                    border-color: var(--marriage);
                    background: rgba(236, 72, 153, 0.04);
                }

                .btn {
                    background: rgba(236, 72, 153, 0.04);
                    border: 1px solid rgba(236, 72, 153, 0.2);
                    color: var(--marriage);
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    text-decoration: none;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .btn:hover {
                    background: var(--marriage-glow);
                    border-color: var(--marriage);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.1);
                }

                .btn.danger {
                    background: rgba(248, 113, 113, 0.04);
                    border-color: rgba(248, 113, 113, 0.2);
                    color: var(--danger);
                }

                .btn.danger:hover {
                    background: var(--danger-glow);
                    border-color: var(--danger);
                    box-shadow: 0 4px 12px rgba(248, 113, 113, 0.1);
                }

                .footer-link {
                    display: block;
                    text-align: center;
                    margin-top: 16px;
                    font-size: 11px;
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .footer-link:hover {
                    color: var(--text-main);
                }
            </style>
        </head>
        <body>
            <div class="panel">
                <div class="header-flex">
                    <h1>Sanctuary of Bonds</h1>
                    <span class="badge">v${version}</span>
                </div>

                <div class="description">
                    Bind your destiny with another adventurer in the world of Dragons of Legends.
                </div>

                ${isMarried ? `
                    <div class="status-box">
                        <p>Currently bound to</p>
                        <h3>${partnerAccount?.username || 'Unknown Partner'}</h3>
                    </div>
                    <form action="/marriage/divorce" method="POST" style="margin: 0;">
                        <button type="submit" class="btn danger">Request Divorce 💔</button>
                    </form>
                ` : `
                    <form action="/marriage/propose" method="POST" style="margin: 0;">
                        <div class="form-group">
                            <label for="targetUsername">Adventurer Name</label>
                            <input type="text" id="targetUsername" name="targetUsername" placeholder="e.g. Arthur" required>
                        </div>
                        <button type="submit" class="btn">Propose Marriage ❤️</button>
                    </form>
                `}

                <a href="/" class="footer-link">← Return to Sanctuary</a>
            </div>
        </body>
        </html>
    `;
}