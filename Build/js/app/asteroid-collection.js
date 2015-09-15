var asteroid_1 = require('./asteroid');
var engine_1 = require('./engine/engine');
var AsteroidCollection = (function () {
    function AsteroidCollection() {
        this.list = [];
    }
    AsteroidCollection.prototype.update = function () {
        var checkAsteroidBounds = function (asteroid, index) {
            if (asteroid.settings.posY > engine_1.Engine.settings.canvasHeight + 30) {
                this.list.splice(index, 1);
            }
        }.bind(this);
        this.list.forEach(checkAsteroidBounds);
        this.list.forEach(function (asteroid) { return asteroid.update(); });
    };
    AsteroidCollection.prototype.draw = function (context) {
        this.list.forEach(function (asteroid) { return asteroid.draw(context); });
    };
    AsteroidCollection.prototype.addAsteroid = function () {
        this.list.push(new asteroid_1.Asteroid());
    };
    return AsteroidCollection;
})();
exports.AsteroidCollection = AsteroidCollection;
