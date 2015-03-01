import {ENGINE} from '../App/JavaScript/Src/engine.js';

var EngineSpec = (function() {   // Temp until we get a module system in place (Convert to a ES6 module)
    'use strict';

    describe('ENGINE Specs', function() {
        it('Engine contains a util module', function() {
            expect(ENGINE.util).toBeDefined();
        });

        it('Engine contains a factory module', function() {
            expect(ENGINE.factory).toBeDefined();
        });

        it('Engine contains a controls module', function() {
            expect(ENGINE.controls).toBeDefined();
        });

        it('Engine contains a settings module', function() {
            expect(ENGINE.settings).toBeDefined();
        });

        it('Engine settings module has default canvasWidth and canvasHeight properties', function() {
            expect(ENGINE.settings.canvasHeight).toBe(480);
            expect(ENGINE.settings.canvasWidth).toBe(720);
        });
    });
}());

export {EngineSpec}