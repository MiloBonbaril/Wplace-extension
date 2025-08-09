(function (global) {
  function saveOverlayState(state) {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ overlayState: state }, () => {
          const err = chrome.runtime && chrome.runtime.lastError;
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  function loadOverlayState() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get('overlayState', (result) => {
          resolve(result.overlayState || {});
        });
      } else {
        resolve({});
      }
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { saveOverlayState, loadOverlayState };
  } else {
    global.saveOverlayState = saveOverlayState;
    global.loadOverlayState = loadOverlayState;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
