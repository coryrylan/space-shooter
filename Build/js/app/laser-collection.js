var laser_1 = require('./laser');
var LaserCollection = (function () {
    function LaserCollection() {
        this.maxLasers = 10;
        this.list = [];
    }
    LaserCollection.prototype.update = function () {
        var _this = this;
        this.list.forEach(function (laser, index) {
            if (_this._isLaserOutOfTopBounds(index)) {
                _this.list.shift();
            }
        });
        this.list.forEach(function (laser) { return laser.update(); });
    };
    LaserCollection.prototype.draw = function (context) {
        this.list.forEach(function (laser) { return laser.draw(context); });
    };
    LaserCollection.prototype.fire = function (posX, posY) {
        if (this.list.length < this.maxLasers) {
            var laser = new laser_1.Laser(posX, posY);
            this.list.push(laser);
            laser.playSound();
        }
    };
    LaserCollection.prototype._isLaserOutOfTopBounds = function (index) {
        return this.list[index].settings.posY < -5;
    };
    return LaserCollection;
})();
exports.LaserCollection = LaserCollection;
