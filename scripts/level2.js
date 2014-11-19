var context;
var queue;
var WIDTH = 1024;
var HEIGHT = 768;
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var enemyXPos=200;
var enemyYPos=100;
var enemyXSpeed = 10;
var enemyYSpeed = 10;
var score = 0;
var scoreText;
var gameOverText;
var gameTimer;
var gameTime = 0;
var timerText;
var firstShot = 0;

window.onload = function() {
    gameOverText = new createjs.Text("GAME OVER", "80px Arial", "#F00");
    gameOverText.x = 270;
    gameOverText.y = 300;

    //prepare canvas
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    //load sounds
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    //load all resources
    queue.loadManifest([
        {id: 'backgroundImage', src: 'images/background2.jpg'},
        {id: 'crossHair', src: 'images/crosshair2.png'},
        {id: 'shot', src: 'sounds/shot.mp3'},
        {id: 'background', src: 'sounds/beatle.mp3'},
        {id: 'gameOverSound', src: 'sounds/gameOver.mp3'},
        {id: 'deathSound', src: 'sounds/die.mp3'},
        {id: 'flySpritesheet', src: 'images/dragonfly.png'},
        {id: 'flyDeath', src: 'images/flyDeath.png'}
    ]);
    queue.load();


    //update-timer - updates events every second
    gameTimer = setInterval(updateTime, 1000);

};

function queueLoaded() {
    //add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
    stage.addChild(backgroundImage);

    //add score
    scoreText = new createjs.Text("Score: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 820;
    scoreText.y = 10;
    stage.addChild(scoreText);

    //ad timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "20px Arial", "#FFF");
    timerText.x = 10;
    timerText.y = 10;
    stage.addChild(timerText);

    //play background sound
    createjs.Sound.play("background", {loop: -1});

    //create fly spritesheet
    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('flySpritesheet')],
        "frames": {"width": 129, "height": 95},
        "animations": { "flap": [0,7] }
    });

    // Create fly death spritesheet
    flyDeathSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('flyDeath')],
        "frames": {"width": 198, "height" : 148},
        "animations": {"die": [0,5, false, 1] }
    });

    //create fly sprite
    createEnemy();

    //create crosshair
    crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    stage.addChild(crossHair);

    //add ticker at 30 fps
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    //set up events after everything has loaded
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
}

function createEnemy()
{
    animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 55;
    animation.regY = 60;
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function flyDeath()
{
    deathAnimation = new createjs.Sprite(flyDeathSpriteSheet, "die");
    deathAnimation.regX = 99;
    deathAnimation.regY = 58;
    deathAnimation.x = enemyXPos;
    deathAnimation.y = enemyYPos;
    deathAnimation.gotoAndPlay("die");
    stage.addChild(deathAnimation);
}

function tickEvent()
{
    //keep enemy in playfield and move it
    if(enemyXPos < WIDTH && enemyXPos > 0)
    {
        enemyXPos += enemyXSpeed;
    } else
    {
        enemyXSpeed = enemyXSpeed * (-1);
        enemyXPos += enemyXSpeed;
    }
    if(enemyYPos < HEIGHT && enemyYPos > 0)
    {
        enemyYPos += enemyYSpeed;
    } else
    {
        enemyYSpeed = enemyYSpeed * (-1);
        enemyYPos += enemyYSpeed;
    }

    animation.x = enemyXPos;
    animation.y = enemyYPos;
}


function handleMouseMove(event)
{
    //mouse pointer offset to the middle of the crosshair image
    crossHair.x = event.clientX-45;
    crossHair.y = event.clientY-45;
}

function handleMouseDown(event)
{
    //First Shot won't count if missed
    firstShot = firstShot+1;
	
	if ((gameTime > 60 && score < 50 || score < 0) || (gameTime > 60 && score > 50)) {
	}else{
		//Play Gunshot sound
		createjs.Sound.play("shot");

		//Increase speed of enemy slightly
		enemyXSpeed += 2;
		enemyYSpeed += 2;

		//Obtain Shot position
		var shotX = Math.round(event.clientX);
		var shotY = Math.round(event.clientY);
		var spriteX = Math.round(animation.x);
		var spriteY = Math.round(animation.y);

		// Compute the X and Y distance using absolute value
		var distX = Math.abs(shotX - spriteX);
		var distY = Math.abs(shotY - spriteY);

		//calculating a hit or a miss
		if(distX < 60 && distY < 60 )
		{
			//Hit
			stage.removeChild(animation);
			flyDeath();
			score += 10;
			scoreText.text = "Score: " + score.toString();
			createjs.Sound.play("deathSound");

			//increase speed for new enemy respawn
			enemyYSpeed += 2;
			enemyXSpeed += 2;

			//Create new enemy
			var timeToCreate = Math.floor((Math.random()*3000)+1000);
			setTimeout(createEnemy, timeToCreate);

		} else {
			//Miss
			score -= 5;
			if (firstShot == 1 ) {
				score = 0;
			}
			scoreText.text = "Score: " + score.toString();
			if (score < 0 && firstShot > 1 ) {
				timerText.text = "GAME OVER";
				stage.addChild(gameOverText);
				stage.removeChild(animation);
				stage.removeChild(crossHair);
				clearInterval(gameTimer);
				createjs.Sound.stop();
				var si =createjs.Sound.play("gameOverSound");
			}
	}
    }
}

function updateTime()
{
    gameTime += 1;
    if(gameTime > 60 && score < 50)
    {  //End Game and Clear field
        gameOverText.x = 140;
        gameOverText.text = "Time's up, score: " + score;
        stage.addChild(gameOverText);
        timerText.text = "GAME OVER";
        stage.removeChild(animation);
        stage.removeChild(crossHair);
        clearInterval(gameTimer);
        createjs.Sound.stop();
        var si =createjs.Sound.play("gameOverSound");
    }else if(gameTime > 60 && score > 50)
    {
        //beat game
        gameOverText.x = 140;
        gameOverText.text = "YOU WON! Score: " + score;
        stage.addChild(gameOverText);
        timerText.text = "GAME OVER";
        stage.removeChild(animation);
        stage.removeChild(crossHair);
        clearInterval(gameTimer);
        createjs.Sound.stop();
    } else {
        timerText.text = "Time: " + gameTime
    }
}
