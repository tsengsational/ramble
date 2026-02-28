import Phaser from 'phaser';

export default class GridMovement {
    private static readonly gridSize: number = 32;

    static moveTo(scene: Phaser.Scene, target: Phaser.GameObjects.Sprite | any, targetX: number, targetY: number, duration: number = 150): Promise<void> {
        if (target.isMoving) return Promise.resolve();

        target.isMoving = true;
        return new Promise((resolve) => {
            scene.tweens.add({
                targets: target,
                x: targetX,
                y: targetY,
                duration: duration,
                onComplete: () => {
                    target.isMoving = false;
                    resolve();
                }
            });
        });
    }

    static handlePlayerInput(scene: Phaser.Scene, player: any, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (player.isMoving) return;

        if (cursors.left.isDown) {
            player.setFlipX(true);
            this.moveTo(scene, player, player.x - this.gridSize, player.y);
        } else if (cursors.right.isDown) {
            player.setFlipX(false);
            this.moveTo(scene, player, player.x + this.gridSize, player.y);
        } else if (cursors.up.isDown) {
            this.moveTo(scene, player, player.x, player.y - this.gridSize);
        } else if (cursors.down.isDown) {
            this.moveTo(scene, player, player.x, player.y + this.gridSize);
        }
    }

    static snapToGrid(coord: number): number {
        return Math.floor(coord / this.gridSize) * this.gridSize + (this.gridSize / 2);
    }
}
