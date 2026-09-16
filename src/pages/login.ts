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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #090a0f;
                --card-bg: #12151c;
                --border-color: #1e222b;
                --text-main: #f3f4f6;
                --text-muted: #9ca3af;
                --accent: #38bdf8;
                --error-bg: rgba(239, 68, 68, 0.1);
                --error-text: #f87171;
            }

            body {
                background-color: var(--bg-color);
                color: var(--text-main);
                font-family: 'Inter', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                animation: fadeIn 0.4s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .login-container {
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 36px;
                width: 340px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(8px);
            }

            h1 {
                font-size: 18px;
                font-weight: 600;
                letter-spacing: 0.8px;
                color: var(--text-main);
                margin: 0 0 6px 0;
                text-align: center;
                text-transform: uppercase;
            }

            .subtitle {
                font-size: 12px;
                color: var(--text-muted);
                text-align: center;
                margin-bottom: 24px;
                letter-spacing: 0.3px;
            }

            .error-box {
                background-color: var(--error-bg);
                color: var(--error-text);
                font-size: 12px;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 18px;
                text-align: center;
                font-weight: 500;
                border: 1px solid rgba(239, 68, 68, 0.2);
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
                font-size: 11px;
                font-weight: 500;
                color: var(--text-muted);
                margin-bottom: 6px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            input {
                width: 100%;
                padding: 10px 12px;
                background: #050608;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-main);
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                box-sizing: border-box;
                transition: all 0.2s ease;
            }

            input:focus {
                outline: none;
                border-color: var(--accent);
                box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15);
            }

            button {
                width: 100%;
                background: var(--text-main);
                color: var(--bg-color);
                border: none;
                border-radius: 6px;
                padding: 11px;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                font-size: 13px;
                cursor: pointer;
                margin-top: 6px;
                transition: all 0.2s ease;
            }

            button:hover {
                background: var(--accent);
                transform: translateY(-1px);
            }

            button:active {
                transform: translateY(0);
            }

            .version {
                text-align: center;
                font-size: 10px;
                color: var(--text-muted);
                margin-top: 22px;
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>Dragons of Legends</h1>
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
            
            <div class="version">v${version}</div>
        </div>
    </body>
    </html>
  `;
}