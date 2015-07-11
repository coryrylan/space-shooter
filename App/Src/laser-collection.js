import {Laser} from './laser';

class LaserCollection {
    constructor() {
        this.maxLasers = 10;
        this.list = [];
    }

    update() {
        let checkLaserBounds = function(laser, index) {
            if (this.list[index].settings.posY < -5) {
                this.list.shift(); // If laser outside of top bounds remove from array
            }
        }.bind(this);

        this.list.forEach(checkLaserBounds);
        this.list.forEach(laser => laser.update());
    }

    draw(context) {
        this.list.forEach(laser => laser.draw(context));
    }

    fire(posX, posY) {
        if (this.list.length < this.maxLasers) {
            let laser = new Laser(posX, posY);
            laser.playSound();
            this.list.push(laser);
        }
    }
}

export {LaserCollection};