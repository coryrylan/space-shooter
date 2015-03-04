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

},{"./engineSpec.js":4,"./shipSpec.js":5}],2:[function(require,module,exports){
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

var ENGINE = require("../App/JavaScript/Src/engine.js").ENGINE;

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

},{"../App/JavaScript/Src/engine.js":2}],5:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Ship = require("../App/JavaScript/Src/ship.js").Ship;

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
                expect(testShip.draw).toBeDefined();
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

},{"../App/JavaScript/Src/ship.js":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvU3BlY3Mvc3BlY3MuanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9BcHAvSmF2YVNjcmlwdC9TcmMvZW5naW5lLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvQXBwL0phdmFTY3JpcHQvU3JjL3NoaXAuanMiLCJkOi9HaXRIdWIvc3BhY2Utc2hvb3Rlci9TcGVjcy9lbmdpbmVTcGVjLmpzIiwiZDovR2l0SHViL3NwYWNlLXNob290ZXIvU3BlY3Mvc2hpcFNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0lDQ1EsVUFBVSxXQUFPLGlCQUFpQixFQUFsQyxVQUFVOztJQUNWLFFBQVEsV0FBTyxlQUFlLEVBQTlCLFFBQVE7O0FBRWhCLEFBQUMsQ0FBQSxZQUFXO0FBQ1IsZ0JBQVksQ0FBQzs7QUFFYixjQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDakIsWUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ2xCLENBQUEsRUFBRSxDQUFFOzs7Ozs7Ozs7QUNUSixJQUFJLE1BQU0sR0FBSSxDQUFBLFlBQVc7O0FBQ3RCLGdCQUFZLENBQUM7O0FBRWIsUUFBSSxPQUFPLEdBQUksQ0FBQSxZQUFXO1lBQ2hCLElBQUk7QUFDSyxxQkFEVCxJQUFJLENBQ00sVUFBVTtzQ0FEcEIsSUFBSTs7QUFFRixvQkFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ2pDLG9CQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDN0Isb0JBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQzthQUNoQzs7aUNBTEMsSUFBSTtBQU9OLHNCQUFNOzJCQUFBLGtCQUFHO0FBQ0wsNEJBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztx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QUFHLEVBRVI7Ozs7QUFFRCxZQUFJO21CQUFBLGdCQUFHLEVBRU47Ozs7QUFFRCxZQUFJO21CQUFBLGdCQUFHLEVBRU47Ozs7OztXQWhCQyxtQkFBbUI7OztBQW1CekIsSUFBSSxRQUFRLEdBQUksQ0FBQSxZQUFXOztBQUN2QixnQkFBWSxDQUFDOztBQUViLGFBQVMsR0FBRyxHQUFHO0FBQ1gsZ0JBQVEsQ0FBQyxZQUFZLEVBQUUsWUFBVztBQUM5QixnQkFBSSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUM7QUFDcEIsc0JBQU0sRUFBRSxJQUFJLG1CQUFtQixFQUFFO2FBQ3BDLENBQUMsQ0FBQzs7QUFFSCxjQUFFLENBQUMsbUJBQW1CLEVBQUUsWUFBVztBQUMvQixzQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQzlCLENBQUMsQ0FBQzs7QUFFSCxjQUFFLENBQUMsa0RBQWtELEVBQUUsWUFBVztBQUM5RCxzQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ2xDLENBQUMsQ0FBQzs7QUFFSCxjQUFFLENBQUMsaUNBQWlDLEVBQUUsWUFBVztBQUM3QyxzQkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzthQUN2QyxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7S0FDTjs7QUFFRCxXQUFPO0FBQ0gsV0FBRyxFQUFFLEdBQUc7S0FDWCxDQUFDO0NBQ0wsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7UUFFRyxRQUFRLEdBQVIsUUFBUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCLvu78vLyBJbXBvcnQgYWxsIHRlc3RzXHJcbmltcG9ydCB7RW5naW5lU3BlY30gZnJvbSAnLi9lbmdpbmVTcGVjLmpzJztcclxuaW1wb3J0IHtTaGlwU3BlY30gZnJvbSAnLi9zaGlwU3BlYy5qcyc7XHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgRW5naW5lU3BlYy5ydW4oKTtcclxuICAgIFNoaXBTcGVjLnJ1bigpO1xyXG59KCkpO1xyXG4iLCLvu792YXIgRU5HSU5FID0gKGZ1bmN0aW9uKCkgeyAgIC8vIFRlbXAgdW50aWwgd2UgZ2V0IGEgbW9kdWxlIHN5c3RlbSBpbiBwbGFjZSAoQ29udmVydCB0byBhIEVTNiBtb2R1bGUpXHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgbGV0IGZhY3RvcnkgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY2xhc3MgR2FtZSB7XHJcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSA9IHByb3BlcnRpZXMudXBkYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdyA9IHByb3BlcnRpZXMuZHJhdztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQgPSBwcm9wZXJ0aWVzLmluaXQ7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkcmF3KCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhdygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdGFydCgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICAgICAgICAgIHZhciBnYW1lTG9vcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYXcoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNsYXNzIEdhbWVPYmplY3Qge1xyXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjMDAwMDAwJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA1MCxcclxuICAgICAgICAgICAgICAgICAgICBwb3NYOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc1k6IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdhbWUodXBkYXRlLCBkcmF3KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgR2FtZSh1cGRhdGUsIGRyYXcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY3JlYXRlR2FtZU9iamVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHYW1lT2JqZWN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjcmVhdGVHYW1lOiBjcmVhdGVHYW1lLFxyXG4gICAgICAgICAgICBjcmVhdGVHYW1lT2JqZWN0OiBjcmVhdGVHYW1lT2JqZWN0XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IGNvbnRyb2xzID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxldCBldmVudEFjdGlvbnMgPSB7fTtcclxuICAgICAgICBsZXQga2V5U3RhdGUgPSB7fTtcclxuICAgICAgICBsZXQga2V5QWN0aW9uID0ge1xyXG4gICAgICAgICAgICBzcGFjZTogZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKCdLZXkgYWN0aW9uIHNwYWNlIG5vdCBkZWZpbmVkJyk7IH0sXHJcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coJ0tleSBhY3Rpb24gcGF1c2Ugbm90IGRlZmluZWQnKTsgfSxcclxuICAgICAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnS2V5IGFjdGlvbiBlbnRlciBub3QgZGVmaW5lZCcpOyB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IG9uID0gZnVuY3Rpb24oZXZlbnQsIGZ1bmMpIHtcclxuICAgICAgICAgICAgc3dpdGNoIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAncmlnaHQnOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5yaWdodCA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50QWN0aW9ucy5kb3duID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NwYWNlJzpcclxuICAgICAgICAgICAgICAgICAgICBldmVudEFjdGlvbnMuZG93biA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdwYXVzZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24gPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndW5rbm93biBjb250cm9sIGV2ZW50IGZpcmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgb25rZXkgPSBmdW5jdGlvbihldmVudCwgZnVuYykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdzcGFjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAga2V5QWN0aW9uLnNwYWNlID0gZnVuYztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ3BhdXNlJzpcclxuICAgICAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UgPSBmdW5jO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIGtleUFjdGlvbi5lbnRlciA9IGZ1bmM7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bmtub3duIGNvbnRyb2wgZXZlbnQgZmlyZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBjb250cm9sc0xvb3AgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gKFVwIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzhdIHx8IGtleVN0YXRlWzg3XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnVwKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChMZWZ0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzddIHx8IGtleVN0YXRlWzY1XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmxlZnQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKFJpZ2h0IEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbMzldIHx8IGtleVN0YXRlWzY4XSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLnJpZ2h0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIChEb3duIEFycm93KVxyXG4gICAgICAgICAgICBpZiAoa2V5U3RhdGVbNDBdIHx8IGtleVN0YXRlWzgzXSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRBY3Rpb25zLmRvd24oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNvbnRyb2xzTG9vcCk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBrZXlTdGF0ZVtlLmtleUNvZGUgfHwgZS53aGljaF0gPSB0cnVlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZSB8fCBlLndoaWNoXSA9IGZhbHNlO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgLy8gRW50ZXIga2V5XHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uZW50ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gKHApIFBhdXNlXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDgwKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24ucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gU3BhY2UgYmFyXHJcbiAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICBrZXlBY3Rpb24uc3BhY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvbjpvbixcclxuICAgICAgICAgICAgb25rZXk6IG9ua2V5XHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHV0aWwgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZnVuY3Rpb24gX2hvcml6b250YWxDb2xsaXNpb24ob2JqMSwgb2JqMikge1xyXG4gICAgICAgICAgICBsZXQgb2JqMVJpZ2h0U2lkZSA9IG9iajEuc2V0dGluZ3MucG9zWCArIG9iajEuc2V0dGluZ3Mud2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBvYmoxTGVmdFNpZGUgPSBvYmoxLnNldHRpbmdzLnBvc1g7XHJcbiAgICAgICAgICAgIGxldCBvYmoyUmlnaHRTaWRlID0gb2JqMi5zZXR0aW5ncy5wb3NYICsgb2JqMi5zZXR0aW5ncy53aWR0aDtcclxuICAgICAgICAgICAgbGV0IG9iajJMZWZ0U2lkZSA9IG9iajIuc2V0dGluZ3MucG9zWDtcclxuXHJcbiAgICAgICAgICAgIGlmIChsZWZ0U2lkZUNvbGxpc2lvbigpIHx8IHJpZ2h0U2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGVmdFNpZGVDb2xsaXNpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKG9iajFMZWZ0U2lkZSA+PSBvYmoyTGVmdFNpZGUgJiYgb2JqMUxlZnRTaWRlIDw9IG9iajJSaWdodFNpZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gcmlnaHRTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9iajFSaWdodFNpZGUgPj0gb2JqMkxlZnRTaWRlICYmIG9iajFSaWdodFNpZGUgPD0gb2JqMlJpZ2h0U2lkZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKGNoZWNrVG9wU2lkZUNvbGxpc2lvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tUb3BTaWRlQ29sbGlzaW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChvYmoxLnNldHRpbmdzLnBvc1kgPj0gb2JqMi5zZXR0aW5ncy5wb3NZICYmIG9iajEuc2V0dGluZ3MucG9zWSA8PSBvYmoyLnNldHRpbmdzLnBvc1kgKyBvYmoyLnNldHRpbmdzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrQ29sbGlzaW9uKG9iajEsIG9iajIpIHtcclxuICAgICAgICAgICAgaWYgKF9ob3Jpem9udGFsQ29sbGlzaW9uKG9iajEsIG9iajIpICYmIF92ZXJ0aWNhbFBvc2l0aW9uKG9iajEsIG9iajIpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tTnVtYmVyKG1pbiwgbWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7XHJcbiAgICAgICAgICAgIGxldCBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcclxuICAgICAgICAgICAgbGV0IGNvbG9yID0gJyMnO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTUpXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2hlY2tDb2xsaXNpb246IGNoZWNrQ29sbGlzaW9uLFxyXG4gICAgICAgICAgICBnZXRSYW5kb21OdW1iZXI6IGdldFJhbmRvbU51bWJlcixcclxuICAgICAgICAgICAgZ2V0UmFuZG9tQ29sb3I6IGdldFJhbmRvbUNvbG9yXHJcbiAgICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgbGV0IHNldHRpbmdzID0ge1xyXG4gICAgICAgIGNhbnZhc1dpZHRoOiA3MjAsXHJcbiAgICAgICAgY2FudmFzSGVpZ2h0OiA0ODBcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB1dGlsOiB1dGlsLFxyXG4gICAgICAgIGZhY3Rvcnk6IGZhY3RvcnksXHJcbiAgICAgICAgY29udHJvbHM6IGNvbnRyb2xzLFxyXG4gICAgICAgIHNldHRpbmdzOiBzZXR0aW5nc1xyXG4gICAgfTtcclxufSgpKTtcclxuXHJcbmV4cG9ydCB7RU5HSU5FfTsiLCJpbXBvcnQge0VOR0lORX0gZnJvbSAnLi9lbmdpbmUnO1xyXG5cclxuY2xhc3MgU2hpcCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMgPSBwcm9wZXJ0aWVzLmxhc2VycztcclxuXHJcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IHtcclxuICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDAsIDAsIDAsIDEpJyxcclxuICAgICAgICAgICAgcG9zWDogMjUsXHJcbiAgICAgICAgICAgIHBvc1k6IDM1MCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyNSxcclxuICAgICAgICAgICAgd2lkdGg6IDI1LFxyXG4gICAgICAgICAgICBzcGVlZDogNFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgdGhpcy5pbWcuc3JjID0gJ0FwcC9Db250ZW50L0ltYWdlcy9zcGFjZXNoaXAucG5nJztcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGNvbnRleHQpIHtcclxuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmltZywgdGhpcy5zZXR0aW5ncy5wb3NYLCB0aGlzLnNldHRpbmdzLnBvc1kpO1xyXG4gICAgICAgIHRoaXMubGFzZXJzLmRyYXcoY29udGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIHRoaXMubGFzZXJzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoKSB7XHJcbiAgICAgICAgdGhpcy5sYXNlcnMuZmlyZSh0aGlzLnNldHRpbmdzLnBvc1ggKyAyMywgdGhpcy5zZXR0aW5ncy5wb3NZIC0gNSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MucG9zWCA+IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYIC0gdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVJpZ2h0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1ggKyB0aGlzLnNldHRpbmdzLndpZHRoIDwgRU5HSU5FLnNldHRpbmdzLmNhbnZhc1dpZHRoICsgNzApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NYID0gdGhpcy5zZXR0aW5ncy5wb3NYICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucG9zWSA9IHRoaXMuc2V0dGluZ3MucG9zWSAtIHRoaXMuc2V0dGluZ3Muc3BlZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVEb3duKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLnBvc1kgPCBFTkdJTkUuc2V0dGluZ3MuY2FudmFzSGVpZ2h0IC0gNDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy5wb3NZID0gdGhpcy5zZXR0aW5ncy5wb3NZICsgdGhpcy5zZXR0aW5ncy5zcGVlZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB7U2hpcH07IiwiaW1wb3J0IHtFTkdJTkV9IGZyb20gJy4uL0FwcC9KYXZhU2NyaXB0L1NyYy9lbmdpbmUuanMnO1xyXG5cclxudmFyIEVuZ2luZVNwZWMgPSAoZnVuY3Rpb24oKSB7ICAgLy8gVGVtcCB1bnRpbCB3ZSBnZXQgYSBtb2R1bGUgc3lzdGVtIGluIHBsYWNlIChDb252ZXJ0IHRvIGEgRVM2IG1vZHVsZSlcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oKSB7XHJcbiAgICAgICAgZGVzY3JpYmUoJ0VOR0lORSBTcGVjcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpdCgnRW5naW5lIGNvbnRhaW5zIGEgdXRpbCBtb2R1bGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChFTkdJTkUudXRpbCkudG9CZURlZmluZWQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnRW5naW5lIGNvbnRhaW5zIGEgZmFjdG9yeSBtb2R1bGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChFTkdJTkUuZmFjdG9yeSkudG9CZURlZmluZWQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnRW5naW5lIGNvbnRhaW5zIGEgY29udHJvbHMgbW9kdWxlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoRU5HSU5FLmNvbnRyb2xzKS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0KCdFbmdpbmUgY29udGFpbnMgYSBzZXR0aW5ncyBtb2R1bGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChFTkdJTkUuc2V0dGluZ3MpLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ0VuZ2luZSBzZXR0aW5ncyBtb2R1bGUgaGFzIGRlZmF1bHQgY2FudmFzV2lkdGggYW5kIGNhbnZhc0hlaWdodCBwcm9wZXJ0aWVzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoRU5HSU5FLnNldHRpbmdzLmNhbnZhc0hlaWdodCkudG9CZSg0ODApO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KEVOR0lORS5zZXR0aW5ncy5jYW52YXNXaWR0aCkudG9CZSg3MjApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJ1bjogcnVuXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtFbmdpbmVTcGVjfTsiLCJpbXBvcnQge1NoaXB9IGZyb20gJy4uL0FwcC9KYXZhU2NyaXB0L1NyYy9zaGlwLmpzJztcclxuXHJcbmNsYXNzIExhc2VyQ29sbGVjdGlvbk1vY2sge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tYXhMYXNlcnMgPSAxMDtcclxuICAgICAgICB0aGlzLmxpc3QgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoKSB7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG52YXIgU2hpcFNwZWMgPSAoZnVuY3Rpb24oKSB7ICAgLy8gVGVtcCB1bnRpbCB3ZSBnZXQgYSBtb2R1bGUgc3lzdGVtIGluIHBsYWNlIChDb252ZXJ0IHRvIGEgRVM2IG1vZHVsZSlcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBmdW5jdGlvbiBydW4oKSB7XHJcbiAgICAgICAgZGVzY3JpYmUoJ1NoaXAgU3BlY3MnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbGV0IHRlc3RTaGlwID0gbmV3IFNoaXAoe1xyXG4gICAgICAgICAgICAgICAgbGFzZXJzOiBuZXcgTGFzZXJDb2xsZWN0aW9uTW9jaygpXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ1NoaXAgQ2xhc3MgZXhpc3RzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QoU2hpcCkudG9CZURlZmluZWQoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpdCgnQ2FuIGNyZWF0ZSBuZXcgaW5zdGFuY2UgdGVzdFNoaXAgZnJvbSBTaGlwIGNsYXNzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGVzdFNoaXApLnRvQmVEZWZpbmVkKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXQoJ3Rlc3RTaGlwIGNvbnRhaW5zIGEgZHJhdyBtZXRob2QnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh0ZXN0U2hpcC5kcmF3KS50b0JlRGVmaW5lZCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJ1bjogcnVuXHJcbiAgICB9O1xyXG59KCkpO1xyXG5cclxuZXhwb3J0IHtTaGlwU3BlY307Il19
