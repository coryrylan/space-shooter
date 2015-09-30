import {Laser} from 'app/laser';

class LaserCollection {
    maxLasers: number;
    list: Array<Laser>;
    
    constructor() {
        this.maxLasers = 10;
        this.list = [];
    }

    update() {
        this.list.forEach((laser, index) => {
            if (this._isLaserOutOfTopBounds(index)) {
                this.list.shift();
            }
        });

        this.list.forEach(laser => laser.update());
    }

    draw(context) {
        this.list.forEach(laser => laser.draw(context));
    }

    fire(posX: number, posY: number) {
        if (this.list.length < this.maxLasers) {
            let laser = new Laser(posX, posY);
            this.list.push(laser);
            laser.playSound();
        }
    }

    _isLaserOutOfTopBounds(index: number) {
        return this.list[index].settings.posY < -5;
    }
}

export {LaserCollection};