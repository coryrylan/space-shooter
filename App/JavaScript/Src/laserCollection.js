import {Laser} from './laser';

class LaserCollection {
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

export {LaserCollection};