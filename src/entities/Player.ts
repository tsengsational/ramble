import Phaser from 'phaser';
import GridMovement from '../systems/GridMovement';

export default class Player extends Phaser.GameObjects.Sprite {
    public isMoving: boolean = false;
    private readonly gridSize: number = 32;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDisplaySize(32, 32);
    }

    handleMovement(cursors: any) {
        GridMovement.handlePlayerInput(this.scene, this, cursors);
    }

    getCurrentGridPosition() {
        return {
            gridX: Math.floor(this.x / this.gridSize),
            gridY: Math.floor(this.y / this.gridSize)
        };
    }
}
