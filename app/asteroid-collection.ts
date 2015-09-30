import {Asteroid} from 'app/asteroid';
import {ViewPort}  from 'app/engine/interfaces';

class AsteroidCollection {
    list: Array<Asteroid>;
    private _options: {
        viewPort: ViewPort;
    }
    
    constructor(options) {
        this.list = [];
        this._options = options;
    }

    update() {
        this.list.forEach((asteroid, index) => {
            if (asteroid.settings.posY > this._options.viewPort.height + 30) {
                this.list.splice(index, 1);
            }
        });
        
        this.list.forEach(asteroid => asteroid.update());
    }

    draw(context) {
        this.list.forEach(asteroid => asteroid.draw(context));
    }

    addAsteroid() {
        this.list.push(new Asteroid({ viewPort: this._options.viewPort }));
    }
}

export {AsteroidCollection};