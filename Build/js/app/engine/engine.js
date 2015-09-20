System.register(['app/engine/collision-detection'], function(exports_1) {
    var collision_detection_1;
    var Game, Controls;
    return {
        setters:[
            function (_collision_detection_1) {
                collision_detection_1 = _collision_detection_1;
                exports_1("CollisionDetection", collision_detection_1.CollisionDetection);
            }],
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
            exports_1("Game", Game);
            Controls = (function () {
                function Controls() {
                    var _this = this;
                    this.eventActions = {
                        left: null,
                        right: null,
                        up: null,
                        down: null
                    };
                    this.keyAction = {
                        space: null,
                        pause: null,
                        enter: null
                    };
                    this.keyState = {};
                    this._init();
                    var controlsLoop = function () {
                        _this._loop();
                        requestAnimationFrame(controlsLoop);
                    };
                    requestAnimationFrame(controlsLoop);
                }
                Controls.prototype._init = function () {
                    var _this = this;
                    window.addEventListener('keydown', function (e) {
                        _this.keyState[e.keyCode || e.which] = true;
                    }, true);
                    window.addEventListener('keyup', function (e) {
                        _this.keyState[e.keyCode || e.which] = false;
                    }, true);
                    $(document).keydown(function (e) {
                        // Enter key
                        if (e.keyCode === 13) {
                            _this.keyAction.enter();
                        }
                        // (p) Pause
                        if (e.keyCode === 80) {
                            _this.keyAction.pause();
                        }
                        // Space bar
                        if (e.keyCode === 32) {
                            _this.keyAction.space();
                        }
                    });
                };
                Controls.prototype.on = function (event, func) {
                    switch (event) {
                        case 'left':
                            this.eventActions.left = func;
                            break;
                        case 'right':
                            this.eventActions.right = func;
                            break;
                        case 'up':
                            this.eventActions.up = func;
                            break;
                        case 'down':
                            this.eventActions.down = func;
                            break;
                        case 'space':
                            this.eventActions.down = func;
                            break;
                        case 'pause':
                            this.eventActions.down = func;
                            break;
                        default:
                            console.log('unknown control event fired');
                    }
                };
                Controls.prototype.onKey = function (event, func) {
                    switch (event) {
                        case 'space':
                            this.keyAction.space = func;
                            break;
                        case 'pause':
                            this.keyAction.pause = func;
                            break;
                        case 'enter':
                            this.keyAction.enter = func;
                            break;
                        default:
                            console.log('unknown control event fired');
                    }
                };
                Controls.prototype._loop = function () {
                    // (Up Arrow)
                    if (this.keyState[38] || this.keyState[87]) {
                        this.eventActions.up();
                    }
                    // (Left Arrow)
                    if (this.keyState[37] || this.keyState[65]) {
                        this.eventActions.left();
                    }
                    // (Right Arrow)
                    if (this.keyState[39] || this.keyState[68]) {
                        this.eventActions.right();
                    }
                    // (Down Arrow)
                    if (this.keyState[40] || this.keyState[83]) {
                        this.eventActions.down();
                    }
                };
                return Controls;
            })();
            exports_1("Controls", Controls);
        }
    }
});
