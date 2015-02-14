(function() {
    'use strict';

    // Global Dependencies
    let Howl = window.Howl;
    let ENGINE = window.ENGINE;
    const GAME_STATE = {
        START: 'START',
        PLAY: 'PLAY',
        PAUSE: 'PAUSE',
        OVER: 'OVER'
    };

    // Game Globals
    let gameScore = 0;
    let gameLives = 3;
    let canvas = document.getElementById('GameCanvas');
    let ctx = canvas.getContext('2d');
    let gameState = GAME_STATE.START;

    const CANVAS_WIDTH = 720;
    const CANVAS_HEIGHT = 480;

    //region Game Objects
    class Ship {
        constructor(properties) {
            this.lasers = properties.lasers;

            this.settings = {
                color: 'rgba(0, 0, 0, 1)',
                posX: 25,
                posY: 350,
                height: 25,
                width: 25,
                speed: 4
            };

            this.img = new Image();
            this.img.src = 'App/Content/Images/spaceship.png';
        }

        draw(context) {
            context.drawImage(this.img, this.settings.posX, this.settings.posY);
            this.lasers.draw(context);

            //this.img.onload = function() {
            //    context.drawImage(this.img, this.settings.posX, this.settings.posY);
            //}.bind(this);
        }

        update() {
            this.lasers.update();
        }

        fire() {
            this.lasers.fire(this.settings.posX + 23, this.settings.posY - 5);
        }

        moveLeft() {
            if (this.settings.posX > 0) {
                this.settings.posX = this.settings.posX - this.settings.speed;
            }
        }

        moveRight() {
            if (this.settings.posX + this.settings.width < CANVAS_WIDTH + 70) {
                this.settings.posX = this.settings.posX + this.settings.speed;
            }
        }

        moveUp() {
            if (this.settings.posY > 0) {
                this.settings.posY = this.settings.posY - this.settings.speed;
            }
        }

        moveDown() {
            if (this.settings.posY < CANVAS_HEIGHT - 40) {
                this.settings.posY = this.settings.posY + this.settings.speed;
            }
        }
    }

    class Laser {
        constructor (originX, originY) {
            this.settings = {
                posX: originX,
                posY: originY,
                width: 4.5,
                height: 25
            };
        }

        draw(context) {
            context.beginPath();
            context.fillStyle = ENGINE.util.getRandomColor();
            context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            context.fill();
            context.closePath();
        }

        update() {
            this.settings.posY -= 5.05;
        }

        playSound() {
            let sound = new Howl({
                urls: ['App/Content/Audio/laser.mp3']
            });

            //sound.play();
        }
    }

    class Asteroid {
        constructor() {
            let range = ENGINE.util.getRandomNumber(30, 100);

            this.settings = {
                width: range,
                height: range,
                speed: ENGINE.util.getRandomNumber(2, 6)
            };

            this.settings.posX = ENGINE.util.getRandomNumber(0 - this.settings.height, CANVAS_WIDTH);
            this.settings.posY = this.settings.height * -2;

            this.img = new Image();
            this.img.src = 'App/Content/Images/asteroid-' + ENGINE.util.getRandomNumber(1, 4) + '.png';
        }

        draw(context) {
            context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);

            //this.img.onload = function() {
            //    ctx.drawImage(this.img, this.settings.posX, this.settings.posY);
            //}.bind(this);
        }

        update() {
            this.settings.posY += this.settings.speed;
        }
    }

    class LaserCollection {
        constructor() {
            this.maxLasers = 10;
            this.list = [];
        }

        update() {
            let updateLaser = function(laser, index) {
                this.list[index].update();
            }.bind(this);

            let checkLaserBounds = function(laser, index) {
                if (this.list[index].settings.posY < -5) {
                    this.list.shift(); // If laser outside of top bounds remove from array
                }
            }.bind(this);

            this.list.forEach(checkLaserBounds);
            this.list.forEach(updateLaser);
        }

        draw(context) {
            let draw = function(laser) {
                laser.draw(context);
            };

            this.list.forEach(draw);
        }

        fire(posX, posY) {
            if (this.list.length < this.maxLasers) {
                let laser = new Laser(posX, posY);
                laser.playSound();
                this.list.push(laser);
            }
        }
    }

    class AsteroidCollection {
        constructor() {
            this.list = [];

            setInterval(function() {
                if (gameState === GAME_STATE.PLAY) {
                    let asteroid = new Asteroid();
                    this.list.push(asteroid);
                }
            }.bind(this), 140 - (CANVAS_WIDTH / 100));
        }

        update() {
            let checkAsteroidBounds = function(asteroid, index) {
                if (asteroid.settings.posY > CANVAS_HEIGHT + 30) {
                    this.list.splice(index, 1);
                }
            }.bind(this);

            let update = function(asteroid) {
                asteroid.update();
            };

            this.list.forEach(checkAsteroidBounds);
            this.list.forEach(update);
        }

        draw(context) {
            let draw = function(asteroid) {
                asteroid.draw(context);
            };

            this.list.forEach(draw);
        }
    }

    class Game {
        constructor(properties) {
            this._update = properties.update;
            this._draw = properties.draw;
        }

        update() {
            this._update();
        }

        draw() {
            this._draw();
        }

        start() {
            var gameLoop = function() {
                this._update();
                this._draw();
                requestAnimationFrame(gameLoop);
            }.bind(this);

            requestAnimationFrame(gameLoop);
        }
    }
    //endregion

    //region Game
    let playerShip = new Ship({
        lasers: new LaserCollection()
    });

    let asteroids = new AsteroidCollection();

    let checkShipAndAsteroidCollision = function() {
        asteroids.list.forEach(_checkShipCollision);

        function _checkShipCollision(asteroid, index) {
            if (ENGINE.util.checkCollision(playerShip, asteroid)) {
                asteroids.list.splice(index, 1);
                removeLife();
            }
        }
    };

    let checkShipLaserAndAsteroidCollision = function() {

        let checkLaserCollision = function(laser, laserIndex) {
            // For every asteroid
            for (let i = 0; i < asteroids.list.length; i++) {
                if (ENGINE.util.checkCollision(laser, asteroids.list[i])) {
                    playerShip.lasers.list.splice(laserIndex, 1);
                    asteroids.list.splice(i, 1);
                    addScore();
                    return 0;
                }
            }
        };

        playerShip.lasers.list.forEach(checkLaserCollision);
    };

    let update = function() {
        if (gameState === GAME_STATE.START) {
            return;
        }

        if (gameState === GAME_STATE.PLAY) {
            asteroids.update();
            playerShip.update();
            checkShipAndAsteroidCollision();
            checkShipLaserAndAsteroidCollision();
        }

        if (gameState === GAME_STATE.PAUSE) {
            return;
        }

        if (gameState === GAME_STATE.OVER) {
            return;
        }
    };

    let draw = function() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawScore();
        drawLives();

        if (gameState === GAME_STATE.START) {
            drawStartScreen();
        }

        if (gameState === GAME_STATE.PLAY) {
            playerShip.draw(ctx);
            asteroids.draw(ctx);
        }

        if (gameState === GAME_STATE.PAUSE) {
            return;
        }

        if (gameState === GAME_STATE.OVER) {
            endGame();
        }
    };

    let game = new Game({
        update: update,
        draw: draw
    });

    game.start();
    //endregion

    //region Game Controls
    ENGINE.controls.on('left', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveLeft();
        }
    });

    ENGINE.controls.on('right', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveRight();
        }
    });

    ENGINE.controls.on('up', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveUp();
        }
    });

    ENGINE.controls.on('down', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveDown();
        }
    });

    ENGINE.controls.onkey('space', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.fire();
        }
    });

    ENGINE.controls.onkey('pause', function() {
        pauseGame();
    });

    ENGINE.controls.onkey('enter', function() {
        if (gameState === GAME_STATE.START || gameState === GAME_STATE.OVER) {
            startNewGame();
        }
    });
    //endregion

    //region Helper Functions
    function drawStartScreen() {
        $('.js-start-screen').show();
    }

    function hideStartScreen() {
        $('.js-start-screen').hide();
    }

    function startNewGame() {
        gameLives = 3;
        gameState = GAME_STATE.PLAY;
        gameScore = 0;
        hideStartScreen();
        $('.js-game-over-screen').hide();
    }

    function pauseGame() {
        drawPauseScreen();

        if (gameState === GAME_STATE.PLAY) {
            gameState = GAME_STATE.PAUSE;
        } else {
            gameState = GAME_STATE.PLAY;
        }
    }

    function drawPauseScreen() {
        $('.js-pause-screen').toggle();
    }

    function endGame() {
        $('.js-game-over-screen').show();
    }

    function addScore() {
        gameScore += 1;
    }

    function drawScore() {
        $('.js-score').html('Score:' + gameScore);
    }

    function removeLife() {
        if (gameLives > 0) {
            gameLives -= 1;
        } else {
            gameState = GAME_STATE.OVER;
        }
    }

    function drawLives() {
        $('.js-lives').html('Lives:' + gameLives);
    }
    //endregion
}());