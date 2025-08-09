const assert = require('assert');
const { applyTransform } = require('../wplace-overlay/transform.js');

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

console.log('transform.test.js passed');
