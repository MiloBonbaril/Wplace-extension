const assert = require('assert');
const {
  saveOverlayState,
  loadOverlayState,
  exportOverlayConfig,
  importOverlayConfig
} = require('../wplace-overlay/storage.js');

function createMockChrome() {
  const store = {};
  return {
    storage: {
      local: {
        set: (data, cb) => {
          Object.assign(store, data);
          if (cb) cb();
        },
        get: (key, cb) => {
          if (typeof key === 'string') {
            cb({ [key]: store[key] });
          } else {
            cb(store);
          }
        }
      }
    },
    runtime: {
      lastError: null
    }
  };
}

global.chrome = createMockChrome();

(async () => {
  const state = {
    mapX: 1,
    mapY: 2,
    scale: 1.5,
    rotation: 0.5,
    opacity: 0.8,
    active: true,
    imageSrc: 'data:image/png;base64,abc'
  };
  await saveOverlayState(state);
  const loaded = await loadOverlayState();
  assert.deepStrictEqual(loaded, state);

  const json = exportOverlayConfig(state);
  const imported = importOverlayConfig(json);
  assert.deepStrictEqual(imported, state);
  console.log('storage.test.js passed');
})();
