import {Ship} from '../App/Src/ship.js';
import {LaserCollectionMock} from './Mocks/laserCollectionMock.js';

var ShipSpec = (function() {   // Temp until we get a module system in place (Convert to a ES6 module)
    'use strict';

    function run() {
        describe('Ship Specs', function() {
            let testShip = new Ship({
                lasers: new LaserCollectionMock()
            });

            it('Ship Class exists', function() {
                expect(Ship).toBeDefined();
            });

            it('Can create new instance testShip from Ship class', function() {
                expect(testShip).toBeDefined();
            });

            it('testShip contains a draw method', function() {
                expect(testShip.draw2).toBeDefined();
            });
        });
    }

    return {
        run: run
    };
}());

export {ShipSpec};