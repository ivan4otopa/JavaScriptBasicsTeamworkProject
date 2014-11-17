var context;
var queue;
var WIDTH = 1024;
var HEIGHT = 768;
/*var mouseXPosition;
var mouseYPosition;
var batImage;*/
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var enemyXPos=200;
var enemyYPos=100;
var enemyXSpeed = 1.5;
var enemyYSpeed = 1.5;
var score = 0;
var scoreText;
var gameOverText;
var gameTimer;
var gameTime = 0;
var timerText;
var firstShot = 0;

window.onload = function()
{

    gameOverText = new createjs.Text("GAME OVER", "80px Arial", "#F00");
    gameOverText.x = 270;
    gameOverText.y = 300;
    /*
     *      Set up the Canvas with Size and height
     *
     */
    var canvas = document.getElementById('myCanvas');
    context = canvas.getContext('2d');
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    /*
     *      Set up the Asset Queue and load sounds
     *
     */
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    /*
     *      Create a load manifest for all resources
     *
     */
    queue.loadManifest([
        {id: 'backgroundImage', src: 'images/background2.jpg'},
        {id: 'crossHair', src: 'images/crosshair2.png'},
        {id: 'shot', src: 'sounds/shot.mp3'},
        {id: 'background', src: 'sounds/beatle.mp3'},
        {id: 'gameOverSound', src: 'sounds/gameOver.mp3'},
        {id: 'deathSound', src: 'sounds/die.mp3'},
        {id: 'flySpritesheet', src: 'images/flySpritesheet.png'},
        {id: 'flySpriteSheet2', src: 'images/flySpriteSheet2.png'},
        {id: 'batDeath', src: 'images/batDeath.png'}
    ]);
    queue.load();

    /*
     *      Create a timer that updates once per second
     *
     */
    gameTimer = setInterval(updateTime, 1000);

};

function queueLoaded()
{
    // Add background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
    stage.addChild(backgroundImage);

    //Add Score
    scoreText = new createjs.Text("Score: " + score.toString(), "36px Arial", "#FFF");
    scoreText.x = 820;
    scoreText.y = 10;
    stage.addChild(scoreText);

    //Ad Timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "20px Arial", "#FFF");
    timerText.x = 10;
    timerText.y = 10;
    stage.addChild(timerText);

    // Play background sound
    createjs.Sound.play("background", {loop: -1});

    // Create bat spritesheet
    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('flySpritesheet')],
        "frames": {"width": 123, "height": 100},
        "animations": { "flap": [0,9] }
    });

    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('flySpritesheet2')],
        "frames": {"width": 123, "height": 100},
        "animations": { "flap": [0,9] }
    });

    // Create bat death spritesheet
        batDeathSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('batDeath')],
        "frames": {"width": 198, "height" : 148},
        "animations": {"die": [0,5, false, 1] }
    });

    // Create bat sprite
    createEnemy1();
    createEnemy2();

    // Create crosshair
    crossHair = new createjs.Bitmap(queue.getResult("crossHair"));
    stage.addChild(crossHair);

    // Add ticker
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', stage);
    createjs.Ticker.addEventListener('tick', tickEvent);

    // Set up events AFTER the game is loaded
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
}

function createEnemy1()
{
    animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 55;
    animation.regY = 60;
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function createEnemy2()
{
    animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 500;
    animation.regY = 350;
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
}

function batDeath()
{
    deathAnimation = new createjs.Sprite(batDeathSpriteSheet, "die");
  deathAnimation.regX = 99;
  deathAnimation.regY = 58;
  deathAnimation.x = enemyXPos;
  deathAnimation.y = enemyYPos;
  deathAnimation.gotoAndPlay("die");
  stage.addChild(deathAnimation);
}

function tickEvent()
{
    //Make sure enemy bat is within game boundaries and move enemy Bat
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
    //Offset the position by 45 pixels so mouse is in center of crosshair
    crossHair.x = event.clientX-45;
    crossHair.y = event.clientY-45;
}

function handleMouseDown(event)
{
    //First Shot won't count if missed
    firstShot = firstShot+1;
    
   //Play Gunshot sound
    createjs.Sound.play("shot");

    //Increase speed of enemy slightly
    enemyXSpeed += 1.4;
    enemyYSpeed += 1.5;

    //Obtain Shot position
    var shotX = Math.round(event.clientX);
    var shotY = Math.round(event.clientY);
    var spriteX = Math.round(animation.x);
    var spriteY = Math.round(animation.y);

    // Compute the X and Y distance using absolute value
    var distX = Math.abs(shotX - spriteX);
    var distY = Math.abs(shotY - spriteY);

    // Anywhere in the body or head is a hit - but not the wings
    if(distX < 60 && distY < 60 )
    {
        //Hit
        stage.removeChild(animation);
        batDeath();
        score += 10;
        scoreText.text = "Score: " + score.toString();
        createjs.Sound.play("deathSound");
        
        //Make it harder next time
        enemyYSpeed += 1.5;
        enemyXSpeed += 1.5;

        //Create new enemy
        var timeToCreate = Math.floor((Math.random()*3000)+100);
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
            var si =createjs.Sound.play("gameOverSound");
            clearInterval(gameTimer);
            createjs.Sound.stop();
        }

    }
}

function updateTime()
{
    gameTime += 1;
    if(gameTime = 120)
    {
        //End Game and Clean up
        gameOverText.x = 140;
        gameOverText.text = "Time's up, score: " + score;
        stage.addChild(gameOverText);
        timerText.text = "GAME OVER";
        stage.removeChild(animation);
        stage.removeChild(crossHair);
        var si =createjs.Sound.play("gameOverSound");
        clearInterval(gameTimer);
        createjs.Sound.stop();
    } else {
        timerText.text = "Time: " + gameTime
    }
}
