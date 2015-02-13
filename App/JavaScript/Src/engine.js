window.ENGINE = (function() {   // Temp until we get a module system in place (Convert to a ES6 module)
    'use strict';

    let keyState = {};
    window.addEventListener('keydown', function(e) {
        keyState[e.keyCode || e.which] = true;
    }, true);

    window.addEventListener('keyup', function(e) {
        keyState[e.keyCode || e.which] = false;
    }, true);

    function draw() {

    }

    function update() {
        gameIOUpdate();
    }

    //region Object Factory
    let factory = {};

    factory.createGameObject = function() {
        return new GameObject();
    };

    function GameObject() {
        this.settings = {
            color: '#000000',
            width: 50,
            height: 50,
            posX: 0,
            posY: 0,
        };
    }
    //endregion

    //region Controls
    let controls = {};
    let eventActions = {};
    let keyAction = {
        space: function() { console.log('Key action space not defined'); },
        pause: function() { console.log('Key action pause not defined'); },
        enter: function() { console.log('Key action enter not defined'); }
    };

    controls.on = function(event, func) {
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

    controls.onkey = function(event, func) {
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

    // Inactive controls
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

    //region testing
    var start = new Hammer($('.start-screen')[0]);
    start.on('tap', function() {
        keyAction.enter();
    });

    var upBtn = new Hammer($('.direction-pad__up')[0], { time: 1 });
    var pressingUp = false;

    upBtn.on('press', function() {
        pressingUp = true;
    });

    upBtn.on('pressup', function() {
        pressingUp = false;
    });
    //endregion

    function gameIOUpdate() {
        // (Up Arrow)
        if (keyState[38] || keyState[87] || pressingUp) {
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
    }
    //endregion

    //region Util
    let util = {};

    util.checkCollision = function(obj1, obj2) {
        if (horizontalCollision() && verticalPosition()) {
            return true;
        } else {
            return false;
        }

        function horizontalCollision() {
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

        function verticalPosition() {
            if (checkTopSideCollision()) {
                return true;
            } else {
                return false;
            }

            function checkTopSideCollision() {
                return (obj1.settings.posY >= obj2.settings.posY && obj1.settings.posY <= obj2.settings.posY + obj2.settings.height);
            }
        }
    };

    util.getRandomNumber = function getRandNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    util.getRandomColor = function() {
        let letters = '0123456789ABCDEF'.split('');
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.round(Math.random() * 15)];
        }

        return color;
    };
    //endregion

    return {
        draw: draw,
        update: update,
        util: util,
        factory: factory,
        controls: controls
    };
}());
