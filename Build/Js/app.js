(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var ENGINE = require("./engine").ENGINE;

var CollisionDetection = require("./engine/collision-detection").CollisionDetection;

var Ship = require("./ship").Ship;

var LaserCollection = require("./laser-collection").LaserCollection;

var AsteroidCollection = require("./asteroid-collection").AsteroidCollection;

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
        asteroids.list.forEach(function (asteroid, index) {
            if (CollisionDetection.check(playerShip, asteroid)) {
                asteroids.list.splice(index, 1);
                removeLife();
            }
        });
    };

    var checkShipLaserAndAsteroidCollision = function checkShipLaserAndAsteroidCollision() {
        playerShip.lasers.list.forEach(function (laser, laserIndex) {
            asteroids.list.forEach(function (asteroid, asteroidIndex) {
                if (CollisionDetection.check(laser, asteroid)) {
                    playerShip.lasers.list.splice(laserIndex, 1);
                    asteroids.list.splice(asteroidIndex, 1);
                    addScore();
                    return 0;
                }
            });
        });
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
            $("#GameCanvas").width(ENGINE.settings.canvasWidth);
            $("#GameCanvas").height(ENGINE.settings.canvasHeight);
        }
    }
    //endregion
})();

},{"./asteroid-collection":2,"./engine":4,"./engine/collision-detection":5,"./laser-collection":6,"./ship":8}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var ENGINE = require("./engine").ENGINE;

var Asteroid = require("./asteroid").Asteroid;

var AsteroidCollection = (function () {
    function AsteroidCollection() {
        _classCallCheck(this, AsteroidCollection);

        this.list = [];
    }

    _createClass(AsteroidCollection, {
        update: {
            value: function update() {
                var checkAsteroidBounds = (function (asteroid, index) {
                    if (asteroid.settings.posY > ENGINE.settings.canvasHeight + 30) {
                        this.list.splice(index, 1);
                    }
                }).bind(this);

                this.list.forEach(checkAsteroidBounds);
                this.list.forEach(function (asteroid) {
                    return asteroid.update();
                });
            }
        },
        draw: {
            value: function draw(context) {
                this.list.forEach(function (asteroid) {
                    return asteroid.draw(context);
                });
            }
        },
        addAsteroid: {
            value: function addAsteroid() {
                this.list.push(new Asteroid());
            }
        }
    });

    return AsteroidCollection;
})();

exports.AsteroidCollection = AsteroidCollection;

},{"./asteroid":3,"./engine":4}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
        this.img.src = "app/Content/Images/asteroid-" + ENGINE.util.getRandomNumber(1, 4) + ".png";
    }

    _createClass(Asteroid, {
        draw: {
            value: function draw(context) {
                context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
            }
        },
        update: {
            value: function update() {
                this.settings.posY += this.settings.speed;
            }
        }
    });

    return Asteroid;
})();

