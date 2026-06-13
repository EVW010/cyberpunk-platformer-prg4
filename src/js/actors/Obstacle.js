import { Actor, Vector, CollisionType } from "excalibur"
import { Player } from "./Player.js"
import { Resources } from "../resources.js"

// Helperfunctie om bij collision de echte actor terug te krijgen.
function getOtherActor(event) {
    return event.other?.owner ?? event.other
}

// Obstacle is een gevaarlijk object zoals spikes of lasers.
// Als de speler dit raakt, verliest hij een leven en wordt hij teruggezet.
export class Obstacle extends Actor {
    #damage = 1
    #type

    constructor(x, y, type = "spikes") {
        // Standaard grootte voor een obstacle.
        let width = 120
        let height = 35

        // Per obstacle type krijgt de collisionbox een andere grootte.
        if (type === "spikes") {
            width = 200
            height = 80
        }

        if (type === "laserHorizontal") {
            width = 190
            height = 34
        }

        if (type === "laserVertical") {
            width = 44
            height = 160
        }

        super({
            pos: new Vector(x, y),
            width,
            height,
            collisionType: CollisionType.Passive,
            z: 40
        })

        this.#type = type
    }

    onInitialize(engine) {
        // Kies de juiste afbeelding op basis van het type obstacle.
        let resource = Resources.Spikes

        if (this.#type === "laserVertical") resource = Resources.LaserVertical
        if (this.#type === "laserHorizontal") resource = Resources.LaserHorizontal
        if (this.#type === "spikes") resource = Resources.Spikes

        const sprite = resource.toSprite()
        this.graphics.use(sprite)

        // Laat de sprite precies passen binnen de collisionbox.
        this.scale = new Vector(this.width / sprite.width, this.height / sprite.height)

        this.on("collisionstart", (event) => {
            const otherActor = getOtherActor(event)

            if (otherActor instanceof Player) {
                engine.currentScene.loseLife(this.#damage)
                otherActor.resetPosition()
            }
        })
    }
}
