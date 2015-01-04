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
        Game.draw();
        Game.update();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
    //#endregion

    var Game = (function() {
        return {
            init: function() {
                this.bindUIActions();
            },

            draw: function() {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                drawScore();
                drawLives();

                // Game Start
                if (gameState === gameStateEnum.START) {
                    drawStartScreen();
                }

                // Game Play
                if (gameState === gameStateEnum.PLAY) {
                    ship.draw();
                    lasers.draw();
                    asteroids.draw();
                }

                // Game Pause
                if (gameState === gameStateEnum.PAUSE) {
                    return;
                }

                // Game Over
                if (gameState === gameStateEnum.OVER) {
                    endGame();
                }
            },

            update: function() {
                //CheckGameIO();

                ENGINE.update();

                // Game Start
                if (gameState === gameStateEnum.START) {
                    return;
                }

                // Game Play
                if (gameState === gameStateEnum.PLAY) {
                    lasers.update();
                    asteroids.update();
                    ship.update();
                }

                // Game Pause
                if (gameState === gameStateEnum.PAUSE) {
                    return;
                }

                // Game Over
                if (gameState === gameStateEnum.OVER) {
                    return;
                }
            }
        };
    }());

    // Game Object Creation
    var ship = new Ship();
    ship.settings.color = 'rgba(0, 0, 0, 1)';
    ship.settings.posY = 350;
    ship.settings.height = 25;
    ship.settings.width = 25;

    var lasers = new LaserCollection();
    var asteroids = new Asteroids();

    ENGINE.controls.on('left', function() {
        ship.moveLeft();
    });

    ENGINE.controls.on('right', function() {
        ship.moveRight();
    });

    ENGINE.controls.on('up', function() {
        ship.moveUp();
    });

    ENGINE.controls.on('down', function() {
        ship.moveDown();
    });

    ENGINE.controls.onkey('space', function() {
        lasers.fire();
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
    //#region Laser
    function Laser(orginFireX, orginFireY) {
        this.settings = {
            posX: orginFireX + 15,
            posY: orginFireY - 5,
            width: 4.5,
            height: 25
        }
    }

    Laser.prototype = ENGINE.factory.createGameObject();
    Laser.prototype.constructor = ENGINE.factory.createGameObject();

    Laser.prototype.draw = function() {
        ctx.beginPath();
        ctx.fillStyle = getRandColor();
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
        var range = getRandNum(30, 100);

        this.settings = {
            width: range,
            height: range,
            posX: getRandNum(0 - this.settings.height, CANVAS_WIDTH),
            posY: (this.settings.height * -2),
            speed: getRandNum(2, 6),
            color: GetRandomAsteroidColor()
        }

        function GetRandomAsteroidColor() {
            var color = '';
            switch (getRandNum(0, 2)) {
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
        var lasers = {};
        var maxLasers = 10;
        var laserList = [];

        function checkLaserBounds() {
            for (var i = 0; i < laserList.length; i++) {
                if (laserList[i].settings.posY < -5) {
                    laserList.shift(); // If laser outside of top bounds remove from array
                }
            }
        }

        function checkLaserCollision() {
            // For every laser and asteroid
            for (var i = 0; i < laserList.length; i++) {
                for (var j = 0; j < asteroids.asteroidArray.length; j++) {
                    if (ENGINE.util.checkCollision(laserList[i], asteroids.asteroidArray[j])) {
                        asteroids.asteroidArray.splice(j, 1);
                        laserList.splice(i, 1);
                        addScore();
                        console.log('Asteroid Hit!');
                        return 0;
                    }
                }
            }
        }

        lasers.update = function() {
            checkLaserBounds();
            checkLaserCollision();
            for (var i = 0; i < laserList.length; i++) {
                laserList[i].update();
            }
        };

        lasers.draw = function() {
            for (var i = 0; i < laserList.length; i++) {
                laserList[i].draw();
            }
        };

        lasers.fire = function() {
            if (laserList.length < maxLasers) {
                var orginFireX = ship.settings.posX;
                var orginFireY = ship.settings.posY;
                var laser = new Laser(orginFireX, orginFireY);
                laserList.push(laser);
            }
        };

        return lasers;
    }
    //#endregion

    function Ship() {
        var shipObject = ENGINE.factory.createGameObject();

        function checkShipCollision() {
            // For every asteroid
            for (var j = 0; j < asteroids.asteroidArray.length; j++) {
                if (ENGINE.util.checkCollision(shipObject, asteroids.asteroidArray[j])) {
                    asteroids.asteroidArray.splice(j, 1);
                    removeLife();
                    console.log('Ship Hit!');
                    return 0;
                }
            }
        }

        shipObject.update = function() {
            checkShipCollision();
        };

        shipObject.moveLeft = function() {
            if (ship.settings.posX > 0 && gameState === gameStateEnum.PLAY) {
                ship.settings.posX = ship.settings.posX - SHIP_SPEED;
            }
        };

        shipObject.moveRight = function() {
            if (ship.settings.posX + ship.settings.width < CANVAS_WIDTH + 70 && gameState === gameStateEnum.PLAY) {
                ship.settings.posX = ship.settings.posX + SHIP_SPEED;
            }
        };

        shipObject.moveUp = function() {
            if (ship.settings.posY > 0 && gameState === gameStateEnum.PLAY) {
                ship.settings.posY = ship.settings.posY - SHIP_SPEED;
            }
        };

        shipObject.moveDown = function() {
            if (ship.settings.posY < CANVAS_HEIGHT - 40 && gameState === gameStateEnum.PLAY) {
                ship.settings.posY = ship.settings.posY + SHIP_SPEED;
            }
        };

        var img = new Image();
        img.src = 'App/Content/Images/spaceship.png';
        img.onload = function() {
            ctx.drawImage(img, shipObject.settings.posX, shipObject.settings.posY);
        };

        shipObject.draw = function() {
            ctx.drawImage(img, shipObject.settings.posX, shipObject.settings.posY);
        };

        return shipObject;
    }

    function Asteroids() {
        var asteroids = {};
        asteroids.asteroidArray = [];

        setInterval(function() {
            if (gameState === gameStateEnum.PLAY) {
                var asteroid = new Asteroid();
                asteroids.asteroidArray.push(asteroid);
            }
        }, 140 - (CANVAS_WIDTH / 100));

        function checkAsteroidBounds() {
            for (var i = 0; i < asteroids.asteroidArray.length; i++) {
                if (asteroids.asteroidArray[i].settings.posY > CANVAS_HEIGHT + 30) {
                    asteroids.asteroidArray.splice(i, 1);
                }
            }
        }

        asteroids.update = function() {
            checkAsteroidBounds();
            for (var i = 0; i < asteroids.asteroidArray.length; i++) {
                asteroids.asteroidArray[i].update();
            }
        };

        asteroids.draw = function() {
            for (var i = 0; i < asteroids.asteroidArray.length; i++) {
                asteroids.asteroidArray[i].draw();
            }
        };

        return asteroids;
    }
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

    function getRandColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    function getRandNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //#endregion
}());