exports.Asteroid = Asteroid;

},{"./engine":4}],4:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ENGINE = (function () {
    "use strict";

    var factory = (function () {
        var Game = (function () {
            function Game(properties) {
                _classCallCheck(this, Game);

                this._update = properties.update;
                this._draw = properties.draw;
                this._init = properties.init;
            }

            _createClass(Game, {
                update: {
                    value: function update() {
                        this._update();
                    }
                },
                draw: {
                    value: function draw() {
                        this._draw();
                    }
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
                    }
                }
            });

            return Game;
        })();

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

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var CollisionDetection = exports.CollisionDetection = (function () {
    function CollisionDetection() {
        _classCallCheck(this, CollisionDetection);
    }

    _createClass(CollisionDetection, null, {
        check: {
            value: function check(obj1, obj2) {
                if (this._horizontalCollision(obj1, obj2) && this._verticalPosition(obj1, obj2)) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        _horizontalCollision: {
            value: function _horizontalCollision(obj1, obj2) {
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
        },
        _verticalPosition: {
            value: function _verticalPosition(obj1, obj2) {
                if (checkTopSideCollision()) {
                    return true;
                } else {
                    return false;
                }

                function checkTopSideCollision() {
                    return obj1.settings.posY >= obj2.settings.posY && obj1.settings.posY <= obj2.settings.posY + obj2.settings.height;
                }
            }
        }
    });

    return CollisionDetection;
})();

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Laser = require("./laser").Laser;

var LaserCollection = (function () {
    function LaserCollection() {
        _classCallCheck(this, LaserCollection);

        this.maxLasers = 10;
        this.list = [];
    }

    _createClass(LaserCollection, {
        update: {
            value: function update() {
                var checkLaserBounds = (function (laser, index) {
                    if (this.list[index].settings.posY < -5) {
                        this.list.shift(); // If laser outside of top bounds remove from array
                    }
                }).bind(this);

                this.list.forEach(checkLaserBounds);
                this.list.forEach(function (laser) {
                    return laser.update();
                });
            }
        },
        draw: {
            value: function draw(context) {
                this.list.forEach(function (laser) {
                    return laser.draw(context);
                });
            }
        },
        fire: {
            value: function fire(posX, posY) {
                if (this.list.length < this.maxLasers) {
                    var laser = new Laser(posX, posY);
                    laser.playSound();
                    this.list.push(laser);
                }
            }
        }
    });

    return LaserCollection;
})();

exports.LaserCollection = LaserCollection;

},{"./laser":7}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
            urls: ["app/Content/Audio/laser.mp3"]
        });
    }

    _createClass(Laser, {
        draw: {
            value: function draw(context) {
                context.beginPath();
                context.fillStyle = "#00ff00";
                context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
                context.fill();
                context.closePath();
            }
        },
        update: {
            value: function update() {
                this.settings.posY -= 5.05;
            }
        },
        playSound: {
            value: function playSound() {
                this.sound.play();
            }
        }
    });

    return Laser;
})();

exports.Laser = Laser;

},{}],8:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
        this.img.src = "app/Content/Images/spaceship.png";
    }

    _createClass(Ship, {
        draw: {
            value: function draw(context) {
                context.drawImage(this.img, this.settings.posX, this.settings.posY);
                this.lasers.draw(context);
            }
        },
        update: {
            value: function update() {
                this.lasers.update();
            }
        },
        fire: {
            value: function fire() {
                this.lasers.fire(this.settings.posX + 23, this.settings.posY - 5);
            }
        },
        moveLeft: {
            value: function moveLeft() {
                if (this.settings.posX > 0) {
                    this.settings.posX = this.settings.posX - this.settings.speed;
                }
            }
        },
        moveRight: {
            value: function moveRight() {
                if (this.settings.posX + this.settings.width < ENGINE.settings.canvasWidth + 70) {
                    this.settings.posX = this.settings.posX + this.settings.speed;
                }
            }
        },
        moveUp: {
            value: function moveUp() {
                if (this.settings.posY > 0) {
                    this.settings.posY = this.settings.posY - this.settings.speed;
                }
            }
        },
        moveDown: {
            value: function moveDown() {
                if (this.settings.posY < ENGINE.settings.canvasHeight - 40) {
                    this.settings.posY = this.settings.posY + this.settings.speed;
                }
            }
        }
    });

    return Ship;
})();

