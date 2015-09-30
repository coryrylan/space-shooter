System.register([], function(exports_1) {
    var Laser;
    return {
        setters:[],
        execute: function() {
            Laser = (function () {
                function Laser(originX, originY) {
                    this.settings = {
                        posX: originX,
                        posY: originY,
                        width: 4.5,
                        height: 25
                    };
                    this.sound = new Howl({
                        urls: ['assets/audio/laser.mp3']
                    });
                }
                Laser.prototype.draw = function (context) {
                    context.beginPath();
                    context.fillStyle = '#00ff00';
                    context.arc(this.settings.posX, this.settings.posY, this.settings.width, this.settings.height, Math.PI * 2, true);
                    context.fill();
                    context.closePath();
                };
                Laser.prototype.update = function () {
                    this.settings.posY -= 5.05;
                };
                Laser.prototype.playSound = function () {
                    this.sound.play();
                };
                return Laser;
            })();
            exports_1("Laser", Laser);
        }
    }
});
