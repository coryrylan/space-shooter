$(document).ready(function () {

    // Game CONSTS
    var CANVAS_WIDTH = 300;
    var CANVAS_HEIGHT = 400;
    var SHIP_SPEED = 4;
    var GAME_SCORE = 0;
    var LIVES = 3;
    var ASTEROID_SPEED = 3.5;
    var GAME_STATE_ENUM = ["GAME START", "PLAY", "PAUSE", "GAME OVER"];
    var GAME_STATE = GAME_STATE_ENUM[0].toString();
    var canvas = document.getElementById('GameCanvas'),
        context = canvas.getContext('2d');
    var ctx = context;

    // Game loop clock 60fps
    window.setInterval(function () {
        Game.Draw();
        Game.Update();
    }, 1000 / 60);

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

            bindUIActions: function () {

            },

            // Draw method calls here
            Draw: function () {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                // Constant Live Drawing
                DrawScore();
                DrawLives();

                // I do not use case statement here because I like the readability of the if's in a block style
                // Game Start
                if (GAME_STATE === GAME_STATE_ENUM[0]) {
                    DrawStartScreen();
                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    ship.Draw();
                    lasers.Draw();
                    asteroids.Draw();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {
                    DrawPauseScreen();
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

                }

                // Game Play
                if (GAME_STATE === GAME_STATE_ENUM[1]) {
                    lasers.Update();
                    asteroids.Update();
                    ship.Update();
                }

                // Game Pause
                if (GAME_STATE === GAME_STATE_ENUM[2]) {

                }

                // Game Over
                if (GAME_STATE === GAME_STATE_ENUM[3]) {

                }
            },

            CheckCollision: function (Object1, Object2) {
                if (checkXposition() && checkYPosition()) {
                    return true;
                }
                else {
                    return false;
                }

                function checkXposition() {
                    if (Object1.settings.posX >= Object2.settings.posX && Object1.settings.posX <= Object2.settings.posX + Object2.settings.width) {
                        return true;
                    }
                    return false;
                }

                function checkYPosition() {
                    if (Object1.settings.posY >= Object2.settings.posY && Object1.settings.posY <= Object2.settings.posY + Object2.settings.height) {
                        return true;
                    }
                    return false;
                }
            }
        };
    })();

    // Basic Object to represent on the screen, Game Loops
    var GameObject = function () {
        // Privat Vars and Funcs
        var privateVar = "private";

        var s; // bind alias to public settings
        return {
            settings: {
                color: "rgba(0, 0, 200, 0.5)",
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
            Draw: function (posX, posY) {
                ctx.fillStyle = this.settings.color;
                ctx.fillRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            }
        };
    };

    // Game Objects
    var LaserObject = function (orginFireX, orginFireY) {
        // Apply inherited parent class values
        var _laserObject = new GameObject();
        _laserObject.settings.posX = orginFireX + 15;
        _laserObject.settings.posY = orginFireY - 5;
        _laserObject.settings.width = 4.5;
        _laserObject.settings.height = 25;

        // Override Object Draw 
        // PUBLIC
        _laserObject.Draw = function () {
            ctx.fillStyle = GetRandColor();
            ctx.beginPath();
            ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        // PUBLIC
        _laserObject.Update = function () {
            _laserObject.settings.posY -= 5.05;
        }

        return _laserObject;
    };

    var Lasers = function () {
        // Apply inherited parent class values
        var _lasers = GameObject.apply(this, arguments)
        _lasers.LaserArray = new Array();

        // PRIVATE
        function CheckLaserBounds() {
            for (var i = 0; i < _lasers.LaserArray.length; i++) {
                if (_lasers.LaserArray[i].settings.posY < -5) {
                    _lasers.LaserArray.shift(); // If laser outside of top bounds remove from array
                }
            }
        }

        // PRIVATE
        function CheckLaserCollision() {
            // For every laser and asteroid
            for (var i = 0; i < _lasers.LaserArray.length; i++) {
                for (var j = 0; j < asteroids.AsteroidArray.length; j++) {
                    if (Game.CheckCollision(_lasers.LaserArray[i], asteroids.AsteroidArray[j])) {
                        //asteroids.AsteroidArray[j].settings.speed = -5;
                        asteroids.AsteroidArray.splice(j, 1);
                        _lasers.LaserArray.splice(i, 1);
                        AddScore();
                        console.log("Asteroid Hit!");
                        return 0;
                    }
                }
            }
        }

        // PUBLIC
        _lasers.Update = function () {
            CheckLaserBounds();
            CheckLaserCollision()
            for (var i = 0; i < _lasers.LaserArray.length; i++) {
                _lasers.LaserArray[i].Draw();
                _lasers.LaserArray[i].Update();
            }
        }

        // PUBLIC 
        _lasers.Fire = function () {
            var orginFireX = ship.settings.posX;
            var orginFireY = ship.settings.posY;
            _lasers.LaserArray.push(laser = new LaserObject(orginFireX, orginFireY)); // Add new laser object
        }

        return _lasers;
    };

    var Ship = function () {
        // Apply inherited parent class values
        var _ship = new GameObject();
        
        // PRIVATE
        function CheckShipCollision() {
            // For every asteroid
            for (var j = 0; j < asteroids.AsteroidArray.length; j++) {
                if (Game.CheckCollision(asteroids.AsteroidArray[j], _ship)) {
                    asteroids.AsteroidArray.splice(j, 1);
                    CheckLives();
                    console.log("Ship Hit!");
                    return 0;
                }
            }
        }

        // PUBLIC
        _ship.Update = function () {
            CheckShipCollision();
        }

        var imageObj = new Image();
        imageObj.src = 'Resources/jet.JPG';
        // PUBLIC

        var img = new Image();
        img.src = 'Resources/jet.JPG';
        img.onload = function () {
            ctx.drawImage(img, _ship.settings.posX, _ship.settings.posY);
        };

        _ship.Draw = function () {
            ctx.drawImage(img, _ship.settings.posX, _ship.settings.posY);
        }
        
        return _ship;
    }

    var AsteroidObject = function () {
        // Apply inherited parent class values
        var _asteroidObject = new GameObject();
        
        _asteroidObject.settings.posX = GetRandNum(0, CANVAS_WIDTH);
        _asteroidObject.settings.posY = -_asteroidObject.settings.height;
        _asteroidObject.settings.width = 20;
        _asteroidObject.settings.height = 20;
        _asteroidObject.settings.speed = GetRandNum(2, 6);

        // PUBLIC Override Object Draw 
        _asteroidObject.Draw = function () {
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.strokeRect(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            //ctx.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        // PUBLIC
        _asteroidObject.Update = function () {
            _asteroidObject.settings.posY += _asteroidObject.settings.speed;
        }

        return _asteroidObject;
    };

    var Asteroids = function () {
        // Apply inherited parent class values
        var _asteroids = new GameObject();
        _asteroids.AsteroidArray = new Array();

        // Add new asteroids
        
        setInterval(function () {
            if (GAME_STATE === GAME_STATE_ENUM[1]) {
                _asteroids.AsteroidArray.push(asteroid = new AsteroidObject());
            }
            }, 300);
        
        
        // PRIVATE
        function CheckAsteroidBounds() {
            for (var i = 0; i < _asteroids.AsteroidArray.length; i++) {
                if (_asteroids.AsteroidArray[i].settings.posY > CANVAS_HEIGHT + 30) {
                    _asteroids.AsteroidArray.splice(i, 1); // If laser outside of top bounds remove from array
                }
            }
        }

        // PUBLIC
        _asteroids.Update = function () {
            CheckAsteroidBounds();
            for (var i = 0; i < _asteroids.AsteroidArray.length; i++) {
                _asteroids.AsteroidArray[i].Draw();
                _asteroids.AsteroidArray[i].Update();
            }
        }

        return _asteroids;
    };


    // Helper Functions
    function DrawStartScreen() {
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.lineStyle = "#000000";
        ctx.font = "18px sans-serif";
        //ctx.fillText("Use mouse to move paddle left and right.", 180, 180);
        ctx.fillText("Press Enter to start.", 60, 180);
    }

    function StartNewGame() {
        LIVES = 3;
        GAME_STATE = GAME_STATE_ENUM[1];
        GAME_SCORE = 0;
    }

    function PauseGame() {
        // If playing pause
        if (GAME_STATE === GAME_STATE_ENUM[1]) {
            GAME_STATE = GAME_STATE_ENUM[2];
        }
        else {
            GAME_STATE = GAME_STATE_ENUM[1];
        }
    }

    function DrawPauseScreen() {
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.lineStyle = "#000000";
        ctx.font = "18px sans-serif";
        ctx.fillText("Paused", 115, 160);
    }

    function EndGame() {
        ctx.lineWidth = 1;
        ctx.fillStyle = "#000000";
        ctx.lineStyle = "#000000";
        ctx.font = "18px sans-serif";
        ctx.fillText("GAME OVER", 100, 160);
        ctx.fillText("Press Enter to start new game.", 30, 200);
    }

    function AddScore() {
        GAME_SCORE = GAME_SCORE + 1;
    }

    function DrawScore() {
        context.lineWidth = 1;
        context.fillStyle = "#000000";
        context.lineStyle = "#000000";
        context.font = "18px sans-serif";
        context.fillText("Score:" + GAME_SCORE, 20, 20);
    }

    function CheckLives() {
        if (LIVES > 0) {
            LIVES = LIVES - 1;
        }
        else {
            GAME_STATE = GAME_STATE_ENUM[3];
        }
    }

    function DrawLives() {
        context.lineWidth = 1;
        context.fillStyle = "#000000";
        context.lineStyle = "#000000";
        context.font = "18px sans-serif";
        context.fillText("Lives:" + LIVES, 220, 20);
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
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // Game IO
    $("#GameCanvas").mousemove(function (e) {
        //If Play Game
        if (GAME_STATE === GAME_STATE_ENUM[1]) {
            //ship.settings.posX = e.pageX - 50;
        }
    });

    // Inactive Key Events
    $(document).keydown(function (e) {
        //Enter key
        if (e.keyCode == 13) {
            // If game start or game over allow new game
            if (GAME_STATE === GAME_STATE_ENUM[0] || GAME_STATE === GAME_STATE_ENUM[3]) {
                StartNewGame();
            }
            return false;
        }

        // (p) Pause
        if (e.keyCode == 80) {
            PauseGame();
        }

        // Space bar
        if (e.keyCode == 32) {
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
            MoveShipLeft();
        }

        // (Right Arrow)
        if (keyState[39] || keyState[68]) {
            MoveShipRight();
        }

        // (Up Arrow)
        if (keyState[38] || keyState[87]) {
            MoveShipUp();
        }

        // (Down Arrow)
        if (keyState[40] || keyState[83]) {
            MoveShipDown();
        }
    }

    function MoveShipLeft() {
        if (ship.settings.posX > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
            ship.settings.posX = ship.settings.posX - SHIP_SPEED;
        }
    }

    function MoveShipRight() {
        if (ship.settings.posX + ship.settings.width < CANVAS_WIDTH + 70 && GAME_STATE === GAME_STATE_ENUM[1]) {
            ship.settings.posX = ship.settings.posX + SHIP_SPEED;
        }
    }

    function MoveShipUp() {
        if (ship.settings.posY > 0 && GAME_STATE === GAME_STATE_ENUM[1]) {
            ship.settings.posY = ship.settings.posY - SHIP_SPEED;
        }
    }

    function MoveShipDown() {
        if (ship.settings.posY < CANVAS_HEIGHT - 40 && GAME_STATE === GAME_STATE_ENUM[1]) {
            ship.settings.posY = ship.settings.posY + SHIP_SPEED;
        }
    }

    // Game Object Declarations
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


    //$(".leftButton").click(function () {
    //    MoveShipLeft();
    //});
});