exports.Ship = Ship;

},{"./engine":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2FwcC5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvYXN0ZXJvaWQtY29sbGVjdGlvbi5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvYXN0ZXJvaWQuanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2VuZ2luZS5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvZW5naW5lL2NvbGxpc2lvbi1kZXRlY3Rpb24uanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2xhc2VyLWNvbGxlY3Rpb24uanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2xhc2VyLmpzIiwiYzovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9zaGlwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7SUNBUyxNQUFNLFdBQU8sVUFBVSxFQUF2QixNQUFNOztJQUNQLGtCQUFrQixXQUFPLDhCQUE4QixFQUF2RCxrQkFBa0I7O0lBRWxCLElBQUksV0FBTyxRQUFRLEVBQW5CLElBQUk7O0lBQ0osZUFBZSxXQUFPLG9CQUFvQixFQUExQyxlQUFlOztJQUNmLGtCQUFrQixXQUFPLHVCQUF1QixFQUFoRCxrQkFBa0I7O0FBRzFCLENBQUMsWUFBVztBQUNSLGdCQUFZLENBQUM7OztBQUdiLFFBQU0sVUFBVSxHQUFHO0FBQ2YsYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtBQUNaLGFBQUssRUFBRSxPQUFPO0FBQ2QsWUFBSSxFQUFFLE1BQU07S0FDZixDQUFDOzs7QUFHRixRQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLFFB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O0FBRUQsaUJBQVM7bUJBQUEscUJBQUc7QUFDUixvQkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUU7QUFDN0Usd0JBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNqRTthQUNKOztBQUVELGNBQU07bUJBQUEsa0JBQUc7QUFDTCxvQkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDeEIsd0JBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2lCQUNqRTthQUNKOztBQUVELGdCQUFRO21CQUFBLG9CQUFHO0FBQ1Asb0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsRUFBRSxFQUFFO0FBQ3hELHdCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQkFDakU7YUFDSjs7OztXQXBEQyxJQUFJOzs7UUF1REYsSUFBSSxHQUFKLElBQUkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwi77u/aW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuaW1wb3J0IHtDb2xsaXNpb25EZXRlY3Rpb259IGZyb20gJy4vZW5naW5lL2NvbGxpc2lvbi1kZXRlY3Rpb24nO1xyXG5cclxuaW1wb3J0IHtTaGlwfSBmcm9tICcuL3NoaXAnO1xyXG5pbXBvcnQge0xhc2VyQ29sbGVjdGlvbn0gZnJvbSAnLi9sYXNlci1jb2xsZWN0aW9uJztcclxuaW1wb3J0IHtBc3Rlcm9pZENvbGxlY3Rpb259IGZyb20gJy4vYXN0ZXJvaWQtY29sbGVjdGlvbic7XHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lXHJcbiAgICBsZXQgcGxheWVyU2hpcCA9IG5ldyBTaGlwKHtcclxuICAgICAgICBsYXNlcnM6IG5ldyBMYXNlckNvbGxlY3Rpb24oKVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGFzdGVyb2lkcyA9IG5ldyBBc3Rlcm9pZENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICBsZXQgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBhc3Rlcm9pZHMubGlzdC5mb3JFYWNoKChhc3Rlcm9pZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKENvbGxpc2lvbkRldGVjdGlvbi5jaGVjayhwbGF5ZXJTaGlwLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaWZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goKGxhc2VyLCBsYXNlckluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LmZvckVhY2goKGFzdGVyb2lkLCBhc3Rlcm9pZEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQ29sbGlzaW9uRGV0ZWN0aW9uLmNoZWNrKGxhc2VyLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LnNwbGljZShsYXNlckluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3Rlcm9pZHMubGlzdC5zcGxpY2UoYXN0ZXJvaWRJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkU2NvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2NhbGVTY3JlZW4oKTtcclxuICAgICAgICB0b3VjaFNldHVwKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRU5HSU5FLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBBVVNFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoLCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KTtcclxuICAgICAgICAgICAgZHJhd1Njb3JlKCk7XHJcbiAgICAgICAgICAgIGRyYXdMaXZlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllclNoaXAuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmRyYXcoY3R4KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBhc3Rlcm9pZHMuYWRkQXN0ZXJvaWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LCAxNDAgLSAoRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMTAwKSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIFRvdWNoIEdhbWUgQ29udHJvbHNcclxuICAgIGZ1bmN0aW9uIHRvdWNoU2V0dXAoKSB7XHJcbiAgICAgICAgbGV0IHRvdWNoYWJsZSA9ICdjcmVhdGVUb3VjaCcgaW4gZG9jdW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0b3VjaGFibGUpIHtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RvdWNoc3RhcnQnKTtcclxuXHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCB8fCBnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICBzdGFydE5ld0dhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYID4gRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMikge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5maXJlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZXZlbnQpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBicm93c2VyIGZyb20gZG9pbmcgaXRzIGRlZmF1bHQgdGhpbmcgKHNjcm9sbCwgem9vbSlcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0b3VjaG1vdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xyXG4gICAgICAgIC8vZG8gc3R1ZmZcclxuICAgICAgICBjb25zb2xlLmxvZygndG91Y2hlbmQnKTtcclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gS2V5IEdhbWUgQ29udHJvbHNcclxuICAgIEVOR0lORS5jb250cm9scy5vbignbGVmdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9uKCdyaWdodCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVSaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbigndXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlVXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFTkdJTkUuY29udHJvbHMub24oJ2Rvd24nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlRG93bigpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVOR0lORS5jb250cm9scy5vbmtleSgnc3BhY2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5maXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdwYXVzZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHBhdXNlR2FtZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgRU5HSU5FLmNvbnRyb2xzLm9ua2V5KCdlbnRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQgfHwgZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgc3RhcnROZXdHYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIEhlbHBlciBGdW5jdGlvbnNcclxuICAgIGZ1bmN0aW9uIGRyYXdTdGFydFNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtc3RhcnQtc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhpZGVTdGFydFNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtc3RhcnQtc2NyZWVuJykuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0TmV3R2FtZSgpIHtcclxuICAgICAgICBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICBnYW1lU2NvcmUgPSAwO1xyXG4gICAgICAgIGhpZGVTdGFydFNjcmVlbigpO1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhdXNlR2FtZSgpIHtcclxuICAgICAgICBkcmF3UGF1c2VTY3JlZW4oKTtcclxuXHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUEFVU0U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QTEFZO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3UGF1c2VTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXBhdXNlLXNjcmVlbicpLnRvZ2dsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuZEdhbWUoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbWUtb3Zlci1zY3JlZW4nKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkU2NvcmUoKSB7XHJcbiAgICAgICAgZ2FtZVNjb3JlICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1Njb3JlKCkge1xyXG4gICAgICAgICQoJy5qcy1zY29yZScpLmh0bWwoJ1Njb3JlOicgKyBnYW1lU2NvcmUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpZmUoKSB7XHJcbiAgICAgICAgaWYgKGdhbWVMaXZlcyA+IDApIHtcclxuICAgICAgICAgICAgZ2FtZUxpdmVzIC09IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5PVkVSO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3TGl2ZXMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWxpdmVzJykuaHRtbCgnTGl2ZXM6JyArIGdhbWVMaXZlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2NhbGVTY3JlZW4oKSB7XHJcbiAgICAgICAgaWYgKE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCwgd2luZG93LmlubmVyV2lkdGggfHwgMCkgPCA3MjApIHtcclxuICAgICAgICAgICAgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKTtcclxuICAgICAgICAgICAgRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCA9IE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKTtcclxuICAgICAgICAgICAgY3R4LmNhbnZhcy53aWR0aCAgPSBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGg7XHJcbiAgICAgICAgICAgIGN0eC5jYW52YXMuaGVpZ2h0ID0gRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodDtcclxuXHJcbiAgICAgICAgICAgICQoJy5ub3RpZmljYXRpb25zJykucmVtb3ZlQ2xhc3MoJ2xhcmdlLXNjcmVlbicpO1xyXG4gICAgICAgICAgICAkKCcjR2FtZUNhbnZhcycpLndpZHRoKEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCk7XHJcbiAgICAgICAgICAgICQoJyNHYW1lQ2FudmFzJykuaGVpZ2h0KEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcbn0oKSk7XHJcbiIsImltcG9ydCB7RU5HSU5FfSBmcm9tICcuL2VuZ2luZSc7XHJcbmltcG9ydCB7QXN0ZXJvaWR9IGZyb20gJy4vYXN0ZXJvaWQnO1xyXG5cclxuY2xhc3MgQXN0ZXJvaWRDb2xsZWN0aW9uIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY2hlY2tBc3Rlcm9pZEJvdW5kcyA9IGZ1bmN0aW9uKGFzdGVyb2lkLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAoYXN0ZXJvaWQuc2V0dGluZ3MucG9zWSA+IEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQgKyAzMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNoZWNrQXN0ZXJvaWRCb3VuZHMpO1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGFzdGVyb2lkID0+IGFzdGVyb2lkLnVwZGF0ZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChhc3Rlcm9pZCA9PiBhc3Rlcm9pZC5kcmF3KGNvbnRleHQpKTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRBc3Rlcm9pZCgpIHtcclxuICAgICAgICB0aGlzLmxpc3QucHVzaChuZXcgQXN0ZXJvaWQoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7QXN0ZXJvaWRDb2xsZWN0aW9ufTsiLCJpbXBvcnQge0VOR0lORX0gZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuY2xhc3MgQXN0ZXJvaWQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbGV0IHJhbmdlID0gRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDMwLCAxMDApO1xyXG5cclxuICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogcmFuZ2UsXHJcbiAgICAgICAgICAgIGhlaWdodDogcmFuZ2UsXHJcbiAgICAgICAgICAgIHNwZWVkOiBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMiwgNilcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMCAtIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MuaGVpZ2h0ICogLTI7XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ2FwcC9Db250ZW50L0ltYWdlcy9hc3Rlcm9pZC0nICsgRU5HSU5FLnV0aWwuZ2V0UmFuZG9tTnVtYmVyKDEsIDQpICsgJy5wbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSwgdGhpcy5zZXR0aW5ncy53aWR0aCwgdGhpcy5zZXR0aW5ncy5oZWlnaHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgKz0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtBc3Rlcm9pZH07Iiwi77u/dmFyIEVOR0lORSA9IChmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBsZXQgZmFjdG9yeSA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBjbGFzcyBHYW1lIHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlID0gcHJvcGVydGllcy51cGRhdGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3ID0gcHJvcGVydGllcy5kcmF3O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCA9IHByb3BlcnRpZXMuaW5pdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXBkYXRlKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRyYXcoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0YXJ0KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGdhbWVMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZSh1cGRhdGUsIGRyYXcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lKHVwZGF0ZSwgZHJhdyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lT2JqZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWVPYmplY3QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWU6IGNyZWF0ZUdhbWUsXHJcbiAgICAgICAgICAgIGNyZWF0ZUdhbWVPYmplY3Q6IGNyZWF0ZUdhbWVPYmplY3RcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgY29udHJvbHMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGV0IGV2ZW50QWN0aW9ucyA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlTdGF0ZSA9IHt9O1xyXG4gICAgICAgIGxldCBrZXlBY3Rpb24gPSB7XHJcbiAgICAgICAgICAgIHNwYWNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gc3BhY2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBwYXVzZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBlbnRlcjogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIGVudGVyIG5vdCBkZWZpbmVkJyk7IH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb24gPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZG93bic6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbmtleSA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNvbnRyb2xzTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyAoVXAgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOF0gfHwga2V5U3RhdGVbODddKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMudXAoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKExlZnQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszN10gfHwga2V5U3RhdGVbNjVdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMubGVmdCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoUmlnaHQgQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVszOV0gfHwga2V5U3RhdGVbNjhdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKERvd24gQXJyb3cpXHJcbiAgICAgICAgICAgIGlmIChrZXlTdGF0ZVs0MF0gfHwga2V5U3RhdGVbODNdKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93bigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY29udHJvbHNMb29wKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IHRydWU7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gZmFsc2U7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAvLyBFbnRlciBrZXlcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAocCkgUGF1c2VcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gODApIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBTcGFjZSBiYXJcclxuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9uOm9uLFxyXG4gICAgICAgICAgICBvbmtleTogb25rZXlcclxuICAgICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBsZXQgdXRpbCA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21OdW1iZXIobWluLCBtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICAgICAgbGV0IGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRicuc3BsaXQoJycpO1xyXG4gICAgICAgICAgICBsZXQgY29sb3IgPSAnIyc7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxNSldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBnZXRSYW5kb21OdW1iZXI6IGdldFJhbmRvbU51bWJlcixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tQ29sb3I6IGdldFJhbmRvbUNvbG9yXHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHNldHRpbmdzID0ge1xyXG4gICAgICAgIGNhbnZhc1dpZHRoOiA3MjAsXHJcbiAgICAgICAgY2FudmFzSGVpZ2h0OiA0ODBcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB1dGlsOiB1dGlsLFxyXG4gICAgICAgIGZhY3Rvcnk6IGZhY3RvcnksXHJcbiAgICAgICAgY29udHJvbHM6IGNvbnRyb2xzLFxyXG4gICAgICAgIHNldHRpbmdzOiBzZXR0aW5nc1xyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbmV4cG9ydCB7RU5HSU5FfTsiLCJleHBvcnQgY2xhc3MgQ29sbGlzaW9uRGV0ZWN0aW9uIHtcclxuICAgIHN0YXRpYyBjaGVjayhvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikgJiYgdGhpcy5fdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgbGV0IG9iajFSaWdodFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1ggKyBvYmoxLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgIGxldCBvYmoxTGVmdFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1g7XHJcbiAgICAgICAgbGV0IG9iajJSaWdodFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1ggKyBvYmoyLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgIGxldCBvYmoyTGVmdFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1g7XHJcblxyXG4gICAgICAgIGlmIChsZWZ0U2lkZUNvbGxpc2lvbigpIHx8IHJpZ2h0U2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxlZnRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoKG9iajFMZWZ0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMUxlZnRTaWRlIDw9IG9iajJSaWdodFNpZGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmlnaHRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICBpZiAob2JqMVJpZ2h0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMVJpZ2h0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgX3ZlcnRpY2FsUG9zaXRpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgIGlmIChjaGVja1RvcFNpZGVDb2xsaXNpb24oKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGVja1RvcFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAob2JqMS5zZXR0aW5ncy5wb3NZID49IG9iajIuc2V0dGluZ3MucG9zWSAmJiBvYmoxLnNldHRpbmdzLnBvc1kgPD0gb2JqMi5zZXR0aW5ncy5wb3NZICsgb2JqMi5zZXR0aW5ncy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbXBvcnQge0xhc2VyfSBmcm9tICcuL2xhc2VyJztcclxuXHJcbmNsYXNzIExhc2VyQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1heExhc2VycyA9IDEwO1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY2hlY2tMYXNlckJvdW5kcyA9IGZ1bmN0aW9uKGxhc2VyLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saXN0W2luZGV4XS5zZXR0aW5ncy5wb3NZIDwgLTUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zaGlmdCgpOyAvLyBJZiBsYXNlciBvdXRzaWRlIG9mIHRvcCBib3VuZHMgcmVtb3ZlIGZyb20gYXJyYXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tMYXNlckJvdW5kcyk7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2gobGFzZXIgPT4gbGFzZXIudXBkYXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGxhc2VyID0+IGxhc2VyLmRyYXcoY29udGV4dCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUocG9zWCwgcG9zWSkge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3QubGVuZ3RoIDwgdGhpcy5tYXhMYXNlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGxhc2VyID0gbmV3IExhc2VyKHBvc1gsIHBvc1kpO1xyXG4gICAgICAgICAgICBsYXNlci5wbGF5U291bmQoKTtcclxuICAgICAgICAgICAgdGhpcy5saXN0LnB1c2gobGFzZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtMYXNlckNvbGxlY3Rpb259OyIsImNsYXNzIExhc2VyIHtcclxuICAgIGNvbnN0cnVjdG9yIChvcmlnaW5YLCBvcmlnaW5ZKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgcG9zWDogb3JpZ2luWCxcclxuICAgICAgICAgICAgcG9zWTogb3JpZ2luWSxcclxuICAgICAgICAgICAgd2lkdGg6IDQuNSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyNVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc291bmQgPSBuZXcgd2luZG93Lkhvd2woe1xyXG4gICAgICAgICAgICB1cmxzOiBbJ2FwcC9Db250ZW50L0F1ZGlvL2xhc2VyLm1wMyddXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMGZmMDAnO1xyXG4gICAgICAgIGNvbnRleHQuYXJjKHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSAtPSA1LjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlTb3VuZCgpIHtcclxuICAgICAgICB0aGlzLnNvdW5kLnBsYXkoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtMYXNlcn07IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuXHJcbmNsYXNzIFNoaXAge1xyXG4gICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXHJcbiAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICBwb3NZOiAzNTAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjUsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgc3BlZWQ6IDRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICdhcHAvQ29udGVudC9JbWFnZXMvc3BhY2VzaGlwLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICB0aGlzLmxhc2Vycy5kcmF3KGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmxhc2Vycy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmZpcmUodGhpcy5zZXR0aW5ncy5wb3NYICsgMjMsIHRoaXMuc2V0dGluZ3MucG9zWSAtIDUpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCArIDcwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge1NoaXB9OyJdfQ==
