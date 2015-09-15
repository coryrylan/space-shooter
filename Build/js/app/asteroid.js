var utilities_1 = require('./engine/utilities');
var engine_1 = require('./engine/engine');
var Asteroid = (function () {
    function Asteroid() {
        var range = utilities_1.Utilities.getRandomNumber(30, 100);
        this.settings = {
            width: range,
            height: range,
            speed: utilities_1.Utilities.getRandomNumber(2, 6)
        };
        this.settings.posX = utilities_1.Utilities.getRandomNumber(0 - this.settings.height, engine_1.Engine.settings.canvasWidth);
        this.settings.posY = this.settings.height * -2;
        this.img = new Image();
        this.img.src = 'app/content/images/asteroid-' + utilities_1.Utilities.getRandomNumber(1, 4) + '.png';
    }
    Asteroid.prototype.draw = function (context) {
        context.drawImage(this.img, this.settings.posX, this.settings.posY, this.settings.width, this.settings.height);
    };
    Asteroid.prototype.update = function () {
        this.settings.posY += this.settings.speed;
    };
    return Asteroid;
})();
exports.Asteroid = Asteroid;
