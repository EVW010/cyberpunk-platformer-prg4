import { Actor, Vector, CollisionType, SpriteSheet, Animation, range } from "excalibur"
import { Resources } from "../resources.js"
import { AudioManager } from "../AudioManager.js"
import { Player } from "./Player.js"

// Helperfunctie om bij een collision de echte actor op te halen.
function getOtherActor(event) {
    return event.other?.owner ?? event.other
}

// Enemy loopt heen en weer tussen een linker- en rechtergrens.
// De speler kan schade krijgen door de enemy, maar kan hem ook verslaan door erop te springen.
export class Enemy extends Actor {
    #speed = 70
    #leftLimit
    #rightLimit
    #runAnimation
    #facingLeft = false
    #visual
    #isDead = false

    #visualScale = 1.55

    constructor(x, y, leftLimit, rightLimit) {
        super({
            pos: new Vector(x, y),

            // Dit is de echte collisionbox van de enemy.
            // De sprite zelf wordt apart getekend zodat de hitbox niet te groot wordt.
            width: 30,
            height: 48,

            collisionType: CollisionType.Active,
            z: 45
        })

        // Deze grenzen bepalen waar de enemy moet omdraaien.
        this.#leftLimit = leftLimit
        this.#rightLimit = rightLimit
    }

    onInitialize(engine) {
        // Maak de rennende animatie van de enemy.
        const runSheet = SpriteSheet.fromImageSource({
            image: Resources.EnemyRun,
            grid: {
                rows: 1,
                columns: 6,
                spriteWidth: 48,
                spriteHeight: 48
            }
        })

        this.#runAnimation = Animation.fromSpriteSheet(runSheet, range(0, 5), 120)

        // Alleen de animatie groter maken.
        // Niet this.scale gebruiken, want dan wordt de collisionbox ook groter.
        this.#runAnimation.scale = new Vector(this.#visualScale, this.#visualScale)

        // Visual actor zonder collision.
        // De echte enemy actor blijft alleen verantwoordelijk voor collision en beweging.
        this.#visual = new Actor({
            pos: this.pos.clone(),
            width: 1,
            height: 1,
            collisionType: CollisionType.PreventCollision,
            z: 55
        })

        this.#visual.graphics.use(this.#runAnimation)
        engine.currentScene.add(this.#visual)

        // Enemy begint naar rechts te lopen.
        this.vel.x = this.#speed
        this.#syncVisual()

        this.on("collisionstart", (event) => {
            if (this.#isDead) {
                return
            }

            const other = getOtherActor(event)

            if (other instanceof Player) {
                const scene = engine.currentScene

                // Als de speler bovenop de enemy landt, gaat de enemy dood.
                // Anders verliest de speler een leven.
                if (this.#playerStompsEnemy(other)) {
                    this.#die(scene, other)
                } else {
                    scene.loseLife(1)
                    other.resetPosition()
                }
            }
        })
    }

    onPreUpdate() {
        if (this.#isDead) {
            return
        }

        // Omdraaien bij de linkergrens.
        if (this.pos.x <= this.#leftLimit) {
            this.vel.x = this.#speed
            this.#facingLeft = false
        }

        // Omdraaien bij de rechtergrens.
        if (this.pos.x >= this.#rightLimit) {
            this.vel.x = -this.#speed
            this.#facingLeft = true
        }

        this.#syncVisual()
    }

    #playerStompsEnemy(player) {
        // Bereken de randen van de speler en enemy om te checken of de speler echt bovenop landt.
        const playerBottom = player.pos.y + player.height / 2
        const enemyTop = this.pos.y - this.height / 2

        const playerLeft = player.pos.x - player.width / 2
        const playerRight = player.pos.x + player.width / 2
        const enemyLeft = this.pos.x - this.width / 2
        const enemyRight = this.pos.x + this.width / 2

        const playerIsAboveEnemy = playerBottom <= enemyTop + 22
        const playerIsFalling = player.vel.y >= -80
        const horizontalOverlap = playerRight > enemyLeft && playerLeft < enemyRight

        return playerIsAboveEnemy && playerIsFalling && horizontalOverlap
    }

    #die(scene, player) {
        // Enemy verwijderen, punten geven en de speler omhoog laten bouncen.
        this.#isDead = true
        this.vel = new Vector(0, 0)

        scene.addScore(25)
        AudioManager.playEnemyDeath()
        player.bounce()

        if (this.#visual) {
            this.#visual.kill()
        }

        this.kill()
    }

    #syncVisual() {
        if (!this.#visual) {
            return
        }

        // De sprite wordt iets verschoven zodat hij goed op de collisionbox staat.
        let offsetX = 18

        if (this.#facingLeft) {
            offsetX = -18
        }

        // Y iets omhoog zodat voeten mooi op het platform staan.
        this.#visual.pos = this.pos.add(new Vector(offsetX, -10))

        // Sprite spiegelen als de enemy naar links loopt.
        this.#visual.graphics.flipHorizontal = this.#facingLeft
    }

    kill() {
        // Als de enemy actor wordt verwijderd, moet de losse visual actor ook weg.
        if (this.#visual) {
            this.#visual.kill()
        }

        super.kill()
    }
}
