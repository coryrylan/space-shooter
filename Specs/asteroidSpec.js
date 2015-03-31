import {Asteroid} from '../App/Src/asteroid.js';
import {CanvasMock} from './Mocks/CanvasMock.js';

let asteroidSpec = (function() {
    'use strict';

    function run() {
        let testAsteroid = new Asteroid();

        describe('Asteroid Specs', function() {
            it('Asteroid contains a draw method', function() {
                expect(testAsteroid.draw).toBeDefined();
            });

            it('Asteroid contains a update method', function() {
                expect(testAsteroid.update).toBeDefined();
            });
        });
    }

    return {
        run: run
    };
}());

export {asteroidSpec};