import { Actor, Vector, CollisionType, Color } from "excalibur"

// Simpele basis-platform class.
// In de uiteindelijke levels gebruik ik vooral TilePlatform, omdat die betere sprites heeft.
export class Platform extends Actor {
    constructor(x, y, width, height) {
        super({
            pos: new Vector(x, y),
            width: width,
            height: height,
            color: Color.fromHex("#ff00ff"),
            collisionType: CollisionType.Fixed
        })
    }
}
