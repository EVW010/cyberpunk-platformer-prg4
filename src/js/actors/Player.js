import { Actor, Vector, Keys, CollisionType, SpriteSheet, Animation, range } from "excalibur"
import { Resources } from "../resources.js"
import { AudioManager } from "../AudioManager.js"
import { TilePlatform } from "./TilePlatform.js"

// Helperfunctie om bij collision de echte actor terug te krijgen.
function getOtherActor(event) {
    return event.other?.owner ?? event.other
}

// Player is de bestuurbare speler van de platformer.
// Deze class regelt lopen, springen, animaties, physics en vallen uit de wereld.
export class Player extends Actor {
    #speed = 300
    #jumpPower = -700
    #groundContacts = new Set()
    #facingLeft = false

    #visual
    #idleAnimation
    #runAnimation
    #jumpAnimation
    #currentAnimation = ""

    // De sprite is groter dan de collisionbox, zodat de speler mooi zichtbaar is.
    #visualScale = 1.55

    constructor() {
        super({
            // Startpositie op de eerste grond.
            // Ground topY 640 - player hitbox height 48 / 2 = 616.
            pos: new Vector(120, 616),

            // Dit is de echte collisionbox van de speler.
            width: 30,
            height: 48,

            collisionType: CollisionType.Active,
            z: 50
        })

        // Gravity: positieve y-acceleration trekt de speler naar beneden.
        this.acc = new Vector(0, 900)
    }

