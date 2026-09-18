export function renderLoginPage(version: string, error: string | null = null): string {
    let errorMessage = "";
    if (error === "missing_fields") {
        errorMessage = `<div class="error-box">Please fill in all required fields.</div>`;
    }

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Dragons of Legends — Login</title>
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

                .login-container {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 16px;
                    padding: 32px;
                    width: 360px;
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(12px);
                    transition: border-color 0.3s ease;
                }
                .login-container:hover {
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
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

                .subtitle {
                    font-size: 11px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    margin-bottom: 20px;
                    font-weight: 600;
                }

                .error-box {
                    background-color: var(--danger-glow);
                    color: var(--danger);
                    font-size: 11px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                    font-weight: 600;
                    border: 1px solid rgba(248, 113, 113, 0.2);
                    animation: shake 0.3s ease-in-out;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }

                .form-group {
                    margin-bottom: 14px;
                }

                label {
                    display: block;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                }

                input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    color: var(--text-main);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 12px;
                    box-sizing: border-box;
                    transition: all 0.2s ease;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(56, 189, 248, 0.03);
                    box-shadow: 0 0 10px rgba(56, 189, 248, 0.1);
                }

                button {
                    width: 100%;
                    background: var(--primary-glow);
                    color: var(--primary);
                    border: 1px solid rgba(56, 189, 248, 0.3);
                    border-radius: 10px;
                    padding: 12px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 600;
                    font-size: 12px;
                    cursor: pointer;
                    margin-top: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                button:hover {
                    background: var(--primary);
                    color: var(--bg-color);
                    border-color: var(--primary);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
                }

                button:active {
                    transform: translateY(0);
                }
            </style>
        </head>
        <body>
            <div class="login-container">
                <div class="header-flex">
                    <h1>Dragons of Legends</h1>
                    <span class="badge">v${version}</span>
                </div>
                <div class="subtitle">Enter the realm</div>
                
                ${errorMessage}
                
                <form action="/login" method="POST">
                    <div class="form-group">
                        <label for="username">Adventurer Name</label>
                        <input type="text" id="username" name="username" placeholder="e.g., Arthur" required autocomplete="off">
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                    </div>
                    
                    <button type="submit">Start Journey</button>
                </form>
            </div>
        </body>
        </html>
    `;
}