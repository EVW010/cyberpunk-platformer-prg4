import { Actor, Vector, CollisionType } from "excalibur"
import { Player } from "./Player.js"
import { Resources } from "../resources.js"
import { AudioManager } from "../AudioManager.js"

// Helperfunctie om bij een collision de echte actor te vinden.
function getOtherActor(event) {
    return event.other?.owner ?? event.other
}

// Goal is het eindpunt van een level.
// Als de speler deze portal raakt, gaat de game naar de volgende scene.
export class Goal extends Actor {
    #nextScene
    #message
    #isTriggered = false

    constructor(x, y, nextScene = "win", message = "Level gehaald!") {
        super({
            pos: new Vector(x, y),
            width: 95,
            height: 145,
            collisionType: CollisionType.Passive,
            z: 40
        })

        this.#nextScene = nextScene
        this.#message = message
    }

    onInitialize(engine) {
        // De exit portal wordt passend gemaakt op de collisionbox.
        const sprite = Resources.ExitPortal.toSprite()
        this.graphics.use(sprite)
        this.scale = new Vector(this.width / sprite.width, this.height / sprite.height)

        this.on("collisionstart", (event) => {
            // Voorkomt dat de scene meerdere keren tegelijk wisselt.
            if (this.#isTriggered) {
                return
            }

            const otherActor = getOtherActor(event)

            if (otherActor instanceof Player) {
                this.#isTriggered = true
                AudioManager.playLevelComplete()
                alert(`${this.#message} Score: ${engine.currentScene.getScore()}`)
                engine.goToScene(this.#nextScene)
            }
        })
    }
}
