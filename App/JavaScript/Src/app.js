import {ENGINE} from './engine';
import {Ship} from './ship';
import {LaserCollection} from './laserCollection';
import {AsteroidCollection} from './asteroidCollection';

(function() {
    'use strict';

    // Enums
    const GAME_STATE = {
        START: 'START',
        PLAY: 'PLAY',
        PAUSE: 'PAUSE',
        OVER: 'OVER'
    };

    // Game Globals
    let gameScore = 0;
    let gameLives = 3;
    let canvas = document.getElementById('GameCanvas');
    let ctx = canvas.getContext('2d');
    let gameState = GAME_STATE.START;

    //region Game
    let playerShip = new Ship({
        lasers: new LaserCollection()
    });

    let asteroids = new AsteroidCollection();

    let checkShipAndAsteroidCollision = function() {
        asteroids.list.forEach(_checkShipCollision);

        function _checkShipCollision(asteroid, index) {
            if (ENGINE.util.checkCollision(playerShip, asteroid)) {
                asteroids.list.splice(index, 1);
                removeLife();
            }
        }
    };

    let checkShipLaserAndAsteroidCollision = function() {
        let checkLaserCollision = function(laser, laserIndex) {
            // For every asteroid
            for (let i = 0; i < asteroids.list.length; i++) {
                if (ENGINE.util.checkCollision(laser, asteroids.list[i])) {
                    playerShip.lasers.list.splice(laserIndex, 1);
                    asteroids.list.splice(i, 1);
                    addScore();
                    return 0;
                }
            }
        };

        playerShip.lasers.list.forEach(checkLaserCollision);
    };

    let init = function() {
        scaleScreen();
        touchSetup();
    };

    let game = ENGINE.factory.createGame({
        init: function() {
            init();
        },
        update: function() {
            if (gameState === GAME_STATE.START) {
                return;
            } else if (gameState === GAME_STATE.PLAY) {
                asteroids.update();
                playerShip.update();
                checkShipAndAsteroidCollision();
                checkShipLaserAndAsteroidCollision();
            } else if (gameState === GAME_STATE.PAUSE) {
                return;
            } else if (gameState === GAME_STATE.OVER) {
                return;
            }
        },
        draw: function() {
            ctx.clearRect(0, 0, ENGINE.settings.canvasWidth, ENGINE.settings.canvasHeight);
            drawScore();
            drawLives();

            if (gameState === GAME_STATE.START) {
                drawStartScreen();
            } else if (gameState === GAME_STATE.PLAY) {
                playerShip.draw(ctx);
                asteroids.draw(ctx);
            } else if (gameState === GAME_STATE.PAUSE) {
                console.log('Paused');
            } else if (gameState === GAME_STATE.OVER) {
                endGame();
            } else {
                drawStartScreen();
            }
        }
    });

    game.start();

    setInterval(function() {
        if (gameState === GAME_STATE.PLAY) {
            asteroids.addAsteroid();
        }
    }, 140 - (ENGINE.settings.canvasWidth / 100));
    //endregion

    //region Touch Game Controls
    function touchSetup() {
        let touchable = 'createTouch' in document;

        if (touchable) {
            canvas.addEventListener('touchstart', onTouchStart, false );
            canvas.addEventListener('touchmove', onTouchMove, false );
            canvas.addEventListener('touchend', onTouchEnd, false );
        }
    }

    function onTouchStart(event) {
        console.log('touchstart');

        if (gameState === GAME_STATE.START || gameState === GAME_STATE.OVER) {
            startNewGame();
        } else {
            if (event.touches[0].clientX > ENGINE.settings.canvasWidth / 2) {
                playerShip.fire();
            }
        }
    }

    function onTouchMove(event) {
        // Prevent the browser from doing its default thing (scroll, zoom)
        event.preventDefault();
        console.log('touchmove');
    }

    function onTouchEnd() {
        //do stuff
        console.log('touchend');
    }
    //endregion

    //region Key Game Controls
    ENGINE.controls.on('left', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveLeft();
        }
    });

    ENGINE.controls.on('right', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveRight();
        }
    });

    ENGINE.controls.on('up', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveUp();
        }
    });

    ENGINE.controls.on('down', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveDown();
        }
    });

    ENGINE.controls.onkey('space', function() {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.fire();
        }
    });

    ENGINE.controls.onkey('pause', function() {
        pauseGame();
    });

    ENGINE.controls.onkey('enter', function() {
        if (gameState === GAME_STATE.START || gameState === GAME_STATE.OVER) {
            startNewGame();
        }
    });
    //endregion

    //region Helper Functions
    function drawStartScreen() {
        $('.js-start-screen').show();
    }

    function hideStartScreen() {
        $('.js-start-screen').hide();
    }

    function startNewGame() {
        gameLives = 3;
        gameState = GAME_STATE.PLAY;
        gameScore = 0;
        hideStartScreen();
        $('.js-game-over-screen').hide();
    }

    function pauseGame() {
        drawPauseScreen();

        if (gameState === GAME_STATE.PLAY) {
            gameState = GAME_STATE.PAUSE;
        } else {
            gameState = GAME_STATE.PLAY;
        }
    }

    function drawPauseScreen() {
        $('.js-pause-screen').toggle();
    }

    function endGame() {
        $('.js-game-over-screen').show();
    }

    function addScore() {
        gameScore += 1;
    }

    function drawScore() {
        $('.js-score').html('Score:' + gameScore);
    }

    function removeLife() {
        if (gameLives > 0) {
            gameLives -= 1;
        } else {
            gameState = GAME_STATE.OVER;
        }
    }

    function drawLives() {
        $('.js-lives').html('Lives:' + gameLives);
    }

    function scaleScreen() {
        if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 720) {
            ENGINE.settings.canvasWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            ENGINE.settings.canvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            ctx.canvas.width  = ENGINE.settings.canvasWidth;
            ctx.canvas.height = ENGINE.settings.canvasHeight;

            $('.notifications').removeClass('large-screen');
            //$('#GameCanvas').width(ENGINE.settings.canvasWidth);
            //$('#GameCanvas').height(ENGINE.settings.canvasHeight);
        }
    }
    //endregion
}());
