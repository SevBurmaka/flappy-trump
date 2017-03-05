var endText = ["WRONG","YOU ARE WORSE THAN CNN",
    "YOU ARE SO BAD IT MAKES MY HEAD SPIN",
    "PLEASE DON'T FEEL STUPID OR INSECURE, IT'S NOT YOUR FAULT",
    "I'M GOING TO CREATE A SPECIAL COMMITTEE TO LOCK YOU UP",
    "YOU ARE AS STUPID AS THE PEOPLE OF IOWA",
    "I DON'T WANT TO USE THE WORD 'SCREWED', BUT I SCREWED YOU",
    "THE CONCEPT OF THIS GAME WAS CREATED BY AND FOR THE CHINESE",
    "IT DOESN'T MATTER AS LONG AS YOU'VE GOT A YOUNG AND BEAUTIFUL PIECE OF ASS",
    "HOW DO I KNOW YOU AREN'T A MUSLIM TERRORIST? SHOW ME YOUR BIRTH CERTIFICATE",
    "I HAVE A GREAT RELATIONSHIP WITH THE BLACKS",
    "WE CAN'T CONTINUE TO ALLOW CHINA TO RAPE OUR COUNTRY",
    "FAIL AT GAMING. SAD!",
    "THIS GAME IS BEING RIGGED BY THE DISHONEST MEDIA. SAD",
    "I REFUSE TO CALL YOU A BIMBO BECAUSE THAT WOULD NOT BE POLITICALLY CORRECT",
    "I'M GOING TO REPEAL AND REPLACE YOUR RIGHT TO PLAY THIS GAME",
    "I KNOW A LOT OF PEOPLE, TREMENDOUS PEOPLE, WHO COULD DO THIS BETTER",
    "YOU WIN! #ALTERNATIVEFACTS",
    "THIS TRAIN WRECK WILL DRAW A CROWD BIGGER THAN MY TREMENDOUS INAUGURATION",
    "I'M NOT A PUPPET YOU'RE A PUPPET"]

var getRandomEndText = function(){
    return endText[Math.floor(Math.random()*endText.length)]
}
canRestart = false;
deathMax = 3;
deathCount = 0;
trumpSoundLength = 300;
startSoundLength = 3000;
loseSoundLength = 1000;

pipeTimer = 2400;
collectibleTimer = 600;
collectibleFrequency = pipeTimer / collectibleTimer;

specialCollectibleFrequency = 10;

baseSpeed = -200;
maxSpeedScale = 1.5;
var globalScore = 0;

var scoresDb = firebase.database();
firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
})
var checkIsHighScore = function(score){

    return getHighScores().then(function (scores){
            return (scores.length < 15 || scores.slice(-1)[0]['score'] < score)
        },
        function(err){
            console.log(err)
        }
    )
}

var getHighScores = function() {
    return scoresDb.ref().child('scores').limitToFirst(15).once('value').then(function(snapshot) {
            var scores = []

            snapshot.forEach(function(childSnapshot) {
                scores.push(childSnapshot.val())
            });
            return scores
        },
        function(err){
            console.log(err)
        });
}

var addLeaderboardItem = function(y,count, name, score,style){
    countText = game.add.text(0, 0, count, style);
    countText.setTextBounds(120, y, 100, 100);
    nameText = game.add.text(0, 0, name, style);
    nameText.setTextBounds(150, y, 100, 100);
    scoreText = game.add.text(0, 0, score, style);
    scoreText.setTextBounds(350, y, 100, 100);

}

var createLeaderboardButton = function (x,y) {
    var style = {  font: "30px Arial", fill: "#111",
        wordWrap: true, wordWrapWidth: 290,
        boundsAlignH: "left", boundsAlignV: "middle" };
    this.leaderboardBox = game.add.graphics();
    this.leaderboardBox.beginFill(0xFFFFFF, 0.8);
    this.leaderboardBox.lineStyle(2, 0x000000, 0.7);
    this.leaderboardBox.drawRect(x, y, 250, 40);
    leaderboardText = game.add.text(0, 0, 'VIEW LEADERS', style);
    leaderboardText.setTextBounds(x+10, y+5, 260, 40);

    this.leaderboardBox.inputEnabled = true;
    this.leaderboardBox.events.onInputUp.add(function(){
        game.state.start('leaderboard');
    },this)
    this.leaderboardBox.events.onInputDown.add(function(){
        game.state.start('leaderboard');
    },this)
}

