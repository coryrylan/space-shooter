import {GameObject} from './engine/interfaces';
declare let Howl;

export class Laser implements GameObject {
    settings: any;
    sound: any;
    
    constructor (originX, originY) {
        this.settings = {
            posX: originX,
            posY: originY,
            width: 4.5,
            height: 25
        };

        this.sound = new Howl({
            urls: ['assets/audio/laser.mp3']
        });
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = '#00ff00';
        context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
        context.fill();
        context.closePath();
    }

    update() {
        this.settings.posY -= 5.05;
    }

    playSound() {
        this.sound.play();
    }
}
