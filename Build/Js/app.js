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

    var init = function init() {
        scaleScreen();
        touchSetup();
    };

    var game = ENGINE.factory.createGame({
        init: (function (_init) {
            var _initWrapper = function init() {
                return _init.apply(this, arguments);
            };

            _initWrapper.toString = function () {
                return _init.toString();
            };

            return _initWrapper;
        })(function () {
            init();
        }),
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

    //region Touch Game Controls
    function touchSetup() {
        var touchable = ("createTouch" in document);

        if (touchable) {
            canvas.addEventListener("touchstart", onTouchStart, false);
            canvas.addEventListener("touchmove", onTouchMove, false);
            canvas.addEventListener("touchend", onTouchEnd, false);
        }
    }

    function onTouchStart(event) {
        console.log("touchstart");

        if (gameState === GAME_STATE.START || gameState === GAME_STATE.OVER) {
            startNewGame();
        } else {
            if (event.touches[0].clientX > ENGINE.settings.canvasWidth / 2) {
                playerShip.fire();
            }
        }
    }

    function onTouchMove(event) {
        // Prevent the browser from doing its default thing (scroll, zoom)
        event.preventDefault();
        console.log("touchmove");
    }

    function onTouchEnd() {
        //do stuff
        console.log("touchend");
    }
    //endregion

    //region Key Game Controls
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

    function scaleScreen() {
        if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 720) {
            ENGINE.settings.canvasWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            ENGINE.settings.canvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            ctx.canvas.width = ENGINE.settings.canvasWidth;
            ctx.canvas.height = ENGINE.settings.canvasHeight;

            $(".notifications").removeClass("large-screen");
            //$('#GameCanvas').width(ENGINE.settings.canvasWidth);
            //$('#GameCanvas').height(ENGINE.settings.canvasHeight);
        }
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
                this._init = properties.init;
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
                        this._init();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZENvbGxlY3Rpb24uanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyQ29sbGVjdGlvbi5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7SUNBUyxNQUFNLFdBQU8sVUFBVSxFQUF2QixNQUFNOztJQUNQLElBQUksV0FBTyxRQUFRLEVBQW5CLElBQUk7O0lBQ0osZUFBZSxXQUFPLG1CQUFtQixFQUF6QyxlQUFlOztJQUNmLGtCQUFrQixXQUFPLHNCQUFzQixFQUEvQyxrQkFBa0I7O0FBRTFCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7O0FBR2IsUUFBTSxVQUFVLEdBQUc7QUFDZixhQUFLLEVBQUUsT0FBTztBQUNkLFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtLQUNmLENBQUM7OztBQUdGLFFBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxNQUFNLEdBQUcsUUFBUSxD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d0JBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNqRTthQUNKOzs7Ozs7V0FwREMsSUFBSTs7O1FBdURGLElBQUksR0FBSixJQUFJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2ltcG9ydCB7RU5HSU5FfSBmcm9tICcuL2VuZ2luZSc7XHJcbmltcG9ydCB7U2hpcH0gZnJvbSAnLi9zaGlwJztcclxuaW1wb3J0IHtMYXNlckNvbGxlY3Rpb259IGZyb20gJy4vbGFzZXJDb2xsZWN0aW9uJztcclxuaW1wb3J0IHtBc3Rlcm9pZENvbGxlY3Rpb259IGZyb20gJy4vYXN0ZXJvaWRDb2xsZWN0aW9uJztcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBFbnVtc1xyXG4gICAgY29uc3QgR0FNRV9TVEFURSA9IHtcclxuICAgICAgICBTVEFSVDogJ1NUQVJUJyxcclxuICAgICAgICBQTEFZOiAnUExBWScsXHJcbiAgICAgICAgUEFVU0U6ICdQQVVTRScsXHJcbiAgICAgICAgT1ZFUjogJ09WRVInXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEdhbWUgR2xvYmFsc1xyXG4gICAgbGV0IGdhbWVTY29yZSA9IDA7XHJcbiAgICBsZXQgZ2FtZUxpdmVzID0gMztcclxuICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnR2FtZUNhbnZhcycpO1xyXG4gICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgbGV0IGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuU1RBUlQ7XHJcblxyXG4gICAgLy9yZWdpb24gR2FtZVxyXG4gICAgbGV0IHBsYXllclNoaXAgPSBuZXcgU2hpcCh7XHJcbiAgICAgICAgbGFzZXJzOiBuZXcgTGFzZXJDb2xsZWN0aW9uKClcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBhc3Rlcm9pZHMgPSBuZXcgQXN0ZXJvaWRDb2xsZWN0aW9uKCk7XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgYXN0ZXJvaWRzLmxpc3QuZm9yRWFjaChfY2hlY2tTaGlwQ29sbGlzaW9uKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX2NoZWNrU2hpcENvbGxpc2lvbihhc3Rlcm9pZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKEVOR0lORS51dGlsLmNoZWNrQ29sbGlzaW9uKHBsYXllclNoaXAsIGFzdGVyb2lkKSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIHJlbW92ZUxpZmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgY2hlY2tMYXNlckNvbGxpc2lvbiA9IGZ1bmN0aW9uKGxhc2VyLCBsYXNlckluZGV4KSB7XHJcbiAgICAgICAgICAgIC8vIEZvciBldmVyeSBhc3Rlcm9pZFxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdGVyb2lkcy5saXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRU5HSU5FLnV0aWwuY2hlY2tDb2xsaXNpb24obGFzZXIsIGFzdGVyb2lkcy5saXN0W2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllclNoaXAubGFzZXJzLmxpc3Quc3BsaWNlKGxhc2VySW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBhZGRTY29yZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5mb3JFYWNoKGNoZWNrTGFzZXJDb2xsaXNpb24pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNjYWxlU2NyZWVuKCk7XHJcbiAgICAgICAgdG91Y2hTZXR1cCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgZ2FtZSA9IEVOR0lORS5mYWN0b3J5LmNyZWF0ZUdhbWUoe1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIHBsYXllclNoaXAudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBjaGVja1NoaXBBbmRBc3Rlcm9pZENvbGxpc2lvbigpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tTaGlwTGFzZXJBbmRBc3Rlcm9pZENvbGxpc2lvbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QQVVTRSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRyYXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCk7XHJcbiAgICAgICAgICAgIGRyYXdTY29yZSgpO1xyXG4gICAgICAgICAgICBkcmF3TGl2ZXMoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIGRyYXdTdGFydFNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLmRyYXcoY3R4KTtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5kcmF3KGN0eCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBBVVNFKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGF1c2VkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgICAgIGVuZEdhbWUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRyYXdTdGFydFNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZ2FtZS5zdGFydCgpO1xyXG5cclxuICAgIC8vIEdldCBpbiBjb2xsZWN0aW9uIGNsYXNzIGFuZCByZW1vdmUgaW1wb3J0IGZvciBBc3Rlcm9pZFxyXG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkcy5hZGRBc3Rlcm9pZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sIDE0MCAtIChFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGggLyAxMDApKTtcclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gVG91Y2ggR2FtZSBDb250cm9sc1xyXG4gICAgZnVuY3Rpb24gdG91Y2hTZXR1cCgpIHtcclxuICAgICAgICBsZXQgdG91Y2hhYmxlID0gJ2NyZWF0ZVRvdWNoJyBpbiBkb2N1bWVudDtcclxuXHJcbiAgICAgICAgaWYgKHRvdWNoYWJsZSkge1xyXG4gICAgICAgICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UgKTtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvblRvdWNoU3RhcnQoZXZlbnQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygndG91Y2hzdGFydCcpO1xyXG5cclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUIHx8IGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TmV3R2FtZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzWzBdLmNsaWVudFggPiBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGggLyAyKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLmZpcmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvblRvdWNoTW92ZShldmVudCkge1xyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIGJyb3dzZXIgZnJvbSBkb2luZyBpdHMgZGVmYXVsdCB0aGluZyAoc2Nyb2xsLCB6b29tKVxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RvdWNobW92ZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG9uVG91Y2hFbmQoKSB7XHJcbiAgICAgICAgLy9kbyBzdHVmZlxyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0b3VjaGVuZCcpO1xyXG4gICAgfVxyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBLZXkgR2FtZSBDb250cm9sc1xyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdsZWZ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZUxlZnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ3JpZ2h0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCd1cCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVVcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbignZG93bicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVEb3duKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdzcGFjZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLmZpcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ3BhdXNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcGF1c2VHYW1lKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ2VudGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCB8fCBnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICBzdGFydE5ld0dhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gSGVscGVyIEZ1bmN0aW9uc1xyXG4gICAgZnVuY3Rpb24gZHJhd1N0YXJ0U2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1zdGFydC1zY3JlZW4nKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGlkZVN0YXJ0U2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1zdGFydC1zY3JlZW4nKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RhcnROZXdHYW1lKCkge1xyXG4gICAgICAgIGdhbWVMaXZlcyA9IDM7XHJcbiAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QTEFZO1xyXG4gICAgICAgIGdhbWVTY29yZSA9IDA7XHJcbiAgICAgICAgaGlkZVN0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgJCgnLmpzLWdhbWUtb3Zlci1zY3JlZW4nKS5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGF1c2VHYW1lKCkge1xyXG4gICAgICAgIGRyYXdQYXVzZVNjcmVlbigpO1xyXG5cclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QQVVTRTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdQYXVzZVNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtcGF1c2Utc2NyZWVuJykudG9nZ2xlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRTY29yZSgpIHtcclxuICAgICAgICBnYW1lU2NvcmUgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3U2NvcmUoKSB7XHJcbiAgICAgICAgJCgnLmpzLXNjb3JlJykuaHRtbCgnU2NvcmU6JyArIGdhbWVTY29yZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlmZSgpIHtcclxuICAgICAgICBpZiAoZ2FtZUxpdmVzID4gMCkge1xyXG4gICAgICAgICAgICBnYW1lTGl2ZXMgLT0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLk9WRVI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdMaXZlcygpIHtcclxuICAgICAgICAkKCcuanMtbGl2ZXMnKS5odG1sKCdMaXZlczonICsgZ2FtZUxpdmVzKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzY2FsZVNjcmVlbigpIHtcclxuICAgICAgICBpZiAoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSA8IDcyMCkge1xyXG4gICAgICAgICAgICBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGggPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApO1xyXG4gICAgICAgICAgICBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0ID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApO1xyXG4gICAgICAgICAgICBjdHguY2FudmFzLndpZHRoICA9IEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aDtcclxuICAgICAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgJCgnLm5vdGlmaWNhdGlvbnMnKS5yZW1vdmVDbGFzcygnbGFyZ2Utc2NyZWVuJyk7XHJcbiAgICAgICAgICAgIC8vJCgnI0dhbWVDYW52YXMnKS53aWR0aChFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGgpO1xyXG4gICAgICAgICAgICAvLyQoJyNHYW1lQ2FudmFzJykuaGVpZ2h0KEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcbn0oKSk7XHJcbiIsImltcG9ydCB7RU5HSU5FfSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG5jbGFzcyBBc3Rlcm9pZCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBsZXQgcmFuZ2UgPSBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMzAsIDEwMCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiByYW5nZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiByYW5nZSxcclxuICAgICAgICAgICAgc3BlZWQ6IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigyLCA2KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigwIC0gdGhpcy5zZXR0aW5ncy5oZWlnaHQsIEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5oZWlnaHQgKiAtMjtcclxuXHJcbiAgICAgICAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB0aGlzLmltZy5zcmMgPSAnQXBwL0NvbnRlbnQvSW1hZ2VzL2FzdGVyb2lkLScgKyBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMSwgNCkgKyAnLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSArPSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0FzdGVyb2lkfSIsImltcG9ydCB7RU5HSU5FfSBmcm9tICcuL2VuZ2luZSc7XHJcbmltcG9ydCB7QXN0ZXJvaWR9IGZyb20gJy4vYXN0ZXJvaWQnO1xyXG5cclxuY2xhc3MgQXN0ZXJvaWRDb2xsZWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY2hlY2tBc3Rlcm9pZEJvdW5kcyA9IGZ1bmN0aW9uKGFzdGVyb2lkLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAoYXN0ZXJvaWQuc2V0dGluZ3MucG9zWSA+IEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQgKyAzMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGUgPSBmdW5jdGlvbihhc3Rlcm9pZCkge1xyXG4gICAgICAgICAgICBhc3Rlcm9pZC51cGRhdGUoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjaGVja0FzdGVyb2lkQm91bmRzKTtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaCh1cGRhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIGxldCBkcmF3ID0gZnVuY3Rpb24oYXN0ZXJvaWQpIHtcclxuICAgICAgICAgICAgYXN0ZXJvaWQuZHJhdyhjb250ZXh0KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChkcmF3KTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRBc3Rlcm9pZCgpIHtcclxuICAgICAgICB0aGlzLmxpc3QucHVzaChuZXcgQXN0ZXJvaWQoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7QXN0ZXJvaWRDb2xsZWN0aW9ufSIsIu+7v3ZhciBFTkdJTkUgPSAoZnVuY3Rpb24oKSB7ICAgLy8gVGVtcCB1bnRpbCB3ZSBnZXQgYSBtb2R1bGUgc3lzdGVtIGluIHBsYWNlIChDb252ZXJ0IHRvIGEgRVM2IG1vZHVsZSlcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBsZXQgZmFjdG9yeSA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBjbGFzcyBHYW1lIHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlID0gcHJvcGVydGllcy51cGRhdGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3ID0gcHJvcGVydGllcy5kcmF3O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCA9IHByb3BlcnRpZXMuaW5pdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRyYXcoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGdhbWVMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xhc3MgR2FtZU9iamVjdCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1g6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZSh1cGRhdGUsIGRyYXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lKHVwZGF0ZSwgZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lT2JqZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWVPYmplY3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWU6IGNyZWF0ZUdhbWUsXHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWVPYmplY3Q6IGNyZWF0ZUdhbWVPYmplY3RcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgY29udHJvbHMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50QWN0aW9ucyA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlTdGF0ZSA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlBY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIHNwYWNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gc3BhY2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBwYXVzZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIGVudGVyIG5vdCBkZWZpbmVkJyk7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb24gPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbmtleSA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRyb2xzTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAoVXAgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOF0gfHwga2V5U3RhdGVbODddKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKExlZnQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszN10gfHwga2V5U3RhdGVbNjVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoUmlnaHQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOV0gfHwga2V5U3RhdGVbNjhdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKERvd24gQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVs0MF0gfHwga2V5U3RhdGVbODNdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93bigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IHRydWU7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAvLyBFbnRlciBrZXlcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAocCkgUGF1c2VcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gODApIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTcGFjZSBiYXJcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9uOm9uLFxyXG4gICAgICAgICAgICBvbmtleTogb25rZXlcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgdXRpbCA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBmdW5jdGlvbiBfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGxldCBvYmoxUmlnaHRTaWRlID0gb2JqMS5zZXR0aW5ncy5wb3NYICsgb2JqMS5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajFMZWZ0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWDtcclxuICAgICAgICAgICAgbGV0IG9iajJSaWdodFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1ggKyBvYmoyLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICBsZXQgb2JqMkxlZnRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxlZnRTaWRlQ29sbGlzaW9uKCkgfHwgcmlnaHRTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBsZWZ0U2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICgob2JqMUxlZnRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxTGVmdFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByaWdodFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqMVJpZ2h0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMVJpZ2h0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja1RvcFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9iajEuc2V0dGluZ3MucG9zWSA+PSBvYmoyLnNldHRpbmdzLnBvc1kgJiYgb2JqMS5zZXR0aW5ncy5wb3NZIDw9IG9iajIuc2V0dGluZ3MucG9zWSArIG9iajIuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikgJiYgX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21OdW1iZXIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICAgICAgbGV0IGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSAnIyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxNSldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjaGVja0NvbGxpc2lvbjogY2hlY2tDb2xsaXNpb24sXHJcbiAgICAgICAgICAgIGdldFJhbmRvbU51bWJlcjogZ2V0UmFuZG9tTnVtYmVyLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21Db2xvcjogZ2V0UmFuZG9tQ29sb3JcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgY2FudmFzV2lkdGg6IDcyMCxcclxuICAgICAgICBjYW52YXNIZWlnaHQ6IDQ4MFxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHV0aWw6IHV0aWwsXHJcbiAgICAgICAgZmFjdG9yeTogZmFjdG9yeSxcclxuICAgICAgICBjb250cm9sczogY29udHJvbHMsXHJcbiAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtFTkdJTkV9IiwiY2xhc3MgTGFzZXIge1xyXG4gICAgY29uc3RydWN0b3IgKG9yaWdpblgsIG9yaWdpblkpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBwb3NYOiBvcmlnaW5YLFxyXG4gICAgICAgICAgICBwb3NZOiBvcmlnaW5ZLFxyXG4gICAgICAgICAgICB3aWR0aDogNC41LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI1XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZCA9IG5ldyB3aW5kb3cuSG93bCh7XHJcbiAgICAgICAgICAgIHVybHM6IFsnQXBwL0NvbnRlbnQvQXVkaW8vbGFzZXIubXAzJ11cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMGZmMDAnOyAvL0VOR0lORS51dGlsLmdldFJhbmRvbUNvbG9yKCk7XHJcbiAgICAgICAgY29udGV4dC5hcmModGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZIC09IDUuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheVNvdW5kKCkge1xyXG4gICAgICAgIHRoaXMuc291bmQucGxheSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyfSIsImltcG9ydCB7TGFzZXJ9IGZyb20gJy4vbGFzZXInO1xyXG5cclxuY2xhc3MgTGFzZXJDb2xsZWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubWF4TGFzZXJzID0gMTA7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGxldCB1cGRhdGVMYXNlciA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RbaW5kZXhdLnVwZGF0ZSgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgbGV0IGNoZWNrTGFzZXJCb3VuZHMgPSBmdW5jdGlvbihsYXNlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdFtpbmRleF0uc2V0dGluZ3MucG9zWSA8IC01KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3Quc2hpZnQoKTsgLy8gSWYgbGFzZXIgb3V0c2lkZSBvZiB0b3AgYm91bmRzIHJlbW92ZSBmcm9tIGFycmF5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNoZWNrTGFzZXJCb3VuZHMpO1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZUxhc2VyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBsZXQgZHJhdyA9IGZ1bmN0aW9uKGxhc2VyKSB7XHJcbiAgICAgICAgICAgIGxhc2VyLmRyYXcoY29udGV4dCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZHJhdyk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZShwb3NYLCBwb3NZKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGlzdC5sZW5ndGggPCB0aGlzLm1heExhc2Vycykge1xyXG4gICAgICAgICAgICBsZXQgbGFzZXIgPSBuZXcgTGFzZXIocG9zWCwgcG9zWSk7XHJcbiAgICAgICAgICAgIGxhc2VyLnBsYXlTb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYXNlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyQ29sbGVjdGlvbn0iLCJpbXBvcnQge0VOR0lORX0gZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuY2xhc3MgU2hpcCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMgPSBwcm9wZXJ0aWVzLmxhc2VycztcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDEpJyxcclxuICAgICAgICAgICAgcG9zWDogMjUsXHJcbiAgICAgICAgICAgIHBvc1k6IDM1MCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyNSxcclxuICAgICAgICAgICAgd2lkdGg6IDI1LFxyXG4gICAgICAgICAgICBzcGVlZDogNFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ0FwcC9Db250ZW50L0ltYWdlcy9zcGFjZXNoaXAucG5nJztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1kpO1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmRyYXcoY29udGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMuZmlyZSh0aGlzLnNldHRpbmdzLnBvc1ggKyAyMywgdGhpcy5zZXR0aW5ncy5wb3NZIC0gNSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLndpZHRoIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoICsgNzApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7U2hpcH0iXX0=