var postScore = function(user,score) {
    var postData = {
        name: user,
        score: score,
        ".priority" : -1 * score
    };

    var newPostKey = scoresDb.ref().child('scores').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/scores/' + newPostKey] = postData;

    return scoresDb.ref().update(updates);
};

var highScore = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        if (game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        else {
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        game.scale.updateLayout();
    },
    preload: function() {
        game.load.spritesheet('trump', 'assets/trump-sprite.png', 50, 67);
        game.load.spritesheet('trump-hands', 'assets/hands-small-anim.png', 80, 41);
    },
    create: function() {
        game.stage.backgroundColor = '#71c5cf';

        this.endBox = game.add.graphics();
        this.endBox.beginFill(0xFFFFFF, 0.8);
        this.endBox.lineStyle(10, 0x000000, 0.7);
        this.endBox.drawRect(100, 200, 300, 350);

        var style = { font: "bold 20px Arial", fill: "#fff",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "center", boundsAlignV: "middle" };
        textMain = game.add.text(0, 0, 'YOU SUCCEEDED BIGLY!', style);
        textMain.stroke = '#000000';
        textMain.strokeThickness = 6;
        textMain.setTextBounds(110, 210, 300, 100);
        textMain.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);

        var style = {  font: "20px Arial", fill: "#111",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "left", boundsAlignV: "middle" };
        nameText = game.add.text(0, 0, 'NAME: ', style);
        nameText.setTextBounds(150, 270, 300, 100);

        var input = game.add.inputField(150, 340,{
            max: 10,
            height : 32,
            font: "30px Arial"
        });
        input.startFocus();

        var enterScore = function(){
            if (input.value.length > 0) {
                postScore(input.value, globalScore);
                game.state.start('leaderboard');
            }
        }

        var style = {  font: "30px Arial", fill: "#111",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "left", boundsAlignV: "middle" };
        this.enterBox = game.add.graphics();
        this.enterBox.beginFill(0xFFFFFF, 0.8);
        this.enterBox.lineStyle(2, 0x000000, 0.7);
        this.enterBox.drawRect(150, 400, 120, 40);
        enterText = game.add.text(0, 0, 'ENTER ', style);
        enterText.setTextBounds(160, 425, 80, 40);

        this.enterBox.inputEnabled = true;
        this.enterBox.events.onInputDown.add(enterScore,this)
        var enterKey = game.input.keyboard.addKey(
            Phaser.Keyboard.ENTER);
        enterKey.onDown.add(enterScore, this);
    },

    update: function() {

    }
}

var leaderboard = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        if (game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        else {
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        game.scale.updateLayout();
    },
    preload: function() {
        game.load.spritesheet('trump', 'assets/trump-sprite.png', 50, 67);
        game.load.spritesheet('trump-hands', 'assets/hands-small-anim.png', 80, 41);
    },
    create: function() {
        game.stage.backgroundColor = '#71c5cf';

        this.endBox = game.add.graphics();
        this.endBox.beginFill(0xFFFFFF, 0.8);
        this.endBox.lineStyle(10, 0x000000, 0.7);
        this.endBox.drawRect(100, 200, 350, 550);

        var style = { font: "bold 20px Arial", fill: "#fff",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "center", boundsAlignV: "middle" };
        textMain = game.add.text(0, 0, 'TREMENDOUS PEOPLE', style);
        textMain.stroke = '#000000';
        textMain.strokeThickness = 6;
        textMain.setTextBounds(120, 210, 300, 100);
        textMain.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);

        var style = {  font: "20px Arial", fill: "#111",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "left", boundsAlignV: "middle" };

        var startingY = 250;
        var count = 1;
        getHighScores().then(function(scores){
            scores.forEach(function(score){
                addLeaderboardItem(startingY,count,score['name'],score['score'],style)
                startingY+=25;
                count++;
            })
        })

        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function(){game.state.start('main')}, this);
        game.input.onDown.add(function(){game.state.start('main')}, this);

    },

    update: function() {

    }
}

