import ENGINE from './engine';

(function() {
    'use strict';

    module.exports = class Ship {
        constructor(properties) {
            this.lasers = properties.lasers;

            this.settings = {
                color: 'rgba(0, 0, 0, 1)',
                posX: 25,
                posY: 350,
                height: 25,
                width: 25,
                speed: 4
            };

            this.img = new Image();
            this.img.src = 'App/Content/Images/spaceship.png';
        }

        draw(context) {
            context.drawImage(this.img, this.settings.posX, this.settings.posY);
            this.lasers.draw(context);
        }

        update() {
            this.lasers.update();
        }

        fire() {
            this.lasers.fire(this.settings.posX + 23, this.settings.posY - 5);
        }

        moveLeft() {
            if (this.settings.posX > 0) {
                this.settings.posX = this.settings.posX - this.settings.speed;
            }
        }

        moveRight() {
            if (this.settings.posX + this.settings.width < ENGINE.settings.canvasWidth + 70) {
                this.settings.posX = this.settings.posX + this.settings.speed;
            }
        }

        moveUp() {
            if (this.settings.posY > 0) {
                this.settings.posY = this.settings.posY - this.settings.speed;
            }
        }

        moveDown() {
            if (this.settings.posY < ENGINE.settings.canvasHeight - 40) {
                this.settings.posY = this.settings.posY + this.settings.speed;
            }
        }
    };
}());