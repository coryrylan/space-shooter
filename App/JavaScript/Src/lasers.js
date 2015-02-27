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
            context.fillStyle = ENGINE.util.getRandomColor();
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

(function() {
    'use strict';

    module.exports = class LaserCollection {
        constructor() {
            this.maxLasers = 10;
            this.list = [];
        }

        update() {
            let updateLaser = function(laser, index) {
                this.list[index].update();
            }.bind(this);

            let checkLaserBounds = function(laser, index) {
                if (this.list[index].settings.posY < -5) {
                    this.list.shift(); // If laser outside of top bounds remove from array
                }
            }.bind(this);

            this.list.forEach(checkLaserBounds);
            this.list.forEach(updateLaser);
        }

        draw(context) {
            let draw = function(laser) {
                laser.draw(context);
            };

            this.list.forEach(draw);
        }

        fire(posX, posY) {
            if (this.list.length < this.maxLasers) {
                let laser = new Laser(posX, posY);
                laser.playSound();
                this.list.push(laser);
            }
        }
    }
}());