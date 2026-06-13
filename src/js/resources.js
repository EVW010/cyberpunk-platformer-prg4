import { ImageSource, Loader, Sound } from 'excalibur'

// In Resources staan alle afbeeldingen en geluiden die de game gebruikt.
// Door alles hier te verzamelen is het makkelijker om assets terug te vinden of te vervangen.
const Resources = {
    // Cyberpunk megacity achtergrond.
    BackgroundCity: new ImageSource('./images/background-city.png'),

    // Player sprites.
    PlayerIdle: new ImageSource('./images/player-idle.png'),
    PlayerRun: new ImageSource('./images/player-run.png'),
    PlayerJump: new ImageSource('./images/player-jump.png'),

    // Enemy en coin sprites.
    EnemyIdle: new ImageSource('./images/enemy-idle.png'),
    EnemyRun: new ImageSource('./images/enemy-run.png'),
    Coin: new ImageSource('./images/coin.png'),

    // Platform sprites.
    PlatformLeft: new ImageSource('./images/platform-left.png'),
    PlatformMiddle: new ImageSource('./images/platform-middle.png'),
    PlatformRight: new ImageSource('./images/platform-right.png'),
    PlatformGround: new ImageSource('./images/platform-ground.png'),
    PlatformCorner: new ImageSource('./images/platform-corner.png'),
    PlatformBroken: new ImageSource('./images/platform-broken.png'),
    PlatformMoving: new ImageSource('./images/platform-moving.png'),

    // Obstacles en einddoel.
    LaserVertical: new ImageSource('./images/laser-vertical.png'),
    LaserHorizontal: new ImageSource('./images/laser-horizontal.png'),
    Spikes: new ImageSource('./images/spikes.png'),
    ExitPortal: new ImageSource('./images/exit.png'),

    // Cyberpunk/retro audio.
    BackgroundMusic: new Sound('./sounds/background-music.mp3'),
    JumpSound: new Sound('./sounds/jump.mp3'),
    CoinSound: new Sound('./sounds/coin.mp3'),
    HitSound: new Sound('./sounds/hit.mp3'),
    EnemyDeathSound: new Sound('./sounds/enemy-death.mp3'),
    LevelCompleteSound: new Sound('./sounds/level-complete.mp3'),
    GameOverSound: new Sound('./sounds/game-over.mp3')
}

// ResourceLoader zorgt ervoor dat alle assets geladen zijn voordat de game start.
const ResourceLoader = new Loader(Object.values(Resources))

export { Resources, ResourceLoader }