    onInitialize(engine) {
        // Maak spritesheets voor idle, run en jump animaties.
        const idleSheet = SpriteSheet.fromImageSource({
            image: Resources.PlayerIdle,
            grid: {
                rows: 1,
                columns: 4,
                spriteWidth: 48,
                spriteHeight: 48
            }
        })

        const runSheet = SpriteSheet.fromImageSource({
            image: Resources.PlayerRun,
            grid: {
                rows: 1,
                columns: 6,
                spriteWidth: 48,
                spriteHeight: 48
            }
        })

        const jumpSheet = SpriteSheet.fromImageSource({
            image: Resources.PlayerJump,
            grid: {
                rows: 1,
                columns: 4,
                spriteWidth: 48,
                spriteHeight: 48
            }
        })

        this.#idleAnimation = Animation.fromSpriteSheet(idleSheet, range(0, 3), 150)
        this.#runAnimation = Animation.fromSpriteSheet(runSheet, range(0, 5), 100)
        this.#jumpAnimation = Animation.fromSpriteSheet(jumpSheet, range(0, 3), 120)

        // Alleen de animatie groter maken, niet de actor zelf.
        // Anders wordt de collisionbox ook groter en voelt de gameplay oneerlijk.
        this.#idleAnimation.scale = new Vector(this.#visualScale, this.#visualScale)
        this.#runAnimation.scale = new Vector(this.#visualScale, this.#visualScale)
        this.#jumpAnimation.scale = new Vector(this.#visualScale, this.#visualScale)

        // Visual actor zonder collision.
        // De echte Player actor gebruikt alleen de kleine hitbox voor physics/collision.
        this.#visual = new Actor({
            pos: this.pos.clone(),
            width: 1,
            height: 1,
            collisionType: CollisionType.PreventCollision,
            z: 60
        })

        engine.currentScene.add(this.#visual)

        this.#setAnimation("idle")
        this.#syncVisual()

        // Als de speler een platform raakt terwijl hij naar beneden beweegt,
        // wordt dat platform toegevoegd aan groundContacts.
        this.on("collisionstart", (event) => {
            const other = getOtherActor(event)

            if (other instanceof TilePlatform && this.vel.y >= 0) {
                this.#groundContacts.add(other)
            }
        })

        // Als de speler het platform verlaat, wordt het platform verwijderd uit groundContacts.
        this.on("collisionend", (event) => {
            const other = getOtherActor(event)

            if (other instanceof TilePlatform) {
                this.#groundContacts.delete(other)
            }
        })
    }

    onPreUpdate(engine) {
        const isOnGround = this.#groundContacts.size > 0

        // Eerst horizontale snelheid resetten.
        // Daarna zetten we snelheid opnieuw op basis van input.
        this.vel.x = 0

        // Links bewegen met pijltje links of A.
        if (engine.input.keyboard.isHeld(Keys.Left) || engine.input.keyboard.isHeld(Keys.A)) {
            this.vel.x = -this.#speed
            this.#facingLeft = true

            if (isOnGround) {
                this.#setAnimation("run")
            }
        } else if (engine.input.keyboard.isHeld(Keys.Right) || engine.input.keyboard.isHeld(Keys.D)) {
            // Rechts bewegen met pijltje rechts of D.
            this.vel.x = this.#speed
            this.#facingLeft = false

            if (isOnGround) {
                this.#setAnimation("run")
            }
        } else if (isOnGround) {
            // Geen input en op de grond betekent idle animatie.
            this.#setAnimation("idle")
        }

        // Springen kan alleen als de speler op de grond staat.
        if (
            (
                engine.input.keyboard.wasPressed(Keys.Space) ||
                engine.input.keyboard.wasPressed(Keys.Up) ||
                engine.input.keyboard.wasPressed(Keys.W)
            ) &&
            isOnGround
        ) {
            this.vel.y = this.#jumpPower
            AudioManager.playJump()
            this.#groundContacts.clear()
            this.#setAnimation("jump")
        }

        // In de lucht altijd de jump animatie laten zien.
        if (!isOnGround) {
            this.#setAnimation("jump")
        }

        // De visual wordt in onPostUpdate gesynchroniseerd.
        // Daardoor loopt de sprite niet één physics-frame achter en trilt hij minder tijdens springen.

        // Als de speler uit de wereld valt, is het game over.
        if (this.pos.y > 900) {
            engine.goToScene("gameover")
        }
    }

    onPostUpdate() {
        // Na de physics update staat de speler op zijn definitieve positie.
        // Hier syncen voorkomt een kleine trilling/vertraging van de losse sprite.
        this.#syncVisual()
    }

    #setAnimation(name) {
        // Alleen veranderen als de animatie echt anders is.
        // Dit voorkomt onnodig opnieuw instellen per frame.
        if (this.#currentAnimation === name) {
            return
        }

        this.#currentAnimation = name

        if (name === "idle") {
            this.#visual.graphics.use(this.#idleAnimation)
        }

        if (name === "run") {
            this.#visual.graphics.use(this.#runAnimation)
        }

        if (name === "jump") {
            this.#visual.graphics.use(this.#jumpAnimation)
        }
    }

    #syncVisual() {
        if (!this.#visual) {
            return
        }

        // De sprite wordt een beetje verschoven zodat hij netjes om de collisionbox staat.
        let offsetX = 10

        if (this.#facingLeft) {
            offsetX = -10
        }

        // -11 zet de sprite iets omhoog zodat de voeten goed op het platform staan.
        this.#visual.pos = this.pos.add(new Vector(offsetX, -11))

        // Sprite spiegelen als de speler naar links kijkt.
        this.#visual.graphics.flipHorizontal = this.#facingLeft
    }

    resetPosition() {
        // Zet de speler terug naar het begin na schade.
        this.pos = new Vector(120, 616)
        this.vel = new Vector(0, 0)
        this.#groundContacts.clear()
        this.#facingLeft = false
        this.#syncVisual()
    }

    bounce() {
        // Kleine bounce omhoog na het verslaan van een enemy.
        this.vel.y = -420
        this.#groundContacts.clear()
    }

    kill() {
        // Als de speler verwijderd wordt, moet de losse visual actor ook weg.
        if (this.#visual) {
            this.#visual.kill()
        }

        super.kill()
    }
}
