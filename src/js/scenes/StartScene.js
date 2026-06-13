import { Scene, Label, Vector, Color, Font, FontUnit, Keys } from "excalibur"
import { AudioManager } from "../AudioManager.js"

// StartScene is het beginscherm van de game.
// Hier ziet de speler de titel, controls en start-instructie.
export class StartScene extends Scene {
    onInitialize(engine) {
        // Titel van de game.
        const title = new Label({
            text: "CYBERPUNK PLATFORMER",
            pos: new Vector(285, 235),
            font: new Font({
                family: "Arial",
                size: 56,
                unit: FontUnit.Px,
                color: Color.Cyan
            })
        })

        // Geeft duidelijk aan welke template en thema gekozen zijn.
        const subtitle = new Label({
            text: "Platformer template | Cyberpunk megacity theme",
            pos: new Vector(335, 325),
            font: new Font({
                family: "Arial",
                size: 26,
                unit: FontUnit.Px,
                color: Color.Yellow
            })
        })

        // Uitleg van de besturing.
        const controls = new Label({
            text: "A/D of pijltjes = bewegen   SPACE/W/UP = springen",
            pos: new Vector(315, 385),
            font: new Font({
                family: "Arial",
                size: 22,
                unit: FontUnit.Px,
                color: Color.White
            })
        })

        const startText = new Label({
            text: "Druk op ENTER om te starten",
            pos: new Vector(410, 495),
            font: new Font({
                family: "Arial",
                size: 34,
                unit: FontUnit.Px,
                color: Color.Lime
            })
        })

        this.add(title)
        this.add(subtitle)
        this.add(controls)
        this.add(startText)
    }

    onPreUpdate(engine) {
        // Na ENTER start de achtergrondmuziek en ga je naar level 1.
        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            AudioManager.startMusic()
            engine.goToScene("level1")
        }
    }
}
