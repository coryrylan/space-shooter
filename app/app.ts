import {Engine} from 'app/engine/engine';
import {CollisionDetection} from 'app/engine/collision-detection';
import {Ship} from 'app/ship';
import {LaserCollection} from 'app/laser-collection';
import {AsteroidCollection} from 'app/asteroid-collection';

declare let $; // jQuery global, need d.ts file

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

    function checkShipAndAsteroidCollision() {
        asteroids.list.forEach((asteroid, index) => {
            if (CollisionDetection.check(playerShip, asteroid)) {
                asteroids.list.splice(index, 1);
                removeLife();
            }
        });
    };

    function checkShipLaserAndAsteroidCollision() {
        playerShip.lasers.list.forEach((laser, laserIndex) => {
            asteroids.list.forEach((asteroid, asteroidIndex) => {
                if (CollisionDetection.check(laser, asteroid)) {
                    playerShip.lasers.list.splice(laserIndex, 1);
                    asteroids.list.splice(asteroidIndex, 1);
                    addScore();
                    return 0;
                }
            });
        });
    };

    let game = Engine.factory.createGame({
        init: function() {

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
            ctx.clearRect(0, 0, Engine.settings.canvasWidth, Engine.settings.canvasHeight);
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

    setInterval(() => {
        if (gameState === GAME_STATE.PLAY) {
            asteroids.addAsteroid();
        }
    }, 140 - (Engine.settings.canvasWidth / 100));
    //endregion

    //region Key Game Controls
    Engine.controls.on('left', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveLeft();
        }
    });

    Engine.controls.on('right', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveRight();
        }
    });

    Engine.controls.on('up', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveUp();
        }
    });

    Engine.controls.on('down', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveDown();
        }
    });

    Engine.controls.onkey('space', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.fire();
        }
    });

    Engine.controls.onkey('pause', () => {
        pauseGame();
    });

    Engine.controls.onkey('enter', () => {
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
    //endregion
}());
