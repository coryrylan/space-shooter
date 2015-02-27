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

        this.settings = {
            speed: ENGINE.util.getRandomNumber(2, 6),
            width: ENGINE.util.getRandomNumber(30, 100),
            height: ENGINE.util.getRandomNumber(30, 100)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZENvbGxlY3Rpb24uanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyQ29sbGVjdGlvbi5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7SUNBUyxNQUFNLFdBQU8sVUFBVSxFQUF2QixNQUFNOztJQUNQLElBQUksV0FBTyxRQUFRLEVBQW5CLElBQUk7O0lBQ0osZUFBZSxXQUFPLG1CQUFtQixFQUF6QyxlQUFlOztJQUNmLGtCQUFrQixXQUFPLHNCQUFzQixFQUEvQyxrQkFBa0I7O0FBRTFCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7O0FBR2IsUUFBTSxVQUFVLEdBQUc7QUFDZixhQUFLLEVBQUUsT0FBTztBQUNkLFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtLQUNmLENBQUM7OztBQUdGLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxNQUFNLEdBQUcsUUFBUSxD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RUFBRTtBQUN4Qix3QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7aUJBQ2pFO2FBQ0o7Ozs7QUFFRCxnQkFBUTttQkFBQSxvQkFBRztBQUNQLG9CQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLEVBQUUsRUFBRTtBQUN4RCx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7aUJBQ2pFO2FBQ0o7Ozs7OztXQXBEQyxJQUFJOzs7UUF1REYsSUFBSSxHQUFKLElBQUkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/aW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuaW1wb3J0IHtTaGlwfSBmcm9tICcuL3NoaXAnO1xyXG5pbXBvcnQge0xhc2VyQ29sbGVjdGlvbn0gZnJvbSAnLi9sYXNlckNvbGxlY3Rpb24nO1xyXG5pbXBvcnQge0FzdGVyb2lkQ29sbGVjdGlvbn0gZnJvbSAnLi9hc3Rlcm9pZENvbGxlY3Rpb24nO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lXHJcbiAgICBsZXQgcGxheWVyU2hpcCA9IG5ldyBTaGlwKHtcclxuICAgICAgICBsYXNlcnM6IG5ldyBMYXNlckNvbGxlY3Rpb24oKVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGFzdGVyb2lkcyA9IG5ldyBBc3Rlcm9pZENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICBsZXQgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBhc3Rlcm9pZHMubGlzdC5mb3JFYWNoKF9jaGVja1NoaXBDb2xsaXNpb24pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBfY2hlY2tTaGlwQ29sbGlzaW9uKGFzdGVyb2lkLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAoRU5HSU5FLnV0aWwuY2hlY2tDb2xsaXNpb24ocGxheWVyU2hpcCwgYXN0ZXJvaWQpKSB7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgcmVtb3ZlTGlmZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgY2hlY2tTaGlwTGFzZXJBbmRBc3Rlcm9pZENvbGxpc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBjaGVja0xhc2VyQ29sbGlzaW9uID0gZnVuY3Rpb24obGFzZXIsIGxhc2VySW5kZXgpIHtcclxuICAgICAgICAgICAgLy8gRm9yIGV2ZXJ5IGFzdGVyb2lkXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0ZXJvaWRzLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihsYXNlciwgYXN0ZXJvaWRzLmxpc3RbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5zcGxpY2UobGFzZXJJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZFNjb3JlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goY2hlY2tMYXNlckNvbGxpc2lvbik7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRU5HSU5FLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGgsIEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQpO1xyXG4gICAgICAgICAgICBkcmF3U2NvcmUoKTtcclxuICAgICAgICAgICAgZHJhd0xpdmVzKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUKSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3U3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5kcmF3KGN0eCk7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QQVVTRSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BhdXNlZCcpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgICAgICBlbmRHYW1lKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3U3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGdhbWUuc3RhcnQoKTtcclxuXHJcbiAgICAvLyBHZXQgaW4gY29sbGVjdGlvbiBjbGFzcyBhbmQgcmVtb3ZlIGltcG9ydCBmb3IgQXN0ZXJvaWRcclxuICAgIHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBhc3Rlcm9pZHMuYWRkQXN0ZXJvaWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LCAxNDAgLSAoRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMTAwKSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIEdhbWUgQ29udHJvbHNcclxuICAgIEVOR0lORS5jb250cm9scy5vbignbGVmdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdyaWdodCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVSaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbigndXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlVXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ2Rvd24nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlRG93bigpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgnc3BhY2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5maXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdwYXVzZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHBhdXNlR2FtZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdlbnRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQgfHwgZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgc3RhcnROZXdHYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIEhlbHBlciBGdW5jdGlvbnNcclxuICAgIGZ1bmN0aW9uIGRyYXdTdGFydFNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtc3RhcnQtc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhpZGVTdGFydFNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtc3RhcnQtc2NyZWVuJykuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0TmV3R2FtZSgpIHtcclxuICAgICAgICBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICBnYW1lU2NvcmUgPSAwO1xyXG4gICAgICAgIGhpZGVTdGFydFNjcmVlbigpO1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhdXNlR2FtZSgpIHtcclxuICAgICAgICBkcmF3UGF1c2VTY3JlZW4oKTtcclxuXHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUEFVU0U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QTEFZO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3UGF1c2VTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXBhdXNlLXNjcmVlbicpLnRvZ2dsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuZEdhbWUoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbWUtb3Zlci1zY3JlZW4nKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkU2NvcmUoKSB7XHJcbiAgICAgICAgZ2FtZVNjb3JlICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1Njb3JlKCkge1xyXG4gICAgICAgICQoJy5qcy1zY29yZScpLmh0bWwoJ1Njb3JlOicgKyBnYW1lU2NvcmUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpZmUoKSB7XHJcbiAgICAgICAgaWYgKGdhbWVMaXZlcyA+IDApIHtcclxuICAgICAgICAgICAgZ2FtZUxpdmVzIC09IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5PVkVSO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3TGl2ZXMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWxpdmVzJykuaHRtbCgnTGl2ZXM6JyArIGdhbWVMaXZlcyk7XHJcbiAgICB9XHJcbiAgICAvL2VuZHJlZ2lvblxyXG59KCkpO1xyXG4iLCJpbXBvcnQge0VOR0lORX0gZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuY2xhc3MgQXN0ZXJvaWQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgc3BlZWQ6IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigyLCA2KSxcclxuICAgICAgICAgICAgd2lkdGg6IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigzMCwgMTAwKSxcclxuICAgICAgICAgICAgaGVpZ2h0OiBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMzAsIDEwMClcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMCAtIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MuaGVpZ2h0ICogLTI7XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ0FwcC9Db250ZW50L0ltYWdlcy9hc3Rlcm9pZC0nICsgRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDEsIDQpICsgJy5wbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSwgdGhpcy5zZXR0aW5ncy53aWR0aCwgdGhpcy5zZXR0aW5ncy5oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgKz0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtBc3Rlcm9pZH0iLCJpbXBvcnQge0VOR0lORX0gZnJvbSAnLi9lbmdpbmUnO1xyXG5pbXBvcnQge0FzdGVyb2lkfSBmcm9tICcuL2FzdGVyb2lkJztcclxuXHJcbmNsYXNzIEFzdGVyb2lkQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgbGV0IGNoZWNrQXN0ZXJvaWRCb3VuZHMgPSBmdW5jdGlvbihhc3Rlcm9pZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKGFzdGVyb2lkLnNldHRpbmdzLnBvc1kgPiBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0ICsgMzApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlID0gZnVuY3Rpb24oYXN0ZXJvaWQpIHtcclxuICAgICAgICAgICAgYXN0ZXJvaWQudXBkYXRlKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tBc3Rlcm9pZEJvdW5kcyk7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2godXBkYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBsZXQgZHJhdyA9IGZ1bmN0aW9uKGFzdGVyb2lkKSB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZHJhdyk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQXN0ZXJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0LnB1c2gobmV3IEFzdGVyb2lkKCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0FzdGVyb2lkQ29sbGVjdGlvbn0iLCLvu792YXIgRU5HSU5FID0gKGZ1bmN0aW9uKCkgeyAgIC8vIFRlbXAgdW50aWwgd2UgZ2V0IGEgbW9kdWxlIHN5c3RlbSBpbiBwbGFjZSAoQ29udmVydCB0byBhIEVTNiBtb2R1bGUpXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IGZhY3RvcnkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xhc3MgR2FtZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSA9IHByb3BlcnRpZXMudXBkYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdyA9IHByb3BlcnRpZXMuZHJhdztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRyYXcoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdhbWVMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xhc3MgR2FtZU9iamVjdCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1g6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZSh1cGRhdGUsIGRyYXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lKHVwZGF0ZSwgZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lT2JqZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWVPYmplY3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWU6IGNyZWF0ZUdhbWUsXHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWVPYmplY3Q6IGNyZWF0ZUdhbWVPYmplY3RcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgY29udHJvbHMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50QWN0aW9ucyA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlTdGF0ZSA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlBY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIHNwYWNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gc3BhY2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBwYXVzZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIGVudGVyIG5vdCBkZWZpbmVkJyk7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb24gPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbmtleSA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRyb2xzTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAoVXAgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOF0gfHwga2V5U3RhdGVbODddKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKExlZnQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszN10gfHwga2V5U3RhdGVbNjVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoUmlnaHQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOV0gfHwga2V5U3RhdGVbNjhdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKERvd24gQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVs0MF0gfHwga2V5U3RhdGVbODNdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93bigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IHRydWU7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAvLyBFbnRlciBrZXlcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAocCkgUGF1c2VcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gODApIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTcGFjZSBiYXJcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9uOm9uLFxyXG4gICAgICAgICAgICBvbmtleTogb25rZXlcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgdXRpbCA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBmdW5jdGlvbiBfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGxldCBvYmoxUmlnaHRTaWRlID0gb2JqMS5zZXR0aW5ncy5wb3NYICsgb2JqMS5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajFMZWZ0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWDtcclxuICAgICAgICAgICAgbGV0IG9iajJSaWdodFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1ggKyBvYmoyLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICBsZXQgb2JqMkxlZnRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxlZnRTaWRlQ29sbGlzaW9uKCkgfHwgcmlnaHRTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBsZWZ0U2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICgob2JqMUxlZnRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxTGVmdFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByaWdodFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqMVJpZ2h0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMVJpZ2h0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja1RvcFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9iajEuc2V0dGluZ3MucG9zWSA+PSBvYmoyLnNldHRpbmdzLnBvc1kgJiYgb2JqMS5zZXR0aW5ncy5wb3NZIDw9IG9iajIuc2V0dGluZ3MucG9zWSArIG9iajIuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikgJiYgX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21OdW1iZXIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICAgICAgbGV0IGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSAnIyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxNSldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjaGVja0NvbGxpc2lvbjogY2hlY2tDb2xsaXNpb24sXHJcbiAgICAgICAgICAgIGdldFJhbmRvbU51bWJlcjogZ2V0UmFuZG9tTnVtYmVyLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21Db2xvcjogZ2V0UmFuZG9tQ29sb3JcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgY2FudmFzV2lkdGg6IDcyMCxcclxuICAgICAgICBjYW52YXNIZWlnaHQ6IDQ4MFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHV0aWw6IHV0aWwsXHJcbiAgICAgICAgZmFjdG9yeTogZmFjdG9yeSxcclxuICAgICAgICBjb250cm9sczogY29udHJvbHMsXHJcbiAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtFTkdJTkV9IiwiY2xhc3MgTGFzZXIge1xyXG4gICAgY29uc3RydWN0b3IgKG9yaWdpblgsIG9yaWdpblkpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBwb3NYOiBvcmlnaW5YLFxyXG4gICAgICAgICAgICBwb3NZOiBvcmlnaW5ZLFxyXG4gICAgICAgICAgICB3aWR0aDogNC41LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI1XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZCA9IG5ldyB3aW5kb3cuSG93bCh7XHJcbiAgICAgICAgICAgIHVybHM6IFsnQXBwL0NvbnRlbnQvQXVkaW8vbGFzZXIubXAzJ11cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMGZmMDAnOyAvL0VOR0lORS51dGlsLmdldFJhbmRvbUNvbG9yKCk7XHJcbiAgICAgICAgY29udGV4dC5hcmModGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZIC09IDUuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheVNvdW5kKCkge1xyXG4gICAgICAgIHRoaXMuc291bmQucGxheSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyfSIsImltcG9ydCB7TGFzZXJ9IGZyb20gJy4vbGFzZXInO1xyXG5cclxuY2xhc3MgTGFzZXJDb2xsZWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubWF4TGFzZXJzID0gMTA7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGxldCB1cGRhdGVMYXNlciA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RbaW5kZXhdLnVwZGF0ZSgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgbGV0IGNoZWNrTGFzZXJCb3VuZHMgPSBmdW5jdGlvbihsYXNlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdFtpbmRleF0uc2V0dGluZ3MucG9zWSA8IC01KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3Quc2hpZnQoKTsgLy8gSWYgbGFzZXIgb3V0c2lkZSBvZiB0b3AgYm91bmRzIHJlbW92ZSBmcm9tIGFycmF5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNoZWNrTGFzZXJCb3VuZHMpO1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZUxhc2VyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBsZXQgZHJhdyA9IGZ1bmN0aW9uKGxhc2VyKSB7XHJcbiAgICAgICAgICAgIGxhc2VyLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZHJhdyk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZShwb3NYLCBwb3NZKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGlzdC5sZW5ndGggPCB0aGlzLm1heExhc2Vycykge1xyXG4gICAgICAgICAgICBsZXQgbGFzZXIgPSBuZXcgTGFzZXIocG9zWCwgcG9zWSk7XHJcbiAgICAgICAgICAgIGxhc2VyLnBsYXlTb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYXNlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyQ29sbGVjdGlvbn0iLCJpbXBvcnQge0VOR0lORX0gZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuY2xhc3MgU2hpcCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMgPSBwcm9wZXJ0aWVzLmxhc2VycztcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDEpJyxcclxuICAgICAgICAgICAgcG9zWDogMjUsXHJcbiAgICAgICAgICAgIHBvc1k6IDM1MCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyNSxcclxuICAgICAgICAgICAgd2lkdGg6IDI1LFxyXG4gICAgICAgICAgICBzcGVlZDogNFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ0FwcC9Db250ZW50L0ltYWdlcy9zcGFjZXNoaXAucG5nJztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1kpO1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmRyYXcoY29udGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMuZmlyZSh0aGlzLnNldHRpbmdzLnBvc1ggKyAyMywgdGhpcy5zZXR0aW5ncy5wb3NZIC0gNSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLndpZHRoIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoICsgNzApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7U2hpcH0iXX0=
