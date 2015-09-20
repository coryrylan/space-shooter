System.register(['app/asteroid', 'app/engine/engine'], function(exports_1) {
    var asteroid_1, engine_1;
    var AsteroidCollection;
    return {
        setters:[
            function (_asteroid_1) {
                asteroid_1 = _asteroid_1;
            },
            function (_engine_1) {
                engine_1 = _engine_1;
            }],
        execute: function() {
            AsteroidCollection = (function () {
                function AsteroidCollection() {
                    this.list = [];
                }
                AsteroidCollection.prototype.update = function () {
                    var _this = this;
                    this.list.forEach(function (asteroid, index) {
                        if (asteroid.settings.posY > engine_1.Engine.settings.canvasHeight + 30) {
                            _this.list.splice(index, 1);
                        }
                    });
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
            exports_1("AsteroidCollection", AsteroidCollection);
        }
    }
});
