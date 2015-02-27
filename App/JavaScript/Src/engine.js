var ENGINE = (function() {   // Temp until we get a module system in place (Convert to a ES6 module)
    'use strict';

    let factory = (function() {
        class Game {
            constructor(properties) {
                this._update = properties.update;
                this._draw = properties.draw;
            }

            update() {
                this._update();
            }

            draw() {
                this._draw();
            }

            start() {
                var gameLoop = function() {
                    this._update();
                    this._draw();
                    requestAnimationFrame(gameLoop);
                }.bind(this);

                requestAnimationFrame(gameLoop);
            }
        }

        class GameObject {
            constructor() {
                this.settings = {
                    color: '#000000',
                    width: 50,
                    height: 50,
                    posX: 0,
                    posY: 0
                };
            }
        }

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

    let util = (function() {
        function _horizontalCollision(obj1, obj2) {
            let obj1RightSide = obj1.settings.posX + obj1.settings.width;
            let obj1LeftSide = obj1.settings.posX;
            let obj2RightSide = obj2.settings.posX + obj2.settings.width;
            let obj2LeftSide = obj2.settings.posX;

            if (leftSideCollision() || rightSideCollision()) {
                return true;
            } else {
                return false;
            }

            function leftSideCollision() {
                if ((obj1LeftSide >= obj2LeftSide && obj1LeftSide <= obj2RightSide)) {
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
                return (obj1.settings.posY >= obj2.settings.posY && obj1.settings.posY <= obj2.settings.posY + obj2.settings.height);
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
            let letters = '0123456789ABCDEF'.split('');
            let color = '#';

            for (let i = 0; i < 6; i++) {
                color += letters[Math.round(Math.random() * 15)];
            }

            return color;
        }

        return {
            checkCollision: checkCollision,
            getRandomNumber: getRandomNumber,
            getRandomColor: getRandomColor
        };
    }());

    let settings = {
        canvasWidth: 640,
        canvasHeight: 480
    };

    return {
        util: util,
        factory: factory,
        controls: controls,
        settings: settings
    };
}());

export {ENGINE}