(function (global) {
  function applyTransform(ctx, state) {
    const { scale = 1, rotation = 0, x = 0, y = 0 } = state || {};
    const cos = Math.cos(rotation) * scale;
    const sin = Math.sin(rotation) * scale;
    ctx.setTransform(cos, sin, -sin, cos, x, y);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyTransform };
  } else {
    global.applyTransform = applyTransform;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
