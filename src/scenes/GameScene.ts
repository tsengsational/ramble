import Phaser from 'phaser';
import Player from '../entities/Player';
import Bush, { BushOutcome } from '../entities/Bush';
import Cop from '../entities/Cop';
import EncounterLogic from '../systems/EncounterLogic';
import UIManager from '../ui/UIManager';

export default class GameScene extends Phaser.Scene {
    public player!: Player;
    private bushes!: Phaser.GameObjects.Group;
    private cops!: Phaser.GameObjects.Group;
    private lightMask!: Phaser.GameObjects.Graphics;
    private fowOverlay!: Phaser.GameObjects.Graphics;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private uiManager!: UIManager;
    private level: number = 1;
    private creationTime: number = 0;

    constructor() {
        super('GameScene');
    }

    init(data: any) {
        this.level = data.level || 1;
    }

    create() {
        this.creationTime = Date.now();
        this.createBackground();

        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }

        this.player = new Player(this, 16 + 32, 16 + 32);
        console.log(`LEVEL ${this.level} START - PLAYER SPAWN: ${this.player.x}, ${this.player.y}`);
        this.bushes = this.add.group();
        this.cops = this.add.group();

        // 1. Difficulty Scaling - More cops, fewer strangers as level increases
        this.spawnBushes();
        this.spawnCops();

        // 2. Fog of War Implementation
        this.createFogOfWar();

