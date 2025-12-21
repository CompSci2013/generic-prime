/**
 * Pop-Out Bootstrap Entry Point
 *
 * Minimal Angular bootstrap for pop-out windows.
 * Loads only PopoutAppModule (no main app header or navigation).
 * Each pop-out is a completely separate Angular instance.
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { PopoutAppModule } from './app/popout-app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(PopoutAppModule)
  .catch(err => console.error(err));