var startState = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        if (game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        else {
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        game.scale.updateLayout();
    },
    preload: function() {
        game.load.spritesheet('trump', 'assets/trump-sprite.png', 50, 67);
        game.load.spritesheet('trump-hands', 'assets/hands-small-anim.png', 80, 41);
    },
    create: function() {
        game.stage.backgroundColor = '#71c5cf';

        this.endBox = game.add.graphics();
        this.endBox.beginFill(0xFFFFFF, 0.8);
        this.endBox.lineStyle(10, 0x000000, 0.7);
        this.endBox.drawRect(100, 200, 300, 350);

        var style = { font: "bold 40px Arial", fill: "#fff",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "center", boundsAlignV: "middle" };
        textMain = game.add.text(0, 0, 'TINY HANDS', style);
        textMain.stroke = '#000000';
        textMain.strokeThickness = 6;
        textMain.setTextBounds(110, 260, 300, 100);
        textMain.setShadow(5, 5, 'rgba(0,0,0,0.5)', 15);


        var style = { font: "bold 22px Arial", fill: "#111",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "left", boundsAlignV: "middle" };
        if (game.device.desktop)
            textSub = game.add.text(0, 0, "PRESS SPACE TO FLAP", style);
        else
            textSub = game.add.text(0, 0, "TAP TO FLAP ", style);

        textSub.setTextBounds(120, 300, 300, 100);

        var style = {  font: "20px Arial", fill: "#111",
            wordWrap: true, wordWrapWidth: 290,
            boundsAlignH: "left", boundsAlignV: "middle" };

        soundText = game.add.text(0, 0, "BEST WITH SOUND ON", style);
        soundText.setTextBounds(110, 480, 300, 100);
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        createLeaderboardButton(120,450);

        spaceKey.onDown.add(function(){game.state.start('main')}, this);
        game.input.onTap.add(function(){game.state.start('main')}, this);


    },

    update: function() {

    }

}

