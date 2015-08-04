var Engine = (function() {
    'use strict';

    let factory = (function() {
        class Game {
            constructor(properties) {
                this._update = properties.update;
                this._draw = properties.draw;
                this._init = properties.init;
            }

            update() {
                this._update();
            }

            draw() {
                this._draw();
            }

            start() {
                this._init();
                var gameLoop = function() {
                    this._update();
                    this._draw();
                    requestAnimationFrame(gameLoop);
                }.bind(this);

                requestAnimationFrame(gameLoop);
            }
        }

        function createGame(update, draw) {
            return new Game(update, draw);
        }

        return {
            createGame: createGame
        };
    }());

    let controls = (function() {
        let eventActions = {};
        let keyState = {};
        let keyAction = {
            space: function() { console.log('Key action space not defined'); },
            pause: function() { console.log('Key action pause not defined'); },
            enter: function() { console.log('Key action enter not defined'); }
        };

        let on = function(event, func) {
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

        let onkey = function(event, func) {
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

        let controlsLoop = function() {
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

        window.addEventListener('keydown', function(e) {
            keyState[e.keyCode || e.which] = true;
        }, true);

        window.addEventListener('keyup', function(e) {
            keyState[e.keyCode || e.which] = false;
        }, true);

        $(document).keydown(function(e) {
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
            on:on,
            onkey: onkey
        };
    }());

    let settings = {
        canvasWidth: 720,
        canvasHeight: 480
    };

    return {
        factory: factory,
        controls: controls,
        settings: settings
    };
}());

export {Engine};