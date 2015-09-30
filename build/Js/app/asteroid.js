System.register(['./engine/utilities'], function(exports_1) {
    var utilities_1;
    var Asteroid;
    return {
        setters:[
            function (_utilities_1) {
                utilities_1 = _utilities_1;
            }],
        execute: function() {
            Asteroid = (function () {
                function Asteroid(options) {
                    var range = utilities_1.Utilities.getRandomNumber(30, 100);
                    this._options = options;
                    this.settings = {
                        width: range,
                        height: range,
                        speed: utilities_1.Utilities.getRandomNumber(2, 6)
                    };
                    this.settings.posX = utilities_1.Utilities.getRandomNumber(0 - this.settings.height, this._options.viewPort.width);
                    this.settings.posY = this.settings.height * -2;
                    this.img = new Image();
                    this.img.src = 'assets/images/asteroid-' + utilities_1.Utilities.getRandomNumber(1, 4) + '.png';
                }
                Asteroid.prototype.draw = function (context) {
                    context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
                };
                Asteroid.prototype.update = function () {
                    this.settings.posY += this.settings.speed;
                };
                return Asteroid;
            })();
            exports_1("Asteroid", Asteroid);
        }
    }
});
