window.Asteroid = (function() {
    'use strict';

    const CANVAS_WIDTH = 720;
    const CANVAS_HEIGHT = 480;

    class Asteroid {
        constructor() {
            let range = ENGINE.util.getRandomNumber(30, 100);

            this.settings = {
                width: range,
                height: range,
                speed: ENGINE.util.getRandomNumber(2, 6)
            };

            this.settings.posX = ENGINE.util.getRandomNumber(0 - this.settings.height, CANVAS_WIDTH);
            this.settings.posY = this.settings.height * -2;

            this.img = new Image();
            this.img.src = 'App/Content/Images/asteroid-' + ENGINE.util.getRandomNumber(1, 4) + '.png';
        }

        draw(context) {
            context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);

            //this.img.onload = function() {
            //    ctx.drawImage(this.img, this.settings.posX, this.settings.posY);
            //}.bind(this);
        }

        update() {
            this.settings.posY += this.settings.speed;
        }
    }

    return Asteroid;
}());

window.AsteroidCollection = (function() {
    'use strict';

    const CANVAS_WIDTH = 720;
    const CANVAS_HEIGHT = 480;

    class AsteroidCollection {
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
    }

    return AsteroidCollection;
}());