import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from "../resources.js"

// TilePlatform is een platform waar de speler op kan staan.
// De actor zelf is een simpele rechthoek voor collision.
// De mooie platform-afbeelding wordt apart als visual toegevoegd.
export class TilePlatform extends Actor {
    #topY
    #platformWidth
    #type
    #collisionHeight = 24

    constructor(x, topY, width = 320, type = "middle") {
        super({
            // topY betekent: de bovenkant waarop de speler staat.
            // Omdat de collisionbox 24px hoog is, staat het midden op topY + 12.
            pos: new Vector(x, topY + 12),
            width: width,
            height: 24,
            collisionType: CollisionType.Fixed
        })

        this.#topY = topY
        this.#platformWidth = width
        this.#type = type
    }

    onInitialize(engine) {
        // Kies de juiste platform afbeelding op basis van het type.
        let resource = Resources.PlatformMiddle

        if (this.#type === "ground") resource = Resources.PlatformGround
        if (this.#type === "left") resource = Resources.PlatformLeft
        if (this.#type === "middle") resource = Resources.PlatformMiddle
        if (this.#type === "right") resource = Resources.PlatformRight
        if (this.#type === "broken") resource = Resources.PlatformBroken
        if (this.#type === "moving") resource = Resources.PlatformMoving
        if (this.#type === "corner") resource = Resources.PlatformCorner

        const sprite = resource.toSprite()
        const scale = this.#platformWidth / sprite.width
        const visualHeight = sprite.height * scale

        // De afbeelding is alleen visueel. De Actor zelf blijft de collisionbox.
        // Hierdoor zakt de speler niet door rare grote sprites heen.
        const visual = new Actor({
            pos: new Vector(this.pos.x, this.#topY + visualHeight / 2),
            width: this.#platformWidth,
            height: visualHeight,
            collisionType: CollisionType.PreventCollision,
            z: 10
        })

        visual.graphics.use(sprite)
        visual.scale = new Vector(scale, scale)
        engine.currentScene.add(visual)
    }
}