// Create our 'main' state that will contain the game
var mainState = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        if (game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        else {
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
            // game.scale.pageAlignHorizontally = true;
            game.scale.windowConstraints.bottom = 'visual'
        }
        game.scale.updateLayout();
    },
    preload: function() {
        game.load.spritesheet('trump', 'assets/trump-sprite.png', 50, 67);
        game.load.spritesheet('trump-hands', 'assets/hands-small-anim.png', 80, 41);
        game.load.image('bricks', 'assets/bricks.jpg');
        game.load.image('trump_dead', 'assets/trumpfacedead.png');
        game.load.image('dollar','assets/dollar.png');
        game.load.spritesheet('cat','assets/cat.png');
        game.load.image('mexican','assets/mexican.png');
        //on jump sounds
        game.load.audio('trump1', 'assets/trump1.wav');
        game.load.audio('trump2', 'assets/trump2.wav');
        game.load.audio('trump3', 'assets/trump3.wav');

        //lose sounds
        game.load.audio('captured','assets/losesounds/captured.wav');
        game.load.audio('china','assets/losesounds/china.wav');
        game.load.audio('hardtime','assets/losesounds/hardtime.wav');
        game.load.audio('stupidpeople','assets/losesounds/stupidpeople.wav');
        game.load.audio('wrong','assets/losesounds/wrong.wav');
        game.load.audio('yourfired','assets/losesounds/yourfired.wav');
        game.load.audio('americandream','assets/losesounds/americandream.wav');
        game.load.audio('notverygood','assets/losesounds/notverygood.wav');
        game.load.audio('payforwall','assets/losesounds/payforwall.wav');


        //start sounds
        game.load.audio('bombthem','assets/startsounds/bombthem.wav');
        game.load.audio('greatwall','assets/startsounds/greatwall.wav');
        game.load.audio('lovemexican','assets/startsounds/lovemexican.wav');
        game.load.audio('trumpx3','assets/startsounds/trumpx3.wav');
        game.load.audio('bingbong','assets/startsounds/bingbong.wav');
        game.load.audio('beatchina','assets/startsounds/beatchina.wav');
        game.load.audio('jobs','assets/startsounds/jobs.wav');
        game.load.audio('suffer','assets/startsounds/suffer.wav');
        game.load.audio('words','assets/startsounds/words.wav');
        game.load.audio('friends','assets/startsounds/friends.wav');
        game.load.audio('greatagain','assets/startsounds/greatagain.wav');

        //triggered sounds
        game.load.audio('reallyrich','assets/reallyrich.wav');
        game.load.audio('muchricher','assets/muchricher.wav');
        game.load.audio("grabem",'assets/grabem.wav');
        game.load.audio("badhombres",'assets/badhombres.wav');

    },


    create: function() {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.

        this.flapSounds = [
            game.add.audio('trump1'),
            game.add.audio('trump2'),
            game.add.audio('trump3')
        ];
        this.loseSounds = [
            game.add.audio('captured'),
            game.add.audio('china'),
            game.add.audio('hardtime'),
            game.add.audio('stupidpeople'),
            game.add.audio('wrong'),
            game.add.audio('yourfired'),
            game.add.audio('americandream'),
            game.add.audio('notverygood'),
            game.add.audio('payforwall')
        ];
        this.startSounds = [
            game.add.audio('bombthem'),
            game.add.audio('greatwall'),
            game.add.audio('lovemexican'),
            game.add.audio('reallyrich'),
            game.add.audio('trumpx3'),
            game.add.audio('bingbong'),
            game.add.audio('beatchina'),
            game.add.audio('jobs'),
            game.add.audio('suffer'),
            game.add.audio('words'),
            game.add.audio('friends'),
            game.add.audio('greatagain')
        ];
        this.dollarCollectSounds = [
            game.add.audio('reallyrich'),
            game.add.audio('muchricher'),
        ]
        this.grabem = game.add.audio('grabem');
        this.badhombres = game.add.audio('badhombres');

        this.lastSoundTimer = game.time.now;
        this.lastSoundLength = 0;
        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //lastHole and nextHole start out in same location as trump
        this.nextHole = Math.floor(Math.random() * 7) + 1;
        this.nextHoleY = this.nextHole*80 + 80;
        this.lastHoleY = 245;

        this.createAssets()
        this.playStart();

        this.collectibleTick = 0;
        this.pipeCount = 0
        this.speedScale = 0.75;
        this.skipNextWall = false;
        showAd('banner')

    },
    playBing: function(){
        if (game.time.now - this.lastSoundTimer > this.lastSoundLength) {
            this.flapSounds[Math.floor(Math.random()*this.flapSounds.length)].play()
            this.trump.animations.play('mouthflap');
            this.lastSoundTimer = game.time.now;
            this.lastSoundLength = trumpSoundLength;
        }
    },
    playLose: function(){
        this.loseSounds[Math.floor(Math.random()*this.loseSounds.length)].play()
        this.trump.animations.play('mouthfull');
        this.lastSoundTimer = game.time.now;
        this.lastSoundLength = loseSoundLength;
    },
    playStart: function(){
        this.startSounds[Math.floor(Math.random()*this.startSounds.length)].play()
        this.trump.animations.play('mouthfull');
        this.lastSoundTimer = game.time.now;
        this.lastSoundLength = startSoundLength;
    },
    createDollar: function(x,y) {
//add variance to y
        //greater variance toward the middle
        var middle = collectibleFrequency / 2;
        var tick =  (this.collectibleTick + 1)
        var modifier = middle - Math.abs(tick-middle)
        var variance = (Math.floor(Math.random() * 200) - 100) * modifier
        var dollar = game.add.sprite(x, y + variance, 'dollar');
        dollar.height = 30;
        dollar.width = 60;
        // Add the pipe to our previously created group
        this.dollars.add(dollar);

        // Enable physics on the pipe
        game.physics.arcade.enable(dollar);

        // Add velocity to the pipe to make it move left
        dollar.body.velocity.x = baseSpeed * this.speedScale;

        // Automatically kill the pipe when it's no longer visible
        dollar.checkWorldBounds = true;
        dollar.outOfBoundsKill = true;
    },
    createSpecialCollectible: function(x,y) {

        if (Math.floor(Math.random() * 2) == 1) {
            var collectible = game.add.sprite(x, y, 'cat');
            collectible.height = 40;
            collectible.width = 60;
            this.cats.add(collectible);

        }
        else {
            var collectible = game.add.sprite(x, y, 'mexican');
            collectible.height = 50;
            collectible.width = 70;
            this.mexicans.add(collectible)
        }



        game.physics.arcade.enable(collectible);

        collectible.body.velocity.x = baseSpeed * this.speedScale;

        collectible.checkWorldBounds = true;
        collectible.outOfBoundsKill = true;
    },
    createCollectible: function() {
        if (!this.skipNextWall) {
            slope = (this.nextHoleY - this.lastHoleY) / (collectibleFrequency)
            y = this.lastHoleY + (slope * (this.collectibleTick + 1))

            if (this.collectibleTick == (collectibleFrequency - 1) && this.pipeCount > 0 && (this.pipeCount % specialCollectibleFrequency == 0)) {
                this.createSpecialCollectible(game.width, y)
            }
            else this.createDollar(game.width, y);
        }
        this.collectibleTick = (this.collectibleTick + 1) % (collectibleFrequency);

    },
    createAssets: function() {
        this.trump = game.add.sprite(100, 245, 'trump');
        this.trump.frame = 1;
        this.trump.animations.add('mouthflap', [1,2, 3,4], 10, false);
        this.hands = game.add.sprite(94,254,'trump-hands');
        this.trump.animations.add('mouthfull', [0,1,2,3,4,5,4,3,2,1,0], 10, false);

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

        // Call the 'jump' function when the `key is hit
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onDown.add(this.jump, this);

        // Create an empty group
        this.pipes = game.add.group();
        this.dollars = game.add.group();
        this.cats = game.add.group();
        this.mexicans = game.add.group();

        this.moneyTimer = game.time.events.loop(collectibleTimer, this.createCollectible, this);
        this.timer = game.time.events.loop(pipeTimer, this.addRowOfPipes, this);


        this.score = 0;
        var style = { font: "bold 30px Arial", fill: "#FFF",
            wordWrap: true, wordWrapWidth: 300,
            boundsAlignH: "center", boundsAlignV: "middle" };
        this.labelScore = game.add.text(210, 20, "TRUMP:     0",
            style);
        this.labelScore.stroke = '#000000';
        this.labelScore.strokeThickness = 6;
        this.labelScore2 = game.add.text(210, 55, "AMERICA: 0",
            style);
        this.labelScore2.stroke = '#000000';
        this.labelScore2.strokeThickness = 6;

        // Move the anchor to the left and downward
        this.trump.anchor.setTo(-0.2, 0.5);
    },
    collectDollar: function(trump, dollar) {
        this.addScore(1);
        dollar.kill()

        if (this.score % 20 == 0){
            this.dollarCollectSounds[Math.floor(Math.random()*this.dollarCollectSounds.length)].play()
            this.trump.animations.play('mouthfull');
            this.lastSoundTimer = game.time.now;
            this.lastSoundLength = startSoundLength;
        }

    },
    incrementSpeedScale: function(){
        if (this.speedScale < maxSpeedScale)
            this.speedScale += 0.25
    },
    collectCat: function(trump, cat) {
        this.addScore(10);
        cat.kill()
        this.grabem.play()
        this.trump.animations.play('mouthfull');
        this.lastSoundTimer = game.time.now;
        this.lastSoundLength = startSoundLength;
        this.incrementSpeedScale();
        this.skipNextWall = true;

    },
    collectMexican: function(trump, mexican) {
        this.addScore(10);
        mexican.kill()
        this.badhombres.play()
        this.trump.animations.play('mouthfull');
        this.lastSoundTimer = game.time.now;
        this.lastSoundLength = startSoundLength;
        this.incrementSpeedScale()
        this.skipNextWall = true;

    },
    update: function() {
        // This function is called 60 times per second
        // It contains the game's logic

        // If the bird is out of the screen (too high or too low)
        // Call the 'restartGame' function
        if (this.trump.y < 0 || this.trump.y > game.height)
            this.gameOver();

        game.physics.arcade.overlap(
            this.trump, this.pipes, this.gameOver, null, this);
        game.physics.arcade.overlap(
            this.trump, this.dollars, this.collectDollar, null, this);
        game.physics.arcade.overlap(
            this.trump, this.cats, this.collectCat, null, this);
        game.physics.arcade.overlap(
            this.trump, this.mexicans, this.collectMexican, null, this);

        this.trump.checkWorldBounds = true;
        this.trump.events.onOutOfBounds.add(this.gameOver, this);

        if (this.trump.angle < 20)
            this.trump.angle += 1;
        if (this.hands.angle < 20)
            this.hands.angle += 1;
    },

    onDeath: function(){
        this.playLose();//@todo play a "win" soundbite if is a high score
        var score = this.score
        checkIsHighScore(this.score).then(function(isHighScore){
                if (isHighScore){
                    globalScore = score;
                    game.state.start('highScore')
                }
                else{
                    this.endBox = game.add.graphics();
                    this.endBox.beginFill(0xFFFFFF, 0.8);
                    this.endBox.lineStyle(10, 0x000000, 0.7);
                    this.endBox.drawRect(100, 200, 300, 400);

                    var style = { font: "bold 20px Arial", fill: "#fff",
                        wordWrap: true, wordWrapWidth: 300,
                        boundsAlignH: "center", boundsAlignV: "middle" };
                    textMain = game.add.text(0, 0, getRandomEndText(), style);
                    textMain.stroke = '#000000';
                    textMain.strokeThickness = 4;
                    textMain.setTextBounds(120, 260, 240, 100);

                    createLeaderboardButton(120,450);

                    var style = { font: "bold 16px Arial", fill: "#111",
                        wordWrap: true, wordWrapWidth: 300,
                        boundsAlignH: "left", boundsAlignV: "middle" };
                    if (game.device.desktop)
                        textSub = game.add.text(0, 0, "PRESS SPACE TO MAKE GAMING GREAT AGAIN", style);
                    else
                        textSub = game.add.text(0, 0, "TAP TO MAKE GAMING GREAT AGAIN", style);
                    textSub.setTextBounds(120, 500, 240, 100);
                    deathTimer = game.time.events.add(Phaser.Timer.SECOND * 1, function(){canRestart=true}, this);
                }
            },
            function(err){
                console.log(err)
                game.state.start('start')
            }
        )

        deathCount = deathCount + 1;
        if (deathCount >= deathMax) {
            showAd('interstitial')
        }
    },
    // Make the bird jump
    jump: function() {
        if (this.trump.alive == false) {
            if (canRestart == true) {

                this.restartGame();
                if (deathCount >= deathMax){
                    deathCount = 0;
                    // window.location.reload(false);
                }
            }
            return;
        }
        this.playBing();

        // Add a vertical velocity to the bird
        this.trump.body.velocity.y = -350;
        this.hands.body.velocity.y = -350;

        game.add.tween(this.trump).to({angle: -20}, 100).start();
        game.add.tween(this.hands).to({angle: -20}, 100).start();
    },

    addScore: function(amount) {
        this.score += amount;
        this.labelScore.text = "TRUMP:      "+this.score;
        this.labelScore2.text = "AMERICA: -"+this.score;
    },

// Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        this.trump.game.state.start('main');
        // this.createAssets();
        canRestart=false;
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
        game.time.events.remove(this.moneyTimer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
        this.dollars.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
        this.cats.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
        this.mexicans.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);

        this.onDeath();



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
        pipe.body.velocity.x = baseSpeed * this.speedScale;

        // Automatically kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        if (this.trump.alive == false)
            return
        // This will be the hole position
        var hole = this.nextHole;
        this.lastHoleY =  hole * 80 + 80
        this.nextHole = Math.floor(Math.random() * 7) + 1;
        this.nextHoleY = this.nextHole * 80 + 80 ;

        // Add the 6 pipes
        // With one big hole at position 'hole' and 'hole + 1'
        if (!this.skipNextWall) {
            for (var i = 0; i < 12; i++)
                if (this.pipeCount > 10) {
                    if (i != hole && i != hole + 1)
                        this.addOnePipe(game.width, i * 80);
                }
                else {
                    if (i != hole && i != hole + 1 && i != hole - 1)
                        this.addOnePipe(game.width, i * 80);
                }
        }
        else{
            this.skipNextWall = false;
        }
        this.pipeCount++;
    },
};
var game = new Phaser.Game(500, 888,Phaser.Canvas, 'game-container');
Phaser.Device.whenReady(function () {
    game.plugins.add(PhaserAds.AdManager);
    game.add.plugin(PhaserInput.Plugin);

    loadAds();
});

