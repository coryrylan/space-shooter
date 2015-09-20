import {CollisionDetection} from 'app/engine/collision-detection';

declare let $;

class Game {
    _update: Function;
    _draw: Function;
    _init: Function;
    
    constructor(options) {
        this._update = options.update;
        this._draw = options.draw;
        this._init = options.init;
    }

    update() {
        this._update();
    }

    draw() {
        this._draw();
    }

    start() {
        this._init();
        let gameLoop = () => {
            this._update();
            this._draw();
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}

class Controls {
    eventActions: any;
    keyAction: any;
    keyState: any;
    
    constructor() {
        this.eventActions = {
            left: null,
            right: null,
            up: null,
            down: null
        };
        
        this.keyAction = {
            space: null,
            pause: null,
            enter: null
        };
        
        this.keyState = {};
        
        this._init();
        
        let controlsLoop = () => {
            this._loop();
            requestAnimationFrame(controlsLoop);
        };

        requestAnimationFrame(controlsLoop);
    }
    
    private _init() {
        window.addEventListener('keydown', e => {
            this.keyState[e.keyCode || e.which] = true;
        }, true);

        window.addEventListener('keyup', e => {
            this.keyState[e.keyCode || e.which] = false;
        }, true);

        $(document).keydown(e => {
            // Enter key
            if (e.keyCode === 13) {
                this.keyAction.enter();
            }

            // (p) Pause
            if (e.keyCode === 80) {
                this.keyAction.pause();
            }

            // Space bar
            if (e.keyCode === 32) {
                this.keyAction.space();
            }
        });
    }
    
    on(event: string, func: Function) {
        switch (event) {
            case 'left':
                this.eventActions.left = func;
                break;
            case 'right':
                this.eventActions.right = func;
                break;
            case 'up':
                this.eventActions.up = func;
                break;
            case 'down':
                this.eventActions.down = func;
                break;
            case 'space':
                this.eventActions.down = func;
                break;
            case 'pause':
                this.eventActions.down = func;
                break;
            default:
                console.log('unknown control event fired');
        }
    }
    
    onKey(event: string, func: Function) {
        switch (event) {
            case 'space':
                this.keyAction.space = func;
                break;
            case 'pause':
                this.keyAction.pause = func;
                break;
            case 'enter':
                this.keyAction.enter = func;
                break;
            default:
                console.log('unknown control event fired');
        }
    }
    
    private _loop() {
        // (Up Arrow)
        if (this.keyState[38] || this.keyState[87]) {
            this.eventActions.up();
        }

        // (Left Arrow)
        if (this.keyState[37] || this.keyState[65]) {
            this.eventActions.left();
        }

        // (Right Arrow)
        if (this.keyState[39] || this.keyState[68]) {
            this.eventActions.right();
        }

        // (Down Arrow)
        if (this.keyState[40] || this.keyState[83]) {
            this.eventActions.down();
        }
    }
}

export {Game, Controls, CollisionDetection};