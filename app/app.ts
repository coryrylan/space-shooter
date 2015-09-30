import {Game, Controls, CollisionDetection} from 'app/engine/engine';
import {AsteroidCollection} from 'app/asteroid-collection';
import {LaserCollection} from 'app/laser-collection';
import {Ship} from 'app/ship';

declare let $; // jQuery global, need d.ts file

(function main() {
    'use strict';

    // Game Globals
    const GAME_STATE = { START: 'START', PLAY: 'PLAY', PAUSE: 'PAUSE', OVER: 'OVER' };
    let canvasContext = document.getElementById('GameCanvas').getContext('2d');
    let gameState = GAME_STATE.START;
    let gameScore = 0;
    let gameLives = 3;
    let viewPort = {
        width: 720,
        height: 480
    };

    //region Game
    let playerShip = new Ship({viewPort, lasers: new LaserCollection()});
    let asteroids = new AsteroidCollection({viewPort: viewPort});
    let controls = new Controls();
    let game = new Game({init, update, draw});
    game.start();
    
    function init() {
        window.setInterval(() => {
            if (gameState === GAME_STATE.PLAY) {
                asteroids.addAsteroid();
            }
        }, 140 - (viewPort.width / 100));
    }
    
    function update() {
        if (gameState === GAME_STATE.PLAY) {
            asteroids.update();
            playerShip.update();
            checkShipAndAsteroidCollision();
            checkShipLaserAndAsteroidCollision();
        } else {
            return;
        }
    }
    
    function draw() {
        canvasContext.clearRect(0, 0, viewPort.width, viewPort.height);
        drawScore();
        drawLives();

        if (gameState === GAME_STATE.START) {
            drawStartScreen();
        } else if (gameState === GAME_STATE.PLAY) {
            playerShip.draw(canvasContext);
            asteroids.draw(canvasContext);
        } else if (gameState === GAME_STATE.PAUSE) {
            console.log('Paused');
        } else if (gameState === GAME_STATE.OVER) {
            endGame();
        } else {
            drawStartScreen();
        }
    }
    
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
                }
            });
        });
    };
    //endregion

    //region Key Game Controls
    controls.on('left', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveLeft();
        }
    });

    controls.on('right', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveRight();
        }
    });

    controls.on('up', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveUp();
        }
    });

    controls.on('down', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.moveDown();
        }
    });

    controls.onKey('space', () => {
        if (gameState === GAME_STATE.PLAY) {
            playerShip.fire();
        }
    });

    controls.onKey('pause', () => {
        pauseGame();
    });

    controls.onKey('enter', () => {
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
