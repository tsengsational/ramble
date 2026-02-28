import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('player', '/assets/player.png');
        this.load.image('bush', '/assets/bush.png');
        this.load.image('cop', '/assets/cop.png');
        this.load.image('stranger', '/assets/stranger.png');
        this.load.image('raccoon', '/assets/raccoon.png');
        this.load.image('couple1', '/assets/couple1.png');
        this.load.image('couple2', '/assets/couple2.png');
        this.load.image('couple3', '/assets/couple3.png');
        this.load.image('background', '/assets/background.png');
        this.load.json('encounters', '/assets/encounters.json');
    }

    create() {
        // Set nearest neighbor for sharp 8-bit look
        this.textures.get('player').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('bush').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('cop').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('stranger').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('raccoon').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('couple1').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('couple2').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('couple3').setFilter(Phaser.Textures.FilterMode.NEAREST);
        this.textures.get('background').setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.scene.start('MenuScene');
    }
}

