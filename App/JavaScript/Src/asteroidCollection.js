import ENGINE from './engine';

(function() {
    'use strict';

    const CANVAS_WIDTH = 720;
    const CANVAS_HEIGHT = 480;

    module.exports = class AsteroidCollection {
        constructor() {
            this.list = [];
        }

        update() {
            let checkAsteroidBounds = function(asteroid, index) {
                if (asteroid.settings.posY > CANVAS_HEIGHT + 30) {
                    this.list.splice(index, 1);
                }
            }.bind(this);

            let update = function(asteroid) {
                asteroid.update();
            };

            this.list.forEach(checkAsteroidBounds);
            this.list.forEach(update);
        }

        draw(context) {
            let draw = function(asteroid) {
                asteroid.draw(context);
            };

            this.list.forEach(draw);
        }
    };
}());