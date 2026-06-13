import '../css/style.css'
import { Engine, DisplayMode, Color } from "excalibur"
import { ResourceLoader } from './resources.js'

import { StartScene } from './scenes/StartScene.js'
import { GameScene } from './scenes/GameScene.js'
import { Level2Scene } from './scenes/Level2Scene.js'
import { GameOverScene } from './scenes/GameOverScene.js'
import { WinScene } from './scenes/WinScene.js'

// Game is de hoofdclass van het project.
// Deze class maakt de Excalibur engine aan, registreert alle scenes en start de game.
export class Game extends Engine {
    constructor() {
        super({
            width: 1280,
            height: 720,
            maxFps: 60,
            displayMode: DisplayMode.FitScreen,
            backgroundColor: Color.fromHex("#050014")
        })

        // Alle scenes krijgen een naam zodat we later met goToScene kunnen wisselen.
        this.add("start", new StartScene())
        this.add("level1", new GameScene())
        this.add("level2", new Level2Scene())
        this.add("gameover", new GameOverScene())
        this.add("win", new WinScene())

        // Eerst alle afbeeldingen en geluiden laden, daarna naar startGame.
        this.start(ResourceLoader).then(() => this.startGame())
    }

    startGame() {
        console.log("Start Cyberpunk Platformer")
        this.goToScene("start")
    }
}

// Hier wordt de game echt gestart.
new Game()
