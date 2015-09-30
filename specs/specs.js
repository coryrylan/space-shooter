// Import all tests
import {engineSpec} from './engineSpec.js';
import {shipSpec} from './shipSpec.js';
import {asteroidSpec} from './asteroidSpec.js';

(function() {
    'use strict';

    engineSpec.run();
    shipSpec.run();
    asteroidSpec.run();
}());
