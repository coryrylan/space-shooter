System.register(['app/asteroid'], function(exports_1) {
    var asteroid_1;
    var AsteroidCollection;
    return {
        setters:[
            function (_asteroid_1) {
                asteroid_1 = _asteroid_1;
            }],
        execute: function() {
            AsteroidCollection = (function () {
                function AsteroidCollection(options) {
                    this.list = [];
                    this._options = options;
                }
                AsteroidCollection.prototype.update = function () {
                    var _this = this;
                    this.list.forEach(function (asteroid, index) {
                        if (asteroid.settings.posY > _this._options.viewPort.height + 30) {
                            _this.list.splice(index, 1);
                        }
                    });
                    this.list.forEach(function (asteroid) { return asteroid.update(); });
                };
                AsteroidCollection.prototype.draw = function (context) {
                    this.list.forEach(function (asteroid) { return asteroid.draw(context); });
                };
                AsteroidCollection.prototype.addAsteroid = function () {
                    this.list.push(new asteroid_1.Asteroid({ viewPort: this._options.viewPort }));
                };
                return AsteroidCollection;
            })();
            exports_1("AsteroidCollection", AsteroidCollection);
        }
    }
});
