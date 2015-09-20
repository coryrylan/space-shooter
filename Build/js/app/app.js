System.register(['app/engine/engine', 'app/engine/collision-detection', 'app/ship', 'app/laser-collection', 'app/asteroid-collection'], function(exports_1) {
    var engine_1, collision_detection_1, ship_1, laser_collection_1, asteroid_collection_1;
    return {
        setters:[
            function (_engine_1) {
                engine_1 = _engine_1;
            },
            function (_collision_detection_1) {
                collision_detection_1 = _collision_detection_1;
            },
            function (_ship_1) {
                ship_1 = _ship_1;
            },
            function (_laser_collection_1) {
                laser_collection_1 = _laser_collection_1;
            },
            function (_asteroid_collection_1) {
                asteroid_collection_1 = _asteroid_collection_1;
            }],
        execute: function() {
            (function () {
                'use strict';
                // Enums
                var GAME_STATE = {
                    START: 'START',
                    PLAY: 'PLAY',
                    PAUSE: 'PAUSE',
                    OVER: 'OVER'
                };
                // Game Globals
                var gameScore = 0;
                var gameLives = 3;
                var canvas = document.getElementById('GameCanvas');
                var ctx = canvas.getContext('2d');
                var gameState = GAME_STATE.START;
                //region Game
                var playerShip = new ship_1.Ship({
                    lasers: new laser_collection_1.LaserCollection()
                });
                var asteroids = new asteroid_collection_1.AsteroidCollection();
                var checkShipAndAsteroidCollision = function () {
                    asteroids.list.forEach(function (asteroid, index) {
                        if (collision_detection_1.CollisionDetection.check(playerShip, asteroid)) {
                            asteroids.list.splice(index, 1);
                            removeLife();
                        }
                    });
                };
                var checkShipLaserAndAsteroidCollision = function () {
                    playerShip.lasers.list.forEach(function (laser, laserIndex) {
                        asteroids.list.forEach(function (asteroid, asteroidIndex) {
                            if (collision_detection_1.CollisionDetection.check(laser, asteroid)) {
                                playerShip.lasers.list.splice(laserIndex, 1);
                                asteroids.list.splice(asteroidIndex, 1);
                                addScore();
                                return 0;
                            }
                        });
                    });
                };
                var init = function () {
                    scaleScreen();
                    touchSetup();
                };
                var game = engine_1.Engine.factory.createGame({
                    init: function () {
                        init();
                    },
                    update: function () {
                        if (gameState === GAME_STATE.START) {
                            return;
                        }
                        else if (gameState === GAME_STATE.PLAY) {
                            asteroids.update();
                            playerShip.update();
                            checkShipAndAsteroidCollision();
                            checkShipLaserAndAsteroidCollision();
                        }
                        else if (gameState === GAME_STATE.PAUSE) {
                            return;
                        }
                        else if (gameState === GAME_STATE.OVER) {
                            return;
                        }
                    },
                    draw: function () {
                        ctx.clearRect(0, 0, engine_1.Engine.settings.canvasWidth, engine_1.Engine.settings.canvasHeight);
                        drawScore();
                        drawLives();
                        if (gameState === GAME_STATE.START) {
                            drawStartScreen();
                        }
                        else if (gameState === GAME_STATE.PLAY) {
                            playerShip.draw(ctx);
                            asteroids.draw(ctx);
                        }
                        else if (gameState === GAME_STATE.PAUSE) {
                            console.log('Paused');
                        }
                        else if (gameState === GAME_STATE.OVER) {
                            endGame();
                        }
                        else {
                            drawStartScreen();
                        }
                    }
                });
                game.start();
                setInterval(function () {
                    if (gameState === GAME_STATE.PLAY) {
                        asteroids.addAsteroid();
                    }
                }, 140 - (engine_1.Engine.settings.canvasWidth / 100));
                //endregion
                //region Touch Game Controls
                function touchSetup() {
                    var touchable = 'createTouch' in document;
                    if (touchable) {
                        canvas.addEventListener('touchstart', onTouchStart, false);
                        canvas.addEventListener('touchmove', onTouchMove, false);
                        canvas.addEventListener('touchend', onTouchEnd, false);
                    }
                }
                function onTouchStart(event) {
                    console.log('touchstart');
                    if (gameState === GAME_STATE.START || gameState === GAME_STATE.OVER) {
                        startNewGame();
                    }
                    else {
                        if (event.touches[0].clientX > engine_1.Engine.settings.canvasWidth / 2) {
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
                engine_1.Engine.controls.on('left', function () {
                    if (gameState === GAME_STATE.PLAY) {
                        playerShip.moveLeft();
                    }
                });
                engine_1.Engine.controls.on('right', function () {
                    if (gameState === GAME_STATE.PLAY) {
                        playerShip.moveRight();
                    }
                });
                engine_1.Engine.controls.on('up', function () {
                    if (gameState === GAME_STATE.PLAY) {
                        playerShip.moveUp();
                    }
                });
                engine_1.Engine.controls.on('down', function () {
                    if (gameState === GAME_STATE.PLAY) {
                        playerShip.moveDown();
                    }
                });
                engine_1.Engine.controls.onkey('space', function () {
                    if (gameState === GAME_STATE.PLAY) {
                        playerShip.fire();
                    }
                });
                engine_1.Engine.controls.onkey('pause', function () {
                    pauseGame();
                });
                engine_1.Engine.controls.onkey('enter', function () {
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
                    }
                    else {
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
                    }
                    else {
                        gameState = GAME_STATE.OVER;
                    }
                }
                function drawLives() {
                    $('.js-lives').html('Lives:' + gameLives);
                }
                function scaleScreen() {
                    if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 720) {
                        engine_1.Engine.settings.canvasWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                        engine_1.Engine.settings.canvasHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                        ctx.canvas.width = engine_1.Engine.settings.canvasWidth;
                        ctx.canvas.height = engine_1.Engine.settings.canvasHeight;
                        $('.notifications').removeClass('large-screen');
                        $('#GameCanvas').width(engine_1.Engine.settings.canvasWidth);
                        $('#GameCanvas').height(engine_1.Engine.settings.canvasHeight);
                    }
                }
                //endregion
            }());
        }
    }
});
