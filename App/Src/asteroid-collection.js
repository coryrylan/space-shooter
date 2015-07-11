import {ENGINE} from './engine';
import {Asteroid} from './asteroid';

class AsteroidCollection {
    constructor() {
        this.list = [];
    }

    update() {
        let checkAsteroidBounds = function(asteroid, index) {
            if (asteroid.settings.posY > ENGINE.settings.canvasHeight + 30) {
                this.list.splice(index, 1);
            }
        }.bind(this);

        this.list.forEach(checkAsteroidBounds);
        this.list.forEach(asteroid => asteroid.update());
    }

    draw(context) {
        this.list.forEach(asteroid => asteroid.draw(context));
    }

    addAsteroid() {
        this.list.push(new Asteroid());
    }
}

export {AsteroidCollection};