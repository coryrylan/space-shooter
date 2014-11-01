$(document).ready(function () {

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
        Game.Draw();
        Game.Update();
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

            // Draw method calls here
            Draw: function () {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                DrawScore();
                DrawLives();

                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {
                    DrawStartScreen();
                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    ship.Draw();
                    lasers.Draw();
                    asteroids.Draw();
                    //stars.Draw();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {
                    //DrawPauseScreen();
                    return;
                }

                // Game Over
                if (GAME_STATE === GAME_STATE_ENUM[3]) {
                    EndGame();
                }
            },

            // Game logic functions here
            Update: function () {
                CheckGameIO();

                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {
                    return;
                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    lasers.Update();
                    asteroids.Update();
                    ship.Update();
                    //stars.Update();
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

            CheckCollision: function (object1, object2) { // ship, asteroid
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
    })();

    //#region Game Objects
    // Basic Game Object to represent on the screen, Game Loops (Astroids, lasers, ship)
    var GameObject = function () {
        var s; // bind alias to public settings

        return {
            // Default Settings
            settings: {
                color: "#000000",
                width: 50,
                height: 50,
                posX: 0,
                posY: 0,
            },

            init: function () {
                s = this.settings;
                //this.bindUIActions();
            },

            // Draws object on the canvas
            Draw: function () {
                ctx.fillStyle = this.settings.color;
                ctx.fillRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            }
        };
    };

    var LaserObject = function (orginFireX, orginFireY) {
        var laserObject = new GameObject();

        laserObject.settings.posX = orginFireX + 15;
        laserObject.settings.posY = orginFireY - 5;
        laserObject.settings.width = 4.5;
        laserObject.settings.height = 25;

        laserObject.Draw = function () {
            ctx.fillStyle = GetRandColor();
            ctx.beginPath();
            ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        };

        laserObject.Update = function () {
            laserObject.settings.posY -= 5.05;
        };

        return laserObject;
    };

    var Lasers = function () {
        // Apply GameObject methods to allow lasers to use
        var maxLasers = 10;
        var lasers = GameObject.apply(this, arguments); // BUG HERE 
        lasers.LaserArray = [];

        function CheckLaserBounds() {
            for (var i = 0; i < lasers.LaserArray.length; i++) {
                if (lasers.LaserArray[i].settings.posY < -5) {
                    lasers.LaserArray.shift(); // If laser outside of top bounds remove from array
                }
            }
        }

        function CheckLaserCollision() {
            // For every laser and asteroid
            for (var i = 0; i < lasers.LaserArray.length; i++) {
                for (var j = 0; j < asteroids.AsteroidArray.length; j++) {
                    if (Game.CheckCollision(lasers.LaserArray[i], asteroids.AsteroidArray[j])) {
                        asteroids.AsteroidArray.splice(j, 1);
                        lasers.LaserArray.splice(i, 1);
                        AddScore();
                        console.log("Asteroid Hit!");
                        return 0;
                    }
                }
            }
        }

        lasers.Update = function () {
            CheckLaserBounds();
            CheckLaserCollision();
            for (var i = 0; i < lasers.LaserArray.length; i++) {
                lasers.LaserArray[i].Draw();
                lasers.LaserArray[i].Update();
            }
        };

        lasers.Fire = function () {
            if (lasers.LaserArray.length < maxLasers) {
                var orginFireX = ship.settings.posX;
                var orginFireY = ship.settings.posY;
                var laser = new LaserObject(orginFireX, orginFireY);
                lasers.LaserArray.push(laser); // Add new laser object
            }
        };

        return lasers;
    };

    var Ship = function () {
        var _ship = new GameObject();

        function CheckShipCollision() {
            // For every asteroid
            for (var j = 0; j < asteroids.AsteroidArray.length; j++) {
                if (Game.CheckCollision(_ship, asteroids.AsteroidArray[j])) {
                    asteroids.AsteroidArray.splice(j, 1);
                    RemoveLife();
                    console.log("Ship Hit!");
                    return 0;
                }
            }
        }

        _ship.Update = function () {
            CheckShipCollision();
        };

        _ship.MoveLeft = function () {
            if (ship.settings.posX > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posX = ship.settings.posX - SHIP_SPEED;
            }
        };

        _ship.MoveRight = function () {
            if (ship.settings.posX + ship.settings.width < CANVAS_WIDTH + 70 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posX = ship.settings.posX + SHIP_SPEED;
            }
        };

        _ship.MoveUp = function () {
            if (ship.settings.posY > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posY = ship.settings.posY - SHIP_SPEED;
            }
        };

        _ship.MoveDown = function () {
            if (ship.settings.posY < CANVAS_HEIGHT - 40 && GAME_STATE === GAME_STATE_ENUM[1]) {
                ship.settings.posY = ship.settings.posY + SHIP_SPEED;
            }
        };

        var imageObj = new Image();
        imageObj.src = 'Resources/spaceship.png';

        var img = new Image();
        img.src = 'Resources/spaceship.png';
        img.onload = function () {
            ctx.drawImage(img, _ship.settings.posX, _ship.settings.posY);

        };

        _ship.Draw = function () {
            ctx.drawImage(img, _ship.settings.posX, _ship.settings.posY);
            // ctx.strokeRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height); // Test for collision boundries
        };

        return _ship;
    };

    var AsteroidObject = function () {
        var _asteroidObject = new GameObject();
        var range = GetRandNum(30, 100);

        _asteroidObject.settings.width = range;
        _asteroidObject.settings.height = range;
        _asteroidObject.settings.posX = GetRandNum(0 - _asteroidObject.settings.height, CANVAS_WIDTH);
        _asteroidObject.settings.posY = -_asteroidObject.settings.height;
        _asteroidObject.settings.speed = GetRandNum(2, 6);
        _asteroidObject.settings.color = GetRandomAsteroidColor();

        _asteroidObject.Draw = function () {
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

        _asteroidObject.Update = function () {
            _asteroidObject.settings.posY += _asteroidObject.settings.speed;
        };

        function GetRandomAsteroidColor() {
            var color = '';
            switch (GetRandNum(0, 3)) {
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
        var _asteroids = new GameObject();
        _asteroids.AsteroidArray = [];

        setInterval(function () {
            if (GAME_STATE === GAME_STATE_ENUM[1]) {
                var asteroid = new AsteroidObject();
                _asteroids.AsteroidArray.push(asteroid);
            }
        }, 140 - (CANVAS_WIDTH / 100));

        function CheckAsteroidBounds() {
            for (var i = 0; i < _asteroids.AsteroidArray.length; i++) {
                if (_asteroids.AsteroidArray[i].settings.posY > CANVAS_HEIGHT + 30) {
                    _asteroids.AsteroidArray.splice(i, 1);
                }
            }
        }

        _asteroids.Update = function () {
            CheckAsteroidBounds();
            for (var i = 0; i < _asteroids.AsteroidArray.length; i++) {
                _asteroids.AsteroidArray[i].Draw();
                _asteroids.AsteroidArray[i].Update();
            }
        };

        return _asteroids;
    };

    var StarObject = function () {
        var starObject = new GameObject();

        starObject.settings.width = 2;
        starObject.settings.height = 2;
        starObject.settings.posX = GetRandNum(0 - starObject.settings.height, CANVAS_WIDTH);
        starObject.settings.posY = starObject.settings.height;
        starObject.settings.speed = GetRandNum(2, 6);
        starObject.settings.color = "#FFFFFF";

        // PUBLIC Override Object Draw
        starObject.Draw = function () {
            ctx.beginPath();
            ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.fillStyle = starObject.settings.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
            ctx.closePath();
        };

        // PUBLIC
        starObject.Update = function () {
            starObject.settings.posY += starObject.settings.speed;
        };

        return starObject;
    };

    var Stars = function () {
        var stars = new GameObject();
        stars.StarArray = [];

        // Add new Stars
        setInterval(function () {
            if (GAME_STATE === GAME_STATE_ENUM[1]) {
                var star = new StarObject();
                stars.StarArray.push(star);
            }
        }, 140 - (CANVAS_WIDTH / 100));

        // PRIVATE
        function CheckStarBounds() {
            for (var i = 0; i < stars.StarArray.length; i++) {
                if (stars.StarArray[i].settings.posY > CANVAS_HEIGHT + 30) {
                    stars.StarArray.splice(i, 1);
                }
            }
        }

        // PUBLIC
        stars.Update = function () {
            CheckStarBounds();
            for (var i = 0; i < stars.StarArray.length; i++) {
                stars.StarArray[i].Draw();
                stars.StarArray[i].Update();
            }
        };

        return stars;
    };
    // #endregion

    //#region Helper Functions
    function DrawStartScreen() {
        $("#StartScreen").show();
    }

    function HideStartScreen() {
        $("#StartScreen").hide();
    }

    function StartNewGame() {
        LIVES = 3;
        GAME_STATE = GAME_STATE_ENUM[1];
        GAME_SCORE = 0;
        HideStartScreen();
        $("#GameOver").hide();
    }

    function PauseGame() {
        DrawPauseScreen();
        if (GAME_STATE === GAME_STATE_ENUM[1]) {
            GAME_STATE = GAME_STATE_ENUM[2];
        } else {
            GAME_STATE = GAME_STATE_ENUM[1];
        }
    }

    function DrawPauseScreen() {
        $("#Paused").toggle();
    }

    function EndGame() {
        $("#GameOver").show();
    }

    function AddScore() {
        GAME_SCORE += 1;
    }

    function DrawScore() {
        $("#Score").html("Score:" + GAME_SCORE);
    }

    function RemoveLife() {
        if (LIVES > 0) {
            LIVES -= 1;
        } else {
            GAME_STATE = GAME_STATE_ENUM[3];
        }
    }

    function DrawLives() {
        $("#Lives").html("Lives:" + LIVES);
    }

    function GetRandColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    function GetRandNum(min, max) {
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
                StartNewGame();
            }
            return false;
        }

        // (p) Pause
        if (e.keyCode === 80) {
            PauseGame();
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
            ship.MoveLeft();
        }

        // (Right Arrow)
        if (keyState[39] || keyState[68]) {
            ship.MoveRight();
        }

        // (Up Arrow)
        if (keyState[38] || keyState[87]) {
            ship.MoveUp();
        }

        // (Down Arrow)
        if (keyState[40] || keyState[83]) {
            ship.MoveDown();
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
    lasers.settings.width = 1;
    lasers.settings.height = 1;
    lasers.settings.color = "rgba(0, 0, 0, 1)";
    lasers.settings.posX = -1;
    lasers.settings.posY = -1;

    var asteroids = new Asteroids();
    asteroids.settings.width = 1;
    asteroids.settings.height = 1;
    asteroids.settings.color = "rgba(0, 0, 0, 1)";
    asteroids.settings.posX = -1;
    asteroids.settings.posY = -1;

    var stars = new Stars();
    stars.settings.width = 1;
    stars.settings.height = 1;
    stars.settings.color = "rgba(0, 0, 0, 1)";
    stars.settings.posX = -1;
    stars.settings.posY = -1;
});