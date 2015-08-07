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
        this.img.src = "app/content/images/asteroid-" + Utilities.getRandomNumber(1, 4) + ".png";
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
            urls: ["app/content/audio/laser.mp3"]
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
        this.img.src = "app/content/images/spaceship.png";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJEOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2FwcC5qcyIsIkQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvYXN0ZXJvaWQtY29sbGVjdGlvbi5qcyIsIkQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvYXN0ZXJvaWQuanMiLCJEOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9hcHAvc3JjL2VuZ2luZS9jb2xsaXNpb24tZGV0ZWN0aW9uLmpzIiwiRDovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9lbmdpbmUvZW5naW5lLmpzIiwiRDovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9lbmdpbmUvdXRpbGl0aWVzLmpzIiwiRDovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9sYXNlci1jb2xsZWN0aW9uLmpzIiwiRDovR2l0SHViL3NwYWNlLXNob290ZXIvYXBwL3NyYy9sYXNlci5qcyIsIkQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL2FwcC9zcmMvc2hpcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0lDQVMsTUFBTSxXQUFPLGlCQUFpQixFQUE5QixNQUFNOztJQUNQLGtCQUFrQixXQUFPLDhCQUE4QixFQUF2RCxrQkFBa0I7O0lBQ2xCLElBQUksV0FBTyxRQUFRLEVBQW5CLElBQUk7O0lBQ0osZUFBZSxXQUFPLG9CQUFvQixFQUExQyxlQUFlOztJQUNmLGtCQUFrQixXQUFPLHVCQUF1QixFQUFoRCxrQkFBa0I7O0FBRTFCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7O0FBR2IsUUFBTSxVQUFVLEdBQUc7QUFDZixhQUFLLEVBQUUsT0FBTztBQUNkLFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFFLE9BQU87QUFDZCxZQUFJLEVBQUUsTUFBTTtLQUNmLENBQUM7OztB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QUNqRTthQUNKOztBQUVELGlCQUFTO21CQUFBLHFCQUFHO0FBQ1Isb0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFO0FBQzdFLHdCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQkFDakU7YUFDSjs7QUFFRCxjQUFNO21CQUFBLGtCQUFHO0FBQ0wsb0JBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLHdCQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztpQkFDakU7YUFDSjs7QUFFRCxnQkFBUTttQkFBQSxvQkFBRztBQUNQLG9CQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxHQUFHLEVBQUUsRUFBRTtBQUN4RCx3QkFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7aUJBQ2pFO2FBQ0o7Ozs7V0FwREMsSUFBSTs7O1FBdURGLElBQUksR0FBSixJQUFJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7v2ltcG9ydCB7RW5naW5lfSBmcm9tICcuL2VuZ2luZS9lbmdpbmUnO1xyXG5pbXBvcnQge0NvbGxpc2lvbkRldGVjdGlvbn0gZnJvbSAnLi9lbmdpbmUvY29sbGlzaW9uLWRldGVjdGlvbic7XHJcbmltcG9ydCB7U2hpcH0gZnJvbSAnLi9zaGlwJztcclxuaW1wb3J0IHtMYXNlckNvbGxlY3Rpb259IGZyb20gJy4vbGFzZXItY29sbGVjdGlvbic7XHJcbmltcG9ydCB7QXN0ZXJvaWRDb2xsZWN0aW9ufSBmcm9tICcuL2FzdGVyb2lkLWNvbGxlY3Rpb24nO1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIC8vIEVudW1zXHJcbiAgICBjb25zdCBHQU1FX1NUQVRFID0ge1xyXG4gICAgICAgIFNUQVJUOiAnU1RBUlQnLFxyXG4gICAgICAgIFBMQVk6ICdQTEFZJyxcclxuICAgICAgICBQQVVTRTogJ1BBVVNFJyxcclxuICAgICAgICBPVkVSOiAnT1ZFUidcclxuICAgIH07XHJcblxyXG4gICAgLy8gR2FtZSBHbG9iYWxzXHJcbiAgICBsZXQgZ2FtZVNjb3JlID0gMDtcclxuICAgIGxldCBnYW1lTGl2ZXMgPSAzO1xyXG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdHYW1lQ2FudmFzJyk7XHJcbiAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICBsZXQgZ2FtZVN0YXRlID0gR0FNRV9TVEFURS5TVEFSVDtcclxuXHJcbiAgICAvL3JlZ2lvbiBHYW1lXHJcbiAgICBsZXQgcGxheWVyU2hpcCA9IG5ldyBTaGlwKHtcclxuICAgICAgICBsYXNlcnM6IG5ldyBMYXNlckNvbGxlY3Rpb24oKVxyXG4gICAgfSk7XHJcblxyXG4gICAgbGV0IGFzdGVyb2lkcyA9IG5ldyBBc3Rlcm9pZENvbGxlY3Rpb24oKTtcclxuXHJcbiAgICBsZXQgY2hlY2tTaGlwQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBhc3Rlcm9pZHMubGlzdC5mb3JFYWNoKChhc3Rlcm9pZCwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgaWYgKENvbGxpc2lvbkRldGVjdGlvbi5jaGVjayhwbGF5ZXJTaGlwLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICByZW1vdmVMaWZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgbGV0IGNoZWNrU2hpcExhc2VyQW5kQXN0ZXJvaWRDb2xsaXNpb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LmZvckVhY2goKGxhc2VyLCBsYXNlckluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGFzdGVyb2lkcy5saXN0LmZvckVhY2goKGFzdGVyb2lkLCBhc3Rlcm9pZEluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoQ29sbGlzaW9uRGV0ZWN0aW9uLmNoZWNrKGxhc2VyLCBhc3Rlcm9pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXJTaGlwLmxhc2Vycy5saXN0LnNwbGljZShsYXNlckluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBhc3Rlcm9pZHMubGlzdC5zcGxpY2UoYXN0ZXJvaWRJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkU2NvcmUoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBpbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2NhbGVTY3JlZW4oKTtcclxuICAgICAgICB0b3VjaFNldHVwKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBnYW1lID0gRW5naW5lLmZhY3RvcnkuY3JlYXRlR2FtZSh7XHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluaXQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC51cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrU2hpcEFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgICAgICBjaGVja1NoaXBMYXNlckFuZEFzdGVyb2lkQ29sbGlzaW9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBBVVNFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLk9WRVIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoLCBFbmdpbmUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KTtcclxuICAgICAgICAgICAgZHJhd1Njb3JlKCk7XHJcbiAgICAgICAgICAgIGRyYXdMaXZlcygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllclNoaXAuZHJhdyhjdHgpO1xyXG4gICAgICAgICAgICAgICAgYXN0ZXJvaWRzLmRyYXcoY3R4KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUEFVU0UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXVzZWQnKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICAgICAgZW5kR2FtZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd1N0YXJ0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnYW1lLnN0YXJ0KCk7XHJcblxyXG4gICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBhc3Rlcm9pZHMuYWRkQXN0ZXJvaWQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LCAxNDAgLSAoRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMTAwKSk7XHJcbiAgICAvL2VuZHJlZ2lvblxyXG5cclxuICAgIC8vcmVnaW9uIFRvdWNoIEdhbWUgQ29udHJvbHNcclxuICAgIGZ1bmN0aW9uIHRvdWNoU2V0dXAoKSB7XHJcbiAgICAgICAgbGV0IHRvdWNoYWJsZSA9ICdjcmVhdGVUb3VjaCcgaW4gZG9jdW1lbnQ7XHJcblxyXG4gICAgICAgIGlmICh0b3VjaGFibGUpIHtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcclxuICAgICAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3RvdWNoc3RhcnQnKTtcclxuXHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5TVEFSVCB8fCBnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuT1ZFUikge1xyXG4gICAgICAgICAgICBzdGFydE5ld0dhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlc1swXS5jbGllbnRYID4gRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoIC8gMikge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyU2hpcC5maXJlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZXZlbnQpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBicm93c2VyIGZyb20gZG9pbmcgaXRzIGRlZmF1bHQgdGhpbmcgKHNjcm9sbCwgem9vbSlcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCd0b3VjaG1vdmUnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xyXG4gICAgICAgIC8vZG8gc3R1ZmZcclxuICAgICAgICBjb25zb2xlLmxvZygndG91Y2hlbmQnKTtcclxuICAgIH1cclxuICAgIC8vZW5kcmVnaW9uXHJcblxyXG4gICAgLy9yZWdpb24gS2V5IEdhbWUgQ29udHJvbHNcclxuICAgIEVuZ2luZS5jb250cm9scy5vbignbGVmdCcsICgpID0+IHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlTGVmdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIEVuZ2luZS5jb250cm9scy5vbigncmlnaHQnLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgRW5naW5lLmNvbnRyb2xzLm9uKCd1cCcsICgpID0+IHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlBMQVkpIHtcclxuICAgICAgICAgICAgcGxheWVyU2hpcC5tb3ZlVXAoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFbmdpbmUuY29udHJvbHMub24oJ2Rvd24nLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5QTEFZKSB7XHJcbiAgICAgICAgICAgIHBsYXllclNoaXAubW92ZURvd24oKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFbmdpbmUuY29udHJvbHMub25rZXkoJ3NwYWNlJywgKCkgPT4ge1xyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBwbGF5ZXJTaGlwLmZpcmUoKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBFbmdpbmUuY29udHJvbHMub25rZXkoJ3BhdXNlJywgKCkgPT4ge1xyXG4gICAgICAgIHBhdXNlR2FtZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgRW5naW5lLmNvbnRyb2xzLm9ua2V5KCdlbnRlcicsICgpID0+IHtcclxuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBHQU1FX1NUQVRFLlNUQVJUIHx8IGdhbWVTdGF0ZSA9PT0gR0FNRV9TVEFURS5PVkVSKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TmV3R2FtZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgLy9lbmRyZWdpb25cclxuXHJcbiAgICAvL3JlZ2lvbiBIZWxwZXIgRnVuY3Rpb25zXHJcbiAgICBmdW5jdGlvbiBkcmF3U3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoaWRlU3RhcnRTY3JlZW4oKSB7XHJcbiAgICAgICAgJCgnLmpzLXN0YXJ0LXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdGFydE5ld0dhbWUoKSB7XHJcbiAgICAgICAgZ2FtZUxpdmVzID0gMztcclxuICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBMQVk7XHJcbiAgICAgICAgZ2FtZVNjb3JlID0gMDtcclxuICAgICAgICBoaWRlU3RhcnRTY3JlZW4oKTtcclxuICAgICAgICAkKCcuanMtZ2FtZS1vdmVyLXNjcmVlbicpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXVzZUdhbWUoKSB7XHJcbiAgICAgICAgZHJhd1BhdXNlU2NyZWVuKCk7XHJcblxyXG4gICAgICAgIGlmIChnYW1lU3RhdGUgPT09IEdBTUVfU1RBVEUuUExBWSkge1xyXG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBHQU1FX1NUQVRFLlBBVVNFO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuUExBWTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd1BhdXNlU2NyZWVuKCkge1xyXG4gICAgICAgICQoJy5qcy1wYXVzZS1zY3JlZW4nKS50b2dnbGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbmRHYW1lKCkge1xyXG4gICAgICAgICQoJy5qcy1nYW1lLW92ZXItc2NyZWVuJykuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZFNjb3JlKCkge1xyXG4gICAgICAgIGdhbWVTY29yZSArPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRyYXdTY29yZSgpIHtcclxuICAgICAgICAkKCcuanMtc2NvcmUnKS5odG1sKCdTY29yZTonICsgZ2FtZVNjb3JlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVMaWZlKCkge1xyXG4gICAgICAgIGlmIChnYW1lTGl2ZXMgPiAwKSB7XHJcbiAgICAgICAgICAgIGdhbWVMaXZlcyAtPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IEdBTUVfU1RBVEUuT1ZFUjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhd0xpdmVzKCkge1xyXG4gICAgICAgICQoJy5qcy1saXZlcycpLmh0bWwoJ0xpdmVzOicgKyBnYW1lTGl2ZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNjYWxlU2NyZWVuKCkge1xyXG4gICAgICAgIGlmIChNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApIDwgNzIwKSB7XHJcbiAgICAgICAgICAgIEVuZ2luZS5zZXR0aW5ncy5jYW52YXNXaWR0aCA9IE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCwgd2luZG93LmlubmVyV2lkdGggfHwgMCk7XHJcbiAgICAgICAgICAgIEVuZ2luZS5zZXR0aW5ncy5jYW52YXNIZWlnaHQgPSBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LCB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgMCk7XHJcbiAgICAgICAgICAgIGN0eC5jYW52YXMud2lkdGggID0gRW5naW5lLnNldHRpbmdzLmNhbnZhc1dpZHRoO1xyXG4gICAgICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IEVuZ2luZS5zZXR0aW5ncy5jYW52YXNIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAkKCcubm90aWZpY2F0aW9ucycpLnJlbW92ZUNsYXNzKCdsYXJnZS1zY3JlZW4nKTtcclxuICAgICAgICAgICAgJCgnI0dhbWVDYW52YXMnKS53aWR0aChFbmdpbmUuc2V0dGluZ3MuY2FudmFzV2lkdGgpO1xyXG4gICAgICAgICAgICAkKCcjR2FtZUNhbnZhcycpLmhlaWdodChFbmdpbmUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvL2VuZHJlZ2lvblxyXG59KCkpO1xyXG4iLCJpbXBvcnQge0FzdGVyb2lkfSBmcm9tICcuL2FzdGVyb2lkJztcclxuaW1wb3J0IHtFbmdpbmV9IGZyb20gJy4vZW5naW5lL2VuZ2luZSc7XHJcblxyXG5jbGFzcyBBc3Rlcm9pZENvbGxlY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGxldCBjaGVja0FzdGVyb2lkQm91bmRzID0gZnVuY3Rpb24oYXN0ZXJvaWQsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChhc3Rlcm9pZC5zZXR0aW5ncy5wb3NZID4gRW5naW5lLnNldHRpbmdzLmNhbnZhc0hlaWdodCArIDMwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2hlY2tBc3Rlcm9pZEJvdW5kcyk7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goYXN0ZXJvaWQgPT4gYXN0ZXJvaWQudXBkYXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGFzdGVyb2lkID0+IGFzdGVyb2lkLmRyYXcoY29udGV4dCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEFzdGVyb2lkKCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5wdXNoKG5ldyBBc3Rlcm9pZCgpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtBc3Rlcm9pZENvbGxlY3Rpb259OyIsImltcG9ydCB7VXRpbGl0aWVzfSBmcm9tICcuL2VuZ2luZS91dGlsaXRpZXMnO1xyXG5pbXBvcnQge0VuZ2luZX0gZnJvbSAnLi9lbmdpbmUvZW5naW5lJztcclxuXHJcbmNsYXNzIEFzdGVyb2lkIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIGNvbnN0IHJhbmdlID0gVXRpbGl0aWVzLmdldFJhbmRvbU51bWJlcigzMCwgMTAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgd2lkdGg6IHJhbmdlLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHJhbmdlLFxyXG4gICAgICAgICAgICBzcGVlZDogVXRpbGl0aWVzLmdldFJhbmRvbU51bWJlcigyLCA2KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IFV0aWxpdGllcy5nZXRSYW5kb21OdW1iZXIoMCAtIHRoaXMuc2V0dGluZ3MuaGVpZ2h0LCBFbmdpbmUuc2V0dGluZ3MuY2FudmFzV2lkdGgpO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MuaGVpZ2h0ICogLTI7XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ2FwcC9jb250ZW50L2ltYWdlcy9hc3Rlcm9pZC0nICsgVXRpbGl0aWVzLmdldFJhbmRvbU51bWJlcigxLCA0KSArICcucG5nJztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1ksIHRoaXMuc2V0dGluZ3Mud2lkdGgsIHRoaXMuc2V0dGluZ3MuaGVpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZICs9IHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7QXN0ZXJvaWR9OyIsImV4cG9ydCBjbGFzcyBDb2xsaXNpb25EZXRlY3Rpb24ge1xyXG4gICAgc3RhdGljIGNoZWNrKG9iajEsIG9iajIpIHtcclxuICAgICAgICBpZiAodGhpcy5faG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSAmJiB0aGlzLl92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICBsZXQgb2JqMVJpZ2h0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWCArIG9iajEuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgbGV0IG9iajFMZWZ0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWDtcclxuICAgICAgICBsZXQgb2JqMlJpZ2h0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWCArIG9iajIuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgbGV0IG9iajJMZWZ0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWDtcclxuXHJcbiAgICAgICAgaWYgKGxlZnRTaWRlQ29sbGlzaW9uKCkgfHwgcmlnaHRTaWRlQ29sbGlzaW9uKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGVmdFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICgob2JqMUxlZnRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxTGVmdFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByaWdodFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChvYmoxUmlnaHRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxUmlnaHRTaWRlIDw9IG9iajJSaWdodFNpZGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBfdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgaWYgKGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIChvYmoxLnNldHRpbmdzLnBvc1kgPj0gb2JqMi5zZXR0aW5ncy5wb3NZICYmIG9iajEuc2V0dGluZ3MucG9zWSA8PSBvYmoyLnNldHRpbmdzLnBvc1kgKyBvYmoyLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIu+7v3ZhciBFbmdpbmUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IGZhY3RvcnkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xhc3MgR2FtZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSA9IHByb3BlcnRpZXMudXBkYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdyA9IHByb3BlcnRpZXMuZHJhdztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQgPSBwcm9wZXJ0aWVzLmluaXQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkcmF3KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIHZhciBnYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWUodXBkYXRlLCBkcmF3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZSh1cGRhdGUsIGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY3JlYXRlR2FtZTogY3JlYXRlR2FtZVxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBjb250cm9scyA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgZXZlbnRBY3Rpb25zID0ge307XHJcbiAgICAgICAgbGV0IGtleVN0YXRlID0ge307XHJcbiAgICAgICAgbGV0IGtleUFjdGlvbiA9IHtcclxuICAgICAgICAgICAgc3BhY2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBzcGFjZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHBhdXNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gZW50ZXIgbm90IGRlZmluZWQnKTsgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbiA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9ua2V5ID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY29udHJvbHNMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIChVcCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM4XSB8fCBrZXlTdGF0ZVs4N10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoTGVmdCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM3XSB8fCBrZXlTdGF0ZVs2NV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChSaWdodCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM5XSB8fCBrZXlTdGF0ZVs2OF0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoRG93biBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzQwXSB8fCBrZXlTdGF0ZVs4M10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gdHJ1ZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSBmYWxzZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIC8vIEVudGVyIGtleVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChwKSBQYXVzZVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA4MCkge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNwYWNlIGJhclxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMikge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb246b24sXHJcbiAgICAgICAgICAgIG9ua2V5OiBvbmtleVxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBzZXR0aW5ncyA9IHtcclxuICAgICAgICBjYW52YXNXaWR0aDogNzIwLFxyXG4gICAgICAgIGNhbnZhc0hlaWdodDogNDgwXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZmFjdG9yeTogZmFjdG9yeSxcclxuICAgICAgICBjb250cm9sczogY29udHJvbHMsXHJcbiAgICAgICAgc2V0dGluZ3M6IHNldHRpbmdzXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtFbmdpbmV9OyIsImV4cG9ydCBjbGFzcyBVdGlsaXRpZXMge1xyXG4gICAgc3RhdGljIGdldFJhbmRvbU51bWJlcihtaW4sIG1heCkge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRSYW5kb21Db2xvcigpIHtcclxuICAgICAgICBsZXQgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gJyMnO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDE1KV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICB9XHJcbn1cclxuIiwiaW1wb3J0IHtMYXNlcn0gZnJvbSAnLi9sYXNlcic7XHJcblxyXG5jbGFzcyBMYXNlckNvbGxlY3Rpb24ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tYXhMYXNlcnMgPSAxMDtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goKGxhc2VyLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faXNMYXNlck91dE9mVG9wQm91bmRzKGluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2gobGFzZXIgPT4gbGFzZXIudXBkYXRlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGxhc2VyID0+IGxhc2VyLmRyYXcoY29udGV4dCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUocG9zWCwgcG9zWSkge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3QubGVuZ3RoIDwgdGhpcy5tYXhMYXNlcnMpIHtcclxuICAgICAgICAgICAgbGV0IGxhc2VyID0gbmV3IExhc2VyKHBvc1gsIHBvc1kpO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3QucHVzaChsYXNlcik7XHJcbiAgICAgICAgICAgIGxhc2VyLnBsYXlTb3VuZCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBfaXNMYXNlck91dE9mVG9wQm91bmRzKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFtpbmRleF0uc2V0dGluZ3MucG9zWSA8IC01O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyQ29sbGVjdGlvbn07IiwiY2xhc3MgTGFzZXIge1xyXG4gICAgY29uc3RydWN0b3IgKG9yaWdpblgsIG9yaWdpblkpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBwb3NYOiBvcmlnaW5YLFxyXG4gICAgICAgICAgICBwb3NZOiBvcmlnaW5ZLFxyXG4gICAgICAgICAgICB3aWR0aDogNC41LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI1XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZCA9IG5ldyB3aW5kb3cuSG93bCh7XHJcbiAgICAgICAgICAgIHVybHM6IFsnYXBwL2NvbnRlbnQvYXVkaW8vbGFzZXIubXAzJ11cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJyMwMGZmMDAnO1xyXG4gICAgICAgIGNvbnRleHQuYXJjKHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCwgTWF0aC5QSSAqIDIsIHRydWUpO1xyXG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xyXG4gICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSAtPSA1LjA1O1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlTb3VuZCgpIHtcclxuICAgICAgICB0aGlzLnNvdW5kLnBsYXkoKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtMYXNlcn07IiwiaW1wb3J0IHtFbmdpbmV9IGZyb20gJy4vZW5naW5lL2VuZ2luZSc7XHJcblxyXG5jbGFzcyBTaGlwIHtcclxuICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICB0aGlzLmxhc2VycyA9IHByb3BlcnRpZXMubGFzZXJzO1xyXG5cclxuICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICBjb2xvcjogJ3JnYmEoMCwgMCwgMCwgMSknLFxyXG4gICAgICAgICAgICBwb3NYOiAyNSxcclxuICAgICAgICAgICAgcG9zWTogMzUwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI1LFxyXG4gICAgICAgICAgICB3aWR0aDogMjUsXHJcbiAgICAgICAgICAgIHNwZWVkOiA0XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB0aGlzLmltZy5zcmMgPSAnYXBwL2NvbnRlbnQvaW1hZ2VzL3NwYWNlc2hpcC5wbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoY29udGV4dCkge1xyXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKHRoaXMuaW1nLCB0aGlzLnNldHRpbmdzLnBvc1gsIHRoaXMuc2V0dGluZ3MucG9zWSk7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMuZHJhdyhjb250ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZSgpIHtcclxuICAgICAgICB0aGlzLmxhc2Vycy5maXJlKHRoaXMuc2V0dGluZ3MucG9zWCArIDIzLCB0aGlzLnNldHRpbmdzLnBvc1kgLSA1KTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlTGVmdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSB0aGlzLnNldHRpbmdzLnBvc1ggLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlUmlnaHQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Mud2lkdGggPCBFbmdpbmUuc2V0dGluZ3MuY2FudmFzV2lkdGggKyA3MCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1ggPSB0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWSA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZURvd24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWSA8IEVuZ2luZS5zZXR0aW5ncy5jYW52YXNIZWlnaHQgLSA0MCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgKyB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IHtTaGlwfTsiXX0=
