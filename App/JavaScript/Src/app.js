(function() {
    // Game CONSTS
    var CANVAS_WIDTH = 720;
    var CANVAS_HEIGHT = 480;
    var SHIP_SPEED = 4;
    var GAME_SCORE = 0;
    var LIVES = 3;
    var GAME_STATE_ENUM = ["GAME START", "PLAY", "PAUSE", "GAME OVER"];
    var GAME_STATE = GAME_STATE_ENUM[0].toString();
    var canvas = document.getElementById('GameCanvas');
    var context = canvas.getContext('2d');
    var ctx = context;

    $("#GameCanvas").attr('width', CANVAS_WIDTH).attr('height', CANVAS_HEIGHT);

    //#region Main (Game loop)
    function gameLoop() {
        Game.draw();
        Game.update();
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
    //#endregion

    var Game = (function () {
        var s; // bind alias to public settings
        return {
            settings: {
                numPlayers: 1,
            },

            init: function () {
                s = this.settings;
                this.bindUIActions();
            },

            draw: function () {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                drawScore();
                drawLives();

                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {
                    drawStartScreen();
                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    ship.draw();
                    lasers.draw();
                    asteroids.draw();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {
                    return;
                }

                // Game Over
                if (GAME_STATE === GAME_STATE_ENUM[3]) {
                    endGame();
                }
            },

            update: function () {
                CheckGameIO();

                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {
                    return;
                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    lasers.update();
                    asteroids.update();
                    ship.update();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {
                    return;
                }

                // Game Over
                if (GAME_STATE === GAME_STATE_ENUM[3]) {
                    return;
                }
            },

            checkCollision: function (object1, object2) { // ship, asteroid
                if (checkHorizontalCollision() && checkVerticalPosition()) {
                    return true;
                } else {
                    return false;
                }

                function checkHorizontalCollision() {
                    var object1RightSide = object1.settings.posX + object1.settings.width;
                    var object1LeftSide = object1.settings.posX;
                    var object2RightSide = object2.settings.posX + object2.settings.width;
                    var object2LeftSide = object2.settings.posX;

                    if (leftSideCollision() || rightSideCollision()) {
                        return true;
                    } else {
                        return false;
                    }

                    function leftSideCollision() {
                        if ((object1LeftSide >= object2LeftSide && object1LeftSide <= object2RightSide)) {
                            return true;
                        } else {
                            return false;
                        }
                    }

                    function rightSideCollision() {
                        if (object1RightSide >= object2LeftSide && object1RightSide <= object2RightSide) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }

                function checkVerticalPosition() {
                    if (object1.settings.posY >= object2.settings.posY && object1.settings.posY <= object2.settings.posY + object2.settings.height) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        };
    }());

    //#region Game Objects
    // Basic Game Object to represent on the screen, Game Loops (Asteroids, lasers, ship)
    var GameObject = function () {
        this.settings = {
            color: "#000000",
            width: 50,
            height: 50,
            posX: 0,
            posY: 0,
        };
    };

    GameObject.prototype.draw = function () {
        ctx.fillStyle = this.settings.color;
        ctx.fillRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
    };

    var LaserObject = function (orginFireX, orginFireY) {
        var laserObject = new GameObject();

        laserObject.settings.posX = orginFireX + 15;
        laserObject.settings.posY = orginFireY - 5;
        laserObject.settings.width = 4.5;
        laserObject.settings.height = 25;

        laserObject.draw = function () {
            ctx.fillStyle = getRandColor();
            ctx.beginPath();
            ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        };

        laserObject.update = function () {
            laserObject.settings.posY -= 5.05;
        };

        return laserObject;
    };

    var Lasers = function () {
        var lasers = {};
        var maxLasers = 10;
        lasers.laserArray = [];

        function checkLaserBounds() {
            for (var i = 0; i < lasers.laserArray.length; i++) {
                if (lasers.laserArray[i].settings.posY < -5) {
                    lasers.laserArray.shift(); // If laser outside of top bounds remove from array
                }
            }
        }

        function checkLaserCollision() {
            // For every laser and asteroid
            for (var i = 0; i < lasers.laserArray.length; i++) {
                for (var j = 0; j < asteroids.asteroidArray.length; j++) {
                    if (Game.checkCollision(lasers.laserArray[i], asteroids.asteroidArray[j])) {
                        asteroids.asteroidArray.splice(j, 1);
                        lasers.laserArray.splice(i, 1);
                        addScore();
                        console.log("Asteroid Hit!");
                        return 0;
                    }
                }
            }
        }

        lasers.update = function () {
            checkLaserBounds();
            checkLaserCollision();
            for (var i = 0; i < lasers.laserArray.length; i++) {
                lasers.laserArray[i].update();
            }
        };

        lasers.draw = function () {
            for (var i = 0; i < lasers.laserArray.length; i++) {
                lasers.laserArray[i].draw();
            }
        };

        lasers.Fire = function () {
            if (lasers.laserArray.length < maxLasers) {
                var orginFireX = ship.settings.posX;
                var orginFireY = ship.settings.posY;
                var laser = new LaserObject(orginFireX, orginFireY);
                lasers.laserArray.push(laser);
            }
        };

        return lasers;
    };

    var Ship = function () {
        var _ship = new GameObject();

        function checkShipCollision() {
            // For every asteroid
            for (var j = 0; j < asteroids.asteroidArray.length; j++) {
                if (Game.checkCollision(_ship, asteroids.asteroidArray[j])) {
                    asteroids.asteroidArray.splice(j, 1);
                    removeLife();
                    console.log("Ship Hit!");
                    return 0;
                }
            }
        }

        _ship.update = function () {
            checkShipCollision();
        };

        _ship.moveLeft = function () {
            if (ship.settings.posX > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posX = ship.settings.posX - SHIP_SPEED;
            }
        };

        _ship.moveRight = function () {
            if (ship.settings.posX + ship.settings.width < CANVAS_WIDTH + 70 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posX = ship.settings.posX + SHIP_SPEED;
            }
        };

        _ship.moveUp = function () {
            if (ship.settings.posY > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posY = ship.settings.posY - SHIP_SPEED;
            }
        };

        _ship.moveDown = function () {
            if (ship.settings.posY < CANVAS_HEIGHT - 40 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posY = ship.settings.posY + SHIP_SPEED;
            }
        };

        var img = new Image();
        img.src = 'App/Content/Images/spaceship.png';
        img.onload = function () {
            ctx.drawImage(img, _ship.settings.posX, _ship.settings.posY);
        };

        _ship.draw = function () {
            ctx.drawImage(img, _ship.settings.posX, _ship.settings.posY);
            // ctx.strokeRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height); // Test for collision boundries
        };

        return _ship;
    };

    var AsteroidObject = function () {
        var _asteroidObject = new GameObject();
        var range = getRandNum(30, 100);

        _asteroidObject.settings.width = range;
        _asteroidObject.settings.height = range;
        _asteroidObject.settings.posX = getRandNum(0 - _asteroidObject.settings.height, CANVAS_WIDTH);
        _asteroidObject.settings.posY = -_asteroidObject.settings.height;
        _asteroidObject.settings.speed = getRandNum(2, 6);
        _asteroidObject.settings.color = GetRandomAsteroidColor();

        _asteroidObject.draw = function () {
            ctx.beginPath();
            ctx.rect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            //ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.fillStyle = _asteroidObject.settings.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#3d3d3d';
            ctx.stroke();
            ctx.closePath();
        };

        _asteroidObject.update = function () {
            _asteroidObject.settings.posY += _asteroidObject.settings.speed;
        };

        function GetRandomAsteroidColor() {
            var color = '';
            switch (getRandNum(0, 3)) {
                case 1:
                    color = "#755D41";
                    break;
                case 2:
                    color = "#735B40";
                    break;
                case 3:
                    color = "#967754";
                    break;
            }

            return color;
        }

        return _asteroidObject;
    };

    var Asteroids = function () {
        var _asteroids = {};
        _asteroids.asteroidArray = [];

        setInterval(function () {
            if (GAME_STATE === GAME_STATE_ENUM[1]) {
                var asteroid = new AsteroidObject();
                _asteroids.asteroidArray.push(asteroid);
            }
        }, 140 - (CANVAS_WIDTH / 100));

        function checkAsteroidBounds() {
            for (var i = 0; i < _asteroids.asteroidArray.length; i++) {
                if (_asteroids.asteroidArray[i].settings.posY > CANVAS_HEIGHT + 30) {
                    _asteroids.asteroidArray.splice(i, 1);
                }
            }
        }

        _asteroids.update = function () {
            checkAsteroidBounds();
            for (var i = 0; i < _asteroids.asteroidArray.length; i++) {
                _asteroids.asteroidArray[i].update();
            }
        };

        _asteroids.draw = function () {
            for (var i = 0; i < _asteroids.asteroidArray.length; i++) {
                _asteroids.asteroidArray[i].draw();
            }
        };

        return _asteroids;
    };
    // #endregion

    //#region Helper Functions
    function drawStartScreen() {
        $("#StartScreen").show();
    }

    function hideStartScreen() {
        $("#StartScreen").hide();
    }

    function startNewGame() {
        LIVES = 3;
        GAME_STATE = GAME_STATE_ENUM[1];
        GAME_SCORE = 0;
        hideStartScreen();
        $("#GameOver").hide();
    }

    function pauseGame() {
        drawPauseScreen();
        if (GAME_STATE === GAME_STATE_ENUM[1]) {
            GAME_STATE = GAME_STATE_ENUM[2];
        } else {
            GAME_STATE = GAME_STATE_ENUM[1];
        }
    }

    function drawPauseScreen() {
        $("#Paused").toggle();
    }

    function endGame() {
        $("#GameOver").show();
    }

    function addScore() {
        GAME_SCORE += 1;
    }

    function drawScore() {
        $("#Score").html("Score:" + GAME_SCORE);
    }

    function removeLife() {
        if (LIVES > 0) {
            LIVES -= 1;
        } else {
            GAME_STATE = GAME_STATE_ENUM[3];
        }
    }

    function drawLives() {
        $("#Lives").html("Lives:" + LIVES);
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

    //#region Key Events
    // Inactive Key Events
    $(document).keydown(function (e) {
        //Enter key
        if (e.keyCode === 13) {
            // If game start or game over allow new game
            if (GAME_STATE === GAME_STATE_ENUM[0] || GAME_STATE === GAME_STATE_ENUM[3]) {
                startNewGame();
            }
            return false;
        }

        // (p) Pause
        if (e.keyCode === 80) {
            pauseGame();
        }

        // Space bar
        if (e.keyCode === 32) {
            lasers.Fire();
        }
    });

    var keyState = {};
    window.addEventListener('keydown', function (e) {
        keyState[e.keyCode || e.which] = true;
    }, true);
    window.addEventListener('keyup', function (e) {
        keyState[e.keyCode || e.which] = false;
    }, true);

    // Active key Events
    function CheckGameIO() {
        // (Left Arrow)
        if (keyState[37] || keyState[65]) {
            ship.moveLeft();
        }

        // (Right Arrow)
        if (keyState[39] || keyState[68]) {
            ship.moveRight();
        }

        // (Up Arrow)
        if (keyState[38] || keyState[87]) {
            ship.moveUp();
        }

        // (Down Arrow)
        if (keyState[40] || keyState[83]) {
            ship.moveDown();
        }
    }
    //#endregion

    // Game Object Creation
    var ship = new Ship();
    ship.settings.color = "rgba(0, 0, 0, 1)";
    ship.settings.posY = 350;
    ship.settings.height = 25;
    ship.settings.width = 25;

    var lasers = new Lasers();
    var asteroids = new Asteroids();
}());