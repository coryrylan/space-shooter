System.register([], function(exports_1) {
    var Ship;
    return {
        setters:[],
        execute: function() {
            Ship = (function () {
                function Ship(options) {
                    this.lasers = options.lasers;
                    this._options = options;
                    this.settings = {
                        color: 'rgba(0, 0, 0, 1)',
                        posX: 25,
                        posY: 350,
                        height: 25,
                        width: 25,
                        speed: 4
                    };
                    this.img = new Image();
                    this.img.src = 'assets/images/spaceship.png';
                }
                Ship.prototype.draw = function (context) {
                    context.drawImage(this.img, this.settings.posX, this.settings.posY);
                    this.lasers.draw(context);
                };
                Ship.prototype.update = function () {
                    this.lasers.update();
                };
                Ship.prototype.fire = function () {
                    this.lasers.fire(this.settings.posX + 23, this.settings.posY - 5);
                };
                Ship.prototype.moveLeft = function () {
                    if (this.settings.posX > 0) {
                        this.settings.posX = this.settings.posX - this.settings.speed;
                    }
                };
                Ship.prototype.moveRight = function () {
                    if (this.settings.posX + this.settings.width < this._options.viewPort.width + 70) {
                        this.settings.posX = this.settings.posX + this.settings.speed;
                    }
                };
                Ship.prototype.moveUp = function () {
                    if (this.settings.posY > 0) {
                        this.settings.posY = this.settings.posY - this.settings.speed;
                    }
                };
                Ship.prototype.moveDown = function () {
                    if (this.settings.posY < this._options.viewPort.height - 40) {
                        this.settings.posY = this.settings.posY + this.settings.speed;
                    }
                };
                return Ship;
            })();
            exports_1("Ship", Ship);
        }
    }
});
