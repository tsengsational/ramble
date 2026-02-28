import Phaser from 'phaser';

export default class UIManager {
    private hud: HTMLElement | null = null;
    private bustedOverlay: HTMLElement | null = null;
    private toast: HTMLElement | null = null;
    private victoryOverlay: HTMLElement | null = null;
    private instructionsOverlay: HTMLElement | null = null;
    private cheekiness: number = 0;
    private startTime: number = 0;
    private timerInterval: any = null;

    constructor() {
        this.createUIElements();
    }

    private createUIElements() {
        const container = document.getElementById('game-container');
        if (!container) return;

        // 1. HUD
        this.hud = document.getElementById('game-hud');
        if (!this.hud) {
            this.hud = document.createElement('div');
            this.hud.id = 'game-hud';
            this.hud.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 60px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;
                box-sizing: border-box;
                background: linear-gradient(180deg, rgba(13, 13, 27, 0.8) 0%, transparent 100%);
                color: #ffd700;
                font-family: 'Courier New', Courier, monospace;
                font-size: 18px;
                z-index: 10;
                pointer-events: none;
                text-transform: uppercase;
                letter-spacing: 2px;
            `;
            container.appendChild(this.hud);
        }
        this.hud.innerHTML = `
            <div id="game-level">Level: 1</div>
            <div id="cheekiness">Cheekiness: 0</div>
            <div id="game-timer">Time: 00:00</div>
            <div id="location">Location: The Rambles</div>
        `;

        // 2. Encounter Toast
        this.toast = document.getElementById('encounter-toast');
        if (!this.toast) {
            this.toast = document.createElement('div');
            this.toast.id = 'encounter-toast';
            this.toast.style.cssText = `
                position: absolute;
                bottom: 50px;
                left: 50%;
                transform: translateX(-50%);
                background: #0d0d1b;
                border: 4px solid #ffd700;
                padding: 15px 30px;
                color: #ffd700;
                font-family: 'Courier New', Courier, monospace;
                font-size: 20px;
                z-index: 20;
                display: none;
                text-align: center;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
                image-rendering: pixelated;
            `;
            container.appendChild(this.toast);
        }

        // 3. Victory Overlay
        this.victoryOverlay = document.getElementById('victory-screen');
        if (!this.victoryOverlay) {
            this.victoryOverlay = document.createElement('div');
            this.victoryOverlay.id = 'victory-screen';
            this.victoryOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(13, 20, 13, 0.95);
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 100;
                color: #ffd700;
                font-family: 'Courier New', Courier, monospace;
                text-align: center;
            `;
            this.victoryOverlay.innerHTML = `
                <h1 style="font-size: 80px; margin: 0; letter-spacing: 5px;">SUCCESS!</h1>
                <p style="color: #ffffff; font-size: 24px;">You found a handsome friend in the dark.</p>
                <div id="victory-stats" style="color: #00ff00; margin: 20px 0; font-size: 22px;"></div>
                <button id="next-lvl-btn" style="
                    background: #00ff00;
                    border: none;
                    padding: 10px 40px;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 30px;
                ">CONTINUE RAMBLING</button>
            `;
            container.appendChild(this.victoryOverlay);
        }

        // 4. Busted Overlay
        this.bustedOverlay = document.getElementById('busted-screen');
        if (!this.bustedOverlay) {
            this.bustedOverlay = document.createElement('div');
            this.bustedOverlay.id = 'busted-screen';
            this.bustedOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(13, 13, 27, 0.95);
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 100;
                color: #ff0000;
                font-family: 'Courier New', Courier, monospace;
                text-align: center;
            `;
            this.bustedOverlay.innerHTML = `
                <h1 style="font-size: 80px; margin: 0; letter-spacing: 10px; animation: blink 0.5s infinite;">BUSTED!</h1>
                <p style="color: #ffffff; font-size: 24px;">Central Park Police Report #1964</p>
                <div id="final-stats" style="color: #ffd700; margin: 20px 0; font-size: 28px;"></div>
                <button id="retry-btn" style="
                    background: #ffd700;
                    border: none;
                    padding: 10px 40px;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 30px;
                    transition: transform 0.1s;
                ">TRY AGAIN</button>
                <style>
                    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                    #retry-btn:active { transform: scale(0.95); }
                </style>
            `;
            container.appendChild(this.bustedOverlay);
        }

        // 5. Instructions Overlay
        this.instructionsOverlay = document.getElementById('instructions-screen');
        if (!this.instructionsOverlay) {
            this.instructionsOverlay = document.createElement('div');
            this.instructionsOverlay.id = 'instructions-screen';
            this.instructionsOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(13, 13, 27, 0.98);
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 200;
                color: #ffd700;
                font-family: 'Courier New', Courier, monospace;
                text-align: left;
                padding: 40px;
                box-sizing: border-box;
            `;
            this.instructionsOverlay.innerHTML = `
                <div style="background: rgba(13, 13, 27, 0.95); border: 4px solid #00ff00; padding: 40px; max-width: 600px;">
                    <h1 style="font-size: 40px; margin-top: 0; color: #00ff00; text-align: center;">RAMBLE: 1964</h1>
                    <div style="font-size: 18px; line-height: 1.6; color: #ffffff;">
                        <p><b style="color: #ffd700;">THE MISSION:</b> Explore the dark Rambles of Central Park. Find the <b style="color: #00ff00;">Handsome Stranger</b> to advance through levels.</p>
                        <p><b style="color: #ffd700;">CONTROLS:</b></p>
                        <ul style="list-style-type: none; padding-left: 10px;">
                            <li>🚶 <b>Move:</b> Arrow Keys -or- Swipe</li>
                            <li>🔎 <b>Search:</b> Space Key -or- Tap Screen</li>
                        </ul>
                        <p><b style="color: #ffd700;">BEWARE:</b></p>
                        <ul style="list-style-type: none; padding-left: 10px;">
                            <li>👮 <b>Cops:</b> Getting seen or finding them in a bush means <b style="color: #ff0000;">BUSTED!</b></li>
                            <li>🦝 <b>Racoons:</b> These critters alert nearby patrols when disturbed.</li>
                            <li>👨‍❤️‍👨 <b>Couples:</b> Friendly neighbors! They increase your "Cheekiness".</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <button id="close-instructions-btn" style="
                            background: #ffd700;
                            border: none;
                            padding: 10px 40px;
                            font-family: 'Courier New', Courier, monospace;
                            font-size: 20px;
                            font-weight: bold;
                            cursor: pointer;
                        ">GOT IT</button>
                    </div>
                </div>
            `;
            container.appendChild(this.instructionsOverlay);

            document.getElementById('close-instructions-btn')?.addEventListener('click', () => {
                this.hideInstructions();
            });
        }
    }

