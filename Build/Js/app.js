(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var ENGINE = require("./engine").ENGINE;

var Ship = require("./ship").Ship;

var LaserCollection = require("./laserCollection").LaserCollection;

var AsteroidCollection = require("./asteroidCollection").AsteroidCollection;

(function () {
    "use strict";

    // Enums
    var GAME_STATE = {
        START: "START",
        PLAY: "PLAY",
        PAUSE: "PAUSE",
        OVER: "OVER"
    };

    // Game Globals
    var gameScore = 0;
    var gameLives = 3;
    var canvas = document.getElementById("GameCanvas");
    var ctx = canvas.getContext("2d");
    var gameState = GAME_STATE.START;

    //region Game
    var playerShip = new Ship({
        lasers: new LaserCollection()
    });

    var asteroids = new AsteroidCollection();

    var checkShipAndAsteroidCollision = function checkShipAndAsteroidCollision() {
        asteroids.list.forEach(_checkShipCollision);

        function _checkShipCollision(asteroid, index) {
            if (ENGINE.util.checkCollision(playerShip, asteroid)) {
                asteroids.list.splice(index, 1);
                removeLife();
            }
        }
    };

    var checkShipLaserAndAsteroidCollision = function checkShipLaserAndAsteroidCollision() {
        var checkLaserCollision = function checkLaserCollision(laser, laserIndex) {
            // For every asteroid
            for (var i = 0; i < asteroids.list.length; i++) {
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

    var game = ENGINE.factory.createGame({
        update: function update() {
            if (gameState === GAME_STATE.START) {
                return;
            } else if (gameState === GAME_STATE.PLAY) {
                asteroids.update();
                playerShip.update();
                checkShipAndAsteroidCollision();
                checkShipLaserAndAsteroidCollision();
            } else if (gameState === GAME_STATE.PAUSE) {
                return;
            } else if (gameState === GAME_STATE.OVER) {
                return;
            }
        },
        draw: function draw() {
            ctx.clearRect(0, 0, ENGINE.settings.canvasWidth, ENGINE.settings.canvasHeight);
            drawScore();
            drawLives();

            if (gameState === GAME_STATE.START) {
                drawStartScreen();
            } else if (gameState === GAME_STATE.PLAY) {
                playerShip.draw(ctx);
                asteroids.draw(ctx);
            } else if (gameState === GAME_STATE.PAUSE) {
                console.log("Paused");
            } else if (gameState === GAME_STATE.OVER) {
                endGame();
            } else {
                drawStartScreen();
            }
        }
    });

    game.start();

    // Get in collection class and remove import for Asteroid
    setInterval(function () {
        if (gameState === GAME_STATE.PLAY) {
            asteroids.addAsteroid();
        }
    }, 140 - ENGINE.settings.canvasWidth / 100);
    //endregion

    //region Game Controls
    ENGINE.controls.on("left", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveLeft();
        }
    });

    ENGINE.controls.on("right", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveRight();
        }
    });

    ENGINE.controls.on("up", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveUp();
        }
    });

    ENGINE.controls.on("down", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveDown();
        }
    });

    ENGINE.controls.onkey("space", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.fire();
        }
    });

    ENGINE.controls.onkey("pause", function () {
        pauseGame();
    });

    ENGINE.controls.onkey("enter", function () {
        if (gameState === GAME_STATE.START || gameState === GAME_STATE.OVER) {
            startNewGame();
        }
    });
    //endregion

    //region Helper Functions
    function drawStartScreen() {
        $(".js-start-screen").show();
    }

    function hideStartScreen() {
        $(".js-start-screen").hide();
    }

    function startNewGame() {
        gameLives = 3;
        gameState = GAME_STATE.PLAY;
        gameScore = 0;
        hideStartScreen();
        $(".js-game-over-screen").hide();
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
        $(".js-pause-screen").toggle();
    }

    function endGame() {
        $(".js-game-over-screen").show();
    }

    function addScore() {
        gameScore += 1;
    }

    function drawScore() {
        $(".js-score").html("Score:" + gameScore);
    }

    function removeLife() {
        if (gameLives > 0) {
            gameLives -= 1;
        } else {
            gameState = GAME_STATE.OVER;
        }
    }

    function drawLives() {
        $(".js-lives").html("Lives:" + gameLives);
    }
    //endregion
})();

},{"./asteroidCollection":3,"./engine":4,"./laserCollection":6,"./ship":7}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = require("./engine").ENGINE;

