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
});
