(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Ship = _interopRequire(require("./ship"));

//import Laser from './lasers';

var LaserCollection = _interopRequire(require("./lasers"));

var _asteroids = require("./asteroids");

var Asteroid = _interopRequire(_asteroids);

var AsteroidCollection = _interopRequire(_asteroids);

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

},{"./asteroids":2,"./engine":3,"./lasers":4,"./ship":5}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

window.AsteroidCollection = (function () {
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

(function () {
    "use strict";

    var Howl = window.Howl;

    module.exports = (function () {
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
                    context.fillStyle = ENGINE.util.getRandomColor();
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
})();

(function () {
    "use strict";

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

},{}],5:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZHMuanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2Vycy5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztJQ0FRLElBQUksMkJBQU0sUUFBUTs7OztJQUVuQixlQUFlLDJCQUFNLFVBQVU7O3lCQUNqQixhQUFhOztJQUEzQixRQUFROztJQUNSLGtCQUFrQjs7SUFDbEIsTUFBTSwyQkFBTSxVQUFVOztBQUc3QixBQUFDLENBQUEsWUFBVztBQUNSLGdCQUFZLENBQUM7OztBQUdiLFFBQU0sVUFBVSxHQUFHO0FBQ2YsYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtBQUNaLGFBQUssRUFBRSxPQUFPO0FBQ2QsWUFBSSxFQUFFLE1BQU07S0FDZixDQUFDOzs7QUFHRixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbkQsUUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQyxRQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDOztBQUVqQyxRQUFNLFlBQVksR0FBRyxHQUFHLENB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QUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO3FCQUNqRTtpQkFDSjs7OztBQUVELG9CQUFRO3VCQUFBLG9CQUFHO0FBQ1Asd0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsYUFBYSxHQUFHLEVBQUUsRUFBRTtBQUN6Qyw0QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7cUJBQ2pFO2lCQUNKOzs7Ozs7ZUF4RGtCLElBQUk7UUF5RDFCLENBQUE7Q0FDSixDQUFBLEVBQUUsQ0FBRSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu79pbXBvcnQgU2hpcCBmcm9tICcuL3NoaXAnO1xyXG4vL2ltcG9ydCBMYXNlciBmcm9tICcuL2xhc2Vycyc7XHJcbmltcG9ydCBMYXNlckNvbGxlY3Rpb24gZnJvbSAnLi9sYXNlcnMnO1xyXG5pbXBvcnQgQXN0ZXJvaWQgZnJvbSAnLi9hc3Rlcm9pZHMnO1xyXG5pbXBvcnQgQXN0ZXJvaWRDb2xsZWN0aW9uIGZyb20gJy4vYXN0ZXJvaWRzJztcclxuaW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICBjb25zdCBDQU5WQVNfV0lEVEggPSA3MjA7XHJcbiAgICBjb25zdCBDQU5WQVNfSEVJR0hUID0gNDgwO1xyXG5cclxuICAgIC8vcmVnaW9uIEdhbWVcclxuICAgIGxldCBwbGF5ZXJTaGlwID0gbmV3IFNoaXAoe1xyXG4gICAgICAgIGxhc2VyczogbmV3IExhc2VyQ29sbGVjdGlvbigpXHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgYXN0ZXJvaWRzID0gbmV3IEFzdGVyb2lkQ29sbGVjdGlvbigpO1xyXG5cclxuICAgIGxldCBjaGVja1NoaXBBbmRBc3Rlcm9pZENvbGxpc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFzdGVyb2lkcy5saXN0LmZvckVhY2goX2NoZWNrU2hpcENvbGxpc2lvbik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9jaGVja1NoaXBDb2xsaXNpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihwbGF5ZXJTaGlwLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaWZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGVja0xhc2VyQ29sbGlzaW9uID0gZnVuY3Rpb24obGFzZXIsIGxhc2VySW5kZXgpIHtcclxuICAgICAgICAgICAgLy8gRm9yIGV2ZXJ5IGFzdGVyb2lkXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0ZXJvaWRzLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihsYXNlciwgYXN0ZXJvaWRzLmxpc3RbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5zcGxpY2UobGFzZXJJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZFNjb3JlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goY2hlY2tMYXNlckNvbGxpc2lvbik7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRU5HSU5FLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xyXG4gICAgICAgICAgICBkcmF3U2NvcmUoKTtcclxuICAgICAgICAgICAgZHJhd0xpdmVzKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUKSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3U3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5kcmF3KGN0eCk7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QQVVTRSkge1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnB1c2gobmV3IEFzdGVyb2lkKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIDE0MCAtIChDQU5WQVNfV0lEVEggLyAxMDApKTtcclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gR2FtZSBDb250cm9sc1xyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdsZWZ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZUxlZnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ3JpZ2h0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCd1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVVcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbignZG93bicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVEb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdzcGFjZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLmZpcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ3BhdXNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcGF1c2VHYW1lKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ2VudGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCB8fCBnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICBzdGFydE5ld0dhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gSGVscGVyIEZ1bmN0aW9uc1xyXG4gICAgZnVuY3Rpb24gZHJhd1N0YXJ0U2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1zdGFydC1zY3JlZW4nKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGlkZVN0YXJ0U2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1zdGFydC1zY3JlZW4nKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnROZXdHYW1lKCkge1xyXG4gICAgICAgIGdhbWVMaXZlcyA9IDM7XHJcbiAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QTEFZO1xyXG4gICAgICAgIGdhbWVTY29yZSA9IDA7XHJcbiAgICAgICAgaGlkZVN0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgJCgnLmpzLWdhbWUtb3Zlci1zY3JlZW4nKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGF1c2VHYW1lKCkge1xyXG4gICAgICAgIGRyYXdQYXVzZVNjcmVlbigpO1xyXG5cclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QQVVTRTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdQYXVzZVNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtcGF1c2Utc2NyZWVuJykudG9nZ2xlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRTY29yZSgpIHtcclxuICAgICAgICBnYW1lU2NvcmUgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3U2NvcmUoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjb3JlJykuaHRtbCgnU2NvcmU6JyArIGdhbWVTY29yZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlmZSgpIHtcclxuICAgICAgICBpZiAoZ2FtZUxpdmVzID4gMCkge1xyXG4gICAgICAgICAgICBnYW1lTGl2ZXMgLT0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLk9WRVI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdMaXZlcygpIHtcclxuICAgICAgICAkKCcuanMtbGl2ZXMnKS5odG1sKCdMaXZlczonICsgZ2FtZUxpdmVzKTtcclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjb25zdCBDQU5WQVNfV0lEVEggPSA3MjA7XHJcbiAgICBjb25zdCBDQU5WQVNfSEVJR0hUID0gNDgwO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgQXN0ZXJvaWQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBsZXQgcmFuZ2UgPSBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMzAsIDEwMCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHJhbmdlLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiByYW5nZSxcclxuICAgICAgICAgICAgICAgIHNwZWVkOiBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMiwgNilcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigwIC0gdGhpcy5zZXR0aW5ncy5oZWlnaHQsIENBTlZBU19XSURUSCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MuaGVpZ2h0ICogLTI7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmltZy5zcmMgPSAnQXBwL0NvbnRlbnQvSW1hZ2VzL2FzdGVyb2lkLScgKyBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMSwgNCkgKyAnLnBuZyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAgICBjdHguZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSk7XHJcbiAgICAgICAgICAgIC8vfS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgKz0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxud2luZG93LkFzdGVyb2lkQ29sbGVjdGlvbiA9IChmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjb25zdCBDQU5WQVNfV0lEVEggPSA3MjA7XHJcbiAgICBjb25zdCBDQU5WQVNfSEVJR0hUID0gNDgwO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgQXN0ZXJvaWRDb2xsZWN0aW9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGVja0FzdGVyb2lkQm91bmRzID0gZnVuY3Rpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXN0ZXJvaWQuc2V0dGluZ3MucG9zWSA+IENBTlZBU19IRUlHSFQgKyAzMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdXBkYXRlID0gZnVuY3Rpb24oYXN0ZXJvaWQpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tBc3Rlcm9pZEJvdW5kcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgbGV0IGRyYXcgPSBmdW5jdGlvbihhc3Rlcm9pZCkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWQuZHJhdyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGRyYXcpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0oKSk7Iiwi77u/KGZ1bmN0aW9uKCkgeyAgIC8vIFRlbXAgdW50aWwgd2UgZ2V0IGEgbW9kdWxlIHN5c3RlbSBpbiBwbGFjZSAoQ29udmVydCB0byBhIEVTNiBtb2R1bGUpXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IGZhY3RvcnkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xhc3MgR2FtZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSA9IHByb3BlcnRpZXMudXBkYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdyA9IHByb3BlcnRpZXMuZHJhdztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRyYXcoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdhbWVMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xhc3MgR2FtZU9iamVjdCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1g6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZSh1cGRhdGUsIGRyYXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lKHVwZGF0ZSwgZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lT2JqZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWVPYmplY3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWU6IGNyZWF0ZUdhbWUsXHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWVPYmplY3Q6IGNyZWF0ZUdhbWVPYmplY3RcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgY29udHJvbHMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50QWN0aW9ucyA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlTdGF0ZSA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlBY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIHNwYWNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gc3BhY2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBwYXVzZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIGVudGVyIG5vdCBkZWZpbmVkJyk7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb24gPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbmtleSA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRyb2xzTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAoVXAgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOF0gfHwga2V5U3RhdGVbODddKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKExlZnQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszN10gfHwga2V5U3RhdGVbNjVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoUmlnaHQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOV0gfHwga2V5U3RhdGVbNjhdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKERvd24gQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVs0MF0gfHwga2V5U3RhdGVbODNdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93bigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IHRydWU7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAvLyBFbnRlciBrZXlcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAocCkgUGF1c2VcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gODApIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTcGFjZSBiYXJcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9uOm9uLFxyXG4gICAgICAgICAgICBvbmtleTogb25rZXlcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgdXRpbCA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBmdW5jdGlvbiBfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGxldCBvYmoxUmlnaHRTaWRlID0gb2JqMS5zZXR0aW5ncy5wb3NYICsgb2JqMS5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajFMZWZ0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWDtcclxuICAgICAgICAgICAgbGV0IG9iajJSaWdodFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1ggKyBvYmoyLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICBsZXQgb2JqMkxlZnRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxlZnRTaWRlQ29sbGlzaW9uKCkgfHwgcmlnaHRTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBsZWZ0U2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICgob2JqMUxlZnRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxTGVmdFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByaWdodFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqMVJpZ2h0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMVJpZ2h0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja1RvcFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9iajEuc2V0dGluZ3MucG9zWSA+PSBvYmoyLnNldHRpbmdzLnBvc1kgJiYgb2JqMS5zZXR0aW5ncy5wb3NZIDw9IG9iajIuc2V0dGluZ3MucG9zWSArIG9iajIuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikgJiYgX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21OdW1iZXIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICAgICAgbGV0IGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSAnIyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxNSldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjaGVja0NvbGxpc2lvbjogY2hlY2tDb2xsaXNpb24sXHJcbiAgICAgICAgICAgIGdldFJhbmRvbU51bWJlcjogZ2V0UmFuZG9tTnVtYmVyLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21Db2xvcjogZ2V0UmFuZG9tQ29sb3JcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgRU5HSU5FID0ge1xyXG4gICAgICAgIHV0aWw6IHV0aWwsXHJcbiAgICAgICAgZmFjdG9yeTogZmFjdG9yeSxcclxuICAgICAgICBjb250cm9sczogY29udHJvbHNcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFTkdJTkU7XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGxldCBIb3dsID0gd2luZG93Lkhvd2w7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMYXNlciB7XHJcbiAgICAgICAgY29uc3RydWN0b3IgKG9yaWdpblgsIG9yaWdpblkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgIHBvc1g6IG9yaWdpblgsXHJcbiAgICAgICAgICAgICAgICBwb3NZOiBvcmlnaW5ZLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IDQuNSxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogMjVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IEVOR0lORS51dGlsLmdldFJhbmRvbUNvbG9yKCk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuYXJjKHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmZpbGwoKTtcclxuICAgICAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZIC09IDUuMDU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwbGF5U291bmQoKSB7XHJcbiAgICAgICAgICAgIGxldCBzb3VuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgICAgIHVybHM6IFsnQXBwL0NvbnRlbnQvQXVkaW8vbGFzZXIubXAzJ11cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvL3NvdW5kLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMYXNlckNvbGxlY3Rpb24ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLm1heExhc2VycyA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgbGV0IHVwZGF0ZUxhc2VyID0gZnVuY3Rpb24obGFzZXIsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RbaW5kZXhdLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hlY2tMYXNlckJvdW5kcyA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGlzdFtpbmRleF0uc2V0dGluZ3MucG9zWSA8IC01KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnNoaWZ0KCk7IC8vIElmIGxhc2VyIG91dHNpZGUgb2YgdG9wIGJvdW5kcyByZW1vdmUgZnJvbSBhcnJheVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjaGVja0xhc2VyQm91bmRzKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2godXBkYXRlTGFzZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGxldCBkcmF3ID0gZnVuY3Rpb24obGFzZXIpIHtcclxuICAgICAgICAgICAgICAgIGxhc2VyLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChkcmF3KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZpcmUocG9zWCwgcG9zWSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saXN0Lmxlbmd0aCA8IHRoaXMubWF4TGFzZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzZXIgPSBuZXcgTGFzZXIocG9zWCwgcG9zWSk7XHJcbiAgICAgICAgICAgICAgICBsYXNlci5wbGF5U291bmQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5wdXNoKGxhc2VyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY29uc3QgQ0FOVkFTX1dJRFRIID0gNzIwO1xyXG4gICAgY29uc3QgQ0FOVkFTX0hFSUdIVCA9IDQ4MDtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNoaXAge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXNlcnMgPSBwcm9wZXJ0aWVzLmxhc2VycztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMSknLFxyXG4gICAgICAgICAgICAgICAgcG9zWDogMjUsXHJcbiAgICAgICAgICAgICAgICBwb3NZOiAzNTAsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDI1LFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IDI1LFxyXG4gICAgICAgICAgICAgICAgc3BlZWQ6IDRcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nLnNyYyA9ICdBcHAvQ29udGVudC9JbWFnZXMvc3BhY2VzaGlwLnBuZyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICAgICAgdGhpcy5sYXNlcnMuZHJhdyhjb250ZXh0KTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5pbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSk7XHJcbiAgICAgICAgICAgIC8vfS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxhc2Vycy51cGRhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZpcmUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzLmZpcmUodGhpcy5zZXR0aW5ncy5wb3NYICsgMjMsIHRoaXMuc2V0dGluZ3MucG9zWSAtIDUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSB0aGlzLnNldHRpbmdzLnBvc1ggLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb3ZlUmlnaHQoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLndpZHRoIDwgQ0FOVkFTX1dJRFRIICsgNzApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vdmVVcCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZIDwgQ0FOVkFTX0hFSUdIVCAtIDQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgKyB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpOyJdfQ==
