import {Utilities} from './engine/utilities';
import {ViewPort, GameObject} from './engine/interfaces';

class Asteroid implements GameObject {
    img: HTMLImageElement;
    settings: any;
    private _options: {
        viewPort: ViewPort
    };
    
    constructor(options) {
        const range = Utilities.getRandomNumber(30, 100);

        this._options = options;
        this.settings = {
            width: range,
            height: range,
            speed: Utilities.getRandomNumber(2, 6)
        };

        this.settings.posX = Utilities.getRandomNumber(0 - this.settings.height, this._options.viewPort.width);
        this.settings.posY = this.settings.height * -2;

        this.img = new Image();
        this.img.src = 'assets/images/asteroid-' + Utilities.getRandomNumber(1, 4) + '.png';
    }

    draw(context) {
        context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
    }

    update() {
        this.settings.posY += this.settings.speed;
    }
}

export {Asteroid};