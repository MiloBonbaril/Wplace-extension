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
    overlay.style.imageRendering = 'pixelated';

    mapContainer.style.position = 'relative';
    mapContainer.appendChild(overlay);

    const ctx = overlay.getContext('2d');
    let img = null;
    const state = {
      mapX: 0,
      mapY: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      active: true,
      imageSrc: null
    };
    overlay.style.opacity = state.opacity.toString();
    let zoom = 1;
    let cameraX = 0;
    let cameraY = 0;
    let xInput;
    let yInput;

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
      state.mapX = Math.round(state.mapX + dx / zoom);
      state.mapY = Math.round(state.mapY + dy / zoom);
      lastX = e.clientX;
      lastY = e.clientY;
      if (xInput) xInput.value = state.mapX.toString();
      if (yInput) yInput.value = state.mapY.toString();
      updateOverlay();
    });
    overlay.addEventListener('pointerup', (e) => {
      isDragging = false;
      overlay.releasePointerCapture(e.pointerId);
      saveOverlayState(state);
    });
    overlay.addEventListener('pointerleave', () => {
      isDragging = false;
    });

    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Hide Overlay';
    controlPanel.appendChild(toggleButton);

    const controlsContainer = document.createElement('div');
    controlPanel.appendChild(controlsContainer);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.step = '1';
    xInput.value = '0';

    yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.step = '1';
    yInput.value = '0';

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

    const opacitySlider = document.createElement('input');
    opacitySlider.type = 'range';
    opacitySlider.min = '0';
    opacitySlider.max = '1';
    opacitySlider.step = '0.01';
    opacitySlider.value = '1';

    scaleSlider.addEventListener('input', () => {
      state.scale = parseFloat(scaleSlider.value);
      draw();
      saveOverlayState(state);
    });

    rotationSlider.addEventListener('input', () => {
      state.rotation = (parseFloat(rotationSlider.value) * Math.PI) / 180;
      draw();
      saveOverlayState(state);
    });

    opacitySlider.addEventListener('input', () => {
      state.opacity = parseFloat(opacitySlider.value);
      overlay.style.opacity = state.opacity.toString();
      saveOverlayState(state);
    });

    xInput.addEventListener('input', () => {
      state.mapX = Math.round(parseFloat(xInput.value) || 0);
      xInput.value = state.mapX.toString();
      updateOverlay();
      saveOverlayState(state);
    });

    yInput.addEventListener('input', () => {
      state.mapY = Math.round(parseFloat(yInput.value) || 0);
      yInput.value = state.mapY.toString();
      updateOverlay();
      saveOverlayState(state);
    });

    toggleButton.addEventListener('click', () => {
      state.active = !state.active;
      overlay.style.display = state.active ? 'block' : 'none';
      controlsContainer.style.display = state.active ? 'block' : 'none';
      toggleButton.textContent = state.active ? 'Hide Overlay' : 'Show Overlay';
      saveOverlayState(state);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case '+':
        case '=':
          state.scale = Math.min(state.scale + 0.1, 5);
          scaleSlider.value = state.scale.toFixed(1);
          draw();
          saveOverlayState(state);
          break;
        case '-':
        case '_':
          state.scale = Math.max(state.scale - 0.1, 0.1);
          scaleSlider.value = state.scale.toFixed(1);
          draw();
          saveOverlayState(state);
          break;
        case '[':
          state.rotation -= (5 * Math.PI) / 180;
          rotationSlider.value = (state.rotation * 180) / Math.PI;
          draw();
          saveOverlayState(state);
          break;
        case ']':
          state.rotation += (5 * Math.PI) / 180;
          rotationSlider.value = (state.rotation * 180) / Math.PI;
          draw();
          saveOverlayState(state);
          break;
        default:
          return;
      }
    });

    // Handle image loading
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target.result;
        const image = new Image();

        image.onload = () => {
          img = image;
          overlay.width = canvas?.width || img.width;
          overlay.height = canvas?.height || img.height;
          state.mapX = 0;
          state.mapY = 0;
          state.scale = 1;
          state.rotation = 0;
          state.opacity = 1;
          state.imageSrc = dataURL;
          xInput.value = '0';
          yInput.value = '0';
          scaleSlider.value = '1';
          rotationSlider.value = '0';
          opacitySlider.value = '1';
          overlay.style.opacity = '1';
          updateOverlay();
          saveOverlayState(state);
        };

        image.src = dataURL;
      };
      reader.readAsDataURL(file);
    });

    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Config';
    exportButton.addEventListener('click', () => {
      const json = exportOverlayConfig(state);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'overlay-config.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = importOverlayConfig(reader.result);
        Object.assign(state, imported);
        state.mapX = Math.round(state.mapX || 0);
        state.mapY = Math.round(state.mapY || 0);
        overlay.style.opacity = state.opacity.toString();
        overlay.style.display = state.active ? 'block' : 'none';
        controlsContainer.style.display = state.active ? 'block' : 'none';
        toggleButton.textContent = state.active ? 'Hide Overlay' : 'Show Overlay';
        xInput.value = state.mapX;
        yInput.value = state.mapY;
        scaleSlider.value = state.scale;
        rotationSlider.value = ((state.rotation * 180) / Math.PI).toString();
        opacitySlider.value = state.opacity;
        if (state.imageSrc) {
          const image = new Image();
          image.onload = () => {
            img = image;
            overlay.width = canvas?.width || img.width;
            overlay.height = canvas?.height || img.height;
            updateOverlay();
          };
          image.src = state.imageSrc;
        } else {
          draw();
          updateOverlay();
        }
        saveOverlayState(state);
      };
      reader.readAsText(file);
    });

    controlsContainer.appendChild(fileInput);
    controlsContainer.appendChild(xInput);
    controlsContainer.appendChild(yInput);
    controlsContainer.appendChild(scaleSlider);
    controlsContainer.appendChild(rotationSlider);
    controlsContainer.appendChild(opacitySlider);
    controlsContainer.appendChild(exportButton);
    controlsContainer.appendChild(importInput);
    mapContainer.appendChild(controlPanel);

    loadOverlayState().then((saved) => {
      Object.assign(state, saved);
      state.mapX = Math.round(state.mapX || 0);
      state.mapY = Math.round(state.mapY || 0);
      overlay.style.opacity = state.opacity.toString();
      overlay.style.display = state.active ? 'block' : 'none';
      controlsContainer.style.display = state.active ? 'block' : 'none';
      toggleButton.textContent = state.active ? 'Hide Overlay' : 'Show Overlay';
      xInput.value = state.mapX;
      yInput.value = state.mapY;
      scaleSlider.value = state.scale;
      rotationSlider.value = ((state.rotation * 180) / Math.PI).toString();
      opacitySlider.value = state.opacity;
      if (state.imageSrc) {
        const image = new Image();
        image.onload = () => {
          img = image;
          overlay.width = canvas?.width || img.width;
          overlay.height = canvas?.height || img.height;
          updateOverlay();
        };
        image.src = state.imageSrc;
      } else {
        updateOverlay();
      }
    });
  });
}
