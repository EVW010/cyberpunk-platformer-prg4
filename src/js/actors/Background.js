import { Actor, Vector, CollisionType, CoordPlane } from "excalibur"

// Deze class maakt de cyberpunk achtergrond van de game.
// De achtergrond staat op CoordPlane.Screen, zodat hij vast op het scherm blijft staan
// en niet gaat trillen wanneer de camera de speler volgt.
export class Background extends Actor {
    #imageResource
    #scale

    constructor(imageResource, scale = 1.35) {
        super({
            // Midden van het scherm bij een 1280x720 canvas.
            pos: new Vector(640, 360),
            width: 1280,
            height: 720,

            // Een lage z-index zorgt ervoor dat de achtergrond achter alles staat.
            z: -1000,

            // De achtergrond heeft geen collision nodig.
            collisionType: CollisionType.PreventCollision,

            // Screen betekent: vast op het scherm, niet in de wereld/camera.
            coordPlane: CoordPlane.Screen
        })

        this.#imageResource = imageResource
        this.#scale = scale
    }

    onInitialize(engine) {
        // Zet de meegegeven afbeelding om naar een sprite en schaal hem passend.
        this.graphics.use(this.#imageResource.toSprite())
        this.scale = new Vector(this.#scale, this.#scale)
    }
}
