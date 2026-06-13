import { Scene, Label, Vector, Color, Font, FontUnit, CoordPlane } from "excalibur"
import { Resources } from "../resources.js"
import { AudioManager } from "../AudioManager.js"

import { Player } from "../actors/Player.js"
import { TilePlatform } from "../actors/TilePlatform.js"
import { Coin } from "../actors/Coin.js"
import { Goal } from "../actors/Goal.js"
import { Obstacle } from "../actors/Obstacle.js"
import { LivesLabel } from "../actors/LivesLabel.js"
import { Enemy } from "../actors/Enemy.js"
import { Background } from "../actors/Background.js"

// GameScene is level 1 van de platformer.
// Hier worden de speler, platforms, coins, enemies, obstacles en UI toegevoegd.
export class GameScene extends Scene {
    #score = 0
    #highscore = 0
    #lives = 3

    #scoreLabel
    #highscoreLabel
    #livesLabel
    #levelLabel
    #player
    #cameraMinX = 640
    #cameraMaxX = 4580 // Camera mag verder naar rechts, zodat de exit van level 1 zichtbaar blijft.
    #cameraY = 360

    onInitialize(engine) {
        // Beginwaarden voor level 1.
        this.#score = 0
        this.#lives = 3
        this.#highscore = Number(localStorage.getItem("cyberpunkHighscore")) || 0

        // Achtergrond staat vast op het scherm, zodat hij niet trilt met de camera.
        this.add(new Background(Resources.BackgroundCity, 1.35))

        // Speler toevoegen.
        // We bewaren de speler zodat de camera hem rustig horizontaal kan volgen.
        this.#player = new Player()
        this.add(this.#player)

        // Niet lockToActor gebruiken, want die volgt ook elke kleine y-beweging bij springen.
        // Dat kan trillen geven. Daarom volgt de camera alleen horizontaal.
        this.camera.zoom = 1
        this.camera.pos = new Vector(this.#cameraMinX, this.#cameraY)

        // =====================================================
        // LOGISCHE LEVEL FLOW
        // Start -> simpele sprong -> spikes -> klimroute -> enemy -> lasers -> exit
        // =====================================================

        // 1. START: veilige grond, speler leert lopen en coin pakken.
        this.add(new TilePlatform(300, 640, 600, "ground"))
        this.add(new Coin(230, 620))
        this.add(new Coin(350, 620))

        // 2. EERSTE SPRONG: laag platform, makkelijk bereikbaar.
        this.add(new TilePlatform(760, 560, 300, "middle"))
        this.add(new Coin(760, 540))

        // 3. SPIKES: gevaar op grond, maar genoeg ruimte om te springen.
        this.add(new TilePlatform(1160, 640, 620, "ground"))
        this.add(new Obstacle(1130, 620, "spikes"))
        this.add(new Coin(970, 585))
        this.add(new Coin(1280, 585))

        // 4. KLIMROUTE: duidelijke trap omhoog.
        this.add(new TilePlatform(1540, 540, 300, "left"))
        this.add(new Coin(1540, 485))

        this.add(new TilePlatform(1880, 460, 300, "middle"))
        this.add(new Coin(1880, 405))

        this.add(new TilePlatform(2220, 380, 300, "right"))
        this.add(new Coin(2220, 325))

        // 5. ENEMY: brede arena zodat de patrol eerlijk voelt.
        this.add(new TilePlatform(2600, 520, 460, "moving"))
        this.add(new Enemy(2600, 499, 2420, 2780))
        this.add(new Coin(2460, 465))
        this.add(new Coin(2740, 465))

        // 6. LASER TIMING: eerst horizontale laser, daarna verticale laser.
        this.add(new TilePlatform(3140, 640, 660, "ground"))
        this.add(new Obstacle(3140, 615, "laserHorizontal"))
        this.add(new Coin(3350, 585))

        this.add(new TilePlatform(3560, 520, 320, "corner"))
        this.add(new Coin(3560, 465))

        this.add(new TilePlatform(3980, 640, 660, "ground"))
        this.add(new Obstacle(3850, 560, "laserVertical"))
        this.add(new Coin(4160, 585))

        // 7. LAATSTE SPRONG EN FINISH VAN LEVEL 1.
        this.add(new TilePlatform(4380, 520, 340, "middle"))
        this.add(new Coin(4380, 465))

        this.add(new TilePlatform(4840, 640, 760, "ground"))
        this.add(new Goal(4960, 565, "level2", "Level 1 gehaald! Ga door naar level 2."))

        // UI labels staan op CoordPlane.Screen.
        // Daardoor blijven ze vast op het scherm en trillen ze niet mee met de camera.
        this.#scoreLabel = new Label({
            text: "Score: 0",
            pos: new Vector(20, 20),
            font: new Font({
                family: "Arial",
                size: 24,
                unit: FontUnit.Px,
                color: Color.Cyan
            }),
            z: 1000,
            coordPlane: CoordPlane.Screen
        })
        this.add(this.#scoreLabel)

        this.#livesLabel = new LivesLabel()
        this.#livesLabel.z = 1000
        this.add(this.#livesLabel)

        this.#highscoreLabel = new Label({
            text: `Highscore: ${this.#highscore}`,
            pos: new Vector(20, 100),
            font: new Font({
                family: "Arial",
                size: 24,
                unit: FontUnit.Px,
                color: Color.Yellow
            }),
            z: 1000,
            coordPlane: CoordPlane.Screen
        })
        this.add(this.#highscoreLabel)

        this.#levelLabel = new Label({
            text: "Level 1",
            pos: new Vector(20, 140),
            font: new Font({
                family: "Arial",
                size: 24,
                unit: FontUnit.Px,
                color: Color.White
            }),
            z: 1000,
            coordPlane: CoordPlane.Screen
        })
        this.add(this.#levelLabel)
    }

    onPostUpdate() {
        // Camera volgt de speler alleen op de x-as.
        // Math.round voorkomt subpixel-trilling in de camera.
        if (!this.#player) {
            return
        }

        const targetX = Math.min(
            Math.max(this.#player.pos.x, this.#cameraMinX),
            this.#cameraMaxX
        )

        this.camera.pos = new Vector(Math.round(targetX), this.#cameraY)
    }

    addScore(points) {
        // Score verhogen als de speler een coin pakt of enemy verslaat.
        this.#score += points
        this.#scoreLabel.text = `Score: ${this.#score}`

        // Nieuwe highscore bewaren in localStorage.
        if (this.#score > this.#highscore) {
            this.#highscore = this.#score
            localStorage.setItem("cyberpunkHighscore", this.#highscore)
            this.#highscoreLabel.text = `Highscore: ${this.#highscore}`
        }
    }

    getScore() {
        // Wordt gebruikt door Goal om de score te tonen bij level complete.
        return this.#score
    }

    loseLife(amount) {
        // Wordt aangeroepen door obstacles en enemies.
        this.#lives -= amount
        this.#livesLabel.updateLives(this.#lives)

        if (this.#lives <= 0) {
            this.engine.goToScene("gameover")
        } else {
            AudioManager.playHit()
        }
    }
}
