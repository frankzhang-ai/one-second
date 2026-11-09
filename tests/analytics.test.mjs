import assert from 'node:assert/strict';
import { scoreBand } from '../js/analytics.js';

assert.equal(scoreBand(0), '0-4');
assert.equal(scoreBand(4), '0-4');
assert.equal(scoreBand(5), '5-9');
assert.equal(scoreBand(9), '5-9');
assert.equal(scoreBand(10), '10-19');
assert.equal(scoreBand(19), '10-19');
assert.equal(scoreBand(20), '20+');
console.log('analytics tests passed');
