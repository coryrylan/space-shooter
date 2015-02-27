(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Ship = _interopRequire(require("./ship"));

var LaserCollection = _interopRequire(require("./lasers"));

var Asteroid = _interopRequire(require("./asteroid"));

var AsteroidCollection = _interopRequire(require("./asteroids"));

var ENGINE = _interopRequire(require("./engine"));

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

    var CANVAS_WIDTH = 720;
    var CANVAS_HEIGHT = 480;

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
            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            drawScore();
            drawLives();

            if (gameState === GAME_STATE.START) {
                drawStartScreen();
            } else if (gameState === GAME_STATE.PLAY) {
                playerShip.draw(ctx);
                asteroids.draw(ctx);
            } else if (gameState === GAME_STATE.PAUSE) {} else if (gameState === GAME_STATE.OVER) {
                endGame();
            } else {
                drawStartScreen();
            }
        }
    });

    game.start();

    setInterval(function () {
        if (gameState === GAME_STATE.PLAY) {
            asteroids.list.push(new Asteroid());
        }
    }, 140 - CANVAS_WIDTH / 100);
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

},{"./asteroid":2,"./asteroids":3,"./engine":4,"./lasers":5,"./ship":6}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = _interopRequire(require("./engine"));

(function () {
    "use strict";

    var CANVAS_WIDTH = 720;
    var CANVAS_HEIGHT = 480;

    module.exports = (function () {
        function Asteroid() {
            _classCallCheck(this, Asteroid);

            var range = ENGINE.util.getRandomNumber(30, 100);

            this.settings = {
                width: range,
                height: range,
                speed: ENGINE.util.getRandomNumber(2, 6)
            };

            this.settings.posX = ENGINE.util.getRandomNumber(0 - this.settings.height, CANVAS_WIDTH);
            this.settings.posY = this.settings.height * -2;

            this.img = new Image();
            this.img.src = "App/Content/Images/asteroid-" + ENGINE.util.getRandomNumber(1, 4) + ".png";
        }

        _prototypeProperties(Asteroid, null, {
            draw: {
                value: function draw(context) {
                    context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);

                    //this.img.onload = function() {
                    //    ctx.drawImage(this.img, this.settings.posX, this.settings.posY);
                    //}.bind(this);
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
})();

},{"./engine":4}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = _interopRequire(require("./engine"));

(function () {
    "use strict";

    var CANVAS_WIDTH = 720;
    var CANVAS_HEIGHT = 480;

    module.exports = (function () {
        function AsteroidCollection() {
            _classCallCheck(this, AsteroidCollection);

            this.list = [];
        }

        _prototypeProperties(AsteroidCollection, null, {
            update: {
                value: function update() {
                    var checkAsteroidBounds = (function (asteroid, index) {
                        if (asteroid.settings.posY > CANVAS_HEIGHT + 30) {
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
            }
        });

        return AsteroidCollection;
    })();
})();

},{"./engine":4}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

(function () {
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

    var ENGINE = {
        util: util,
        factory: factory,
        controls: controls
    };

    module.exports = ENGINE;
})();

},{}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

//import Laser from './lasers';

(function () {
    "use strict";

    var Laser = (function () {
        function Laser(originX, originY) {
            _classCallCheck(this, Laser);

            this.settings = {
                posX: originX,
                posY: originY,
                width: 4.5,
                height: 25
            };
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
                    var sound = new Howl({
                        urls: ["App/Content/Audio/laser.mp3"]
                    });

                    //sound.play();
                },
                writable: true,
                configurable: true
            }
        });

        return Laser;
    })();

    module.exports = (function () {
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
})();

},{}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

(function () {
    "use strict";

    var CANVAS_WIDTH = 720;
    var CANVAS_HEIGHT = 480;

    module.exports = (function () {
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

                    //this.img.onload = function() {
                    //    context.drawImage(this.img, this.settings.posX, this.settings.posY);
                    //}.bind(this);
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
                    if (this.settings.posX + this.settings.width < CANVAS_WIDTH + 70) {
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
                    if (this.settings.posY < CANVAS_HEIGHT - 40) {
                        this.settings.posY = this.settings.posY + this.settings.speed;
                    }
                },
                writable: true,
                configurable: true
            }
        });

        return Ship;
    })();
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZHMuanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2Vycy5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztJQ0FRLElBQUksMkJBQU0sUUFBUTs7SUFDbkIsZUFBZSwyQkFBTSxVQUFVOztJQUMvQixRQUFRLDJCQUFNLFlBQVk7O0lBQzFCLGtCQUFrQiwyQkFBTSxhQUFhOztJQUNyQyxNQUFNLDJCQUFNLFVBQVU7O0FBRzdCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7O0FBR2IsUUFBTSxVQUFVLEdBQUc7QUFDZixhQUFLLEVBQUUsT0FBTztBQUNkLFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtLQUNmLENBQUM7OztBQUdGLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuRCxRQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xD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QUFDO3FCQUNqRTtpQkFDSjs7OztBQUVELG9CQUFRO3VCQUFBLG9CQUFHO0FBQ1Asd0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsYUFBYSxHQUFHLEVBQUUsRUFBRTtBQUN6Qyw0QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7cUJBQ2pFO2lCQUNKOzs7Ozs7ZUF4RGtCLElBQUk7UUF5RDFCLENBQUE7Q0FDSixDQUFBLEVBQUUsQ0FBRSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu79pbXBvcnQgU2hpcCBmcm9tICcuL3NoaXAnO1xyXG5pbXBvcnQgTGFzZXJDb2xsZWN0aW9uIGZyb20gJy4vbGFzZXJzJztcclxuaW1wb3J0IEFzdGVyb2lkIGZyb20gJy4vYXN0ZXJvaWQnO1xyXG5pbXBvcnQgQXN0ZXJvaWRDb2xsZWN0aW9uIGZyb20gJy4vYXN0ZXJvaWRzJztcclxuaW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICBjb25zdCBDQU5WQVNfV0lEVEggPSA3MjA7XHJcbiAgICBjb25zdCBDQU5WQVNfSEVJR0hUID0gNDgwO1xyXG5cclxuICAgIC8vcmVnaW9uIEdhbWVcclxuICAgIGxldCBwbGF5ZXJTaGlwID0gbmV3IFNoaXAoe1xyXG4gICAgICAgIGxhc2VyczogbmV3IExhc2VyQ29sbGVjdGlvbigpXHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgYXN0ZXJvaWRzID0gbmV3IEFzdGVyb2lkQ29sbGVjdGlvbigpO1xyXG5cclxuICAgIGxldCBjaGVja1NoaXBBbmRBc3Rlcm9pZENvbGxpc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFzdGVyb2lkcy5saXN0LmZvckVhY2goX2NoZWNrU2hpcENvbGxpc2lvbik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9jaGVja1NoaXBDb2xsaXNpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihwbGF5ZXJTaGlwLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaWZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGVja0xhc2VyQ29sbGlzaW9uID0gZnVuY3Rpb24obGFzZXIsIGxhc2VySW5kZXgpIHtcclxuICAgICAgICAgICAgLy8gRm9yIGV2ZXJ5IGFzdGVyb2lkXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0ZXJvaWRzLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihsYXNlciwgYXN0ZXJvaWRzLmxpc3RbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5zcGxpY2UobGFzZXJJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZFNjb3JlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goY2hlY2tMYXNlckNvbGxpc2lvbik7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRU5HSU5FLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xyXG4gICAgICAgICAgICBkcmF3U2NvcmUoKTtcclxuICAgICAgICAgICAgZHJhd0xpdmVzKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUKSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3U3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5kcmF3KGN0eCk7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QQVVTRSkge1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnB1c2gobmV3IEFzdGVyb2lkKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIDE0MCAtIChDQU5WQVNfV0lEVEggLyAxMDApKTtcclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gR2FtZSBDb250cm9sc1xyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdsZWZ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZUxlZnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ3JpZ2h0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCd1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVVcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbignZG93bicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVEb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdzcGFjZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLmZpcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ3BhdXNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcGF1c2VHYW1lKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ2VudGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCB8fCBnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICBzdGFydE5ld0dhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gSGVscGVyIEZ1bmN0aW9uc1xyXG4gICAgZnVuY3Rpb24gZHJhd1N0YXJ0U2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1zdGFydC1zY3JlZW4nKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGlkZVN0YXJ0U2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1zdGFydC1zY3JlZW4nKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnROZXdHYW1lKCkge1xyXG4gICAgICAgIGdhbWVMaXZlcyA9IDM7XHJcbiAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QTEFZO1xyXG4gICAgICAgIGdhbWVTY29yZSA9IDA7XHJcbiAgICAgICAgaGlkZVN0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgJCgnLmpzLWdhbWUtb3Zlci1zY3JlZW4nKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGF1c2VHYW1lKCkge1xyXG4gICAgICAgIGRyYXdQYXVzZVNjcmVlbigpO1xyXG5cclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QQVVTRTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdQYXVzZVNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtcGF1c2Utc2NyZWVuJykudG9nZ2xlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRTY29yZSgpIHtcclxuICAgICAgICBnYW1lU2NvcmUgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3U2NvcmUoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjb3JlJykuaHRtbCgnU2NvcmU6JyArIGdhbWVTY29yZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlmZSgpIHtcclxuICAgICAgICBpZiAoZ2FtZUxpdmVzID4gMCkge1xyXG4gICAgICAgICAgICBnYW1lTGl2ZXMgLT0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLk9WRVI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdMaXZlcygpIHtcclxuICAgICAgICAkKCcuanMtbGl2ZXMnKS5odG1sKCdMaXZlczonICsgZ2FtZUxpdmVzKTtcclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcbn0oKSk7XHJcbiIsImltcG9ydCBFTkdJTkUgZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNvbnN0IENBTlZBU19XSURUSCA9IDcyMDtcclxuICAgIGNvbnN0IENBTlZBU19IRUlHSFQgPSA0ODA7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBBc3Rlcm9pZCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5nZSA9IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigzMCwgMTAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogcmFuZ2UsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHJhbmdlLFxyXG4gICAgICAgICAgICAgICAgc3BlZWQ6IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigyLCA2KVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDAgLSB0aGlzLnNldHRpbmdzLmhlaWdodCwgQ0FOVkFTX1dJRFRIKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5oZWlnaHQgKiAtMjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nLnNyYyA9ICdBcHAvQ29udGVudC9JbWFnZXMvYXN0ZXJvaWQtJyArIEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigxLCA0KSArICcucG5nJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICAgICAgLy99LmJpbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSArPSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0oKSk7IiwiaW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY29uc3QgQ0FOVkFTX1dJRFRIID0gNzIwO1xyXG4gICAgY29uc3QgQ0FOVkFTX0hFSUdIVCA9IDQ4MDtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEFzdGVyb2lkQ29sbGVjdGlvbiB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICBsZXQgY2hlY2tBc3Rlcm9pZEJvdW5kcyA9IGZ1bmN0aW9uKGFzdGVyb2lkLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFzdGVyb2lkLnNldHRpbmdzLnBvc1kgPiBDQU5WQVNfSEVJR0hUICsgMzApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVwZGF0ZSA9IGZ1bmN0aW9uKGFzdGVyb2lkKSB7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZC51cGRhdGUoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNoZWNrQXN0ZXJvaWRCb3VuZHMpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaCh1cGRhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGxldCBkcmF3ID0gZnVuY3Rpb24oYXN0ZXJvaWQpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChkcmF3KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyIsIu+7vyhmdW5jdGlvbigpIHsgICAvLyBUZW1wIHVudGlsIHdlIGdldCBhIG1vZHVsZSBzeXN0ZW0gaW4gcGxhY2UgKENvbnZlcnQgdG8gYSBFUzYgbW9kdWxlKVxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGxldCBmYWN0b3J5ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNsYXNzIEdhbWUge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUgPSBwcm9wZXJ0aWVzLnVwZGF0ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcgPSBwcm9wZXJ0aWVzLmRyYXc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkcmF3KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydCgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBnYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsYXNzIEdhbWVPYmplY3Qge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBwb3NYOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1k6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWUodXBkYXRlLCBkcmF3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZSh1cGRhdGUsIGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZU9iamVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lT2JqZWN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjcmVhdGVHYW1lOiBjcmVhdGVHYW1lLFxyXG4gICAgICAgICAgICBjcmVhdGVHYW1lT2JqZWN0OiBjcmVhdGVHYW1lT2JqZWN0XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IGNvbnRyb2xzID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBldmVudEFjdGlvbnMgPSB7fTtcclxuICAgICAgICBsZXQga2V5U3RhdGUgPSB7fTtcclxuICAgICAgICBsZXQga2V5QWN0aW9uID0ge1xyXG4gICAgICAgICAgICBzcGFjZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHNwYWNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gcGF1c2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBlbnRlciBub3QgZGVmaW5lZCcpOyB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9uID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb25rZXkgPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlciA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjb250cm9sc0xvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gKFVwIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzhdIHx8IGtleVN0YXRlWzg3XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChMZWZ0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzddIHx8IGtleVN0YXRlWzY1XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKFJpZ2h0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzldIHx8IGtleVN0YXRlWzY4XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChEb3duIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbNDBdIHx8IGtleVN0YXRlWzgzXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSB0cnVlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IGZhbHNlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgLy8gRW50ZXIga2V5XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKHApIFBhdXNlXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDgwKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU3BhY2UgYmFyXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvbjpvbixcclxuICAgICAgICAgICAgb25rZXk6IG9ua2V5XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHV0aWwgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBsZXQgb2JqMVJpZ2h0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWCArIG9iajEuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBvYmoxTGVmdFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1g7XHJcbiAgICAgICAgICAgIGxldCBvYmoyUmlnaHRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYICsgb2JqMi5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajJMZWZ0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsZWZ0U2lkZUNvbGxpc2lvbigpIHx8IHJpZ2h0U2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGVmdFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKG9iajFMZWZ0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMUxlZnRTaWRlIDw9IG9iajJSaWdodFNpZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmlnaHRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9iajFSaWdodFNpZGUgPj0gb2JqMkxlZnRTaWRlICYmIG9iajFSaWdodFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChvYmoxLnNldHRpbmdzLnBvc1kgPj0gb2JqMi5zZXR0aW5ncy5wb3NZICYmIG9iajEuc2V0dGluZ3MucG9zWSA8PSBvYmoyLnNldHRpbmdzLnBvc1kgKyBvYmoyLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpICYmIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tTnVtYmVyKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGxldCBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gJyMnO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTUpXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2hlY2tDb2xsaXNpb246IGNoZWNrQ29sbGlzaW9uLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21OdW1iZXI6IGdldFJhbmRvbU51bWJlcixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tQ29sb3I6IGdldFJhbmRvbUNvbG9yXHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IEVOR0lORSA9IHtcclxuICAgICAgICB1dGlsOiB1dGlsLFxyXG4gICAgICAgIGZhY3Rvcnk6IGZhY3RvcnksXHJcbiAgICAgICAgY29udHJvbHM6IGNvbnRyb2xzXHJcbiAgICB9O1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gRU5HSU5FO1xyXG59KCkpOyIsIi8vaW1wb3J0IExhc2VyIGZyb20gJy4vbGFzZXJzJztcclxuXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY2xhc3MgTGFzZXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yIChvcmlnaW5YLCBvcmlnaW5ZKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICBwb3NYOiBvcmlnaW5YLFxyXG4gICAgICAgICAgICAgICAgcG9zWTogb3JpZ2luWSxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiA0LjUsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDI1XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwZmYwMCc7Ly9FTkdJTkUudXRpbC5nZXRSYW5kb21Db2xvcigpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmFyYyh0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSwgdGhpcy5zZXR0aW5ncy53aWR0aCwgdGhpcy5zZXR0aW5ncy5oZWlnaHQsIE1hdGguUEkgKiAyLCB0cnVlKTtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSAtPSA1LjA1O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcGxheVNvdW5kKCkge1xyXG4gICAgICAgICAgICBsZXQgc291bmQgPSBuZXcgSG93bCh7XHJcbiAgICAgICAgICAgICAgICB1cmxzOiBbJ0FwcC9Db250ZW50L0F1ZGlvL2xhc2VyLm1wMyddXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy9zb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgTGFzZXJDb2xsZWN0aW9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXhMYXNlcnMgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGxldCB1cGRhdGVMYXNlciA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0W2luZGV4XS51cGRhdGUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoZWNrTGFzZXJCb3VuZHMgPSBmdW5jdGlvbihsYXNlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpc3RbaW5kZXhdLnNldHRpbmdzLnBvc1kgPCAtNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zaGlmdCgpOyAvLyBJZiBsYXNlciBvdXRzaWRlIG9mIHRvcCBib3VuZHMgcmVtb3ZlIGZyb20gYXJyYXlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tMYXNlckJvdW5kcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZUxhc2VyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgICAgICBsZXQgZHJhdyA9IGZ1bmN0aW9uKGxhc2VyKSB7XHJcbiAgICAgICAgICAgICAgICBsYXNlci5kcmF3KGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaXJlKHBvc1gsIHBvc1kpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdC5sZW5ndGggPCB0aGlzLm1heExhc2Vycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc2VyID0gbmV3IExhc2VyKHBvc1gsIHBvc1kpO1xyXG4gICAgICAgICAgICAgICAgbGFzZXIucGxheVNvdW5kKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYXNlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNvbnN0IENBTlZBU19XSURUSCA9IDcyMDtcclxuICAgIGNvbnN0IENBTlZBU19IRUlHSFQgPSA0ODA7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTaGlwIHtcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDEpJyxcclxuICAgICAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICAgICAgcG9zWTogMzUwLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAyNSxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgICAgIHNwZWVkOiA0XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmltZy5zcmMgPSAnQXBwL0NvbnRlbnQvSW1hZ2VzL3NwYWNlc2hpcC5wbmcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSk7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzLmRyYXcoY29udGV4dCk7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1kpO1xyXG4gICAgICAgICAgICAvL30uYmluZCh0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXNlcnMudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaXJlKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxhc2Vycy5maXJlKHRoaXMuc2V0dGluZ3MucG9zWCArIDIzLCB0aGlzLnNldHRpbmdzLnBvc1kgLSA1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IENBTlZBU19XSURUSCArIDcwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSB0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWSA8IENBTlZBU19IRUlHSFQgLSA0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTsiXX0=
