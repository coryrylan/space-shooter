(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Ship = _interopRequire(require("./ship"));

var LaserCollection = _interopRequire(require("./laserCollection"));

var Asteroid = _interopRequire(require("./asteroid"));

var AsteroidCollection = _interopRequire(require("./asteroidCollection"));

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

    // Get in collection class and remove import for Asteroid
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

},{"./asteroid":2,"./asteroidCollection":3,"./engine":4,"./laserCollection":6,"./ship":7}],2:[function(require,module,exports){
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
})();

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Laser = _interopRequire(require("./laser"));

(function () {
    "use strict";

    //class Laser {
    //    constructor (originX, originY) {
    //        this.settings = {
    //            posX: originX,
    //            posY: originY,
    //            width: 4.5,
    //            height: 25
    //        };
    //    }
    //
    //    draw(context) {
    //        context.beginPath();
    //        context.fillStyle = '#00ff00';
    //        context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
    //        context.fill();
    //        context.closePath();
    //    }
    //
    //    update() {
    //        this.settings.posY -= 5.05;
    //    }
    //
    //    playSound() {
    //        let sound = new Howl({
    //            urls: ['App/Content/Audio/laser.mp3']
    //        });
    //
    //        //sound.play();
    //    }
    //}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2FwcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9hc3Rlcm9pZENvbGxlY3Rpb24uanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL2xhc2VyQ29sbGVjdGlvbi5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztJQ0FRLElBQUksMkJBQU0sUUFBUTs7SUFDbkIsZUFBZSwyQkFBTSxtQkFBbUI7O0lBQ3hDLFFBQVEsMkJBQU0sWUFBWTs7SUFDMUIsa0JBQWtCLDJCQUFNLHNCQUFzQjs7SUFDOUMsTUFBTSwyQkFBTSxVQUFVOztBQUU3QixBQUFDLENBQUEsWUFBVztBQUNSLGdCQUFZLENBQUM7OztBQUdiLFFBQU0sVUFBVSxHQUFHO0FBQ2YsYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtBQUNaLGFBQUssRUFBRSxPQUFPO0FBQ2QsWUFBSSxFQUFFLE1BQU07S0FDZixDQUFDOzs7QUFHRixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMs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QUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO3FCQUNqRTtpQkFDSjs7OztBQUVELGtCQUFNO3VCQUFBLGtCQUFHO0FBQ0wsd0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLDRCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztxQkFDakU7aUJBQ0o7Ozs7QUFFRCxvQkFBUTt1QkFBQSxvQkFBRztBQUNQLHdCQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGFBQWEsR0FBRyxFQUFFLEVBQUU7QUFDekMsNEJBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO3FCQUNqRTtpQkFDSjs7Ozs7O2VBeERrQixJQUFJO1FBeUQxQixDQUFBO0NBQ0osQ0FBQSxFQUFFLENBQUUiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/aW1wb3J0IFNoaXAgZnJvbSAnLi9zaGlwJztcclxuaW1wb3J0IExhc2VyQ29sbGVjdGlvbiBmcm9tICcuL2xhc2VyQ29sbGVjdGlvbic7XHJcbmltcG9ydCBBc3Rlcm9pZCBmcm9tICcuL2FzdGVyb2lkJztcclxuaW1wb3J0IEFzdGVyb2lkQ29sbGVjdGlvbiBmcm9tICcuL2FzdGVyb2lkQ29sbGVjdGlvbic7XHJcbmltcG9ydCBFTkdJTkUgZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICBjb25zdCBDQU5WQVNfV0lEVEggPSA3MjA7XHJcbiAgICBjb25zdCBDQU5WQVNfSEVJR0hUID0gNDgwO1xyXG5cclxuICAgIC8vcmVnaW9uIEdhbWVcclxuICAgIGxldCBwbGF5ZXJTaGlwID0gbmV3IFNoaXAoe1xyXG4gICAgICAgIGxhc2VyczogbmV3IExhc2VyQ29sbGVjdGlvbigpXHJcbiAgICB9KTtcclxuXHJcbiAgICBsZXQgYXN0ZXJvaWRzID0gbmV3IEFzdGVyb2lkQ29sbGVjdGlvbigpO1xyXG5cclxuICAgIGxldCBjaGVja1NoaXBBbmRBc3Rlcm9pZENvbGxpc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFzdGVyb2lkcy5saXN0LmZvckVhY2goX2NoZWNrU2hpcENvbGxpc2lvbik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF9jaGVja1NoaXBDb2xsaXNpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihwbGF5ZXJTaGlwLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaWZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGVja0xhc2VyQ29sbGlzaW9uID0gZnVuY3Rpb24obGFzZXIsIGxhc2VySW5kZXgpIHtcclxuICAgICAgICAgICAgLy8gRm9yIGV2ZXJ5IGFzdGVyb2lkXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0ZXJvaWRzLmxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChFTkdJTkUudXRpbC5jaGVja0NvbGxpc2lvbihsYXNlciwgYXN0ZXJvaWRzLmxpc3RbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyU2hpcC5sYXNlcnMubGlzdC5zcGxpY2UobGFzZXJJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3Quc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFkZFNjb3JlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goY2hlY2tMYXNlckNvbGxpc2lvbik7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRU5HSU5FLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBDQU5WQVNfV0lEVEgsIENBTlZBU19IRUlHSFQpO1xyXG4gICAgICAgICAgICBkcmF3U2NvcmUoKTtcclxuICAgICAgICAgICAgZHJhd0xpdmVzKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUKSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3U3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5kcmF3KGN0eCk7XHJcbiAgICAgICAgICAgICAgICBhc3Rlcm9pZHMuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QQVVTRSkge1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgLy8gR2V0IGluIGNvbGxlY3Rpb24gY2xhc3MgYW5kIHJlbW92ZSBpbXBvcnQgZm9yIEFzdGVyb2lkXHJcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgYXN0ZXJvaWRzLmxpc3QucHVzaChuZXcgQXN0ZXJvaWQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgMTQwIC0gKENBTlZBU19XSURUSCAvIDEwMCkpO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lIENvbnRyb2xzXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ2xlZnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbigncmlnaHQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlUmlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ3VwJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVVwKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdkb3duJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZURvd24oKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub25rZXkoJ3NwYWNlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAuZmlyZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgncGF1c2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBwYXVzZUdhbWUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgnZW50ZXInLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUIHx8IGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TmV3R2FtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBIZWxwZXIgRnVuY3Rpb25zXHJcbiAgICBmdW5jdGlvbiBkcmF3U3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoaWRlU3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydE5ld0dhbWUoKSB7XHJcbiAgICAgICAgZ2FtZUxpdmVzID0gMztcclxuICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgZ2FtZVNjb3JlID0gMDtcclxuICAgICAgICBoaWRlU3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXVzZUdhbWUoKSB7XHJcbiAgICAgICAgZHJhd1BhdXNlU2NyZWVuKCk7XHJcblxyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBBVVNFO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1BhdXNlU2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1wYXVzZS1zY3JlZW4nKS50b2dnbGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmRHYW1lKCkge1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFNjb3JlKCkge1xyXG4gICAgICAgIGdhbWVTY29yZSArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdTY29yZSgpIHtcclxuICAgICAgICAkKCcuanMtc2NvcmUnKS5odG1sKCdTY29yZTonICsgZ2FtZVNjb3JlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVMaWZlKCkge1xyXG4gICAgICAgIGlmIChnYW1lTGl2ZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIGdhbWVMaXZlcyAtPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuT1ZFUjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd0xpdmVzKCkge1xyXG4gICAgICAgICQoJy5qcy1saXZlcycpLmh0bWwoJ0xpdmVzOicgKyBnYW1lTGl2ZXMpO1xyXG4gICAgfVxyXG4gICAgLy9lbmRyZWdpb25cclxufSgpKTtcclxuIiwiaW1wb3J0IEVOR0lORSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgY29uc3QgQ0FOVkFTX1dJRFRIID0gNzIwO1xyXG4gICAgY29uc3QgQ0FOVkFTX0hFSUdIVCA9IDQ4MDtcclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEFzdGVyb2lkIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgbGV0IHJhbmdlID0gRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDMwLCAxMDApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiByYW5nZSxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogcmFuZ2UsXHJcbiAgICAgICAgICAgICAgICBzcGVlZDogRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDIsIDYpXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMCAtIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBDQU5WQVNfV0lEVEgpO1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLmhlaWdodCAqIC0yO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgdGhpcy5pbWcuc3JjID0gJ0FwcC9Db250ZW50L0ltYWdlcy9hc3Rlcm9pZC0nICsgRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDEsIDQpICsgJy5wbmcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSwgdGhpcy5zZXR0aW5ncy53aWR0aCwgdGhpcy5zZXR0aW5ncy5oZWlnaHQpO1xyXG5cclxuICAgICAgICAgICAgLy90aGlzLmltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gICAgY3R4LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1kpO1xyXG4gICAgICAgICAgICAvL30uYmluZCh0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZICs9IHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSgpKTsiLCJpbXBvcnQgRU5HSU5FIGZyb20gJy4vZW5naW5lJztcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBjb25zdCBDQU5WQVNfV0lEVEggPSA3MjA7XHJcbiAgICBjb25zdCBDQU5WQVNfSEVJR0hUID0gNDgwO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgQXN0ZXJvaWRDb2xsZWN0aW9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGxldCBjaGVja0FzdGVyb2lkQm91bmRzID0gZnVuY3Rpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXN0ZXJvaWQuc2V0dGluZ3MucG9zWSA+IENBTlZBU19IRUlHSFQgKyAzMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdXBkYXRlID0gZnVuY3Rpb24oYXN0ZXJvaWQpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tBc3Rlcm9pZEJvdW5kcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgbGV0IGRyYXcgPSBmdW5jdGlvbihhc3Rlcm9pZCkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWQuZHJhdyhjb250ZXh0KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGRyYXcpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0oKSk7Iiwi77u/KGZ1bmN0aW9uKCkgeyAgIC8vIFRlbXAgdW50aWwgd2UgZ2V0IGEgbW9kdWxlIHN5c3RlbSBpbiBwbGFjZSAoQ29udmVydCB0byBhIEVTNiBtb2R1bGUpXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IGZhY3RvcnkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xhc3MgR2FtZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSA9IHByb3BlcnRpZXMudXBkYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdyA9IHByb3BlcnRpZXMuZHJhdztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRyYXcoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdhbWVMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY2xhc3MgR2FtZU9iamVjdCB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMwMDAwMDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1g6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWTogMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZSh1cGRhdGUsIGRyYXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lKHVwZGF0ZSwgZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lT2JqZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWVPYmplY3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWU6IGNyZWF0ZUdhbWUsXHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWVPYmplY3Q6IGNyZWF0ZUdhbWVPYmplY3RcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgY29udHJvbHMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50QWN0aW9ucyA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlTdGF0ZSA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlBY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIHNwYWNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gc3BhY2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBwYXVzZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIGVudGVyIG5vdCBkZWZpbmVkJyk7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb24gPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbmtleSA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRyb2xzTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAoVXAgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOF0gfHwga2V5U3RhdGVbODddKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKExlZnQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszN10gfHwga2V5U3RhdGVbNjVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoUmlnaHQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOV0gfHwga2V5U3RhdGVbNjhdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKERvd24gQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVs0MF0gfHwga2V5U3RhdGVbODNdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93bigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IHRydWU7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAvLyBFbnRlciBrZXlcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAocCkgUGF1c2VcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gODApIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTcGFjZSBiYXJcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9uOm9uLFxyXG4gICAgICAgICAgICBvbmtleTogb25rZXlcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgdXRpbCA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBmdW5jdGlvbiBfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGxldCBvYmoxUmlnaHRTaWRlID0gb2JqMS5zZXR0aW5ncy5wb3NYICsgb2JqMS5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajFMZWZ0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWDtcclxuICAgICAgICAgICAgbGV0IG9iajJSaWdodFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1ggKyBvYmoyLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICBsZXQgb2JqMkxlZnRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxlZnRTaWRlQ29sbGlzaW9uKCkgfHwgcmlnaHRTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBsZWZ0U2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmICgob2JqMUxlZnRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxTGVmdFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiByaWdodFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAob2JqMVJpZ2h0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMVJpZ2h0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja1RvcFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9iajEuc2V0dGluZ3MucG9zWSA+PSBvYmoyLnNldHRpbmdzLnBvc1kgJiYgb2JqMS5zZXR0aW5ncy5wb3NZIDw9IG9iajIuc2V0dGluZ3MucG9zWSArIG9iajIuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBpZiAoX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikgJiYgX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21OdW1iZXIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICAgICAgbGV0IGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSAnIyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxNSldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjaGVja0NvbGxpc2lvbjogY2hlY2tDb2xsaXNpb24sXHJcbiAgICAgICAgICAgIGdldFJhbmRvbU51bWJlcjogZ2V0UmFuZG9tTnVtYmVyLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21Db2xvcjogZ2V0UmFuZG9tQ29sb3JcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgRU5HSU5FID0ge1xyXG4gICAgICAgIHV0aWw6IHV0aWwsXHJcbiAgICAgICAgZmFjdG9yeTogZmFjdG9yeSxcclxuICAgICAgICBjb250cm9sczogY29udHJvbHNcclxuICAgIH07XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBFTkdJTkU7XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICBsZXQgSG93bCA9IHdpbmRvdy5Ib3dsO1xyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgTGFzZXIge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yIChvcmlnaW5YLCBvcmlnaW5ZKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICBwb3NYOiBvcmlnaW5YLFxyXG4gICAgICAgICAgICAgICAgcG9zWTogb3JpZ2luWSxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiA0LjUsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDI1XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcclxuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwZmYwMCc7IC8vRU5HSU5FLnV0aWwuZ2V0UmFuZG9tQ29sb3IoKTtcclxuICAgICAgICAgICAgY29udGV4dC5hcmModGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgLT0gNS4wNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBsYXlTb3VuZCgpIHtcclxuICAgICAgICAgICAgbGV0IHNvdW5kID0gbmV3IEhvd2woe1xyXG4gICAgICAgICAgICAgICAgdXJsczogWydBcHAvQ29udGVudC9BdWRpby9sYXNlci5tcDMnXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vc291bmQucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTsiLCJpbXBvcnQgTGFzZXIgZnJvbSAnLi9sYXNlcic7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgLy9jbGFzcyBMYXNlciB7XHJcbiAgICAvLyAgICBjb25zdHJ1Y3RvciAob3JpZ2luWCwgb3JpZ2luWSkge1xyXG4gICAgLy8gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAvLyAgICAgICAgICAgIHBvc1g6IG9yaWdpblgsXHJcbiAgICAvLyAgICAgICAgICAgIHBvc1k6IG9yaWdpblksXHJcbiAgICAvLyAgICAgICAgICAgIHdpZHRoOiA0LjUsXHJcbiAgICAvLyAgICAgICAgICAgIGhlaWdodDogMjVcclxuICAgIC8vICAgICAgICB9O1xyXG4gICAgLy8gICAgfVxyXG4gICAgLy9cclxuICAgIC8vICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgLy8gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAvLyAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwZmYwMCc7XHJcbiAgICAvLyAgICAgICAgY29udGV4dC5hcmModGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAvLyAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAvLyAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgIC8vICAgIH1cclxuICAgIC8vXHJcbiAgICAvLyAgICB1cGRhdGUoKSB7XHJcbiAgICAvLyAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZIC09IDUuMDU7XHJcbiAgICAvLyAgICB9XHJcbiAgICAvL1xyXG4gICAgLy8gICAgcGxheVNvdW5kKCkge1xyXG4gICAgLy8gICAgICAgIGxldCBzb3VuZCA9IG5ldyBIb3dsKHtcclxuICAgIC8vICAgICAgICAgICAgdXJsczogWydBcHAvQ29udGVudC9BdWRpby9sYXNlci5tcDMnXVxyXG4gICAgLy8gICAgICAgIH0pO1xyXG4gICAgLy9cclxuICAgIC8vICAgICAgICAvL3NvdW5kLnBsYXkoKTtcclxuICAgIC8vICAgIH1cclxuICAgIC8vfVxyXG5cclxuICAgIG1vZHVsZS5leHBvcnRzID0gY2xhc3MgTGFzZXJDb2xsZWN0aW9uIHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXhMYXNlcnMgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgIGxldCB1cGRhdGVMYXNlciA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0W2luZGV4XS51cGRhdGUoKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNoZWNrTGFzZXJCb3VuZHMgPSBmdW5jdGlvbihsYXNlciwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpc3RbaW5kZXhdLnNldHRpbmdzLnBvc1kgPCAtNSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zaGlmdCgpOyAvLyBJZiBsYXNlciBvdXRzaWRlIG9mIHRvcCBib3VuZHMgcmVtb3ZlIGZyb20gYXJyYXlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tMYXNlckJvdW5kcyk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKHVwZGF0ZUxhc2VyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgICAgICBsZXQgZHJhdyA9IGZ1bmN0aW9uKGxhc2VyKSB7XHJcbiAgICAgICAgICAgICAgICBsYXNlci5kcmF3KGNvbnRleHQpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saXN0LmZvckVhY2goZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaXJlKHBvc1gsIHBvc1kpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGlzdC5sZW5ndGggPCB0aGlzLm1heExhc2Vycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc2VyID0gbmV3IExhc2VyKHBvc1gsIHBvc1kpO1xyXG4gICAgICAgICAgICAgICAgbGFzZXIucGxheVNvdW5kKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYXNlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGNvbnN0IENBTlZBU19XSURUSCA9IDcyMDtcclxuICAgIGNvbnN0IENBTlZBU19IRUlHSFQgPSA0ODA7XHJcblxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBTaGlwIHtcclxuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDEpJyxcclxuICAgICAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICAgICAgcG9zWTogMzUwLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAyNSxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgICAgIHNwZWVkOiA0XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmltZy5zcmMgPSAnQXBwL0NvbnRlbnQvSW1hZ2VzL3NwYWNlc2hpcC5wbmcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSk7XHJcbiAgICAgICAgICAgIHRoaXMubGFzZXJzLmRyYXcoY29udGV4dCk7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMuaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1kpO1xyXG4gICAgICAgICAgICAvL30uYmluZCh0aGlzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXNlcnMudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaXJlKCkge1xyXG4gICAgICAgICAgICB0aGlzLmxhc2Vycy5maXJlKHRoaXMuc2V0dGluZ3MucG9zWCArIDIzLCB0aGlzLnNldHRpbmdzLnBvc1kgLSA1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IENBTlZBU19XSURUSCArIDcwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSB0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWSA8IENBTlZBU19IRUlHSFQgLSA0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTsiXX0=
