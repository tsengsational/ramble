export interface GridPoint {
    x: number;
    y: number;
}

export default class AStarPathfinding {

    // Simple manhattan distance
    static getDistance(a: GridPoint, b: GridPoint): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    // Returns the next point to move to (in grid coordinates) to get closer to target
    // Since we only move 2 steps or just need the direction, we can simplify
    static getNextStep(start: GridPoint, target: GridPoint, obstacles: GridPoint[]): GridPoint | null {
        const directions = [
            { x: 32, y: 0 },
            { x: -32, y: 0 },
            { x: 0, y: 32 },
            { x: 0, y: -32 }
        ];

        let bestPoint = null;
        let minDistance = Infinity;

        for (const dir of directions) {
            const nextX = start.x + dir.x;
            const nextY = start.y + dir.y;

            // Check bounds (assuming 800x600)
            if (nextX < 0 || nextX >= 800 || nextY < 0 || nextY >= 600) continue;

            // Simple collision check (ignoring bushes for now as they are permeable in this game)
            const isObstacle = obstacles.some(obs => Math.abs(obs.x - nextX) < 10 && Math.abs(obs.y - nextY) < 10);
            if (isObstacle) continue;

            const dist = this.getDistance({ x: nextX, y: nextY }, target);
            if (dist < minDistance) {
                minDistance = dist;
                bestPoint = { x: nextX, y: nextY };
            }
        }

        return bestPoint;
    }
}
