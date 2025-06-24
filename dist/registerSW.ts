// src/registerSW.ts
export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            // You can use registration here if needed for updates
            return registration;
          })
          .catch((err) => {
            console.error('ServiceWorker registration failed: ', err);
          });
      });
    }
  }