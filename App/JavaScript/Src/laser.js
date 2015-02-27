(function() {
    'use strict';


    let Howl = window.Howl;

    module.exports = class Laser {
        constructor (originX, originY) {
            this.settings = {
                posX: originX,
                posY: originY,
                width: 4.5,
                height: 25
            };
        }

        draw(context) {
            context.beginPath();
            context.fillStyle = '#00ff00'; //ENGINE.util.getRandomColor();
            context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
            context.fill();
            context.closePath();
        }

        update() {
            this.settings.posY -= 5.05;
        }

        playSound() {
            let sound = new Howl({
                urls: ['App/Content/Audio/laser.mp3']
            });

            //sound.play();
        }
    }
}());