import Phaser from 'phaser';

export type BushOutcome = 'Empty' | 'Couple' | 'Raccoon' | 'Cop' | 'Stranger';

export default class Bush extends Phaser.GameObjects.Sprite {
    public outcome: BushOutcome;
    private searched: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, outcome: BushOutcome) {
        super(scene, x, y, 'bush');
        this.outcome = outcome;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDisplaySize(32, 32);
    }

    search(): BushOutcome | null {
        if (this.searched) return null;

        this.searched = true;
        console.log(`BUSH REVEALED: ${this.outcome}`);

        // Update sprite to show what was hidden
        switch (this.outcome) {
            case 'Raccoon':
                this.setTexture('raccoon');
                break;
            case 'Couple':
                // Randomize between the 3 new male-male couple sprites
                const randomIndex = Math.floor(Math.random() * 3) + 1; // 1 to 3
                this.setTexture(`couple${randomIndex}`);
                break;
            case 'Cop':
                this.setTexture('cop');
                // Ensure scale matches
                this.setDisplaySize(32, 32);
                break;
            case 'Stranger':
                this.setTexture('stranger');
                break;
            default:
                // For Empty, maybe make the bush look "searched" or just stay a bush
                this.setAlpha(0.6);
                break;
        }

        this.setDisplaySize(32, 32); // Consistently enforce size of revealed sprite

        // Emit for logic systems
        this.scene.events.emit('bush_searched', this.outcome);

        return this.outcome;
    }

    isSearched() {
        return this.searched;
    }
}
