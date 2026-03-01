import Phaser from 'phaser';

export enum CopState {
    PATROL,
    INVESTIGATE,
    IDLE
}

export default class Cop extends Phaser.GameObjects.Sprite {
    public isMoving: boolean = false;
    private aiState: CopState = CopState.PATROL;
    private currentDirection: { x: number, y: number } = { x: 32, y: 0 };
    private lastKnownPlayerPos: { x: number, y: number } | null = null;
    private investigationStepsRemaining: number = 0;
    private bypassBushes: boolean = false;
    private bypassTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'cop');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDisplaySize(32, 32);

        // Pick initial random direction
        const dirs = [{ x: 32, y: 0 }, { x: -32, y: 0 }, { x: 0, y: 32 }, { x: 0, y: -32 }];
        this.currentDirection = dirs[Math.floor(Math.random() * dirs.length)];
    }

    moveTo(targetX: number, targetY: number) {
        if (this.isMoving) return;

        if (targetX < this.x) {
            this.setFlipX(true);
        } else if (targetX > this.x) {
            this.setFlipX(false);
        }

        this.isMoving = true;
        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 300,
            onComplete: () => {
                this.isMoving = false;
                if (this.aiState === CopState.INVESTIGATE) {
                    this.investigationStepsRemaining--;
                    if (this.investigationStepsRemaining <= 0) this.setAIState(CopState.PATROL);
                }
            }
        });
    }

    setAIState(newState: CopState, target?: { x: number, y: number }) {
        this.aiState = newState;
        if (newState === CopState.INVESTIGATE && target) {
            this.lastKnownPlayerPos = { x: target.x, y: target.y };
            this.investigationStepsRemaining = 5; // More persistent investigation
        }
    }

    getAIState() { return this.aiState; }

    triggerBypass(duration: number) {
        this.bypassBushes = true;
        if (this.bypassTimer) this.bypassTimer.remove();

        this.bypassTimer = this.scene.time.delayedCall(duration, () => {
            this.bypassBushes = false;
            this.bypassTimer = null;
        });
    }

    private isTileBlocked(tx: number, ty: number): boolean {
        // Boundary check
        if (tx < 32 || tx > 768 || ty < 32 || ty > 568) return true;

        // Bush check (if not in bypass mode)
        if (!this.bypassBushes) {
            const bushes = (this.scene as any).bushes as Phaser.GameObjects.Group;
            if (bushes) {
                // Check if any bush exists at this exact grid coordinate
                const blocked = bushes.children.entries.some((bush: any) => {
                    return Math.abs(bush.x - tx) < 5 && Math.abs(bush.y - ty) < 5;
                });
                if (blocked) return true;
            }
        }

        return false;
    }

    update() {
        if (this.isMoving) return;

        // Reactive AI: If player is within 4 tiles (128px), investigate automatically (Proximity Detection)
        const player = (this.scene as any).player;
        if (player) {
            const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (distToPlayer < 128 && this.aiState !== CopState.INVESTIGATE) {
                console.log("COP SPOTTED PLAYER! Investigating...");
                this.setAIState(CopState.INVESTIGATE, { x: player.x, y: player.y });
            }
        }

        if (this.aiState === CopState.PATROL) {
            this.doWander();
        } else if (this.aiState === CopState.INVESTIGATE && this.lastKnownPlayerPos) {
            this.doInvestigate();
        }
    }

    private doWander() {
        const nextX = this.x + this.currentDirection.x;
        const nextY = this.y + this.currentDirection.y;

        // Boundary safety check (800x600 world, with some margin)
        const isOutOfBounds = nextX < 32 || nextX > 768 || nextY < 32 || nextY > 568;

        // 10% chance to voluntarily change direction, or forced turn if hitting boundary
        if (Math.random() > 0.9 || isOutOfBounds) {
            const dirs = [
                { x: 32, y: 0 }, { x: -32, y: 0 },
                { x: 0, y: 32 }, { x: 0, y: -32 }
            ];

            // Filter directions that keep us inside the park AND avoid bushes
            const validDirs = dirs.filter(d => {
                return !this.isTileBlocked(this.x + d.x, this.y + d.y);
            });

            if (validDirs.length > 0) {
                this.currentDirection = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
        }

        // Final sanity check before moving
        const finalX = this.x + this.currentDirection.x;
        const finalY = this.y + this.currentDirection.y;
        if (!this.isTileBlocked(finalX, finalY)) {
            this.moveTo(finalX, finalY);
        } else {
            // If currently blocked but didn't turn (due to 10% chance), force a turn next update
            this.currentDirection = { x: 0, y: 0 };
        }
    }

    private doInvestigate() {
        if (!this.lastKnownPlayerPos) return;

        // Move toward last seen if path is clear or in bypass mode
        let targetX = this.x;
        let targetY = this.y;

        if (this.x < this.lastKnownPlayerPos.x) targetX += 32;
        else if (this.x > this.lastKnownPlayerPos.x) targetX -= 32;
        else if (this.y < this.lastKnownPlayerPos.y) targetY += 32;
        else if (this.y > this.lastKnownPlayerPos.y) targetY -= 32;

        if (!this.isTileBlocked(targetX, targetY)) {
            this.moveTo(targetX, targetY);
        }
    }
}
