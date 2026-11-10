import assert from 'node:assert/strict';
import { qualifies, insert } from '../js/leaderboard.js';

const entries = Array.from({ length: 10 }, (_, index) => ({ name: `P${index}`, score: 20 - index, date: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z` }));
assert.equal(qualifies([], 1), true);
assert.equal(qualifies([], 0), false);
assert.equal(qualifies(entries, 0), false);
assert.equal(qualifies(entries, 10), false);
assert.equal(qualifies(entries, 11), false, "tying the 10th place keeps the earlier entry");
assert.equal(qualifies(entries, 12), true);
assert.equal(qualifies(entries, 20), true);

const result = insert(entries, { name: 'New', score: 20, date: '2025-12-31T00:00:00.000Z' });
assert.equal(result.list.length, 10);
assert.equal(result.list[0].name, 'New', 'score ties sort by earlier date');
assert.equal(result.index, 0);
const low = insert(entries, { name: 'Low', score: 1, date: '2027-01-01T00:00:00.000Z' });
assert.equal(low.index, -1, 'entries beyond the top ten are omitted');
console.log('leaderboard tests passed');
