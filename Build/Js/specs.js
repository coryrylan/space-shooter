(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// Import all tests

var EngineSpec = require("./engineSpec.js").EngineSpec;

var ShipSpec = require("./shipSpec.js").ShipSpec;

(function () {
    "use strict";

    EngineSpec.run();
    ShipSpec.run();
})();

},{"./engineSpec.js":5,"./shipSpec.js":6}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

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

},{}],3:[function(require,module,exports){
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

},{"./engine":2}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var LaserCollectionMock = (function () {
    function LaserCollectionMock() {
        _classCallCheck(this, LaserCollectionMock);

        this.maxLasers = 10;
        this.list = [];
    }

    _prototypeProperties(LaserCollectionMock, null, {
        update: {
            value: function update() {},
            writable: true,
            configurable: true
        },
        draw: {
            value: function draw() {},
            writable: true,
            configurable: true
        },
        fire: {
            value: function fire() {},
            writable: true,
            configurable: true
        }
    });

    return LaserCollectionMock;
})();

exports.LaserCollectionMock = LaserCollectionMock;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{}],5:[function(require,module,exports){
"use strict";

var ENGINE = require("../App/Src/engine.js").ENGINE;

var EngineSpec = (function () {
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

exports.EngineSpec = EngineSpec;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"../App/Src/engine.js":2}],6:[function(require,module,exports){
"use strict";

var Ship = require("../App/Src/ship.js").Ship;

var LaserCollectionMock = require("./Mocks/laserCollectionMock.js").LaserCollectionMock;

var ShipSpec = (function () {
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
                expect(testShip.draw2).toBeDefined();
            });
        });
    }

    return {
        run: run
    };
})();

