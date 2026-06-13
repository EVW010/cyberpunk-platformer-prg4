import { Resources } from './resources.js'

// AudioManager houdt alle audiofuncties op één plek.
// Daardoor hoeven andere classes niet zelf met losse Sound objects te werken.
export class AudioManager {
    static startMusic() {
        // Achtergrondmuziek loopt in een loop en staat iets zachter dan sound effects.
        Resources.BackgroundMusic.loop = true
        Resources.BackgroundMusic.volume = 0.25

        // Alleen starten als de muziek nog niet speelt.
        if (!Resources.BackgroundMusic.isPlaying()) {
            Resources.BackgroundMusic.play().catch(() => {})
        }
    }

    static stopMusic() {
        if (Resources.BackgroundMusic.isPlaying()) {
            Resources.BackgroundMusic.stop()
        }
    }

    static playJump() {
        Resources.JumpSound.play(0.45).catch(() => {})
    }

    static playCoin() {
        Resources.CoinSound.play(0.55).catch(() => {})
    }

    static playHit() {
        Resources.HitSound.play(0.55).catch(() => {})
    }

    static playEnemyDeath() {
        Resources.EnemyDeathSound.play(0.6).catch(() => {})
    }

    static playLevelComplete() {
        Resources.LevelCompleteSound.play(0.65).catch(() => {})
    }

    static playGameOver() {
        Resources.GameOverSound.play(0.65).catch(() => {})
    }
}