loadAds = function() {
    game.ads.setAdProvider(new PhaserAds.AdProvider.CocoonAds(
        game,"AdMob",{
            ios: {
                banner:"ca-app-pub-7470857622953690/8475550164",
                interstitial:"ca-app-pub-7470857622953690/3264901768",
            },
            // android: {
            //     banner:"ca-app-pub-7686972479101507/4443703872",
            //     interstitial:"ca-app-pub-7686972479101507/4443703872"
            // }
        }

    ));
    //Content paused event is fired when the content (game) should be paused, and the ad will be played
    game.ads.onContentPaused.add(function () {
        game.paused=true;
        console.log('Started playing add');
    });

    //This is fired when the ad is finished playing and the content (game) should be resumed
    game.ads.onContentResumed.add(function () {
        game.paused=false;
        console.log('Finished playing add');
    });
}

var showAd = function(type){
    var adsEnabled = game.ads.provider.adsEnabled;
    if (adsEnabled && !game.device.desktop) {
        //This is how we request an ad for desktop
        game.ads.showAd(type);
    }
}

// Add the 'mainState' and call it 'main'
game.state.add('start',startState);
game.state.add('leaderboard',leaderboard);
game.state.add('highScore',highScore);
game.state.add('main', mainState);
// Start the state to actually start the game
game.state.start('start');

