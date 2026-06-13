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

// Level2Scene is het tweede en moeilijkere level.
// Het level gebruikt dezelfde classes, maar met meer enemies en meer lasers.
export class Level2Scene extends Scene {
    #score = 0
    #highscore = 0
    #lives = 3

    #scoreLabel
    #highscoreLabel
    #livesLabel
    #levelLabel
    #player
    #cameraMinX = 640
    #cameraMaxX = 4800
    #cameraY = 360

    onInitialize(engine) {
        // Beginwaarden voor level 2.
        this.#score = 0
        this.#lives = 3
        this.#highscore = Number(localStorage.getItem("cyberpunkHighscore")) || 0

        // Zelfde cyberpunk achtergrond als level 1.
        this.add(new Background(Resources.BackgroundCity, 1.35))

        this.#player = new Player()
        this.add(this.#player)

        // De camera volgt alleen horizontaal.
        // Zo blijft springen rustiger en trilt het beeld minder.
        this.camera.zoom = 1
        this.camera.pos = new Vector(this.#cameraMinX, this.#cameraY)

        // =====================================================
        // LEVEL 2: moeilijker level met meer enemies en lasers
        // =====================================================

        // 1. START: veilige grond.
        this.add(new TilePlatform(300, 640, 600, "ground"))
        this.add(new Coin(240, 600))
        this.add(new Coin(390, 600))

        // 2. SNELLERE SPRONGEN OMHOOG.
        this.add(new TilePlatform(760, 540, 280, "left"))
        this.add(new Coin(760, 485))

        this.add(new TilePlatform(1080, 450, 260, "middle"))
        this.add(new Coin(1080, 395))

        this.add(new TilePlatform(1400, 560, 300, "right"))
        this.add(new Obstacle(1400, 535, "laserHorizontal"))

        // 3. EERSTE ARENA MET ENEMY.
        this.add(new TilePlatform(1820, 640, 620, "ground"))
        this.add(new Enemy(1760, 619, 1580, 2020))
        this.add(new Coin(1600, 585))
        this.add(new Coin(2040, 585))

        // 4. LASER ROUTE: speler moet timing en springen combineren.
        this.add(new TilePlatform(2320, 520, 320, "middle"))
        this.add(new Obstacle(2320, 460, "laserVertical"))
        this.add(new Coin(2450, 465))

        this.add(new TilePlatform(2760, 430, 280, "corner"))
        this.add(new Coin(2760, 375))

        this.add(new TilePlatform(3180, 640, 620, "ground"))
        this.add(new Obstacle(3060, 620, "spikes"))
        this.add(new Obstacle(3300, 615, "laserHorizontal"))
        this.add(new Coin(3420, 585))

        // 5. TWEEDE ENEMY OP HOGER PLATFORM.
        this.add(new TilePlatform(3740, 500, 500, "moving"))
        this.add(new Enemy(3740, 479, 3520, 3960))
        this.add(new Coin(3560, 445))
        this.add(new Coin(3920, 445))

        // 6. LAATSTE TRAP NAAR DE EXIT.
        this.add(new TilePlatform(4300, 400, 260, "left"))
        this.add(new Coin(4300, 345))

        this.add(new TilePlatform(4640, 520, 300, "middle"))
        this.add(new Obstacle(4640, 495, "laserHorizontal"))

        this.add(new TilePlatform(5100, 640, 760, "ground"))
        this.add(new Goal(5240, 565, "win", "Level 2 gehaald! Game uitgespeeld."))

        // UI labels voor score, levens, highscore en levelnaam.
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
            text: "Level 2",
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
        // Score verhogen en tekst aanpassen.
        this.#score += points
        this.#scoreLabel.text = `Score: ${this.#score}`

        // Highscore opslaan als de speler beter scoort dan eerder.
        if (this.#score > this.#highscore) {
            this.#highscore = this.#score
            localStorage.setItem("cyberpunkHighscore", this.#highscore)
            this.#highscoreLabel.text = `Highscore: ${this.#highscore}`
        }
    }

    getScore() {
        return this.#score
    }

    loseLife(amount) {
        // Levens verminderen door lasers, spikes of enemies.
        this.#lives -= amount
        this.#livesLabel.updateLives(this.#lives)

        if (this.#lives <= 0) {
            this.engine.goToScene("gameover")
        } else {
            AudioManager.playHit()
        }
    }
}
