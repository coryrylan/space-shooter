System.register([], function(exports_1) {
    var Game, Engine;
    return {
        setters:[],
        execute: function() {
            Game = (function () {
                function Game(options) {
                    this._update = options.update;
                    this._draw = options.draw;
                    this._init = options.init;
                }
                Game.prototype.update = function () {
                    this._update();
                };
                Game.prototype.draw = function () {
                    this._draw();
                };
                Game.prototype.start = function () {
                    var _this = this;
                    this._init();
                    var gameLoop = function () {
                        _this._update();
                        _this._draw();
                        requestAnimationFrame(gameLoop);
                    };
                    requestAnimationFrame(gameLoop);
                };
                return Game;
            })();
            Engine = (function () {
                'use strict';
                var factory = (function () {
                    function createGame(options) {
                        return new Game(options);
                    }
                    return {
                        createGame: createGame
                    };
                }());
                var controls = (function () {
                    var eventActions = {};
                    var keyState = {};
                    var keyAction = {
                        space: function () { console.log('Key action space not defined'); },
                        pause: function () { console.log('Key action pause not defined'); },
                        enter: function () { console.log('Key action enter not defined'); }
                    };
                    var on = function (event, func) {
                        switch (event) {
                            case 'left':
                                eventActions.left = func;
                                break;
                            case 'right':
                                eventActions.right = func;
                                break;
                            case 'up':
                                eventActions.up = func;
                                break;
                            case 'down':
                                eventActions.down = func;
                                break;
                            case 'space':
                                eventActions.down = func;
                                break;
                            case 'pause':
                                eventActions.down = func;
                                break;
                            default:
                                console.log('unknown control event fired');
                        }
                    };
                    var onkey = function (event, func) {
                        switch (event) {
                            case 'space':
                                keyAction.space = func;
                                break;
                            case 'pause':
                                keyAction.pause = func;
                                break;
                            case 'enter':
                                keyAction.enter = func;
                                break;
                            default:
                                console.log('unknown control event fired');
                        }
                    };
                    var controlsLoop = function () {
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
                    };
                    requestAnimationFrame(controlsLoop);
                    window.addEventListener('keydown', function (e) {
                        keyState[e.keyCode || e.which] = true;
                    }, true);
                    window.addEventListener('keyup', function (e) {
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
                }());
                var settings = {
                    canvasWidth: 720,
                    canvasHeight: 480
                };
                return {
                    factory: factory,
                    controls: controls,
                    settings: settings
                };
            }());
            exports_1("Engine", Engine);
        }
    }
});
