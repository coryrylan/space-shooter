(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Engine = require("./engine/engine").Engine;

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

    var game = Engine.factory.createGame({
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
            ctx.clearRect(0, 0, Engine.settings.canvasWidth, Engine.settings.canvasHeight);
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
    }, 140 - Engine.settings.canvasWidth / 100);
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
            if (event.touches[0].clientX > Engine.settings.canvasWidth / 2) {
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
    Engine.controls.on("left", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveLeft();
        }
    });

    Engine.controls.on("right", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveRight();
        }
    });

    Engine.controls.on("up", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveUp();
        }
    });

    Engine.controls.on("down", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveDown();
        }
    });

    Engine.controls.onkey("space", function () {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.fire();
        }
    });

    Engine.controls.onkey("pause", function () {
        pauseGame();
    });

    Engine.controls.onkey("enter", function () {
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
            Engine.settings.canvasWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            Engine.settings.canvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            ctx.canvas.width = Engine.settings.canvasWidth;
            ctx.canvas.height = Engine.settings.canvasHeight;

            $(".notifications").removeClass("large-screen");
            $("#GameCanvas").width(Engine.settings.canvasWidth);
            $("#GameCanvas").height(Engine.settings.canvasHeight);
        }
    }
    //endregion
})();

},{"./asteroid-collection":2,"./engine/collision-detection":4,"./engine/engine":5,"./laser-collection":7,"./ship":9}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Asteroid = require("./asteroid").Asteroid;

var Engine = require("./engine/engine").Engine;

var AsteroidCollection = (function () {
    function AsteroidCollection() {
        _classCallCheck(this, AsteroidCollection);

        this.list = [];
    }

    _createClass(AsteroidCollection, {
        update: {
            value: function update() {
                var checkAsteroidBounds = (function (asteroid, index) {
                    if (asteroid.settings.posY > Engine.settings.canvasHeight + 30) {
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

},{"./asteroid":3,"./engine/engine":5}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Utilities = require("./engine/utilities").Utilities;

var Engine = require("./engine/engine").Engine;

var Asteroid = (function () {
    function Asteroid() {
        _classCallCheck(this, Asteroid);

        var range = Utilities.getRandomNumber(30, 100);

        this.settings = {
            width: range,
            height: range,
            speed: Utilities.getRandomNumber(2, 6)
        };

        this.settings.posX = Utilities.getRandomNumber(0 - this.settings.height, Engine.settings.canvasWidth);
        this.settings.posY = this.settings.height * -2;

        this.img = new Image();
        this.img.src = "app/Content/Images/asteroid-" + Utilities.getRandomNumber(1, 4) + ".png";
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

},{"./engine/engine":5,"./engine/utilities":6}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Engine = (function () {
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

        return {
            createGame: createGame
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

    var settings = {
        canvasWidth: 720,
        canvasHeight: 480
    };

    return {
        factory: factory,
        controls: controls,
        settings: settings
    };
})();

exports.Engine = Engine;

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Utilities = exports.Utilities = (function () {
    function Utilities() {
        _classCallCheck(this, Utilities);
    }

    _createClass(Utilities, null, {
        getRandomNumber: {
            value: function getRandomNumber(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
        },
        getRandomColor: {
            value: function getRandomColor() {
                var letters = "0123456789ABCDEF".split("");
                var color = "#";

                for (var i = 0; i < 6; i++) {
                    color += letters[Math.round(Math.random() * 15)];
                }

                return color;
            }
        }
    });

    return Utilities;
})();

},{}],7:[function(require,module,exports){
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
                var _this = this;

                this.list.forEach(function (laser, index) {
                    if (_this._isLaserOutOfTopBounds(index)) {
                        _this.list.shift();
                    }
                });

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
                    this.list.push(laser);
                    laser.playSound();
                }
            }
        },
        _isLaserOutOfTopBounds: {
            value: function _isLaserOutOfTopBounds(index) {
                return this.list[index].settings.posY < -5;
            }
        }
    });

    return LaserCollection;
})();

exports.LaserCollection = LaserCollection;

},{"./laser":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Engine = require("./engine/engine").Engine;

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
                if (this.settings.posX + this.settings.width < Engine.settings.canvasWidth + 70) {
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
                if (this.settings.posY < Engine.settings.canvasHeight - 40) {
                    this.settings.posY = this.settings.posY + this.settings.speed;
                }
            }
        }
    });

    return Ship;
})();

