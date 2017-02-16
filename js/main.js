var endText = ["WRONG","YOU ARE WORSE THAN CNN",
    "YOU ARE SO BAD IT MAKES MY HEAD SPIN",
    "PLEASE DON'T FEEL STUPID OR INSECURE, IT'S NOT YOUR FAULT",
    "I'M GOING TO CREATE A SPECIAL COMMITTEE TO LOCK YOU UP",
    "YOU ARE AS STUPID AS THE PEOPLE OF IOWA",
    "I DON'T WANT TO USE THE WORD 'SCREWED', BUT I SCREWED YOU",
    "THE CONCEPT OF THIS GAME WAS CREATED BY AND FOR THE CHINESE",
    "IT DOESN'T MATTER AS LONG AS YOU'VE GOT A YOUNG AND BEAUTIFUL PIECE OF ASS",
    "FAIL AT GAMING. SAD!"]

var getRandomEndText = function(){
    return endText[Math.floor(Math.random()*endText.length)]
}

// Create our 'main' state that will contain the game
var mainState = {
    init: function() {
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    if (game.device.desktop) {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.windowConstraints.bottom = 'visual'
    }
    game.scale.updateLayout();
},
    preload: function() {
        // This function will be executed at the beginning
        // That's where we load the images and sounds

        // Load the bird sprite
        game.load.spritesheet('trump', 'assets/trump-sprite.png', 50, 67);
        game.load.spritesheet('trump-hands', 'assets/hands-small-anim.png', 80, 41);
        game.load.image('bricks', 'assets/bricks.jpg');
        game.load.image('trump_dead', 'assets/trumpfacedead.png');

        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() {
        game.ads.setAdProvider(new Fabrique.AdProvider.AdSense(
            game,
            'game-container',
            'ad-container',
            'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator='
        ));
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.

        this.jumpSound = game.add.audio('jump');

        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird at the position x=100 and y=245
        this.trump = game.add.sprite(100, 245, 'trump');
        this.trump.frame = 3;
        this.trump.animations.add('fly', [0, 1, 2, 3,4,5], 10, true);
        this.trump.animations.play('fly');
        this.hands = game.add.sprite(94,254,'trump-hands');
        this.hands.frame=0;
        this.hands.animations.add('flap',[0,1,2,3], 10, true);
        this.hands.animations.play('flap');

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.trump);
        game.physics.arcade.enable(this.hands);
        // Add gravity to the bird to make it fall
        this.trump.body.gravity.y = 1000;
        this.hands.body.gravity.y = 1000;

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onTap.add(this.jump, this);

        // Create an empty group
        this.pipes = game.add.group();

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        this.score = 0;
        var style = { font: "bold 36px Arial", fill: "#FFF",
            wordWrap: true, wordWrapWidth: 300,
            boundsAlignH: "center", boundsAlignV: "middle" };
        this.labelScore = game.add.text(20, 20, "0",
            style);
        this.labelScore.stroke = '#000000';
        this.labelScore.strokeThickness = 6;

        // Move the anchor to the left and downward
        this.trump.anchor.setTo(-0.2, 0.5);

    },

    update: function() {
        // This function is called 60 times per second
        // It contains the game's logic

        // If the bird is out of the screen (too high or too low)
        // Call the 'restartGame' function
        if (this.trump.y < 0 || this.trump.y > 640)
            this.gameOver();

        game.physics.arcade.overlap(
            this.trump, this.pipes, this.gameOver, null, this);
        this.trump.checkWorldBounds = true;
        this.trump.events.onOutOfBounds.add(this.gameOver, this);

        if (this.trump.angle < 20)
            this.trump.angle += 1;
        if (this.hands.angle < 20)
            this.hands.angle += 1;
    },

    // Make the bird jump
    jump: function() {
        if (this.trump.alive == false) {

            return;
        }
        this.jumpSound.play();
        // Add a vertical velocity to the bird
        this.trump.body.velocity.y = -350;
        this.hands.body.velocity.y = -350;

        game.add.tween(this.trump).to({angle: -20}, 100).start();
        game.add.tween(this.hands).to({angle: -20}, 100).start();
    },



// Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        this.trump.game.state.start('main');
        // this.trump.loadTexture('trump',0);
    },

    gameOver: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.trump.alive == false)
            return;
        this.trump.animations.stop();
        this.hands.animations.stop();
        // Set the alive property of the bird to false
        // this.trump.loadTexture('trump_dead',0);
        this.trump.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);

        this.endBox = game.add.graphics();
        this.endBox.beginFill(0xFFFFFF, 0.8);
        this.endBox.lineStyle(10, 0x000000, 0.7);
        this.endBox.drawRect(50, 100, 300, 300);

        var style = { font: "bold 20px Arial", fill: "#fff",
            wordWrap: true, wordWrapWidth: 300,
            boundsAlignH: "center", boundsAlignV: "middle" };
        textMain = game.add.text(0, 0, getRandomEndText(), style);
        textMain.stroke = '#000000';
        textMain.strokeThickness = 4;
        textMain.setTextBounds(80, 160, 240, 100);


        deathTimer = game.time.events.add(Phaser.Timer.SECOND * 3, this.restartGame, this);

        textSub = game.add.text(0, 0,"3", style);

        updateDeathTimer= function(){
            textSub.text = textSub.text-1
        }
        game.time.events.repeat(Phaser.Timer.SECOND * 1, 2, updateDeathTimer, this);

        textSub.setTextBounds(80, 300, 240, 100);
    },


    addOnePipe: function(x, y) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'bricks');
        pipe.height = 80
        pipe.width = 40
        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Automatically kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        if (this.trump.alive == false)
            return
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < 9; i++)
            if (i != hole && i != hole + 1)
                this.addOnePipe(400, i * 80);

        this.score += 1;
        this.labelScore.text = this.score;
    },
};

var game = new Phaser.Game(400, 640,Phaser.AUTO, 'game-container');
Phaser.Device.whenReady(function () {
    game.plugins.add(Fabrique.Plugins.AdManager);
});

//let's create a new provider, first argument should be the game, second should be the ad tag URL
// var provider = new PhaserAds.AdProvider.Ima3(
//     game,
//     'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&correlator'
// );
// game.ads.setAdProvider(provider);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');