var Asteroid = (function () {
    function Asteroid() {
        _classCallCheck(this, Asteroid);

        var range = ENGINE.util.getRandomNumber(30, 100);

        this.settings = {
            width: range,
            height: range,
            speed: ENGINE.util.getRandomNumber(2, 6)
        };

        this.settings.posX = ENGINE.util.getRandomNumber(0 - this.settings.height, ENGINE.settings.canvasWidth);
        this.settings.posY = this.settings.height * -2;

        this.img = new Image();
        this.img.src = "App/Content/Images/asteroid-" + ENGINE.util.getRandomNumber(1, 4) + ".png";
    }

    _prototypeProperties(Asteroid, null, {
        draw: {
            value: function draw(context) {
                context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            },
            writable: true,
            configurable: true
        },
        update: {
            value: function update() {
                this.settings.posY += this.settings.speed;
            },
            writable: true,
            configurable: true
        }
    });

    return Asteroid;
})();

exports.Asteroid = Asteroid;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"./engine":4}],3:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = require("./engine").ENGINE;

var Asteroid = require("./asteroid").Asteroid;

var AsteroidCollection = (function () {
    function AsteroidCollection() {
        _classCallCheck(this, AsteroidCollection);

        this.list = [];
    }

    _prototypeProperties(AsteroidCollection, null, {
        update: {
            value: function update() {
                var checkAsteroidBounds = (function (asteroid, index) {
                    if (asteroid.settings.posY > ENGINE.settings.canvasHeight + 30) {
                        this.list.splice(index, 1);
                    }
                }).bind(this);

                var update = function update(asteroid) {
                    asteroid.update();
                };

                this.list.forEach(checkAsteroidBounds);
                this.list.forEach(update);
            },
            writable: true,
            configurable: true
        },
        draw: {
            value: function draw(context) {
                var draw = function draw(asteroid) {
                    asteroid.draw(context);
                };

                this.list.forEach(draw);
            },
            writable: true,
            configurable: true
        },
        addAsteroid: {
            value: function addAsteroid() {
                this.list.push(new Asteroid());
            },
            writable: true,
            configurable: true
        }
    });

    return AsteroidCollection;
})();

