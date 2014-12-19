window.ENGINE = (function() {
    'use strict';

    function draw() {

    }

    function update(instanceUpdate) {
        gameIO();
        gameStateUpdate();
        instanceUpdate();
    }

    function checkCollision(object1, object2) {
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
    }

    function gameIO() {

    }

    function gameStateUpdate() {

    }

    return {
        draw: draw,
        update: update,
        util: {
            checkCollision: checkCollision
        }
    };
}());