    public initListeners(scene: Phaser.Scene) {
        // Clear existing events to avoid leaks
        scene.events.off('bush_searched');
        scene.events.off('game_start');
        scene.events.off('game_over');

        scene.events.on('bush_searched', (outcome: string) => {
            this.showToast(outcome, scene);
            if (outcome === 'Stranger') {
                this.updateCheekiness(100);
            } else if (outcome !== 'Empty' && outcome !== 'Cop') {
                this.updateCheekiness(10);
            }
        });

        scene.events.on('game_start', (data: any) => {
            const levelEl = document.getElementById('game-level');
            if (levelEl) levelEl.innerText = `Level: ${data?.level || 1}`;
            this.resetUI();
            this.startTimer();
        });

        scene.events.on('game_over', (finalStats: any) => {
            this.showBustedScreen(finalStats);
        });

        scene.events.on('victory', (finalStats: any) => {
            this.showVictoryScreen(finalStats);
        });

        // RE-ATTACH LISTENER TO THE NEWEST SCENE INSTANCE
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            const newRetryBtn = retryBtn.cloneNode(true) as HTMLElement;
            retryBtn.parentNode?.replaceChild(newRetryBtn, retryBtn);
            newRetryBtn.addEventListener('click', () => {
                this.hideBustedScreen();
                scene.scene.start('GameScene', { level: 1 });
            });
        }

        const nextBtn = document.getElementById('next-lvl-btn');
        if (nextBtn) {
            const newNextBtn = nextBtn.cloneNode(true) as HTMLElement;
            nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
            newNextBtn.addEventListener('click', () => {
                this.hideVictoryScreen();
                const currentLevel = (scene as any).level || 1;
                scene.scene.start('GameScene', { level: currentLevel + 1 });
            });
        }
    }


    private updateCheekiness(amount: number) {
        this.cheekiness += amount;
        const el = document.getElementById('cheekiness');
        if (el) el.innerText = `Cheekiness: ${this.cheekiness}`;
    }

    private startTimer() {
        this.startTime = Date.now();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
            const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
            const el = document.getElementById('game-timer');
            if (el) el.innerText = `Time: ${minutes}:${seconds}`;
        }, 1000);
    }

    private showToast(outcome: string, scene?: Phaser.Scene) {
        if (!this.toast) return;

        let text = "";
        if (scene) {
            const data = scene.cache.json.get('encounters');
            const dialogueList = data?.encounters[outcome] || ["..."];
            text = dialogueList[Math.floor(Math.random() * dialogueList.length)];
        } else {
            // Fallback for basic logic
            switch (outcome) {
                case 'Empty': text = "Just some rustling leaves..."; break;
                case 'Couple': text = "Pardon us, darling! We're just... bird watching."; break;
                case 'Raccoon': text = "A raccoon screeched! RUN!"; break;
                case 'Stranger': text = "My, my! You've found someone handsome."; break;
                case 'Cop': text = "Police! Put your hands up!"; break;
            }
        }

        this.toast.innerText = text;
        this.toast.style.display = 'block';

        setTimeout(() => {
            if (this.toast) this.toast.style.display = 'none';
        }, 4000);
    }

    private showBustedScreen(stats: any) {
        if (!this.bustedOverlay) return;
        const statsEl = document.getElementById('final-stats');
        if (statsEl) statsEl.innerHTML = `Time Survived: ${stats.time}<br>Cheekiness Level: ${this.cheekiness}`;
        this.bustedOverlay.style.display = 'flex';
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    private hideBustedScreen() {
        if (this.bustedOverlay) this.bustedOverlay.style.display = 'none';
    }

    private showVictoryScreen(stats: any) {
        if (!this.victoryOverlay) return;
        const statsEl = document.getElementById('victory-stats');
        if (statsEl) statsEl.innerHTML = `Level Completed: ${stats.level}<br>Time: ${stats.time}<br>Total Cheekiness: ${this.cheekiness}`;
        this.victoryOverlay.style.display = 'flex';
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    private hideVictoryScreen() {
        if (this.victoryOverlay) this.victoryOverlay.style.display = 'none';
    }

    public showInstructions() {
        if (this.instructionsOverlay) this.instructionsOverlay.style.display = 'flex';
    }

    public hideInstructions() {
        if (this.instructionsOverlay) this.instructionsOverlay.style.display = 'none';
    }

    private resetUI() {
        this.cheekiness = 0;
        this.updateCheekiness(0);
        this.hideBustedScreen();
        this.hideVictoryScreen();
    }
}
