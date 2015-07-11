(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Import all tests
"use strict";

var engineSpec = require("./engineSpec.js").engineSpec;

var shipSpec = require("./shipSpec.js").shipSpec;

var asteroidSpec = require("./asteroidSpec.js").asteroidSpec;

(function () {
    "use strict";

    engineSpec.run();
    shipSpec.run();
    asteroidSpec.run();
})();

},{"./asteroidSpec.js":7,"./engineSpec.js":8,"./shipSpec.js":9}],2:[function(require,module,exports){
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

},{"./engine":3}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{"./engine":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var CanvasMock = (function () {

    return {};
})();

exports.CanvasMock = CanvasMock;

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

Object.defineProperty(exports, "__esModule", {
    value: true
});

var LaserCollectionMock = (function () {
    function LaserCollectionMock() {
        _classCallCheck(this, LaserCollectionMock);

        this.maxLasers = 10;
        this.list = [];
    }

    _createClass(LaserCollectionMock, {
        update: {
            value: function update() {}
        },
        draw: {
            value: function draw() {}
        },
        fire: {
            value: function fire() {}
        }
    });

    return LaserCollectionMock;
})();

exports.LaserCollectionMock = LaserCollectionMock;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Asteroid = require("../App/Src/asteroid.js").Asteroid;

var CanvasMock = require("./Mocks/CanvasMock.js").CanvasMock;

var asteroidSpec = (function () {
    "use strict";

    function run() {
        var testAsteroid = new Asteroid();

        describe("Asteroid Specs", function () {
            it("Asteroid contains a draw method", function () {
                expect(testAsteroid.draw).toBeDefined();
            });

            it("Asteroid contains a update method", function () {
                expect(testAsteroid.update).toBeDefined();
            });
        });
    }

    return {
        run: run
    };
})();

exports.asteroidSpec = asteroidSpec;

},{"../App/Src/asteroid.js":2,"./Mocks/CanvasMock.js":5}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var ENGINE = require("../App/Src/engine.js").ENGINE;

var engineSpec = (function () {
    // Temp until we get a module system in place (Convert to a ES6 module)
    "use strict";

    function run() {
        describe("ENGINE Specs", function () {
            it("Engine contains a util module", function () {
                expect(ENGINE.util).toBeDefined();
            });

            it("Engine contains a factory module", function () {
                expect(ENGINE.factory).toBeDefined();
            });

            it("Engine contains a controls module", function () {
                expect(ENGINE.controls).toBeDefined();
            });

            it("Engine contains a settings module", function () {
                expect(ENGINE.settings).toBeDefined();
            });

            it("Engine settings module has default canvasWidth and canvasHeight properties", function () {
                expect(ENGINE.settings.canvasHeight).toBe(480);
                expect(ENGINE.settings.canvasWidth).toBe(720);
            });
        });
    }

    return {
        run: run
    };
})();

exports.engineSpec = engineSpec;

},{"../App/Src/engine.js":3}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var Ship = require("../App/Src/ship.js").Ship;

var LaserCollectionMock = require("./Mocks/laserCollectionMock.js").LaserCollectionMock;

var shipSpec = (function () {
    // Temp until we get a module system in place (Convert to a ES6 module)
    "use strict";

    function run() {
        describe("Ship Specs", function () {
            var testShip = new Ship({
                lasers: new LaserCollectionMock()
            });

            it("Ship Class exists", function () {
                expect(Ship).toBeDefined();
            });

            it("Can create new instance testShip from Ship class", function () {
                expect(testShip).toBeDefined();
            });

            it("testShip contains a draw method", function () {
                expect(testShip.draw).toBeDefined();
            });
        });
    }

    return {
        run: run
    };
})();