exports.ShipSpec = ShipSpec;
Object.defineProperty(exports, "__esModule", {
    value: true
});

},{"../App/Src/ship.js":3,"./Mocks/laserCollectionMock.js":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvU3BlY3Mvc3BlY3MuanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvU3JjL2VuZ2luZS5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL0FwcC9TcmMvc2hpcC5qcyIsImQ6L0dpdEh1Yi9zcGFjZS1zaG9vdGVyL1NwZWNzL01vY2tzL2xhc2VyQ29sbGVjdGlvbk1vY2suanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9TcGVjcy9lbmdpbmVTcGVjLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvU3BlY3Mvc2hpcFNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0lDQ1EsVUFBVSxXQUFPLGlCQUFpQixFQUFsQyxVQUFVOztJQUNWLFFBQVEsV0FBTyxlQUFlLEVBQTlCLFFBQVE7O0FBRWhCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7QUFFYixjQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDakIsWUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ2xCLENBQUEsRUFBRSxDQUFFOzs7Ozs7Ozs7QUNUSixJQUFJLE1BQU0sR0FBSSxDQUFBLFlBQVc7QUFDdEIsZ0JBQVksQ0FBQzs7QUFFYixRQUFJLE9BQU8sR0FBSSxDQUFBLFlBQVc7WUFDaEIsSUFBSTtBQUNLLHFCQURULElBQUksQ0FDTSxVQUFVO3NDQURwQixJQUFJOztBQUVGLG9CQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDakMsb0JBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztBQUM3QixvQkFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO2FBQ2hDOztpQ0FMQyxJQUFJO0FBT04sc0JBQU07MkJBQUEs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Q2pELENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQztLQUNOOztBQUVELFdBQU87QUFDSCxXQUFHLEVBQUUsR0FBRztLQUNYLENBQUM7Q0FDTCxDQUFBLEVBQUUsQUFBQyxDQUFDOztRQUVHLFVBQVUsR0FBVixVQUFVOzs7Ozs7OztJQ25DVixJQUFJLFdBQU8sb0JBQW9CLEVBQS9CLElBQUk7O0lBQ0osbUJBQW1CLFdBQU8sZ0NBQWdDLEVBQTFELG1CQUFtQjs7QUFFM0IsSUFBSSxRQUFRLEdBQUksQ0FBQSxZQUFXOztBQUN2QixnQkFBWSxDQUFDOztBQUViLGFBQVMsR0FBRyxHQUFHO0FBQ1gsZ0JBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBVztBQUM5QixnQkFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUM7QUFDcEIsc0JBQU0sRUFBRSxJQUFJLG1CQUFtQixFQUFFO2FBQ3BDLENBQUMsQ0FBQzs7QUFFSCxjQUFFLENBQUMsbUJBQW1CLEVBQUUsWUFBVztBQUMvQixzQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzlCLENBQUMsQ0FBQzs7QUFFSCxjQUFFLENBQUMsa0RBQWtELEVBQUUsWUFBVztBQUM5RCxzQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ2xDLENBQUMsQ0FBQzs7QUFFSCxjQUFFLENBQUMsaUNBQWlDLEVBQUUsWUFBVztBQUM3QyxzQkFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN4QyxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7S0FDTjs7QUFFRCxXQUFPO0FBQ0gsV0FBRyxFQUFFLEdBQUc7S0FDWCxDQUFDO0NBQ0wsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7UUFFRyxRQUFRLEdBQVIsUUFBUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu78vLyBJbXBvcnQgYWxsIHRlc3RzXHJcbmltcG9ydCB7RW5naW5lU3BlY30gZnJvbSAnLi9lbmdpbmVTcGVjLmpzJztcclxuaW1wb3J0IHtTaGlwU3BlY30gZnJvbSAnLi9zaGlwU3BlYy5qcyc7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgRW5naW5lU3BlYy5ydW4oKTtcclxuICAgIFNoaXBTcGVjLnJ1bigpO1xyXG59KCkpO1xyXG4iLCLvu792YXIgRU5HSU5FID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGxldCBmYWN0b3J5ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNsYXNzIEdhbWUge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUgPSBwcm9wZXJ0aWVzLnVwZGF0ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcgPSBwcm9wZXJ0aWVzLmRyYXc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0ID0gcHJvcGVydGllcy5pbml0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZHJhdygpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RhcnQoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ2FtZUxvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmF3KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjbGFzcyBHYW1lT2JqZWN0IHtcclxuICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDUwLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zWDogMCxcclxuICAgICAgICAgICAgICAgICAgICBwb3NZOiAwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVHYW1lKHVwZGF0ZSwgZHJhdykge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEdhbWUodXBkYXRlLCBkcmF3KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWVPYmplY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZU9iamVjdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY3JlYXRlR2FtZTogY3JlYXRlR2FtZSxcclxuICAgICAgICAgICAgY3JlYXRlR2FtZU9iamVjdDogY3JlYXRlR2FtZU9iamVjdFxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBjb250cm9scyA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgZXZlbnRBY3Rpb25zID0ge307XHJcbiAgICAgICAgbGV0IGtleVN0YXRlID0ge307XHJcbiAgICAgICAgbGV0IGtleUFjdGlvbiA9IHtcclxuICAgICAgICAgICAgc3BhY2U6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBzcGFjZSBub3QgZGVmaW5lZCcpOyB9LFxyXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHBhdXNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIGVudGVyOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gZW50ZXIgbm90IGRlZmluZWQnKTsgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBvbiA9IGZ1bmN0aW9uKGV2ZW50LCBmdW5jKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0ID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMucmlnaHQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncGF1c2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY29udHJvbCBldmVudCBmaXJlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9ua2V5ID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3BhY2UnOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5zcGFjZSA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VudGVyJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY29udHJvbHNMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIChVcCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM4XSB8fCBrZXlTdGF0ZVs4N10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy51cCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoTGVmdCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM3XSB8fCBrZXlTdGF0ZVs2NV0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5sZWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChSaWdodCBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzM5XSB8fCBrZXlTdGF0ZVs2OF0pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAoRG93biBBcnJvdylcclxuICAgICAgICAgICAgaWYgKGtleVN0YXRlWzQwXSB8fCBrZXlTdGF0ZVs4M10pIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjb250cm9sc0xvb3ApO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlIHx8IGUud2hpY2hdID0gdHJ1ZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSBmYWxzZTtcclxuICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIC8vIEVudGVyIGtleVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLmVudGVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChwKSBQYXVzZVxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSA4MCkge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFNwYWNlIGJhclxyXG4gICAgICAgICAgICBpZiAoZS5rZXlDb2RlID09PSAzMikge1xyXG4gICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb246b24sXHJcbiAgICAgICAgICAgIG9ua2V5OiBvbmtleVxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCB1dGlsID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgbGV0IG9iajFSaWdodFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1ggKyBvYmoxLnNldHRpbmdzLndpZHRoO1xyXG4gICAgICAgICAgICBsZXQgb2JqMUxlZnRTaWRlID0gb2JqMS5zZXR0aW5ncy5wb3NYO1xyXG4gICAgICAgICAgICBsZXQgb2JqMlJpZ2h0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWCArIG9iajIuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBvYmoyTGVmdFNpZGUgPSBvYmoyLnNldHRpbmdzLnBvc1g7XHJcblxyXG4gICAgICAgICAgICBpZiAobGVmdFNpZGVDb2xsaXNpb24oKSB8fCByaWdodFNpZGVDb2xsaXNpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGxlZnRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKChvYmoxTGVmdFNpZGUgPj0gb2JqMkxlZnRTaWRlICYmIG9iajFMZWZ0U2lkZSA8PSBvYmoyUmlnaHRTaWRlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJpZ2h0U2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChvYmoxUmlnaHRTaWRlID49IG9iajJMZWZ0U2lkZSAmJiBvYmoxUmlnaHRTaWRlIDw9IG9iajJSaWdodFNpZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBfdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGVja1RvcFNpZGVDb2xsaXNpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAob2JqMS5zZXR0aW5ncy5wb3NZID49IG9iajIuc2V0dGluZ3MucG9zWSAmJiBvYmoxLnNldHRpbmdzLnBvc1kgPD0gb2JqMi5zZXR0aW5ncy5wb3NZICsgb2JqMi5zZXR0aW5ncy5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjaGVja0NvbGxpc2lvbihvYmoxLCBvYmoyKSB7XHJcbiAgICAgICAgICAgIGlmIChfaG9yaXpvbnRhbENvbGxpc2lvbihvYmoxLCBvYmoyKSAmJiBfdmVydGljYWxQb3NpdGlvbihvYmoxLCBvYmoyKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbU51bWJlcihtaW4sIG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xyXG4gICAgICAgICAgICBsZXQgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XHJcbiAgICAgICAgICAgIGxldCBjb2xvciA9ICcjJztcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDE1KV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNoZWNrQ29sbGlzaW9uOiBjaGVja0NvbGxpc2lvbixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tTnVtYmVyOiBnZXRSYW5kb21OdW1iZXIsXHJcbiAgICAgICAgICAgIGdldFJhbmRvbUNvbG9yOiBnZXRSYW5kb21Db2xvclxyXG4gICAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIGxldCBzZXR0aW5ncyA9IHtcclxuICAgICAgICBjYW52YXNXaWR0aDogNzIwLFxyXG4gICAgICAgIGNhbnZhc0hlaWdodDogNDgwXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdXRpbDogdXRpbCxcclxuICAgICAgICBmYWN0b3J5OiBmYWN0b3J5LFxyXG4gICAgICAgIGNvbnRyb2xzOiBjb250cm9scyxcclxuICAgICAgICBzZXR0aW5nczogc2V0dGluZ3NcclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnQge0VOR0lORX07IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4vZW5naW5lJztcclxuXHJcbmNsYXNzIFNoaXAge1xyXG4gICAgY29uc3RydWN0b3IocHJvcGVydGllcykge1xyXG4gICAgICAgIHRoaXMubGFzZXJzID0gcHJvcGVydGllcy5sYXNlcnM7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXHJcbiAgICAgICAgICAgIHBvc1g6IDI1LFxyXG4gICAgICAgICAgICBwb3NZOiAzNTAsXHJcbiAgICAgICAgICAgIGhlaWdodDogMjUsXHJcbiAgICAgICAgICAgIHdpZHRoOiAyNSxcclxuICAgICAgICAgICAgc3BlZWQ6IDRcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIHRoaXMuaW1nLnNyYyA9ICdBcHAvQ29udGVudC9JbWFnZXMvc3BhY2VzaGlwLnBuZyc7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhjb250ZXh0KSB7XHJcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodGhpcy5pbWcsIHRoaXMuc2V0dGluZ3MucG9zWCwgdGhpcy5zZXR0aW5ncy5wb3NZKTtcclxuICAgICAgICB0aGlzLmxhc2Vycy5kcmF3KGNvbnRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmxhc2Vycy51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmZpcmUodGhpcy5zZXR0aW5ncy5wb3NYICsgMjMsIHRoaXMuc2V0dGluZ3MucG9zWSAtIDUpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVMZWZ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy53aWR0aCA8IEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCArIDcwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWCA9IHRoaXMuc2V0dGluZ3MucG9zWCArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVVcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldHRpbmdzLnBvc1kgPSB0aGlzLnNldHRpbmdzLnBvc1kgLSB0aGlzLnNldHRpbmdzLnNwZWVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5wb3NZIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCAtIDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSArIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge1NoaXB9OyIsImNsYXNzIExhc2VyQ29sbGVjdGlvbk1vY2sge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tYXhMYXNlcnMgPSAxMDtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoKSB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQge0xhc2VyQ29sbGVjdGlvbk1vY2t9OyIsImltcG9ydCB7RU5HSU5FfSBmcm9tICcuLi9BcHAvU3JjL2VuZ2luZS5qcyc7XHJcblxyXG52YXIgRW5naW5lU3BlYyA9IChmdW5jdGlvbigpIHsgICAvLyBUZW1wIHVudGlsIHdlIGdldCBhIG1vZHVsZSBzeXN0ZW0gaW4gcGxhY2UgKENvbnZlcnQgdG8gYSBFUzYgbW9kdWxlKVxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJ1bigpIHtcclxuICAgICAgICBkZXNjcmliZSgnRU5HSU5FIFNwZWNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGl0KCdFbmdpbmUgY29udGFpbnMgYSB1dGlsIG1vZHVsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KEVOR0lORS51dGlsKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdFbmdpbmUgY29udGFpbnMgYSBmYWN0b3J5IG1vZHVsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KEVOR0lORS5mYWN0b3J5KS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdFbmdpbmUgY29udGFpbnMgYSBjb250cm9scyBtb2R1bGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChFTkdJTkUuY29udHJvbHMpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0VuZ2luZSBjb250YWlucyBhIHNldHRpbmdzIG1vZHVsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KEVOR0lORS5zZXR0aW5ncykudG9CZURlZmluZWQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnRW5naW5lIHNldHRpbmdzIG1vZHVsZSBoYXMgZGVmYXVsdCBjYW52YXNXaWR0aCBhbmQgY2FudmFzSGVpZ2h0IHByb3BlcnRpZXMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0KS50b0JlKDQ4MCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoKS50b0JlKDcyMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcnVuOiBydW5cclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnQge0VuZ2luZVNwZWN9OyIsImltcG9ydCB7U2hpcH0gZnJvbSAnLi4vQXBwL1NyYy9zaGlwLmpzJztcclxuaW1wb3J0IHtMYXNlckNvbGxlY3Rpb25Nb2NrfSBmcm9tICcuL01vY2tzL2xhc2VyQ29sbGVjdGlvbk1vY2suanMnO1xyXG5cclxudmFyIFNoaXBTcGVjID0gKGZ1bmN0aW9uKCkgeyAgIC8vIFRlbXAgdW50aWwgd2UgZ2V0IGEgbW9kdWxlIHN5c3RlbSBpbiBwbGFjZSAoQ29udmVydCB0byBhIEVTNiBtb2R1bGUpXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgZnVuY3Rpb24gcnVuKCkge1xyXG4gICAgICAgIGRlc2NyaWJlKCdTaGlwIFNwZWNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXN0U2hpcCA9IG5ldyBTaGlwKHtcclxuICAgICAgICAgICAgICAgIGxhc2VyczogbmV3IExhc2VyQ29sbGVjdGlvbk1vY2soKVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdTaGlwIENsYXNzIGV4aXN0cycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KFNoaXApLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0NhbiBjcmVhdGUgbmV3IGluc3RhbmNlIHRlc3RTaGlwIGZyb20gU2hpcCBjbGFzcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHRlc3RTaGlwKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCd0ZXN0U2hpcCBjb250YWlucyBhIGRyYXcgbWV0aG9kJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGVzdFNoaXAuZHJhdzIpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcnVuOiBydW5cclxuICAgIH07XHJcbn0oKSk7XHJcblxyXG5leHBvcnQge1NoaXBTcGVjfTsiXX0=
