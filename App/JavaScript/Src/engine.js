window.ENGINE = (function() {   // Temp until we get a module system in place (RequireJS or aAngularDI)
    'use strict';

    var keyState = {};
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

    // #region Object Factory
    var factory = {};
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
    // #endregion

    // #region Controls
    var controls = {};
    var eventActions = {};
    var keyAction = {
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

    function gameIOUpdate() {
        // (Left Arrow)
        if (keyState[37] || keyState[65]) {
            eventActions.left();
        }

        // (Right Arrow)
        if (keyState[39] || keyState[68]) {
            eventActions.right();
        }

        // (Up Arrow)
        if (keyState[38] || keyState[87]) {
            eventActions.up();
        }

        // (Down Arrow)
        if (keyState[40] || keyState[83]) {
            eventActions.down();
        }
    }
    // #endregion

    // #region Util
    var util = {};
    util.checkCollision = function(object1, object2) {
        if (checkHorizontalCollision() && checkVerticalPosition()) {
            return true;
        } else {
            return false;
        }

        function checkHorizontalCollision() {
            var object1RightSide = object1.settings.posX + object1.settings.width;
            var object1LeftSide = object1.settings.posX;
            var object2RightSide = object2.settings.posX + object2.settings.width;
            var object2LeftSide = object2.settings.posX;

            if (leftSideCollision() || rightSideCollision()) {
                return true;
            } else {
                return false;
            }

            function leftSideCollision() {
                if ((object1LeftSide >= object2LeftSide && object1LeftSide <= object2RightSide)) {
                    return true;
                } else {
                    return false;
                }
            }

            function rightSideCollision() {
                if (object1RightSide >= object2LeftSide && object1RightSide <= object2RightSide) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        function checkVerticalPosition() {
            if (object1.settings.posY >= object2.settings.posY && object1.settings.posY <= object2.settings.posY + object2.settings.height) {
                return true;
            } else {
                return false;
            }
        }
    };
    // #endregion

    return {
        draw: draw,
        update: update,
        util: util,
        factory: factory,
        controls: controls
    };
}());
