import ENGINE from './engine';
import Asteroid from './asteroid';

(function() {
    'use strict';

    module.exports = class AsteroidCollection {
        constructor() {
            this.list = [];
        }

        update() {
            let checkAsteroidBounds = function(asteroid, index) {
                if (asteroid.settings.posY > ENGINE.settings.canvasHeight + 30) {
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

        addAsteroid() {
            this.list.push(new Asteroid());
        }
    };
}());