exports.Ship = Ship;

},{"./engine/engine":5}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2FwcC5qcyIsIkM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvYXN0ZXJvaWQtY29sbGVjdGlvbi5qcyIsIkM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvYXN0ZXJvaWQuanMiLCJDOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2VuZ2luZS9jb2xsaXNpb24tZGV0ZWN0aW9uLmpzIiwiQzovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9lbmdpbmUvZW5naW5lLmpzIiwiQzovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9lbmdpbmUvdXRpbGl0aWVzLmpzIiwiQzovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9sYXNlci1jb2xsZWN0aW9uLmpzIiwiQzovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9sYXNlci5qcyIsIkM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvc2hpcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0lDQVMsTUFBTSxXQUFPLGlCQUFpQixFQUE5QixNQUFNOztJQUNQLGtCQUFrQixXQUFPLDhCQUE4QixFQUF2RCxrQkFBa0I7O0lBQ2xCLElBQUksV0FBTyxRQUFRLEVBQW5CLElBQUk7O0lBQ0osZUFBZSxXQUFPLG9CQUFvQixFQUExQyxlQUFlOztJQUNmLGtCQUFrQixXQUFPLHVCQUF1QixFQUFoRCxrQkFBa0I7O0FBRTFCLENBQUMsWUFBVztBQUNSLGdCQUFZLENBQUM7OztBQUdiLFFBQU0sVUFBVSxHQUFHO0FBQ2YsYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtBQUNaLGFBQUssRUFBRSxPQUFPO0FBQ2QsWUFBSSxFQUFFLE1BQU07S0FDZixDQUFDOzs7QUFHRixR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SUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFO0FBQzdFLHdCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQkFDakU7YUFDSjs7QUFFRCxjQUFNO21CQUFBLGtCQUFHO0FBQ0wsb0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLHdCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQkFDakU7YUFDSjs7QUFFRCxnQkFBUTttQkFBQSxvQkFBRztBQUNQLG9CQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLEVBQUUsRUFBRTtBQUN4RCx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7aUJBQ2pFO2FBQ0o7Ozs7V0FwREMsSUFBSTs7O1FBdURGLElBQUksR0FBSixJQUFJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2ltcG9ydCB7RW5naW5lfSBmcm9tICcuL2VuZ2luZS9lbmdpbmUnO1xyXG5pbXBvcnQge0NvbGxpc2lvbkRldGVjdGlvbn0gZnJvbSAnLi9lbmdpbmUvY29sbGlzaW9uLWRldGVjdGlvbic7XHJcbmltcG9ydCB7U2hpcH0gZnJvbSAnLi9zaGlwJztcclxuaW1wb3J0IHtMYXNlckNvbGxlY3Rpb259IGZyb20gJy4vbGFzZXItY29sbGVjdGlvbic7XHJcbmltcG9ydCB7QXN0ZXJvaWRDb2xsZWN0aW9ufSBmcm9tICcuL2FzdGVyb2lkLWNvbGxlY3Rpb24nO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lXHJcbiAgICBsZXQgcGxheWVyU2hpcCA9IG5ldyBTaGlwKHtcclxuICAgICAgICBsYXNlcnM6IG5ldyBMYXNlckNvbGxlY3Rpb24oKVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGFzdGVyb2lkcyA9IG5ldyBBc3Rlcm9pZENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICBsZXQgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBhc3Rlcm9pZHMubGlzdC5mb3JFYWNoKChhc3Rlcm9pZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKENvbGxpc2lvbkRldGVjdGlvbi5jaGVjayhwbGF5ZXJTaGlwLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaWZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goKGxhc2VyLCBsYXNlckluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LmZvckVhY2goKGFzdGVyb2lkLCBhc3Rlcm9pZEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQ29sbGlzaW9uRGV0ZWN0aW9uLmNoZWNrKGxhc2VyLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LnNwbGljZShsYXNlckluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3Rlcm9pZHMubGlzdC5zcGxpY2UoYXN0ZXJvaWRJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkU2NvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2NhbGVTY3JlZW4oKTtcclxuICAgICAgICB0b3VjaFNldHVwKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRW5naW5lLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBBVVNFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoLCBFbmdpbmUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KTtcclxuICAgICAgICAgICAgZHJhd1Njb3JlKCk7XHJcbiAgICAgICAgICAgIGRyYXdMaXZlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllclNoaXAuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmRyYXcoY3R4KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBhc3Rlcm9pZHMuYWRkQXN0ZXJvaWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LCAxNDAgLSAoRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMTAwKSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIFRvdWNoIEdhbWUgQ29udHJvbHNcclxuICAgIGZ1bmN0aW9uIHRvdWNoU2V0dXAoKSB7XHJcbiAgICAgICAgbGV0IHRvdWNoYWJsZSA9ICdjcmVhdGVUb3VjaCcgaW4gZG9jdW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0b3VjaGFibGUpIHtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RvdWNoc3RhcnQnKTtcclxuXHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCB8fCBnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICBzdGFydE5ld0dhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYID4gRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMikge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5maXJlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZXZlbnQpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBicm93c2VyIGZyb20gZG9pbmcgaXRzIGRlZmF1bHQgdGhpbmcgKHNjcm9sbCwgem9vbSlcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0b3VjaG1vdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xyXG4gICAgICAgIC8vZG8gc3R1ZmZcclxuICAgICAgICBjb25zb2xlLmxvZygndG91Y2hlbmQnKTtcclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gS2V5IEdhbWUgQ29udHJvbHNcclxuICAgIEVuZ2luZS5jb250cm9scy5vbignbGVmdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVMZWZ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRW5naW5lLmNvbnRyb2xzLm9uKCdyaWdodCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLm1vdmVSaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVuZ2luZS5jb250cm9scy5vbigndXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlVXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFbmdpbmUuY29udHJvbHMub24oJ2Rvd24nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlRG93bigpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVuZ2luZS5jb250cm9scy5vbmtleSgnc3BhY2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5maXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRW5naW5lLmNvbnRyb2xzLm9ua2V5KCdwYXVzZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHBhdXNlR2FtZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgRW5naW5lLmNvbnRyb2xzLm9ua2V5KCdlbnRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQgfHwgZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgc3RhcnROZXdHYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIEhlbHBlciBGdW5jdGlvbnNcclxuICAgIGZ1bmN0aW9uIGRyYXdTdGFydFNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtc3RhcnQtc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhpZGVTdGFydFNjcmVlbigpIHtcclxuICAgICAgICAkKCcuanMtc3RhcnQtc2NyZWVuJykuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0TmV3R2FtZSgpIHtcclxuICAgICAgICBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICBnYW1lU2NvcmUgPSAwO1xyXG4gICAgICAgIGhpZGVTdGFydFNjcmVlbigpO1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhdXNlR2FtZSgpIHtcclxuICAgICAgICBkcmF3UGF1c2VTY3JlZW4oKTtcclxuXHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUEFVU0U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5QTEFZO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3UGF1c2VTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXBhdXNlLXNjcmVlbicpLnRvZ2dsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVuZEdhbWUoKSB7XHJcbiAgICAgICAgJCgnLmpzLWdhbWUtb3Zlci1zY3JlZW4nKS5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkU2NvcmUoKSB7XHJcbiAgICAgICAgZ2FtZVNjb3JlICs9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1Njb3JlKCkge1xyXG4gICAgICAgICQoJy5qcy1zY29yZScpLmh0bWwoJ1Njb3JlOicgKyBnYW1lU2NvcmUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpZmUoKSB7XHJcbiAgICAgICAgaWYgKGdhbWVMaXZlcyA+IDApIHtcclxuICAgICAgICAgICAgZ2FtZUxpdmVzIC09IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5PVkVSO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmF3TGl2ZXMoKSB7XHJcbiAgICAgICAgJCgnLmpzLWxpdmVzJykuaHRtbCgnTGl2ZXM6JyArIGdhbWVMaXZlcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2NhbGVTY3JlZW4oKSB7XHJcbiAgICAgICAgaWYgKE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCwgd2luZG93LmlubmVyV2lkdGggfHwgMCkgPCA3MjApIHtcclxuICAgICAgICAgICAgRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoID0gTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKTtcclxuICAgICAgICAgICAgRW5naW5lLnNldHRpbmdzLmNhbnZhc0hlaWdodCA9IE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKTtcclxuICAgICAgICAgICAgY3R4LmNhbnZhcy53aWR0aCAgPSBFbmdpbmUuc2V0dGluZ3MuY2FudmFzV2lkdGg7XHJcbiAgICAgICAgICAgIGN0eC5jYW52YXMuaGVpZ2h0ID0gRW5naW5lLnNldHRpbmdzLmNhbnZhc0hlaWdodDtcclxuXHJcbiAgICAgICAgICAgICQoJy5ub3RpZmljYXRpb25zJykucmVtb3ZlQ2xhc3MoJ2xhcmdlLXNjcmVlbicpO1xyXG4gICAgICAgICAgICAkKCcjR2FtZUNhbnZhcycpLndpZHRoKEVuZ2luZS5zZXR0aW5ncy5jYW52YXNXaWR0aCk7XHJcbiAgICAgICAgICAgICQoJyNHYW1lQ2FudmFzJykuaGVpZ2h0KEVuZ2luZS5zZXR0aW5ncy5jYW52YXNIZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcbn0oKSk7XHJcbiIsImltcG9ydCB7QXN0ZXJvaWR9IGZyb20gJy4vYXN0ZXJvaWQnO1xyXG5pbXBvcnQge0VuZ2luZX0gZnJvbSAnLi9lbmdpbmUvZW5naW5lJztcclxuXHJcbmNsYXNzIEFzdGVyb2lkQ29sbGVjdGlvbiB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgbGV0IGNoZWNrQXN0ZXJvaWRCb3VuZHMgPSBmdW5jdGlvbihhc3Rlcm9pZCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKGFzdGVyb2lkLnNldHRpbmdzLnBvc1kgPiBFbmdpbmUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0ICsgMzApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChjaGVja0FzdGVyb2lkQm91bmRzKTtcclxuICAgICAgICB0aGlzLmxpc3QuZm9yRWFjaChhc3Rlcm9pZCA9PiBhc3Rlcm9pZC51cGRhdGUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goYXN0ZXJvaWQgPT4gYXN0ZXJvaWQuZHJhdyhjb250ZXh0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQXN0ZXJvaWQoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0LnB1c2gobmV3IEFzdGVyb2lkKCkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0FzdGVyb2lkQ29sbGVjdGlvbn07IiwiaW1wb3J0IHtVdGlsaXRpZXN9IGZyb20gJy4vZW5naW5lL3V0aWxpdGllcyc7XHJcbmltcG9ydCB7RW5naW5lfSBmcm9tICcuL2VuZ2luZS9lbmdpbmUnO1xyXG5cclxuY2xhc3MgQXN0ZXJvaWQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgbGV0IHJhbmdlID0gVXRpbGl0aWVzLmdldFJhbmRvbU51bWJlcigzMCwgMTAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgd2lkdGg6IHJhbmdlLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHJhbmdlLFxyXG4gICAgICAgICAgICBzcGVlZDogVXRpbGl0aWVzLmdldFJhbmRvbU51bWJlcigyLCA2KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IFV0aWxpdGllcy5nZXRSYW5kb21OdW1iZXIoMCAtIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBFbmdpbmUuc2V0dGluZ3MuY2FudmFzV2lkdGgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MuaGVpZ2h0ICogLTI7XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ2FwcC9Db250ZW50L0ltYWdlcy9hc3Rlcm9pZC0nICsgVXRpbGl0aWVzLmdldFJhbmRvbU51bWJlcigxLCA0KSArICcucG5nJztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZICs9IHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7QXN0ZXJvaWR9OyIsImV4cG9ydCBjbGFzcyBDb2xsaXNpb25EZXRlY3Rpb24ge1xyXG4gICAgc3RhdGljIGNoZWNrKG9iajEsIG9iajIpIHtcclxuICAgICAgICBpZiAodGhpcy5faG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSAmJiB0aGlzLl92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICBsZXQgb2JqMVJpZ2h0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWCArIG9iajEuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgbGV0IG9iajFMZWZ0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWDtcclxuICAgICAgICBsZXQgb2JqMlJpZ2h0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWCArIG9iajIuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgbGV0IG9iajJMZWZ0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWDtcclxuXHJcbiAgICAgICAgaWYgKGxlZnRTaWRlQ29sbGlzaW9uKCkgfHwgcmlnaHRTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGVmdFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgob2JqMUxlZnRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxTGVmdFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByaWdodFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChvYmoxUmlnaHRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxUmlnaHRTaWRlIDw9IG9iajJSaWdodFNpZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBfdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgaWYgKGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChvYmoxLnNldHRpbmdzLnBvc1kgPj0gb2JqMi5zZXR0aW5ncy5wb3NZICYmIG9iajEuc2V0dGluZ3MucG9zWSA8PSBvYmoyLnNldHRpbmdzLnBvc1kgKyBvYmoyLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIu+7v3ZhciBFbmdpbmUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IGZhY3RvcnkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xhc3MgR2FtZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSA9IHByb3BlcnRpZXMudXBkYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdyA9IHByb3BlcnRpZXMuZHJhdztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQgPSBwcm9wZXJ0aWVzLmluaXQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkcmF3KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIHZhciBnYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWUodXBkYXRlLCBkcmF3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZSh1cGRhdGUsIGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY3JlYXRlR2FtZTogY3JlYXRlR2FtZVxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBjb250cm9scyA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgZXZlbnRBY3Rpb25zID0ge307XHJcbiAgICAgICAgbGV0IGtleVN0YXRlID0ge307XHJcbiAgICAgICAgbGV0IGtleUFjdGlvbiA9IHtcclxuICAgICAgICAgICAgc3BhY2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBzcGFjZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHBhdXNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gZW50ZXIgbm90IGRlZmluZWQnKTsgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbiA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9ua2V5ID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY29udHJvbHNMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIChVcCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM4XSB8fCBrZXlTdGF0ZVs4N10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoTGVmdCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM3XSB8fCBrZXlTdGF0ZVs2NV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChSaWdodCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM5XSB8fCBrZXlTdGF0ZVs2OF0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoRG93biBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzQwXSB8fCBrZXlTdGF0ZVs4M10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gdHJ1ZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSBmYWxzZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIC8vIEVudGVyIGtleVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChwKSBQYXVzZVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA4MCkge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNwYWNlIGJhclxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMikge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb246b24sXHJcbiAgICAgICAgICAgIG9ua2V5OiBvbmtleVxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBzZXR0aW5ncyA9IHtcclxuICAgICAgICBjYW52YXNXaWR0aDogNzIwLFxyXG4gICAgICAgIGNhbnZhc0hlaWdodDogNDgwXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZmFjdG9yeTogZmFjdG9yeSxcclxuICAgICAgICBjb250cm9sczogY29udHJvbHMsXHJcbiAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtFbmdpbmV9OyIsImV4cG9ydCBjbGFzcyBVdGlsaXRpZXMge1xyXG4gICAgc3RhdGljIGdldFJhbmRvbU51bWJlcihtaW4sIG1heCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICBsZXQgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gJyMnO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDE1KV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtMYXNlcn0gZnJvbSAnLi9sYXNlcic7XHJcblxyXG5jbGFzcyBMYXNlckNvbGxlY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tYXhMYXNlcnMgPSAxMDtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goKGxhc2VyLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNMYXNlck91dE9mVG9wQm91bmRzKGluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2gobGFzZXIgPT4gbGFzZXIudXBkYXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGxhc2VyID0+IGxhc2VyLmRyYXcoY29udGV4dCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUocG9zWCwgcG9zWSkge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3QubGVuZ3RoIDwgdGhpcy5tYXhMYXNlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGxhc2VyID0gbmV3IExhc2VyKHBvc1gsIHBvc1kpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYXNlcik7XHJcbiAgICAgICAgICAgIGxhc2VyLnBsYXlTb3VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaXNMYXNlck91dE9mVG9wQm91bmRzKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFtpbmRleF0uc2V0dGluZ3MucG9zWSA8IC01O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyQ29sbGVjdGlvbn07IiwiY2xhc3MgTGFzZXIge1xyXG4gICAgY29uc3RydWN0b3IgKG9yaWdpblgsIG9yaWdpblkpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBwb3NYOiBvcmlnaW5YLFxyXG4gICAgICAgICAgICBwb3NZOiBvcmlnaW5ZLFxyXG4gICAgICAgICAgICB3aWR0aDogNC41LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI1XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZCA9IG5ldyB3aW5kb3cuSG93bCh7XHJcbiAgICAgICAgICAgIHVybHM6IFsnYXBwL0NvbnRlbnQvQXVkaW8vbGFzZXIubXAzJ11cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSAnIzAwZmYwMCc7XHJcbiAgICAgICAgY29udGV4dC5hcmModGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBNYXRoLlBJICogMiwgdHJ1ZSk7XHJcbiAgICAgICAgY29udGV4dC5maWxsKCk7XHJcbiAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZIC09IDUuMDU7XHJcbiAgICB9XHJcblxyXG4gICAgcGxheVNvdW5kKCkge1xyXG4gICAgICAgIHRoaXMuc291bmQucGxheSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyfTsiLCJpbXBvcnQge0VuZ2luZX0gZnJvbSAnLi9lbmdpbmUvZW5naW5lJztcclxuXHJcbmNsYXNzIFNoaXAge1xyXG4gICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXHJcbiAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICBwb3NZOiAzNTAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjUsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgc3BlZWQ6IDRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICdhcHAvQ29udGVudC9JbWFnZXMvc3BhY2VzaGlwLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICB0aGlzLmxhc2Vycy5kcmF3KGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmxhc2Vycy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmZpcmUodGhpcy5zZXR0aW5ncy5wb3NYICsgMjMsIHRoaXMuc2V0dGluZ3MucG9zWSAtIDUpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IEVuZ2luZS5zZXR0aW5ncy5jYW52YXNXaWR0aCArIDcwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZIDwgRW5naW5lLnNldHRpbmdzLmNhbnZhc0hlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge1NoaXB9OyJdfQ==
