import 'phaser';

const gameScene = new Phaser.Scene('Game');

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: gameScene,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 500
            },
            debug: false
        }
    }
};

gameScene.init = function () {
    // Code
    this._map = null;
    this._player = null;
    this._cursors = null;
    this._groundLayer = null;
    this._coinLayer = null;
    this._text = '';
}

gameScene.preload = function () {
    // map made with Tiled in JSON format
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    // tiles in spritesheet
    this.load.spritesheet('tiles', 'assets/tiles.png', { frameWidth: 70, frameHeight: 70 });
    // simple coin image
    this.load.image('coin', 'assets/coinGold.png');
    // player animations
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
}

gameScene.create = function () {
    // load the map
    this._map = this.make.tilemap({key: 'map'});
    // tiles for the ground layer
    const groundTiles = this._map.addTilesetImage('tiles');
    // create the ground layer
    this._groundLayer = this._map.createDynamicLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    this._groundLayer.setCollisionByExclusion([-1]);
    // set the boundaries of our game world
    this.physics.world.bounds.width = this._groundLayer.width;
    this.physics.world.bounds.height = this._groundLayer.height;

    // create the player sprite
    this._player = this.physics.add.sprite(200, 200, 'player');
    this._player.setBounce(0.2); // our player will bounce from items
    this._player.setCollideWorldBounds(true); // don't go out of the map

    this.physics.add.collider(this._groundLayer, this._player);

    this.cameras.main.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(this._player);
    // set background color, so the sky is not black
    this.cameras.main.setBackgroundColor('#ccccff');

    this._cursors = this.input.keyboard.createCursorKeys();
    // coin image used as tileset
    const coinTiles = this._map.addTilesetImage('coin');
    // add coins as tiles
    this._coinLayer = this._map.createDynamicLayer('Coins', coinTiles, 0, 0);

    this._coinLayer.setTileIndexCallback(17, collectCoin, this);
    // when the player overlaps with a tile with index 17, collectCoin
    // will be called
    this.physics.add.overlap(this._player, this._coinLayer);

    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });
}

gameScene.update = function (time, delta) {
    if (this._cursors.left.isDown) {
        this._player.body.setVelocityX(-200); // move left
        this._player.anims.play('walk', true); // play walk animation
        this._player.flipX = true; // flip the sprite to the left
    } else if (this._cursors.right.isDown) {
        this._player.body.setVelocityX(200); // move right
        this._player.anims.play('walk', true); // play walk animatio
        this._player.flipX = false; // use the original sprite looking to the right
    } else if ((this._cursors.space.isDown || this._cursors.up.isDown) && this._player.body.onFloor()) {
        this._player.body.setVelocityY(-800); // jump up
    } else {
        this._player.body.setVelocityX(0);
        this._player.anims.play('idle', true);
    }
}

function collectCoin (sprite, tile) {
    this._coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
    return false;
}

const game = new Phaser.Game(config);
