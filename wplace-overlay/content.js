// Content script for Wplace Overlay
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Wplace Overlay activated');

    const canvas = document.querySelector('canvas');
    const mapContainer = canvas?.parentElement || document.body;

    const overlay = document.createElement('canvas');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.pointerEvents = 'auto';
    overlay.style.cursor = 'move';

    mapContainer.style.position = 'relative';
    mapContainer.appendChild(overlay);

    const ctx = overlay.getContext('2d');
    let img = null;
    const state = { mapX: 0, mapY: 0, scale: 1, rotation: 0 };
    let zoom = 1;
    let cameraX = 0;
    let cameraY = 0;

    function draw() {
      if (!ctx || !img) return;
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      applyTransform(ctx, { scale: state.scale, rotation: state.rotation });
      ctx.drawImage(img, 0, 0, overlay.width, overlay.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    function updateOverlay() {
      const pos = mapToScreen(state.mapX, state.mapY, zoom, cameraX, cameraY);
      overlay.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`;
      draw();
    }

    function findTransformElement(el) {
      let current = el;
      while (current && current !== document.body) {
        const style = getComputedStyle(current);
        if (style.transform && style.transform !== 'none') {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    }

    const transformElement = findTransformElement(canvas);

    function handleTransformChange() {
      if (!transformElement) return;
      const style = getComputedStyle(transformElement);
      const matrix = new DOMMatrix(style.transform);
      zoom = matrix.a;
      cameraX = matrix.e;
      cameraY = matrix.f;
      updateOverlay();
    }

    if (transformElement) {
      const observer = new MutationObserver(handleTransformChange);
      observer.observe(transformElement, { attributes: true, attributeFilter: ['style'] });
      handleTransformChange();
    }

    // Drag and drop to move image
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    overlay.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      overlay.setPointerCapture(e.pointerId);
    });
    overlay.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      state.mapX += dx / zoom;
      state.mapY += dy / zoom;
      lastX = e.clientX;
      lastY = e.clientY;
      updateOverlay();
    });
    overlay.addEventListener('pointerup', (e) => {
      isDragging = false;
      overlay.releasePointerCapture(e.pointerId);
    });
    overlay.addEventListener('pointerleave', () => {
      isDragging = false;
    });

    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    const scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.min = '0.1';
    scaleSlider.max = '5';
    scaleSlider.step = '0.1';
    scaleSlider.value = '1';

    const rotationSlider = document.createElement('input');
    rotationSlider.type = 'range';
    rotationSlider.min = '-180';
    rotationSlider.max = '180';
    rotationSlider.step = '1';
    rotationSlider.value = '0';

    scaleSlider.addEventListener('input', () => {
      state.scale = parseFloat(scaleSlider.value);
      draw();
    });

    rotationSlider.addEventListener('input', () => {
      state.rotation = (parseFloat(rotationSlider.value) * Math.PI) / 180;
      draw();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '+':
        case '=':
          state.scale = Math.min(state.scale + 0.1, 5);
          scaleSlider.value = state.scale.toFixed(1);
          draw();
          break;
        case '-':
        case '_':
          state.scale = Math.max(state.scale - 0.1, 0.1);
          scaleSlider.value = state.scale.toFixed(1);
          draw();
          break;
        case '[':
          state.rotation -= (5 * Math.PI) / 180;
          rotationSlider.value = (state.rotation * 180) / Math.PI;
          draw();
          break;
        case ']':
          state.rotation += (5 * Math.PI) / 180;
          rotationSlider.value = (state.rotation * 180) / Math.PI;
          draw();
          break;
        default:
          return;
      }
    });

    // Handle image loading
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        img = image;
        overlay.width = canvas?.width || img.width;
        overlay.height = canvas?.height || img.height;
        state.mapX = 0;
        state.mapY = 0;
        state.scale = 1;
        state.rotation = 0;
        scaleSlider.value = '1';
        rotationSlider.value = '0';
        updateOverlay();
        URL.revokeObjectURL(url);
      };

      image.src = url;
    });

    controlPanel.appendChild(fileInput);
    controlPanel.appendChild(scaleSlider);
    controlPanel.appendChild(rotationSlider);
    mapContainer.appendChild(controlPanel);
  });
}
