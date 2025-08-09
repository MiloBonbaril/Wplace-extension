(function (global) {
  function applyTransform(ctx, state) {
    const { scale = 1, rotation = 0, x = 0, y = 0 } = state || {};
    const cos = Math.cos(rotation) * scale;
    const sin = Math.sin(rotation) * scale;
    ctx.setTransform(cos, sin, -sin, cos, x, y);
  }

  function mapToScreen(mapX, mapY, zoom, cameraX, cameraY) {
    return {
      x: Math.round(mapX * zoom + cameraX),
      y: Math.round(mapY * zoom + cameraY)
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyTransform, mapToScreen };
  } else {
    global.applyTransform = applyTransform;
    global.mapToScreen = mapToScreen;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
