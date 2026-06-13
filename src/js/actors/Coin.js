import { Actor, Vector, CollisionType, SpriteSheet, Animation, range } from "excalibur"
import { Player } from "./Player.js"
import { Resources } from "../resources.js"
import { AudioManager } from "../AudioManager.js"

// Helperfunctie om altijd de echte actor terug te krijgen bij een collision.
// Soms geeft Excalibur namelijk een collider object terug in plaats van direct de actor.
function getOtherActor(event) {
    return event.other?.owner ?? event.other
}

// Coin is een pickup die de speler kan verzamelen voor score.
export class Coin extends Actor {
    #value = 10
    #visual

    constructor(x, y) {
        super({
            // De collisionbox is kleiner dan de zichtbare coin.
            // Daardoor voelt het oppakken eerlijker en raak je niet te vroeg een coin.
            pos: new Vector(x, y),
            width: 14,
            height: 14,
            collisionType: CollisionType.Passive,
            z: 60
        })
    }

    onInitialize(engine) {
        // Maak een spritesheet van de coin afbeelding.
        // De afbeelding heeft 11 frames naast elkaar.
        const coinSheet = SpriteSheet.fromImageSource({
            image: Resources.Coin,
            grid: {
                rows: 1,
                columns: 11,
                spriteWidth: 16,
                spriteHeight: 16
            }
        })

        // Maak een draaiende coin animatie van frame 0 t/m 10.
        const coinAnimation = Animation.fromSpriteSheet(coinSheet, range(0, 10), 90)

        // Deze actor is alleen de kleine collision.
        // De zichtbare coin is een aparte actor zonder collision, zodat de sprite groter kan zijn
        // zonder dat de collisionbox ook groter wordt.
        this.#visual = new Actor({
            pos: this.pos.clone(),
            width: 32,
            height: 32,
            collisionType: CollisionType.PreventCollision,
            z: 61
        })

        this.#visual.graphics.use(coinAnimation)
        this.#visual.scale = new Vector(1.8, 1.8)

        engine.currentScene.add(this.#visual)

        // Als de speler de coin raakt, krijgt hij punten en verdwijnt de coin.
        this.on("collisionstart", (event) => {
            const otherActor = getOtherActor(event)

            if (otherActor instanceof Player) {
                engine.currentScene.addScore(this.#value)
                AudioManager.playCoin()

                if (this.#visual) {
                    this.#visual.kill()
                }

                this.kill()
            }
        })
    }

    onPreUpdate() {
        // De visual actor volgt steeds de positie van de kleine collision actor.
        if (this.#visual) {
            this.#visual.pos = this.pos.clone()
        }
    }
}