exports.shipSpec = shipSpec;

},{"../App/Src/ship.js":4,"./Mocks/laserCollectionMock.js":6}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9zcGVjcy9zcGVjcy5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9TcmMvYXN0ZXJvaWQuanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvU3JjL2VuZ2luZS5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9TcmMvc2hpcC5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL3NwZWNzL01vY2tzL0NhbnZhc01vY2suanMiLCJjOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9zcGVjcy9Nb2Nrcy9sYXNlckNvbGxlY3Rpb25Nb2NrLmpzIiwiYzovR2l0SHViL3NwYWNlLXNob290ZXIvc3BlY3MvYXN0ZXJvaWRTcGVjLmpzIiwiYzovR2l0SHViL3NwYWNlLXNob290ZXIvc3BlY3MvZW5naW5lU3BlYy5qcyIsImM6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL3NwZWNzL3NoaXBTcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0lDQ1EsVUFBVSxXQUFPLGlCQUFpQixFQUFsQyxVQUFVOztJQUNWLFFBQVEsV0FBTyxlQUFlLEVBQTlCLFFBQVE7O0lBQ1IsWUFBWSxXQUFPLG1CQUFtQixFQUF0QyxZQUFZOztBQUVwQixDQUFDLFlBQVc7QUFDUixnQkFBWSxDQUFDOztBQUViLGNBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNqQixZQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDZixnQkFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ3RCLENBQUEsRUFBRSxDQUFFOzs7Ozs7Ozs7Ozs7O0lDWEcsTUFBTSxXQUFPLFVBQVUsRUFBdkIsTUFBTTs7SUFFUixRQUFRO0FBQ0MsYUFEVCxRQUFRLEdBQ0k7OEJBRFosUUFBUTs7QUFFTixZQUFJLEtBQUssR0FBRyxNQUFN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RyxDQUFDLENBQUM7YUFDakQsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO0tBQ047O0FBRUQsV0FBTztBQUNILFdBQUcsRUFBRSxHQUFHO0tBQ1gsQ0FBQztDQUNMLENBQUEsRUFBRSxDQUFFOztRQUVHLFVBQVUsR0FBVixVQUFVOzs7Ozs7Ozs7SUNuQ1YsSUFBSSxXQUFPLG9CQUFvQixFQUEvQixJQUFJOztJQUNKLG1CQUFtQixXQUFPLGdDQUFnQyxFQUExRCxtQkFBbUI7O0FBRTNCLElBQUksUUFBUSxHQUFJLENBQUEsWUFBVzs7QUFDdkIsZ0JBQVksQ0FBQzs7QUFFYixhQUFTLEdBQUcsR0FBRztBQUNYLGdCQUFRLENBQUMsWUFBWSxFQUFFLFlBQVc7QUFDOUIsZ0JBQUksUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDO0FBQ3BCLHNCQUFNLEVBQUUsSUFBSSxtQkFBbUIsRUFBRTthQUNwQyxDQUFDLENBQUM7O0FBRUgsY0FBRSxDQUFDLG1CQUFtQixFQUFFLFlBQVc7QUFDL0Isc0JBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUM5QixDQUFDLENBQUM7O0FBRUgsY0FBRSxDQUFDLGtEQUFrRCxFQUFFLFlBQVc7QUFDOUQsc0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUNsQyxDQUFDLENBQUM7O0FBRUgsY0FBRSxDQUFDLGlDQUFpQyxFQUFFLFlBQVc7QUFDN0Msc0JBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDdkMsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO0tBQ047O0FBRUQsV0FBTztBQUNILFdBQUcsRUFBRSxHQUFHO0tBQ1gsQ0FBQztDQUNMLENBQUEsRUFBRSxDQUFFOztRQUVHLFFBQVEsR0FBUixRQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIu+7vy8vIEltcG9ydCBhbGwgdGVzdHNcclxuaW1wb3J0IHtlbmdpbmVTcGVjfSBmcm9tICcuL2VuZ2luZVNwZWMuanMnO1xyXG5pbXBvcnQge3NoaXBTcGVjfSBmcm9tICcuL3NoaXBTcGVjLmpzJztcclxuaW1wb3J0IHthc3Rlcm9pZFNwZWN9IGZyb20gJy4vYXN0ZXJvaWRTcGVjLmpzJztcclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBlbmdpbmVTcGVjLnJ1bigpO1xyXG4gICAgc2hpcFNwZWMucnVuKCk7XHJcbiAgICBhc3Rlcm9pZFNwZWMucnVuKCk7XHJcbn0oKSk7XHJcbiIsImltcG9ydCB7RU5HSU5FfSBmcm9tICcuL2VuZ2luZSc7XHJcblxyXG5jbGFzcyBBc3Rlcm9pZCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBsZXQgcmFuZ2UgPSBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMzAsIDEwMCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiByYW5nZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiByYW5nZSxcclxuICAgICAgICAgICAgc3BlZWQ6IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigyLCA2KVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IEVOR0lORS51dGlsLmdldFJhbmRvbU51bWJlcigwIC0gdGhpcy5zZXR0aW5ncy5oZWlnaHQsIEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5oZWlnaHQgKiAtMjtcclxuXHJcbiAgICAgICAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICB0aGlzLmltZy5zcmMgPSAnYXBwL0NvbnRlbnQvSW1hZ2VzL2FzdGVyb2lkLScgKyBFTkdJTkUudXRpbC5nZXRSYW5kb21OdW1iZXIoMSwgNCkgKyAnLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZLCB0aGlzLnNldHRpbmdzLndpZHRoLCB0aGlzLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSArPSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0FzdGVyb2lkfTsiLCLvu792YXIgRU5HSU5FID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGxldCBmYWN0b3J5ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNsYXNzIEdhbWUge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUgPSBwcm9wZXJ0aWVzLnVwZGF0ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcgPSBwcm9wZXJ0aWVzLmRyYXc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0ID0gcHJvcGVydGllcy5pbml0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZHJhdygpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhcnQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ2FtZUxvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGFzcyBHYW1lT2JqZWN0IHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDUwLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWDogMCxcclxuICAgICAgICAgICAgICAgICAgICBwb3NZOiAwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lKHVwZGF0ZSwgZHJhdykge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWUodXBkYXRlLCBkcmF3KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWVPYmplY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZU9iamVjdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY3JlYXRlR2FtZTogY3JlYXRlR2FtZSxcclxuICAgICAgICAgICAgY3JlYXRlR2FtZU9iamVjdDogY3JlYXRlR2FtZU9iamVjdFxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBjb250cm9scyA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgZXZlbnRBY3Rpb25zID0ge307XHJcbiAgICAgICAgbGV0IGtleVN0YXRlID0ge307XHJcbiAgICAgICAgbGV0IGtleUFjdGlvbiA9IHtcclxuICAgICAgICAgICAgc3BhY2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBzcGFjZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHBhdXNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gZW50ZXIgbm90IGRlZmluZWQnKTsgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbiA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9ua2V5ID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY29udHJvbHNMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIChVcCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM4XSB8fCBrZXlTdGF0ZVs4N10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoTGVmdCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM3XSB8fCBrZXlTdGF0ZVs2NV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChSaWdodCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM5XSB8fCBrZXlTdGF0ZVs2OF0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoRG93biBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzQwXSB8fCBrZXlTdGF0ZVs4M10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gdHJ1ZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSBmYWxzZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIC8vIEVudGVyIGtleVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChwKSBQYXVzZVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA4MCkge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNwYWNlIGJhclxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMikge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb246b24sXHJcbiAgICAgICAgICAgIG9ua2V5OiBvbmtleVxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCB1dGlsID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgbGV0IG9iajFSaWdodFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1ggKyBvYmoxLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICBsZXQgb2JqMUxlZnRTaWRlID0gb2JqMS5zZXR0aW5ncy5wb3NYO1xyXG4gICAgICAgICAgICBsZXQgb2JqMlJpZ2h0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWCArIG9iajIuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBvYmoyTGVmdFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1g7XHJcblxyXG4gICAgICAgICAgICBpZiAobGVmdFNpZGVDb2xsaXNpb24oKSB8fCByaWdodFNpZGVDb2xsaXNpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGxlZnRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKChvYmoxTGVmdFNpZGUgPj0gb2JqMkxlZnRTaWRlICYmIG9iajFMZWZ0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJpZ2h0U2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvYmoxUmlnaHRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxUmlnaHRTaWRlIDw9IG9iajJSaWdodFNpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGVja1RvcFNpZGVDb2xsaXNpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAob2JqMS5zZXR0aW5ncy5wb3NZID49IG9iajIuc2V0dGluZ3MucG9zWSAmJiBvYmoxLnNldHRpbmdzLnBvc1kgPD0gb2JqMi5zZXR0aW5ncy5wb3NZICsgb2JqMi5zZXR0aW5ncy5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGVja0NvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGlmIChfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSAmJiBfdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbU51bWJlcihtaW4sIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xyXG4gICAgICAgICAgICBsZXQgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9ICcjJztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDE1KV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNoZWNrQ29sbGlzaW9uOiBjaGVja0NvbGxpc2lvbixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tTnVtYmVyOiBnZXRSYW5kb21OdW1iZXIsXHJcbiAgICAgICAgICAgIGdldFJhbmRvbUNvbG9yOiBnZXRSYW5kb21Db2xvclxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBzZXR0aW5ncyA9IHtcclxuICAgICAgICBjYW52YXNXaWR0aDogNzIwLFxyXG4gICAgICAgIGNhbnZhc0hlaWdodDogNDgwXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdXRpbDogdXRpbCxcclxuICAgICAgICBmYWN0b3J5OiBmYWN0b3J5LFxyXG4gICAgICAgIGNvbnRyb2xzOiBjb250cm9scyxcclxuICAgICAgICBzZXR0aW5nczogc2V0dGluZ3NcclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnQge0VOR0lORX07IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuXHJcbmNsYXNzIFNoaXAge1xyXG4gICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXHJcbiAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICBwb3NZOiAzNTAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjUsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgc3BlZWQ6IDRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICdhcHAvQ29udGVudC9JbWFnZXMvc3BhY2VzaGlwLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICB0aGlzLmxhc2Vycy5kcmF3KGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmxhc2Vycy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmZpcmUodGhpcy5zZXR0aW5ncy5wb3NYICsgMjMsIHRoaXMuc2V0dGluZ3MucG9zWSAtIDUpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCArIDcwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge1NoaXB9OyIsImxldCBDYW52YXNNb2NrID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiB7XHJcblxyXG4gICAgfVxyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtDYW52YXNNb2NrfTtcclxuIiwiY2xhc3MgTGFzZXJDb2xsZWN0aW9uTW9jayB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1heExhc2VycyA9IDEwO1xyXG4gICAgICAgIHRoaXMubGlzdCA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZmlyZSgpIHtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7TGFzZXJDb2xsZWN0aW9uTW9ja307IiwiaW1wb3J0IHtBc3Rlcm9pZH0gZnJvbSAnLi4vQXBwL1NyYy9hc3Rlcm9pZC5qcyc7XHJcbmltcG9ydCB7Q2FudmFzTW9ja30gZnJvbSAnLi9Nb2Nrcy9DYW52YXNNb2NrLmpzJztcclxuXHJcbmxldCBhc3Rlcm9pZFNwZWMgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgIGxldCB0ZXN0QXN0ZXJvaWQgPSBuZXcgQXN0ZXJvaWQoKTtcclxuXHJcbiAgICAgICAgZGVzY3JpYmUoJ0FzdGVyb2lkIFNwZWNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGl0KCdBc3Rlcm9pZCBjb250YWlucyBhIGRyYXcgbWV0aG9kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGVzdEFzdGVyb2lkLmRyYXcpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0FzdGVyb2lkIGNvbnRhaW5zIGEgdXBkYXRlIG1ldGhvZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHRlc3RBc3Rlcm9pZC51cGRhdGUpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcnVuOiBydW5cclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnQge2FzdGVyb2lkU3BlY307IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4uL0FwcC9TcmMvZW5naW5lLmpzJztcclxuXHJcbmxldCBlbmdpbmVTcGVjID0gKGZ1bmN0aW9uKCkgeyAgIC8vIFRlbXAgdW50aWwgd2UgZ2V0IGEgbW9kdWxlIHN5c3RlbSBpbiBwbGFjZSAoQ29udmVydCB0byBhIEVTNiBtb2R1bGUpXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgIGRlc2NyaWJlKCdFTkdJTkUgU3BlY3MnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaXQoJ0VuZ2luZSBjb250YWlucyBhIHV0aWwgbW9kdWxlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoRU5HSU5FLnV0aWwpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0VuZ2luZSBjb250YWlucyBhIGZhY3RvcnkgbW9kdWxlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoRU5HSU5FLmZhY3RvcnkpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0VuZ2luZSBjb250YWlucyBhIGNvbnRyb2xzIG1vZHVsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KEVOR0lORS5jb250cm9scykudG9CZURlZmluZWQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnRW5naW5lIGNvbnRhaW5zIGEgc2V0dGluZ3MgbW9kdWxlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoRU5HSU5FLnNldHRpbmdzKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdFbmdpbmUgc2V0dGluZ3MgbW9kdWxlIGhhcyBkZWZhdWx0IGNhbnZhc1dpZHRoIGFuZCBjYW52YXNIZWlnaHQgcHJvcGVydGllcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KEVOR0lORS5zZXR0aW5ncy5jYW52YXNIZWlnaHQpLnRvQmUoNDgwKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChFTkdJTkUuc2V0dGluZ3MuY2FudmFzV2lkdGgpLnRvQmUoNzIwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBydW46IHJ1blxyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbmV4cG9ydCB7ZW5naW5lU3BlY307IiwiaW1wb3J0IHtTaGlwfSBmcm9tICcuLi9BcHAvU3JjL3NoaXAuanMnO1xyXG5pbXBvcnQge0xhc2VyQ29sbGVjdGlvbk1vY2t9IGZyb20gJy4vTW9ja3MvbGFzZXJDb2xsZWN0aW9uTW9jay5qcyc7XHJcblxyXG5sZXQgc2hpcFNwZWMgPSAoZnVuY3Rpb24oKSB7ICAgLy8gVGVtcCB1bnRpbCB3ZSBnZXQgYSBtb2R1bGUgc3lzdGVtIGluIHBsYWNlIChDb252ZXJ0IHRvIGEgRVM2IG1vZHVsZSlcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oKSB7XHJcbiAgICAgICAgZGVzY3JpYmUoJ1NoaXAgU3BlY3MnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHRlc3RTaGlwID0gbmV3IFNoaXAoe1xyXG4gICAgICAgICAgICAgICAgbGFzZXJzOiBuZXcgTGFzZXJDb2xsZWN0aW9uTW9jaygpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ1NoaXAgQ2xhc3MgZXhpc3RzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoU2hpcCkudG9CZURlZmluZWQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnQ2FuIGNyZWF0ZSBuZXcgaW5zdGFuY2UgdGVzdFNoaXAgZnJvbSBTaGlwIGNsYXNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGVzdFNoaXApLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ3Rlc3RTaGlwIGNvbnRhaW5zIGEgZHJhdyBtZXRob2QnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh0ZXN0U2hpcC5kcmF3KS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJ1bjogcnVuXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtzaGlwU3BlY307Il19
