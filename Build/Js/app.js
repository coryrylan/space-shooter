(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var ENGINE = _interopRequire(require("./engine"));

var Ship = _interopRequire(require("./ship"));

var LaserCollection = _interopRequire(require("./laserCollection"));

var AsteroidCollection = _interopRequire(require("./asteroidCollection"));

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

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = _interopRequire(require("./engine"));

(function () {
    "use strict";

    module.exports = (function () {
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
})();

},{"./engine":4}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = _interopRequire(require("./engine"));

var Asteroid = _interopRequire(require("./asteroid"));

(function () {
    "use strict";

    module.exports = (function () {
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
})();

},{"./asteroid":2,"./engine":4}],4:[function(require,module,exports){
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

    var settings = {
        canvasWidth: 720,
        canvasHeight: 480
    };

    var ENGINE = {
        util: util,
        factory: factory,
        controls: controls,
        settings: settings
    };

    module.exports = ENGINE;
})();

},{}],5:[function(require,module,exports){
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

            this.sound = new Howl({
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
})();

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Laser = _interopRequire(require("./laser"));

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

},{"./laser":5}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var ENGINE = _interopRequire(require("./engine"));

(function () {
    "use strict";

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
})();

},{"./engine":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZENvbGxlY3Rpb24uanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyQ29sbGVjdGlvbi5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztJQ0FRLE1BQU0sMkJBQU0sVUFBVTs7SUFDdkIsSUFBSSwyQkFBTSxRQUFROztJQUNsQixlQUFlLDJCQUFNLG1CQUFtQjs7SUFDeEMsa0JBQWtCLDJCQUFNLHNCQUFzQjs7QUFFckQsQUFBQyxDQUFBLFlBQVc7QUFDUixnQkFBWSxDQUFDOzs7QUFHYixRQUFNLFVBQVUsR0FBRztBQUNmLGFBQUssRUFBRSxPQUFPO0FBQ2QsWUFBSSxFQUFFLE1BQU07QUFDWixhQUFLLEVBQUUsT0FBTztBQUNkLFlBQUksRUFBRSxNQUFNO0tBQ2YsQ0FBQzs7O0FBR0YsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25ELFFB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QyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFO0FBQzdFLDRCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztxQkFDakU7aUJBQ0o7Ozs7QUFFRCxrQkFBTTt1QkFBQSxrQkFBRztBQUNMLHdCQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUN4Qiw0QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7cUJBQ2pFO2lCQUNKOzs7O0FBRUQsb0JBQVE7dUJBQUEsb0JBQUc7QUFDUCx3QkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxFQUFFLEVBQUU7QUFDeEQsNEJBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO3FCQUNqRTtpQkFDSjs7Ozs7O2VBcERrQixJQUFJO1FBcUQxQixDQUFDO0NBQ0wsQ0FBQSxFQUFFLENBQUUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/aW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcbmltcG9ydCBTaGlwIGZyb20gJy4vc2hpcCc7XHJcbmltcG9ydCBMYXNlckNvbGxlY3Rpb24gZnJvbSAnLi9sYXNlckNvbGxlY3Rpb24nO1xyXG5pbXBvcnQgQXN0ZXJvaWRDb2xsZWN0aW9uIGZyb20gJy4vYXN0ZXJvaWRDb2xsZWN0aW9uJztcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBFbnVtc1xyXG4gICAgY29uc3QgR0FNRV9TVEFURSA9IHtcclxuICAgICAgICBTVEFSVDogJ1NUQVJUJyxcclxuICAgICAgICBQTEFZOiAnUExBWScsXHJcbiAgICAgICAgUEFVU0U6ICdQQVVTRScsXHJcbiAgICAgICAgT1ZFUjogJ09WRVInXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdhbWUgR2xvYmFsc1xyXG4gICAgbGV0IGdhbWVTY29yZSA9IDA7XHJcbiAgICBsZXQgZ2FtZUxpdmVzID0gMztcclxuICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnR2FtZUNhbnZhcycpO1xyXG4gICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgbGV0IGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuU1RBUlQ7XHJcblxyXG4gICAgLy9yZWdpb24gR2FtZVxyXG4gICAgbGV0IHBsYXllclNoaXAgPSBuZXcgU2hpcCh7XHJcbiAgICAgICAgbGFzZXJzOiBuZXcgTGFzZXJDb2xsZWN0aW9uKClcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBhc3Rlcm9pZHMgPSBuZXcgQXN0ZXJvaWRDb2xsZWN0aW9uKCk7XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgYXN0ZXJvaWRzLmxpc3QuZm9yRWFjaChfY2hlY2tTaGlwQ29sbGlzaW9uKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2NoZWNrU2hpcENvbGxpc2lvbihhc3Rlcm9pZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKEVOR0lORS51dGlsLmNoZWNrQ29sbGlzaW9uKHBsYXllclNoaXAsIGFzdGVyb2lkKSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUxpZmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgY2hlY2tMYXNlckNvbGxpc2lvbiA9IGZ1bmN0aW9uKGxhc2VyLCBsYXNlckluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIEZvciBldmVyeSBhc3Rlcm9pZFxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdGVyb2lkcy5saXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRU5HSU5FLnV0aWwuY2hlY2tDb2xsaXNpb24obGFzZXIsIGFzdGVyb2lkcy5saXN0W2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNoaXAubGFzZXJzLmxpc3Quc3BsaWNlKGxhc2VySW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRTY29yZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5mb3JFYWNoKGNoZWNrTGFzZXJDb2xsaXNpb24pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgZ2FtZSA9IEVOR0lORS5mYWN0b3J5LmNyZWF0ZUdhbWUoe1xyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBBVVNFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoLCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KTtcclxuICAgICAgICAgICAgZHJhd1Njb3JlKCk7XHJcbiAgICAgICAgICAgIGRyYXdMaXZlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllclNoaXAuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmRyYXcoY3R4KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgLy8gR2V0IGluIGNvbGxlY3Rpb24gY2xhc3MgYW5kIHJlbW92ZSBpbXBvcnQgZm9yIEFzdGVyb2lkXHJcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgYXN0ZXJvaWRzLmFkZEFzdGVyb2lkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgMTQwIC0gKEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCAvIDEwMCkpO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lIENvbnRyb2xzXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ2xlZnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbigncmlnaHQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlUmlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ3VwJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZURvd24oKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ3NwYWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAuZmlyZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgncGF1c2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBwYXVzZUdhbWUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgnZW50ZXInLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUIHx8IGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TmV3R2FtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBIZWxwZXIgRnVuY3Rpb25zXHJcbiAgICBmdW5jdGlvbiBkcmF3U3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoaWRlU3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydE5ld0dhbWUoKSB7XHJcbiAgICAgICAgZ2FtZUxpdmVzID0gMztcclxuICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgZ2FtZVNjb3JlID0gMDtcclxuICAgICAgICBoaWRlU3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXVzZUdhbWUoKSB7XHJcbiAgICAgICAgZHJhd1BhdXNlU2NyZWVuKCk7XHJcblxyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBBVVNFO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1BhdXNlU2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1wYXVzZS1zY3JlZW4nKS50b2dnbGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmRHYW1lKCkge1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFNjb3JlKCkge1xyXG4gICAgICAgIGdhbWVTY29yZSArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdTY29yZSgpIHtcclxuICAgICAgICAkKCcuanMtc2NvcmUnKS5odG1sKCdTY29yZTonICsgZ2FtZVNjb3JlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVMaWZlKCkge1xyXG4gICAgICAgIGlmIChnYW1lTGl2ZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIGdhbWVMaXZlcyAtPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuT1ZFUjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd0xpdmVzKCkge1xyXG4gICAgICAgICQoJy5qcy1saXZlcycpLmh0bWwoJ0xpdmVzOicgKyBnYW1lTGl2ZXMpO1xyXG4gICAgfVxyXG4gICAgLy9lbmRyZWdpb25cclxufSgpKTtcclxuIiwiaW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBBc3Rlcm9pZCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5nZSA9IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigzMCwgMTAwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogcmFuZ2UsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHJhbmdlLFxyXG4gICAgICAgICAgICAgICAgc3BlZWQ6IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigyLCA2KVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDAgLSB0aGlzLnNldHRpbmdzLmhlaWdodCwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5oZWlnaHQgKiAtMjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW1nLnNyYyA9ICdBcHAvQ29udGVudC9JbWFnZXMvYXN0ZXJvaWQtJyArIEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigxLCA0KSArICcucG5nJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZICs9IHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSgpKTsiLCJpbXBvcnQgRU5HSU5FIGZyb20gJy4vZW5naW5lJztcclxuaW1wb3J0IEFzdGVyb2lkIGZyb20gJy4vYXN0ZXJvaWQnO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgQXN0ZXJvaWRDb2xsZWN0aW9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGVja0FzdGVyb2lkQm91bmRzID0gZnVuY3Rpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXN0ZXJvaWQuc2V0dGluZ3MucG9zWSA+IEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQgKyAzMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdXBkYXRlID0gZnVuY3Rpb24oYXN0ZXJvaWQpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tBc3Rlcm9pZEJvdW5kcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgbGV0IGRyYXcgPSBmdW5jdGlvbihhc3Rlcm9pZCkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWQuZHJhdyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRkQXN0ZXJvaWQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5wdXNoKG5ldyBBc3Rlcm9pZCgpKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyIsIu+7vyhmdW5jdGlvbigpIHsgICAvLyBUZW1wIHVudGlsIHdlIGdldCBhIG1vZHVsZSBzeXN0ZW0gaW4gcGxhY2UgKENvbnZlcnQgdG8gYSBFUzYgbW9kdWxlKVxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGxldCBmYWN0b3J5ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNsYXNzIEdhbWUge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUgPSBwcm9wZXJ0aWVzLnVwZGF0ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcgPSBwcm9wZXJ0aWVzLmRyYXc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkcmF3KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydCgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBnYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsYXNzIEdhbWVPYmplY3Qge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBwb3NYOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1k6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWUodXBkYXRlLCBkcmF3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZSh1cGRhdGUsIGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZU9iamVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lT2JqZWN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjcmVhdGVHYW1lOiBjcmVhdGVHYW1lLFxyXG4gICAgICAgICAgICBjcmVhdGVHYW1lT2JqZWN0OiBjcmVhdGVHYW1lT2JqZWN0XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IGNvbnRyb2xzID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBldmVudEFjdGlvbnMgPSB7fTtcclxuICAgICAgICBsZXQga2V5U3RhdGUgPSB7fTtcclxuICAgICAgICBsZXQga2V5QWN0aW9uID0ge1xyXG4gICAgICAgICAgICBzcGFjZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHNwYWNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gcGF1c2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBlbnRlciBub3QgZGVmaW5lZCcpOyB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9uID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb25rZXkgPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlciA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjb250cm9sc0xvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gKFVwIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzhdIHx8IGtleVN0YXRlWzg3XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChMZWZ0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzddIHx8IGtleVN0YXRlWzY1XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKFJpZ2h0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzldIHx8IGtleVN0YXRlWzY4XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChEb3duIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbNDBdIHx8IGtleVN0YXRlWzgzXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSB0cnVlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IGZhbHNlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgLy8gRW50ZXIga2V5XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKHApIFBhdXNlXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDgwKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU3BhY2UgYmFyXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvbjpvbixcclxuICAgICAgICAgICAgb25rZXk6IG9ua2V5XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHV0aWwgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBsZXQgb2JqMVJpZ2h0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWCArIG9iajEuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBvYmoxTGVmdFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1g7XHJcbiAgICAgICAgICAgIGxldCBvYmoyUmlnaHRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYICsgb2JqMi5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajJMZWZ0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsZWZ0U2lkZUNvbGxpc2lvbigpIHx8IHJpZ2h0U2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGVmdFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKG9iajFMZWZ0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMUxlZnRTaWRlIDw9IG9iajJSaWdodFNpZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmlnaHRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9iajFSaWdodFNpZGUgPj0gb2JqMkxlZnRTaWRlICYmIG9iajFSaWdodFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChvYmoxLnNldHRpbmdzLnBvc1kgPj0gb2JqMi5zZXR0aW5ncy5wb3NZICYmIG9iajEuc2V0dGluZ3MucG9zWSA8PSBvYmoyLnNldHRpbmdzLnBvc1kgKyBvYmoyLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpICYmIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tTnVtYmVyKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGxldCBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gJyMnO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTUpXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2hlY2tDb2xsaXNpb246IGNoZWNrQ29sbGlzaW9uLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21OdW1iZXI6IGdldFJhbmRvbU51bWJlcixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tQ29sb3I6IGdldFJhbmRvbUNvbG9yXHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHNldHRpbmdzID0ge1xyXG4gICAgICAgIGNhbnZhc1dpZHRoOiA3MjAsXHJcbiAgICAgICAgY2FudmFzSGVpZ2h0OiA0ODBcclxuICAgIH07XHJcblxyXG4gICAgbGV0IEVOR0lORSA9IHtcclxuICAgICAgICB1dGlsOiB1dGlsLFxyXG4gICAgICAgIGZhY3Rvcnk6IGZhY3RvcnksXHJcbiAgICAgICAgY29udHJvbHM6IGNvbnRyb2xzLFxyXG4gICAgICAgIHNldHRpbmdzOiBzZXR0aW5nc1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEVOR0lORTtcclxufSgpKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IEhvd2wgPSB3aW5kb3cuSG93bDtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExhc2VyIHtcclxuICAgICAgICBjb25zdHJ1Y3RvciAob3JpZ2luWCwgb3JpZ2luWSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgcG9zWDogb3JpZ2luWCxcclxuICAgICAgICAgICAgICAgIHBvc1k6IG9yaWdpblksXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogNC41LFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAyNVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zb3VuZCA9IG5ldyBIb3dsKHtcclxuICAgICAgICAgICAgICAgIHVybHM6IFsnQXBwL0NvbnRlbnQvQXVkaW8vbGFzZXIubXAzJ11cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwZmYwMCc7IC8vRU5HSU5FLnV0aWwuZ2V0UmFuZG9tQ29sb3IoKTtcclxuICAgICAgICAgICAgY29udGV4dC5hcmModGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgLT0gNS4wNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXlTb3VuZCgpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3VuZC5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSgpKTsiLCJpbXBvcnQgTGFzZXIgZnJvbSAnLi9sYXNlcic7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBMYXNlckNvbGxlY3Rpb24ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLm1heExhc2VycyA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgbGV0IHVwZGF0ZUxhc2VyID0gZnVuY3Rpb24obGFzZXIsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RbaW5kZXhdLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY2hlY2tMYXNlckJvdW5kcyA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGlzdFtpbmRleF0uc2V0dGluZ3MucG9zWSA8IC01KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnNoaWZ0KCk7IC8vIElmIGxhc2VyIG91dHNpZGUgb2YgdG9wIGJvdW5kcyByZW1vdmUgZnJvbSBhcnJheVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjaGVja0xhc2VyQm91bmRzKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2godXBkYXRlTGFzZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGxldCBkcmF3ID0gZnVuY3Rpb24obGFzZXIpIHtcclxuICAgICAgICAgICAgICAgIGxhc2VyLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChkcmF3KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZpcmUocG9zWCwgcG9zWSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saXN0Lmxlbmd0aCA8IHRoaXMubWF4TGFzZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGFzZXIgPSBuZXcgTGFzZXIocG9zWCwgcG9zWSk7XHJcbiAgICAgICAgICAgICAgICBsYXNlci5wbGF5U291bmQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5wdXNoKGxhc2VyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0oKSk7IiwiaW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTaGlwIHtcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDEpJyxcclxuICAgICAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICAgICAgcG9zWTogMzUwLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAyNSxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgICAgIHNwZWVkOiA0XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmltZy5zcmMgPSAnQXBwL0NvbnRlbnQvSW1hZ2VzL3NwYWNlc2hpcC5wbmcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSk7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZmlyZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXNlcnMuZmlyZSh0aGlzLnNldHRpbmdzLnBvc1ggKyAyMywgdGhpcy5zZXR0aW5ncy5wb3NZIC0gNSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb3ZlTGVmdCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Mud2lkdGggPCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGggKyA3MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbW92ZVVwKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbW92ZURvd24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KCkpOyJdfQ==
