/**
 * Popout App Root Component
 *
 * Minimal root component for pop-out windows.
 * Does NOT include app header or navigation - just the router outlet.
 * Pop-out windows render ONLY the panel component.
 *
 * @selector app-popout-root
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-popout-root',
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `]
})
export class PopoutAppComponent {}
