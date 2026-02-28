import Phaser from 'phaser';
import { CopState } from '../entities/Cop';

export default class EncounterLogic {
    static handleBushOutcome(scene: Phaser.Scene, outcome: string) {
        const data = scene.cache.json.get('encounters');
        const dialogueList = data.encounters[outcome] || ["..."];
        const text = dialogueList[Math.floor(Math.random() * dialogueList.length)];

        console.log(`ENCOUNTER [${outcome}]: ${text}`);

        // Let the scene handle the actual game state changes
        scene.events.emit('bush_searched_dialogue', outcome, text);

        if (outcome === 'Raccoon') {
            scene.events.emit('raccoon_alert', { x: (scene as any).player.x, y: (scene as any).player.y });
        }
    }


    static triggerRaccoonAlert(cops: Phaser.GameObjects.Group, playerPos: { x: number, y: number }) {
        cops.children.each((child: any) => {
            child.setAIState(CopState.INVESTIGATE, playerPos);
            return true;
        });
    }
}
