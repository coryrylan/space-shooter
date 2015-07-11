import {ENGINE} from './engine';

class Asteroid {
    constructor() {
        let range = ENGINE.util.getRandomNumber(30, 100);

        this.settings = {
            width: range,
            height: range,
            speed: ENGINE.util.getRandomNumber(2, 6)
        };

        this.settings.posX = ENGINE.util.getRandomNumber(0 - this.settings.height, ENGINE.settings.canvasWidth);
        this.settings.posY = this.settings.height * -2;

        this.img = new Image();
        this.img.src = 'app/Content/Images/asteroid-' + ENGINE.util.getRandomNumber(1, 4) + '.png';
    }

    draw(context) {
        context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
    }

    update() {
        this.settings.posY += this.settings.speed;
    }
}

export {Asteroid};