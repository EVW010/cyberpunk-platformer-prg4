import { Label, Vector, Color, Font, FontUnit, CoordPlane } from "excalibur"

// Deze UI-label laat zien hoeveel levens de speler nog heeft.
// CoordPlane.Screen zorgt ervoor dat de tekst vast op het scherm blijft staan.
export class LivesLabel extends Label {
    constructor() {
        super({
            text: "Lives: 3",
            pos: new Vector(20, 60),
            font: new Font({
                family: "Arial",
                size: 28,
                unit: FontUnit.Px,
                color: Color.Red
            }),
            z: 1000,
            coordPlane: CoordPlane.Screen
        })
    }

    updateLives(lives) {
        // Wordt aangeroepen wanneer de speler schade krijgt.
        this.text = `Lives: ${lives}`
    }
}
