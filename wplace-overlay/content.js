// Content script for Wplace Overlay
document.addEventListener('DOMContentLoaded', () => {
  console.log('Wplace Overlay activated');

  const canvas = document.querySelector('canvas');
  const mapContainer = canvas?.parentElement || document.body;

  const overlay = document.createElement('canvas');
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.pointerEvents = 'none';

  mapContainer.style.position = 'relative';
  mapContainer.appendChild(overlay);

  // Create a simple control panel
  const controlPanel = document.createElement('div');
  controlPanel.className = 'control-panel';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  // Handle image loading and drawing
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      const ctx = overlay.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      ctx.drawImage(img, 0, 0, overlay.width, overlay.height);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });

  controlPanel.appendChild(fileInput);
  mapContainer.appendChild(controlPanel);
});
