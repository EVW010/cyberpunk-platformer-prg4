import { Scene, Label, Vector, Color, Font, FontUnit, Keys } from "excalibur"
import { AudioManager } from "../AudioManager.js"

// GameOverScene wordt getoond als de speler geen levens meer heeft
// of uit de wereld valt.
export class GameOverScene extends Scene {
    onInitialize(engine) {
        this.add(new Label({
            text: "GAME OVER",
            pos: new Vector(465, 285),
            font: new Font({ family: "Arial", size: 56, unit: FontUnit.Px, color: Color.Red })
        }))

        this.add(new Label({
            text: "Druk op ENTER om opnieuw te starten",
            pos: new Vector(345, 370),
            font: new Font({ family: "Arial", size: 28, unit: FontUnit.Px, color: Color.Cyan })
        }))
    }

    onActivate() {
        // Achtergrondmuziek stoppen en game-over geluid afspelen.
        AudioManager.stopMusic()
        AudioManager.playGameOver()
    }

    onPreUpdate(engine) {
        // Simpele restart: pagina opnieuw laden zodat alle waarden opnieuw beginnen.
        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            window.location.reload()
        }
    }
}
