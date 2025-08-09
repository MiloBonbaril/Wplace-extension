const assert = require('assert');
const { applyTransform, mapToScreen } = require('../wplace-overlay/transform.js');

function mockCtx() {
  let args = null;
  return {
    setTransform: (...a) => {
      args = a;
    },
    getArgs: () => args
  };
}

const ctx = mockCtx();
const state = { scale: 2, rotation: Math.PI / 2, x: 10, y: -5 };
applyTransform(ctx, state);
const args = ctx.getArgs();
assert(args, 'setTransform should be called');
assert(Math.abs(args[0] - 0) < 1e-10, 'a component');
assert(Math.abs(args[1] - 2) < 1e-10, 'b component');
assert(Math.abs(args[2] + 2) < 1e-10, 'c component');
assert(Math.abs(args[3] - 0) < 1e-10, 'd component');
assert.strictEqual(args[4], 10, 'e component');
assert.strictEqual(args[5], -5, 'f component');

const pos = mapToScreen(10, 5, 2, -3, 4);
assert.strictEqual(pos.x, 17, 'x position');
assert.strictEqual(pos.y, 14, 'y position');

const posSnap = mapToScreen(1.2, 2.6, 3, 0.4, 0.4);
assert.strictEqual(posSnap.x, Math.round(1.2 * 3 + 0.4), 'rounded x position');
assert.strictEqual(posSnap.y, Math.round(2.6 * 3 + 0.4), 'rounded y position');

console.log('transform.test.js passed');
