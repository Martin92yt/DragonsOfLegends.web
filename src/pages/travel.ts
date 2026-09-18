export function renderTravelPage(version: string, boatRoutes: any[], landRoutes: any[], error: string | null = null): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Dragons of Legends — Travel</title>
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

            * { box-sizing: border-box; margin: 0; padding: 0; }

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

            .main-panel { width: 360px; }

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

            .alert {
                background: var(--danger-glow);
                border: 1px solid var(--danger);
                color: var(--danger);
                padding: 10px 14px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 500;
                margin-bottom: 16px;
                text-align: center;
            }
            
            .routes {
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 290px;
                overflow-y: auto;
                padding-right: 4px;
            }

            .routes::-webkit-scrollbar {
                width: 4px;
            }
            .routes::-webkit-scrollbar-thumb {
                background: var(--card-border);
                border-radius: 2px;
            }

            .route-section-title {
                font-size: 10px;
                text-transform: uppercase;
                color: var(--text-muted);
                letter-spacing: 0.8px;
                margin-bottom: 6px;
                font-weight: 700;
            }
            
            .route-card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--card-border);
                border-radius: 10px;
                padding: 10px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
            }
            .route-card:hover {
                border-color: var(--card-border-hover);
                background: rgba(255, 255, 255, 0.04);
                transform: translateY(-1px);
            }

            .route-name {
                font-size: 12px;
                font-weight: 700;
                color: var(--text-main);
                margin-bottom: 3px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .route-details {
                font-size: 9px;
                color: var(--text-muted);
                text-transform: uppercase;
                display: flex;
                gap: 8px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }

            .danger-lvl { color: var(--danger); }
            
            .btn-travel {
                background: var(--primary-glow);
                border: 1px solid rgba(56, 189, 248, 0.3);
                color: var(--primary);
                padding: 6px 12px;
                border-radius: 8px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .btn-travel:hover {
                background: var(--primary);
                color: var(--bg-color);
                box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2);
            }
            
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
                text-decoration: none;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .btn-action:hover {
                background: var(--primary-glow);
                border-color: var(--primary);
                color: var(--primary);
                transform: translateX(3px);
                box-shadow: 0 4px 12px rgba(56, 189, 248, 0.1);
            }

            /* TRAVEL LOADING OVERLAY / POPUP */
            #travel-overlay {
                position: fixed;
                inset: 0;
                background: rgba(3, 4, 7, 0.85);
                backdrop-filter: blur(8px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 999;
                flex-direction: column;
                gap: 16px;
                animation: fadeIn 0.3s ease;
            }

            .travel-popup {
                background: var(--card-bg);
                border: 1px solid var(--card-border-hover);
                padding: 24px;
                border-radius: 16px;
                width: 300px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
            }

            .travel-popup h2 {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                margin-bottom: 8px;
                color: var(--primary);
                font-weight: 700;
            }

            .travel-popup p {
                font-size: 11px;
                color: var(--text-muted);
                margin-bottom: 16px;
                font-weight: 500;
            }

            .travel-bar-container {
                background: rgba(255, 255, 255, 0.05);
                height: 4px;
                border-radius: 2px;
                overflow: hidden;
            }

            .travel-bar-fill {
                background: var(--primary);
                height: 100%;
                width: 0%;
                transition: width linear;
                box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
                border-radius: 2px;
            }
        </style>
    </head>
    <body>
        <div class="game-container">
            <div class="panel main-panel">
                <div class="header-flex">
                    <h1>World Map</h1>
                    <span class="badge">v${version}</span>
                </div>
                ${error ? `<div class="alert">${error}</div>` : ''}
                
                <div class="routes">
                    ${(boatRoutes?.length || landRoutes?.length) ? `
                        ${landRoutes?.length ? `
                            <div class="route-section-title">🗺️ Land Routes</div>
                            ${landRoutes.map(route => renderRouteCard(route)).join('')}
                        ` : ''}
                        
                        ${boatRoutes?.length ? `
                            <div class="route-section-title" style="margin-top: ${landRoutes?.length ? '8px' : '0'};">⛵ Boat Routes</div>
                            ${boatRoutes.map(route => renderRouteCard(route, true)).join('')}
                        ` : ''}
                    ` : `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 40px 0;">Aucune route disponible.</div>`}
                </div>
            </div>

            <div class="panel action-panel">
                <div class="action-title">Navigation</div>
                <a href="/" class="btn-action">Sanctuary <span>🏛️</span></a>
            </div>
        </div>

        <!-- TRAVEL POPUP OVERLAY -->
        <div id="travel-overlay">
            <div class="travel-popup">
                <h2>Voyage en cours</h2>
                <p id="travel-destination-text">Déplacement vers la destination...</p>
                <div class="travel-bar-container">
                    <div id="travel-bar-fill" class="travel-bar-fill"></div>
                </div>
            </div>
        </div>

        <script>
            function startTravel(event, destName, estimatedDuration = 2000) {
                event.preventDefault();
                const form = event.target.closest('form');
                
                document.getElementById('travel-destination-text').innerText = 'En route vers ' + destName + '...';
                document.getElementById('travel-overlay').style.display = 'flex';
                
                const fill = document.getElementById('travel-bar-fill');
                fill.style.transitionDuration = estimatedDuration + 'ms';
                setTimeout(() => { fill.style.width = '100%'; }, 50);

                setTimeout(() => {
                    form.submit();
                }, estimatedDuration);
            }
        </script>
    </body>
    </html>`;
}

function renderRouteCard(route: any, isBoat = false) {
    const duration = route.travelDistance ? route.travelDistance * 300 : 1500;
    return `
        <div class="route-card">
            <div>
                <div class="route-name">${isBoat ? '⛵' : '🗺️'} ${route.destinationLocationId}</div>
                <div class="route-details">
                    <span>Dist: ${route.travelDistance}</span>
                    <span class="danger-lvl">Danger: ${route.dangerLevel}</span>
                </div>
            </div>
            <form action="/action/travel/move" method="POST" style="margin:0;">
                <input type="hidden" name="destinationId" value="${route.destinationLocationId}">
                <button type="submit" class="btn-travel" onclick="startTravel(event, '${route.destinationLocationId}', ${duration})">Go ➔</button>
            </form>
        </div>
    `;
}