(function() {
    'use strict';

    // Game CONSTS
    var CANVAS_WIDTH = 720;
    var CANVAS_HEIGHT = 480;
    var SHIP_SPEED = 4;
    var GAME_SCORE = 0;
    var LIVES = 3;
    var canvas = document.getElementById('GameCanvas');
    var ctx = canvas.getContext('2d');

    var gameStateEnum = Object.freeze({
        START: 'START',
        PLAY: 'PLAY',
        PAUSE: 'PAUSE',
        OVER: 'OVER'
    });

    var gameState = gameStateEnum.START;

    $('#GameCanvas').attr('width', CANVAS_WIDTH).attr('height', CANVAS_HEIGHT);

    //#region Main (Game loop)
    function gameLoop() {
        game.draw();
        game.update();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
    //#endregion

    // Game Object Creation
    var playerShip = new Ship();
    var lasers = new LaserCollection();
    var asteroids = new AsteroidCollection();

    var game = (function() {
        return {
            init: function() {
                this.bindUIActions();
            },

            draw: function() {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                drawScore();
                drawLives();

                if (gameState === gameStateEnum.START) {
                    drawStartScreen();
                }

                if (gameState === gameStateEnum.PLAY) {
                    playerShip.draw();
                    lasers.draw();
                    asteroids.draw();
                }

                if (gameState === gameStateEnum.PAUSE) {
                    return;
                }

                if (gameState === gameStateEnum.OVER) {
                    endGame();
                }
            },

            update: function() {
                ENGINE.update();

                if (gameState === gameStateEnum.START) {
                    return;
                }

                if (gameState === gameStateEnum.PLAY) {
                    lasers.update();
                    asteroids.update();
                    playerShip.update();
                }

                if (gameState === gameStateEnum.PAUSE) {
                    return;
                }

                if (gameState === gameStateEnum.OVER) {
                    return;
                }
            }
        };
    }());

    ENGINE.controls.on('left', function() {
        if (gameState === gameStateEnum.PLAY) {
            playerShip.moveLeft();
        }
    });

    ENGINE.controls.on('right', function() {
        if (gameState === gameStateEnum.PLAY) {
            playerShip.moveRight();
        }
    });

    ENGINE.controls.on('up', function() {
        if (gameState === gameStateEnum.PLAY) {
            playerShip.moveUp();
        }
    });

    ENGINE.controls.on('down', function() {
        if (gameState === gameStateEnum.PLAY) {
            playerShip.moveDown();
        }
    });

    ENGINE.controls.onkey('space', function() {
        if (gameState === gameStateEnum.PLAY) {
            lasers.fire();
        }
    });

    ENGINE.controls.onkey('pause', function() {
        pauseGame();
    });

    ENGINE.controls.onkey('enter', function() {
        if (gameState === gameStateEnum.START || gameState === gameStateEnum.OVER) {
            startNewGame();
        }
    });

    //#region Game Objects
    //#region Ship
    function Ship() {
        this.settings = {
            color: 'rgba(0, 0, 0, 1)',
            posX: 25,
            posY: 350,
            height: 25,
            width: 25,
        };

        this.img = new Image();
        this.img.src = 'App/Content/Images/spaceship.png';
        this.img.onload = function() {
            ctx.drawImage(this.img, this.settings.posX, this.settings.posY);
        }.bind(this);
    }

    // Causes undefined on proto?
    //Ship.prototype = ENGINE.factory.createGameObject();

    //Ship.prototype.constructor = ENGINE.factory.createGameObject();

    Ship.prototype.draw = function() {
        ctx.drawImage(this.img, this.settings.posX, this.settings.posY);
    };

    Ship.prototype.update = function() {
        var checkShipCollision = function() {
            // For every asteroid
            for (var j = 0; j < asteroids.asteroidList.length; j++) {
                if (ENGINE.util.checkCollision(this, asteroids.asteroidList[j])) {
                    asteroids.asteroidList.splice(j, 1);
                    removeLife();
                    console.log('Ship Hit!');
                    return 0;
                }
            }
        }.bind(this);

        checkShipCollision();
    };

    Ship.prototype.moveLeft = function() {
        if (this.settings.posX > 0) {
            this.settings.posX = this.settings.posX - SHIP_SPEED;
        }
    };

    Ship.prototype.moveRight = function() {
        if (this.settings.posX + this.settings.width < CANVAS_WIDTH + 70) {
            this.settings.posX = this.settings.posX + SHIP_SPEED;
        }
    };

    Ship.prototype.moveUp = function() {
        if (this.settings.posY > 0) {
            this.settings.posY = this.settings.posY - SHIP_SPEED;
        }
    };

    Ship.prototype.moveDown = function() {
        if (this.settings.posY < CANVAS_HEIGHT - 40) {
            this.settings.posY = this.settings.posY + SHIP_SPEED;
        }
    };
    // #endregion

    //#region Laser
    function Laser(orginFireX, orginFireY) {
        this.settings = {
            posX: orginFireX + 15,
            posY: orginFireY - 5,
            width: 4.5,
            height: 25
        };
    }

    Laser.prototype = ENGINE.factory.createGameObject();

    Laser.prototype.constructor = ENGINE.factory.createGameObject();

    Laser.prototype.draw = function() {
        ctx.beginPath();
        ctx.fillStyle = ENGINE.util.getRandomColor();
        ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
    };

    Laser.prototype.update = function() {
        this.settings.posY -= 5.05;
    };
    //#endregion

    //#region Asteroid
    function Asteroid() {
        var range = ENGINE.util.getRandomNumber(30, 100);

        this.settings = {
            width: range,
            height: range,
            posX: ENGINE.util.getRandomNumber(0 - this.settings.height, CANVAS_WIDTH),
            posY: (this.settings.height * -2),
            speed: ENGINE.util.getRandomNumber(2, 6),
            color: GetRandomAsteroidColor()
        };

        function GetRandomAsteroidColor() {
            var color = '';
            switch (ENGINE.util.getRandomNumber(0, 2)) {
                case 1:
                    color = '#755D41';
                    break;
                case 2:
                    color = '#735B40';
                    break;
                default:
                    color = '#967754';
                    break;
            }

            return color;
        }
    }

    Asteroid.prototype = ENGINE.factory.createGameObject();

    Asteroid.prototype.constructor = ENGINE.factory.createGameObject();

    Asteroid.prototype.draw = function() {
        ctx.beginPath();
        ctx.rect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
        //ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
        ctx.fillStyle = this.settings.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3d3d3d';
        ctx.stroke();
        ctx.closePath();
    };

    Asteroid.prototype.update = function() {
        this.settings.posY += this.settings.speed;
    };
    //#endregion

    //#region LaserCollection
    function LaserCollection() {
        this.maxLasers = 10;
        this.laserList = [];
    }

    LaserCollection.prototype.update = function() {

        var checkLaserBounds = function() {
            for (var i = 0; i < this.laserList.length; i++) {
                if (this.laserList[i].settings.posY < -5) {
                    this.laserList.shift(); // If laser outside of top bounds remove from array
                }
            }
        }.bind(this);

        var checkLaserCollision = function() {
            // For every laser and asteroid
            for (var i = 0; i < this.laserList.length; i++) {
                for (var j = 0; j < asteroids.asteroidList.length; j++) {
                    if (ENGINE.util.checkCollision(this.laserList[i], asteroids.asteroidList[j])) {
                        asteroids.asteroidList.splice(j, 1);
                        this.laserList.splice(i, 1);
                        addScore();
                        console.log('Asteroid Hit!');
                        return 0;
                    }
                }
            }
        }.bind(this);

        checkLaserBounds();
        checkLaserCollision();

        for (var i = 0; i < this.laserList.length; i++) {
            this.laserList[i].update();
        }
    };

    LaserCollection.prototype.draw = function() {
        for (var i = 0; i < this.laserList.length; i++) {
            this.laserList[i].draw();
        }
    };

    LaserCollection.prototype.fire = function() {
        if (this.laserList.length < this.maxLasers) {
            var orginFireX = playerShip.settings.posX;
            var orginFireY = playerShip.settings.posY;
            var laser = new Laser(orginFireX, orginFireY);
            this.laserList.push(laser);
        }
    };
    //#endregion

    //#region AsteroidCollection
    function AsteroidCollection() {
        this.asteroidList = [];

        setInterval(function() {
            if (gameState === gameStateEnum.PLAY) {
                var asteroid = new Asteroid();
                this.asteroidList.push(asteroid);
            }
        }.bind(this), 140 - (CANVAS_WIDTH / 100));
    }

    AsteroidCollection.prototype.constructor = AsteroidCollection;

    AsteroidCollection.prototype.update = function() {
        var checkAsteroidBounds = function() {
            for (var i = 0; i < this.asteroidList.length; i++) {
                if (this.asteroidList[i].settings.posY > CANVAS_HEIGHT + 30) {
                    this.asteroidList.splice(i, 1);
                }
            }
        }.bind(this);

        checkAsteroidBounds();

        for (var i = 0; i < this.asteroidList.length; i++) {
            this.asteroidList[i].update();
        }
    };

    AsteroidCollection.prototype.draw = function() {
        for (var i = 0; i < this.asteroidList.length; i++) {
            this.asteroidList[i].draw();
        }
    };
    // #endregion
    // #endregion

    //#region Helper Functions
    function drawStartScreen() {
        $('#StartScreen').show();
    }

    function hideStartScreen() {
        $('#StartScreen').hide();
    }

    function startNewGame() {
        LIVES = 3;
        gameState = gameStateEnum.PLAY;
        GAME_SCORE = 0;
        hideStartScreen();
        $('#GameOver').hide();
    }

    function pauseGame() {
        drawPauseScreen();
        if (gameState === gameStateEnum.PLAY) {
            gameState = gameStateEnum.PAUSE;
        } else {
            gameState = gameStateEnum.PLAY;
        }
    }

    function drawPauseScreen() {
        $('#Paused').toggle();
    }

    function endGame() {
        $('#GameOver').show();
    }

    function addScore() {
        GAME_SCORE += 1;
    }

    function drawScore() {
        $('#Score').html('Score:' + GAME_SCORE);
    }

    function removeLife() {
        if (LIVES > 0) {
            LIVES -= 1;
        } else {
            gameState = gameStateEnum.OVER;
        }
    }

    function drawLives() {
        $('#Lives').html('Lives:' + LIVES);
    }
    //#endregion
}());