exports.AsteroidCollection = AsteroidCollection;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"./asteroid":2,"./engine":4}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = (function () {
    // Temp until we get a module system in place (Convert to a ES6 module)
    "use strict";

    var factory = (function () {
        var Game = (function () {
            function Game(properties) {
                _classCallCheck(this, Game);

                this._update = properties.update;
                this._draw = properties.draw;
            }

            _prototypeProperties(Game, null, {
                update: {
                    value: function update() {
                        this._update();
                    },
                    writable: true,
                    configurable: true
                },
                draw: {
                    value: function draw() {
                        this._draw();
                    },
                    writable: true,
                    configurable: true
                },
                start: {
                    value: function start() {
                        var gameLoop = (function () {
                            this._update();
                            this._draw();
                            requestAnimationFrame(gameLoop);
                        }).bind(this);

                        requestAnimationFrame(gameLoop);
                    },
                    writable: true,
                    configurable: true
                }
            });

            return Game;
        })();

        var GameObject = function GameObject() {
            _classCallCheck(this, GameObject);

            this.settings = {
                color: "#000000",
                width: 50,
                height: 50,
                posX: 0,
                posY: 0
            };
        };

        function createGame(update, draw) {
            return new Game(update, draw);
        }

        function createGameObject() {
            return new GameObject();
        }

        return {
            createGame: createGame,
            createGameObject: createGameObject
        };
    })();

    var controls = (function () {
        var eventActions = {};
        var keyState = {};
        var keyAction = {
            space: function space() {
                console.log("Key action space not defined");
            },
            pause: function pause() {
                console.log("Key action pause not defined");
            },
            enter: function enter() {
                console.log("Key action enter not defined");
            }
        };

        var on = function on(event, func) {
            switch (event) {
                case "left":
                    eventActions.left = func;
                    break;
                case "right":
                    eventActions.right = func;
                    break;
                case "up":
                    eventActions.up = func;
                    break;
                case "down":
                    eventActions.down = func;
                    break;
                case "space":
                    eventActions.down = func;
                    break;
                case "pause":
                    eventActions.down = func;
                    break;
                default:
                    console.log("unknown control event fired");
            }
        };

        var onkey = function onkey(event, func) {
            switch (event) {
                case "space":
                    keyAction.space = func;
                    break;
                case "pause":
                    keyAction.pause = func;
                    break;
                case "enter":
                    keyAction.enter = func;
                    break;
                default:
                    console.log("unknown control event fired");
            }
        };

        var controlsLoop = (function (_controlsLoop) {
            var _controlsLoopWrapper = function controlsLoop() {
                return _controlsLoop.apply(this, arguments);
            };

            _controlsLoopWrapper.toString = function () {
                return _controlsLoop.toString();
            };

            return _controlsLoopWrapper;
        })(function () {
            // (Up Arrow)
            if (keyState[38] || keyState[87]) {
                eventActions.up();
            }

            // (Left Arrow)
            if (keyState[37] || keyState[65]) {
                eventActions.left();
            }

            // (Right Arrow)
            if (keyState[39] || keyState[68]) {
                eventActions.right();
            }

            // (Down Arrow)
            if (keyState[40] || keyState[83]) {
                eventActions.down();
            }

            requestAnimationFrame(controlsLoop);
        });

        requestAnimationFrame(controlsLoop);

        window.addEventListener("keydown", function (e) {
            keyState[e.keyCode || e.which] = true;
        }, true);

        window.addEventListener("keyup", function (e) {
            keyState[e.keyCode || e.which] = false;
        }, true);

        $(document).keydown(function (e) {
            // Enter key
            if (e.keyCode === 13) {
                keyAction.enter();
            }

            // (p) Pause
            if (e.keyCode === 80) {
                keyAction.pause();
            }

            // Space bar
            if (e.keyCode === 32) {
                keyAction.space();
            }
        });

        return {
            on: on,
            onkey: onkey
        };
    })();

    var util = (function () {
        function _horizontalCollision(obj1, obj2) {
            var obj1RightSide = obj1.settings.posX + obj1.settings.width;
            var obj1LeftSide = obj1.settings.posX;
            var obj2RightSide = obj2.settings.posX + obj2.settings.width;
            var obj2LeftSide = obj2.settings.posX;

            if (leftSideCollision() || rightSideCollision()) {
                return true;
            } else {
                return false;
            }

            function leftSideCollision() {
                if (obj1LeftSide >= obj2LeftSide && obj1LeftSide <= obj2RightSide) {
                    return true;
                } else {
                    return false;
                }
            }

            function rightSideCollision() {
                if (obj1RightSide >= obj2LeftSide && obj1RightSide <= obj2RightSide) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        function _verticalPosition(obj1, obj2) {
            if (checkTopSideCollision()) {
                return true;
            } else {
                return false;
            }

            function checkTopSideCollision() {
                return obj1.settings.posY >= obj2.settings.posY && obj1.settings.posY <= obj2.settings.posY + obj2.settings.height;
            }
        }

        function checkCollision(obj1, obj2) {
            if (_horizontalCollision(obj1, obj2) && _verticalPosition(obj1, obj2)) {
                return true;
            } else {
                return false;
            }
        }

        function getRandomNumber(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function getRandomColor() {
            var letters = "0123456789ABCDEF".split("");
            var color = "#";

            for (var i = 0; i < 6; i++) {
                color += letters[Math.round(Math.random() * 15)];
            }

            return color;
        }

        return {
            checkCollision: checkCollision,
            getRandomNumber: getRandomNumber,
            getRandomColor: getRandomColor
        };
    })();

    var settings = {
        canvasWidth: 720,
        canvasHeight: 480
    };

    return {
        util: util,
        factory: factory,
        controls: controls,
        settings: settings
    };
})();

exports.ENGINE = ENGINE;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Laser = (function () {
    function Laser(originX, originY) {
        _classCallCheck(this, Laser);

        this.settings = {
            posX: originX,
            posY: originY,
            width: 4.5,
            height: 25
        };

        this.sound = new window.Howl({
            urls: ["App/Content/Audio/laser.mp3"]
        });
    }

    _prototypeProperties(Laser, null, {
        draw: {
            value: function draw(context) {
                context.beginPath();
                context.fillStyle = "#00ff00"; //ENGINE.util.getRandomColor();
                context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
                context.fill();
                context.closePath();
            },
            writable: true,
            configurable: true
        },
        update: {
            value: function update() {
                this.settings.posY -= 5.05;
            },
            writable: true,
            configurable: true
        },
        playSound: {
            value: function playSound() {
                this.sound.play();
            },
            writable: true,
            configurable: true
        }
    });

    return Laser;
})();

exports.Laser = Laser;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Laser = require("./laser").Laser;

var LaserCollection = (function () {
    function LaserCollection() {
        _classCallCheck(this, LaserCollection);

        this.maxLasers = 10;
        this.list = [];
    }

    _prototypeProperties(LaserCollection, null, {
        update: {
            value: function update() {
                var updateLaser = (function (laser, index) {
                    this.list[index].update();
                }).bind(this);

                var checkLaserBounds = (function (laser, index) {
                    if (this.list[index].settings.posY < -5) {
                        this.list.shift(); // If laser outside of top bounds remove from array
                    }
                }).bind(this);

                this.list.forEach(checkLaserBounds);
                this.list.forEach(updateLaser);
            },
            writable: true,
            configurable: true
        },
        draw: {
            value: function draw(context) {
                var draw = function draw(laser) {
                    laser.draw(context);
                };

                this.list.forEach(draw);
            },
            writable: true,
            configurable: true
        },
        fire: {
            value: function fire(posX, posY) {
                if (this.list.length < this.maxLasers) {
                    var laser = new Laser(posX, posY);
                    laser.playSound();
                    this.list.push(laser);
                }
            },
            writable: true,
            configurable: true
        }
    });

    return LaserCollection;
})();

exports.LaserCollection = LaserCollection;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"./laser":5}],7:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = require("./engine").ENGINE;

var Ship = (function () {
    function Ship(properties) {
        _classCallCheck(this, Ship);

        this.lasers = properties.lasers;

        this.settings = {
            color: "rgba(0, 0, 0, 1)",
            posX: 25,
            posY: 350,
            height: 25,
            width: 25,
            speed: 4
        };

        this.img = new Image();
        this.img.src = "App/Content/Images/spaceship.png";
    }

    _prototypeProperties(Ship, null, {
        draw: {
            value: function draw(context) {
                context.drawImage(this.img, this.settings.posX, this.settings.posY);
                this.lasers.draw(context);
            },
            writable: true,
            configurable: true
        },
        update: {
            value: function update() {
                this.lasers.update();
            },
            writable: true,
            configurable: true
        },
        fire: {
            value: function fire() {
                this.lasers.fire(this.settings.posX + 23, this.settings.posY - 5);
            },
            writable: true,
            configurable: true
        },
        moveLeft: {
            value: function moveLeft() {
                if (this.settings.posX > 0) {
                    this.settings.posX = this.settings.posX - this.settings.speed;
                }
            },
            writable: true,
            configurable: true
        },
        moveRight: {
            value: function moveRight() {
                if (this.settings.posX + this.settings.width < ENGINE.settings.canvasWidth + 70) {
                    this.settings.posX = this.settings.posX + this.settings.speed;
                }
            },
            writable: true,
            configurable: true
        },
        moveUp: {
            value: function moveUp() {
                if (this.settings.posY > 0) {
                    this.settings.posY = this.settings.posY - this.settings.speed;
                }
            },
            writable: true,
            configurable: true
        },
        moveDown: {
            value: function moveDown() {
                if (this.settings.posY < ENGINE.settings.canvasHeight - 40) {
                    this.settings.posY = this.settings.posY + this.settings.speed;
                }
            },
            writable: true,
            configurable: true
        }
    });

    return Ship;
})();

exports.Ship = Ship;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"./engine":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZENvbGxlY3Rpb24uanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyQ29sbGVjdGlvbi5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7SUNBUyxNQUFNLFdBQU8sVUFBVSxFQUF2QixNQUFNOztJQUNQLElBQUksV0FBTyxRQUFRLEVBQW5CLElBQUk7O0lBQ0osZUFBZSxXQUFPLG1CQUFtQixFQUF6QyxlQUFlOztJQUNmLGtCQUFrQixXQUFPLHNCQUFzQixFQUEvQyxrQkFBa0I7O0FBRTFCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7O0FBR2IsUUFBTSxVQUFVLEdBQUc7QUFDZixhQUFLLEVBQUUsT0FBTztBQUNkLFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtLQUNmLENBQUM7OztBQUdGLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxNQUFNLEdBQUcsUUFBUSxD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QUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNqRTthQUNKOzs7O0FBRUQsZ0JBQVE7bUJBQUEsb0JBQUc7QUFDUCxvQkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxFQUFFLEVBQUU7QUFDeEQsd0JBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNqRTthQUNKOzs7Ozs7V0FwREMsSUFBSTs7O1FBdURGLElBQUksR0FBSixJQUFJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2ltcG9ydCB7RU5HSU5FfSBmcm9tICcuL2VuZ2luZSc7XHJcbmltcG9ydCB7U2hpcH0gZnJvbSAnLi9zaGlwJztcclxuaW1wb3J0IHtMYXNlckNvbGxlY3Rpb259IGZyb20gJy4vbGFzZXJDb2xsZWN0aW9uJztcclxuaW1wb3J0IHtBc3Rlcm9pZENvbGxlY3Rpb259IGZyb20gJy4vYXN0ZXJvaWRDb2xsZWN0aW9uJztcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBFbnVtc1xyXG4gICAgY29uc3QgR0FNRV9TVEFURSA9IHtcclxuICAgICAgICBTVEFSVDogJ1NUQVJUJyxcclxuICAgICAgICBQTEFZOiAnUExBWScsXHJcbiAgICAgICAgUEFVU0U6ICdQQVVTRScsXHJcbiAgICAgICAgT1ZFUjogJ09WRVInXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdhbWUgR2xvYmFsc1xyXG4gICAgbGV0IGdhbWVTY29yZSA9IDA7XHJcbiAgICBsZXQgZ2FtZUxpdmVzID0gMztcclxuICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnR2FtZUNhbnZhcycpO1xyXG4gICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgbGV0IGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuU1RBUlQ7XHJcblxyXG4gICAgLy9yZWdpb24gR2FtZVxyXG4gICAgbGV0IHBsYXllclNoaXAgPSBuZXcgU2hpcCh7XHJcbiAgICAgICAgbGFzZXJzOiBuZXcgTGFzZXJDb2xsZWN0aW9uKClcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBhc3Rlcm9pZHMgPSBuZXcgQXN0ZXJvaWRDb2xsZWN0aW9uKCk7XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgYXN0ZXJvaWRzLmxpc3QuZm9yRWFjaChfY2hlY2tTaGlwQ29sbGlzaW9uKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2NoZWNrU2hpcENvbGxpc2lvbihhc3Rlcm9pZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKEVOR0lORS51dGlsLmNoZWNrQ29sbGlzaW9uKHBsYXllclNoaXAsIGFzdGVyb2lkKSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUxpZmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgY2hlY2tMYXNlckNvbGxpc2lvbiA9IGZ1bmN0aW9uKGxhc2VyLCBsYXNlckluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIEZvciBldmVyeSBhc3Rlcm9pZFxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdGVyb2lkcy5saXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRU5HSU5FLnV0aWwuY2hlY2tDb2xsaXNpb24obGFzZXIsIGFzdGVyb2lkcy5saXN0W2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNoaXAubGFzZXJzLmxpc3Quc3BsaWNlKGxhc2VySW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRTY29yZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5mb3JFYWNoKGNoZWNrTGFzZXJDb2xsaXNpb24pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgZ2FtZSA9IEVOR0lORS5mYWN0b3J5LmNyZWF0ZUdhbWUoe1xyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBBVVNFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoLCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KTtcclxuICAgICAgICAgICAgZHJhd1Njb3JlKCk7XHJcbiAgICAgICAgICAgIGRyYXdMaXZlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllclNoaXAuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmRyYXcoY3R4KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgLy8gR2V0IGluIGNvbGxlY3Rpb24gY2xhc3MgYW5kIHJlbW92ZSBpbXBvcnQgZm9yIEFzdGVyb2lkXHJcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgYXN0ZXJvaWRzLmFkZEFzdGVyb2lkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgMTQwIC0gKEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCAvIDEwMCkpO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lIENvbnRyb2xzXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ2xlZnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbigncmlnaHQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlUmlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ3VwJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZURvd24oKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ3NwYWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAuZmlyZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgncGF1c2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBwYXVzZUdhbWUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgnZW50ZXInLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUIHx8IGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TmV3R2FtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBIZWxwZXIgRnVuY3Rpb25zXHJcbiAgICBmdW5jdGlvbiBkcmF3U3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoaWRlU3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydE5ld0dhbWUoKSB7XHJcbiAgICAgICAgZ2FtZUxpdmVzID0gMztcclxuICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgZ2FtZVNjb3JlID0gMDtcclxuICAgICAgICBoaWRlU3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXVzZUdhbWUoKSB7XHJcbiAgICAgICAgZHJhd1BhdXNlU2NyZWVuKCk7XHJcblxyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBBVVNFO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1BhdXNlU2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1wYXVzZS1zY3JlZW4nKS50b2dnbGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmRHYW1lKCkge1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFNjb3JlKCkge1xyXG4gICAgICAgIGdhbWVTY29yZSArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdTY29yZSgpIHtcclxuICAgICAgICAkKCcuanMtc2NvcmUnKS5odG1sKCdTY29yZTonICsgZ2FtZVNjb3JlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVMaWZlKCkge1xyXG4gICAgICAgIGlmIChnYW1lTGl2ZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIGdhbWVMaXZlcyAtPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuT1ZFUjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd0xpdmVzKCkge1xyXG4gICAgICAgICQoJy5qcy1saXZlcycpLmh0bWwoJ0xpdmVzOicgKyBnYW1lTGl2ZXMpO1xyXG4gICAgfVxyXG4gICAgLy9lbmRyZWdpb25cclxufSgpKTtcclxuIiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuXHJcbmNsYXNzIEFzdGVyb2lkIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGxldCByYW5nZSA9IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigzMCwgMTAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgd2lkdGg6IHJhbmdlLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHJhbmdlLFxyXG4gICAgICAgICAgICBzcGVlZDogRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDIsIDYpXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDAgLSB0aGlzLnNldHRpbmdzLmhlaWdodCwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoKTtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLmhlaWdodCAqIC0yO1xyXG5cclxuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICdBcHAvQ29udGVudC9JbWFnZXMvYXN0ZXJvaWQtJyArIEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigxLCA0KSArICcucG5nJztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZICs9IHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7QXN0ZXJvaWR9IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuaW1wb3J0IHtBc3Rlcm9pZH0gZnJvbSAnLi9hc3Rlcm9pZCc7XHJcblxyXG5jbGFzcyBBc3Rlcm9pZENvbGxlY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGxldCBjaGVja0FzdGVyb2lkQm91bmRzID0gZnVuY3Rpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChhc3Rlcm9pZC5zZXR0aW5ncy5wb3NZID4gRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCArIDMwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZSA9IGZ1bmN0aW9uKGFzdGVyb2lkKSB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkLnVwZGF0ZSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNoZWNrQXN0ZXJvaWRCb3VuZHMpO1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgbGV0IGRyYXcgPSBmdW5jdGlvbihhc3Rlcm9pZCkge1xyXG4gICAgICAgICAgICBhc3Rlcm9pZC5kcmF3KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGRyYXcpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEFzdGVyb2lkKCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5wdXNoKG5ldyBBc3Rlcm9pZCgpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtBc3Rlcm9pZENvbGxlY3Rpb259Iiwi77u/dmFyIEVOR0lORSA9IChmdW5jdGlvbigpIHsgICAvLyBUZW1wIHVudGlsIHdlIGdldCBhIG1vZHVsZSBzeXN0ZW0gaW4gcGxhY2UgKENvbnZlcnQgdG8gYSBFUzYgbW9kdWxlKVxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGxldCBmYWN0b3J5ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNsYXNzIEdhbWUge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUgPSBwcm9wZXJ0aWVzLnVwZGF0ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcgPSBwcm9wZXJ0aWVzLmRyYXc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkcmF3KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydCgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBnYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsYXNzIEdhbWVPYmplY3Qge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBwb3NYOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1k6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWUodXBkYXRlLCBkcmF3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZSh1cGRhdGUsIGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZU9iamVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lT2JqZWN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjcmVhdGVHYW1lOiBjcmVhdGVHYW1lLFxyXG4gICAgICAgICAgICBjcmVhdGVHYW1lT2JqZWN0OiBjcmVhdGVHYW1lT2JqZWN0XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IGNvbnRyb2xzID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBldmVudEFjdGlvbnMgPSB7fTtcclxuICAgICAgICBsZXQga2V5U3RhdGUgPSB7fTtcclxuICAgICAgICBsZXQga2V5QWN0aW9uID0ge1xyXG4gICAgICAgICAgICBzcGFjZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHNwYWNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gcGF1c2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBlbnRlciBub3QgZGVmaW5lZCcpOyB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9uID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb25rZXkgPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlciA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjb250cm9sc0xvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gKFVwIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzhdIHx8IGtleVN0YXRlWzg3XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChMZWZ0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzddIHx8IGtleVN0YXRlWzY1XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKFJpZ2h0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzldIHx8IGtleVN0YXRlWzY4XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChEb3duIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbNDBdIHx8IGtleVN0YXRlWzgzXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSB0cnVlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IGZhbHNlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgLy8gRW50ZXIga2V5XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKHApIFBhdXNlXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDgwKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU3BhY2UgYmFyXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvbjpvbixcclxuICAgICAgICAgICAgb25rZXk6IG9ua2V5XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHV0aWwgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBsZXQgb2JqMVJpZ2h0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWCArIG9iajEuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBvYmoxTGVmdFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1g7XHJcbiAgICAgICAgICAgIGxldCBvYmoyUmlnaHRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYICsgb2JqMi5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajJMZWZ0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsZWZ0U2lkZUNvbGxpc2lvbigpIHx8IHJpZ2h0U2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGVmdFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKG9iajFMZWZ0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMUxlZnRTaWRlIDw9IG9iajJSaWdodFNpZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmlnaHRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9iajFSaWdodFNpZGUgPj0gb2JqMkxlZnRTaWRlICYmIG9iajFSaWdodFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChvYmoxLnNldHRpbmdzLnBvc1kgPj0gb2JqMi5zZXR0aW5ncy5wb3NZICYmIG9iajEuc2V0dGluZ3MucG9zWSA8PSBvYmoyLnNldHRpbmdzLnBvc1kgKyBvYmoyLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpICYmIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tTnVtYmVyKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGxldCBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gJyMnO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTUpXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2hlY2tDb2xsaXNpb246IGNoZWNrQ29sbGlzaW9uLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21OdW1iZXI6IGdldFJhbmRvbU51bWJlcixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tQ29sb3I6IGdldFJhbmRvbUNvbG9yXHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHNldHRpbmdzID0ge1xyXG4gICAgICAgIGNhbnZhc1dpZHRoOiA3MjAsXHJcbiAgICAgICAgY2FudmFzSGVpZ2h0OiA0ODBcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB1dGlsOiB1dGlsLFxyXG4gICAgICAgIGZhY3Rvcnk6IGZhY3RvcnksXHJcbiAgICAgICAgY29udHJvbHM6IGNvbnRyb2xzLFxyXG4gICAgICAgIHNldHRpbmdzOiBzZXR0aW5nc1xyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbmV4cG9ydCB7RU5HSU5FfSIsImNsYXNzIExhc2VyIHtcclxuICAgIGNvbnN0cnVjdG9yIChvcmlnaW5YLCBvcmlnaW5ZKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgcG9zWDogb3JpZ2luWCxcclxuICAgICAgICAgICAgcG9zWTogb3JpZ2luWSxcclxuICAgICAgICAgICAgd2lkdGg6IDQuNSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyNVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc291bmQgPSBuZXcgd2luZG93Lkhvd2woe1xyXG4gICAgICAgICAgICB1cmxzOiBbJ0FwcC9Db250ZW50L0F1ZGlvL2xhc2VyLm1wMyddXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDBmZjAwJzsgLy9FTkdJTkUudXRpbC5nZXRSYW5kb21Db2xvcigpO1xyXG4gICAgICAgIGNvbnRleHQuYXJjKHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSAtPSA1LjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlTb3VuZCgpIHtcclxuICAgICAgICB0aGlzLnNvdW5kLnBsYXkoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtMYXNlcn0iLCJpbXBvcnQge0xhc2VyfSBmcm9tICcuL2xhc2VyJztcclxuXHJcbmNsYXNzIExhc2VyQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1heExhc2VycyA9IDEwO1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgdXBkYXRlTGFzZXIgPSBmdW5jdGlvbihsYXNlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0W2luZGV4XS51cGRhdGUoKTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIGxldCBjaGVja0xhc2VyQm91bmRzID0gZnVuY3Rpb24obGFzZXIsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxpc3RbaW5kZXhdLnNldHRpbmdzLnBvc1kgPCAtNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnNoaWZ0KCk7IC8vIElmIGxhc2VyIG91dHNpZGUgb2YgdG9wIGJvdW5kcyByZW1vdmUgZnJvbSBhcnJheVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjaGVja0xhc2VyQm91bmRzKTtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaCh1cGRhdGVMYXNlcik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgbGV0IGRyYXcgPSBmdW5jdGlvbihsYXNlcikge1xyXG4gICAgICAgICAgICBsYXNlci5kcmF3KGNvbnRleHQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGRyYXcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUocG9zWCwgcG9zWSkge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3QubGVuZ3RoIDwgdGhpcy5tYXhMYXNlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGxhc2VyID0gbmV3IExhc2VyKHBvc1gsIHBvc1kpO1xyXG4gICAgICAgICAgICBsYXNlci5wbGF5U291bmQoKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0LnB1c2gobGFzZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtMYXNlckNvbGxlY3Rpb259IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuXHJcbmNsYXNzIFNoaXAge1xyXG4gICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXHJcbiAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICBwb3NZOiAzNTAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjUsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgc3BlZWQ6IDRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICdBcHAvQ29udGVudC9JbWFnZXMvc3BhY2VzaGlwLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICB0aGlzLmxhc2Vycy5kcmF3KGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmxhc2Vycy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmZpcmUodGhpcy5zZXR0aW5ncy5wb3NYICsgMjMsIHRoaXMuc2V0dGluZ3MucG9zWSAtIDUpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCArIDcwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge1NoaXB9Il19
