import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.add.text(400, 200, 'RAMBLE', {
            fontSize: '48px',
            fontFamily: 'Courier',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.add.text(400, 400, 'Press Space or Tap to Start', {
            fontSize: '24px',
            fontFamily: 'Courier',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Instructions Button
        const ui = new UIManager();
        const helpBtn = this.add.text(400, 480, '[ HOW TO PLAY ]', {
            fontSize: '20px',
            fontFamily: 'Courier',
            color: '#ffd700'
        }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

        helpBtn.on('pointerdown', () => {
            ui.showInstructions();
        });

        this.input.keyboard?.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Only start game if NOT clicking the help button
            if (pointer.y < 460) {
                this.scene.start('GameScene');
            }
        });
    }
}
import UIManager from '../ui/UIManager';