        // Camera Setup
        this.cameras.main.setZoom(2);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, 800, 600);

        // Bridge
        this.uiManager = new UIManager();
        this.uiManager.initListeners(this);
        this.events.emit('game_start', { level: this.level });

        this.events.on('bush_searched', (outcome: BushOutcome) => {
            EncounterLogic.handleBushOutcome(this, outcome);

            if (outcome === 'Stranger' || outcome === 'Cop') {
                // Freeze movement but don't pause scene yet
                this.physics.world.pause();
                this.player.isMoving = true; // Block input

                const isWin = outcome === 'Stranger';
                const timerEl = document.getElementById('game-timer')?.innerText || "0:00";

                // 3 second delay for reveal drama
                this.time.delayedCall(3000, () => {
                    if (isWin) {
                        this.events.emit('victory', { time: timerEl, level: this.level });
                    } else {
                        this.events.emit('game_over', { time: timerEl });
                    }
                    this.scene.pause();
                });
            }
        });

        this.events.on('raccoon_alert', (playerPos: any) => {
            EncounterLogic.triggerRaccoonAlert(this.cops, playerPos);
        });

        // Setup individual overlap handler
        this.physics.add.overlap(this.player, this.cops, (p: any, c: any) => {
            const dist = Phaser.Math.Distance.Between(p.x, p.y, c.x, c.y);
            if (Date.now() - this.creationTime < 1000 || dist > 40) return;

            // Collision Busted!
            this.physics.world.pause();
            this.player.isMoving = true;

            // Show the "Busted" dialogue manually since it's a collision not a bush check
            this.events.emit('bush_searched_dialogue', 'Cop', "Police! You're under arrest!");

            const timerEl = document.getElementById('game-timer')?.innerText || "0:00";
            this.time.delayedCall(3000, () => {
                this.events.emit('game_over', { time: timerEl });
                this.scene.pause();
            });
        });

        // Setup touch gestures
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const dx = pointer.upX - pointer.downX;
            const dy = pointer.upY - pointer.downY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) {
                // Short tap: Interaction
                this.checkBushInteraction();
            } else {
                // Longer delta: Swipe movement
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal
                    if (dx > 0) this.player.handleMovement({ right: { isDown: true }, left: { isDown: false }, up: { isDown: false }, down: { isDown: false } });
                    else this.player.handleMovement({ left: { isDown: true }, right: { isDown: false }, up: { isDown: false }, down: { isDown: false } });
                } else {
                    // Vertical
                    if (dy > 0) this.player.handleMovement({ down: { isDown: true }, left: { isDown: false }, up: { isDown: false }, right: { isDown: false } });
                    else this.player.handleMovement({ up: { isDown: true }, left: { isDown: false }, right: { isDown: false }, down: { isDown: false } });
                }
            }
        });

        console.log('Game Started - Explore the Rambles!');
    }

    update() {
        this.player.handleMovement(this.cursors);

        // Cops update their AI states
        this.cops.children.each((child: any) => {
            child.update();
            return true;
        });

        // Check interaction trigger (Space Key) - with 500ms safety cooldown to prevent bubbling from menu
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && Date.now() - this.creationTime > 500) {
            this.checkBushInteraction();
        }

        // Update Fog of War position
        this.updateFogOfWar();
    }

    private spawnBushes() {
        const otherOutcomes: BushOutcome[] = ['Empty', 'Couple', 'Raccoon'];

        for (let x = 1; x < 24; x++) {
            for (let y = 1; y < 18; y++) {
                // Skip player start tile (1,1)
                if (x === 1 && y === 1) continue;

                if (Math.random() > 0.85) { // 15% chance for a bush to spawn on a tile
                    const bushX = 16 + (x * 32);
                    const bushY = 16 + (y * 32);

                    const roll = Math.random();
                    let outcome: BushOutcome;

                    // New Probability Logic:
                    // 10% catch-all for Strangers (makes it easier across all levels)
                    const strangerChance = 0.10;
                    // Cops start at 5% (Level 1) and increase by 5% each level (Level 2 = 10%, etc.)
                    const copChance = 0.05 + (this.level - 1) * 0.05;

                    if (roll < strangerChance) {
                        outcome = 'Stranger';
                    } else if (roll < strangerChance + copChance) {
                        outcome = 'Cop';
                    } else {
                        // Distribute remaining probability among safe/flavor outcomes
                        outcome = otherOutcomes[Math.floor(Math.random() * otherOutcomes.length)];
                    }

                    const bush = new Bush(this, bushX, bushY, outcome);
                    this.bushes.add(bush);
                }
            }
        }
    }

    private spawnCops() {
        // Cops: Level 1 = 2, Level 2 = 3, Level 3 = 4, etc.
        const numCops = 1 + this.level;
        const regions = [
            { x: 10, y: 15 }, { x: 20, y: 8 },
            { x: 15, y: 12 }, { x: 5, y: 15 },
            { x: 22, y: 5 }, { x: 18, y: 17 }
        ];

        for (let i = 0; i < numCops; i++) {
            const pos = regions[i % regions.length];
            const cop = new Cop(this, 16 + (pos.x * 32), 16 + (pos.y * 32));
            this.cops.add(cop);
            console.log(`COP SPAWN (LVL ${this.level}): ${cop.x}, ${cop.y}`);
        }
    }

    private createBackground() {
        // Render tiled background
        const bg = this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        bg.setDisplaySize(800, 600);
        bg.setDepth(-10); // Ensure it stays behind everything

        // Dynamic Lighting Overlay for Mood (Optional grid/overlay)
        this.add.rectangle(0, 0, 800, 600, 0x000000, 0.4).setOrigin(0, 0).setDepth(-5);
    }

    private createFogOfWar() {
        // Fill screen with darkness
        this.fowOverlay = this.add.graphics();
        this.fowOverlay.setScrollFactor(0); // Lock to screen
        this.fowOverlay.fillStyle(0x000000, 0.85); // Moody night darkness
        this.fowOverlay.fillRect(0, 0, 800, 600);
        this.fowOverlay.setDepth(100);

        // Create the "hole" in the darkness
        this.lightMask = this.make.graphics({ x: 0, y: 0 });
        this.lightMask.fillStyle(0xffffff);
        this.lightMask.fillCircle(0, 0, 100); // 3 tile radius approx

        const mask = new Phaser.Display.Masks.GeometryMask(this, this.lightMask);
        mask.setInvertAlpha(true);
        this.fowOverlay.setMask(mask);
    }

    private updateFogOfWar() {
        // Translate world player pos to screen-space for the fixed FOV overlay
        this.lightMask.x = this.player.x - this.cameras.main.worldView.x;
        this.lightMask.y = this.player.y - this.cameras.main.worldView.y;
    }

    private checkBushInteraction() {
        console.log("Checking for bush interaction...");
        this.bushes.children.each((child: any) => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);
            // Increase distance check to handle 48px (1.5 tiles) for better feel
            if (distance < 45) {
                child.search();
            }
            return true;
        });
    }
}

