import { Scene, Label, Vector, Color, Font, FontUnit, Keys } from "excalibur"
import { AudioManager } from "../AudioManager.js"

// WinScene wordt getoond nadat level 2 is gehaald.
export class WinScene extends Scene {
    onInitialize(engine) {
        this.add(new Label({
            text: "YOU WIN!",
            pos: new Vector(485, 260),
            font: new Font({ family: "Arial", size: 64, unit: FontUnit.Px, color: Color.Lime })
        }))

        this.add(new Label({
            text: "Je hebt level 1 en level 2 gehaald.",
            pos: new Vector(390, 350),
            font: new Font({ family: "Arial", size: 28, unit: FontUnit.Px, color: Color.Cyan })
        }))

        this.add(new Label({
            text: "Druk op ENTER om opnieuw te spelen",
            pos: new Vector(365, 420),
            font: new Font({ family: "Arial", size: 28, unit: FontUnit.Px, color: Color.White })
        }))
    }

    onActivate() {
        // Muziek stoppen zodra de speler gewonnen heeft.
        AudioManager.stopMusic()
    }

    onPreUpdate(engine) {
        // Opnieuw spelen door de pagina te herladen.
        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            window.location.reload()
        }
    }
}
