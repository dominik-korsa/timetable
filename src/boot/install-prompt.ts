import { boot } from 'quasar/wrappers';
import { setupListeners } from 'src/install-prompt';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot((/* { app, router, ... } */) => {
  setupListeners();
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.sessionStorage.setItem('just-updated', '');
    window.location.reload();
  });
});
