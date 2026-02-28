---
description: 
---

Phase 1: The Foundation (Antigravity)

Goal: Establish the game engine and grid-based movement.

   Role: You are a Senior Game Developer and Systems Architect.
Objective: Build a 2D, top-down, 8-bit stealth-exploration game called "Ramble" using Phaser 3 (JavaScript). The game is set in 1960s Central Park at night.
1. Game Mechanics & Core Loop

    Player: A gay man in the 1960s moving on a grid-based system.

    The Environment: A forested park filled with Bush objects.

    Interactions: The player "searches" a bush by overlapping with it and pressing Space.

    Bush Outcomes (Weighted Random):

        Empty: No effect.

        Couple: Displays cheeky 60s flavor text (e.g., "Pardon us, darling!").

        Raccoon: Triggers an alert. All Cop entities move 2 tiles closer to the player's current position.

        Cop: Instant Game Over (Busted!).

        Handsome Stranger: Victory condition. There is exactly one per level.

2. Entity AI

    Cop AI: Cops have a Patrol state (moving between random points) and an Investigate state (triggered by Raccoons). If a Cop touches the player, trigger the "Game Over" scene.

3. Visual & Audio Aesthetic

    Aesthetic: 8-bit pixel art, nighttime palette (deep blues, purples, mustard yellows).

    UI: A "Cheekiness Meter" (optional score) and a dialogue box for encounter text.

    Technical: Use a CRT scanline post-processing shader for a retro feel.

4. Technical Tasks for the Agent

    Scaffold the Project: Create an index.html, a game.js for configuration, and separate files for Player.js, Bush.js, and Cop.js.

    Asset Management: Create placeholders (colored rectangles) for now, but include a Preload function to easily swap in .png sprites later.

    Grid System: Implement 32×32 pixel grid movement.

    Signal/Event Bus: Implement a global event listener so that when a Bush emits a Raccoon_Alert, the Cop class reacts.

    Scene Management: Create a BootScene, GameScene, VictoryScene, and GameOverScene.

    Core Loop Check: Ensure you can move your "Player" (a temporary colored square) on a grid and that "Bushes" trigger a console log when searched.

Phase 2: The Interface (Stitch MCP)

Goal: Generate the 1960s 8-bit visual wrapper.

    Run the Stitch Integration Prompt: While inside Antigravity, trigger the Stitch MCP.

    UI Generation: Stitch will generate the React/Vue components for your HUD (Heads-Up Display), the "Busted" screen, and the "Encounter Toast."

    The "Bridge": Tell Antigravity to create a UIManager.ts file. This file will "listen" to Phaser events (like on_bush_searched) and tell the Stitch UI components to pop up with the correct text.

Phase 3: The Stealth & AI (Antigravity)

Goal: Make the game challenging and "cheeky."

    Cop AI: Tell Antigravity: "Implement the Cop AI. They should patrol 3 random points. If a Raccoon is triggered, use an A pathfinding algorithm to move the Cop 2 steps toward the player's last location."*

    The "Fog of War": Ask the agent to create a Mask Layer in Phaser. This ensures the player can only see 3 tiles around them, making the "Brambles" feel dark and dangerous.

    Outcome Weighting: Refine the Bush.ts logic so that the Handsome Stranger only spawns once per level, typically at the furthest point from the start.

Phase 4: Content & "Flavor"

Goal: Add the 1960s personality.

    Dialogue Injection: Use the list of cheeky 1960s lines (see below) and have Antigravity save them to a encounters.json file.

    Asset Swap: Once the logic is perfect, use a tool like Aseprite (or an AI pixel art generator) to create your sprites. Tell Antigravity to: "Replace the colored rectangles in Preload with these .png sprites and set the filtering to 'Nearest Neighbor' for that crisp 8-bit look."

Phase 5: Export & Mobile Wrap

Goal: Get it on your phone.

    Build: Run npm run build in the Antigravity terminal.

    Capacitor/Cordova: Use the agent to wrap the project: "Use Capacitor to initialize an iOS/Android project from this build."

    Test: Open the project in Xcode/Android Studio and deploy to your device.