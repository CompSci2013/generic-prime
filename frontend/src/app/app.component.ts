import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DomainConfigRegistry } from '../framework/services';
import { DOMAIN_PROVIDERS } from '../domain-config/domain-providers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'generic-prime';

  // Domain navigation menu items
  domainMenuItems = [
    {
      label: 'Automobiles',
      icon: '🚗',
      submenu: [
        { label: 'Domain Overview', icon: '🏠', route: '/automobiles' },
        { label: 'Discovery Interface', icon: '🔍', route: '/automobiles/discover' }
      ]
    },
    {
      label: 'Agriculture',
      icon: '🌾',
      submenu: [
        { label: 'Domain Overview', icon: '🏠', route: '/agriculture' },
        { label: 'Discovery Interface', icon: '🔍', route: '/agriculture/discover' }
      ]
    },
    {
      label: 'Physics',
      icon: '⚛️',
      submenu: [
        { label: 'Domain Overview', icon: '🏠', route: '/physics' },
        { label: 'Discovery Interface', icon: '🔍', route: '/physics/discover' }
      ]
    },
    {
      label: 'Chemistry',
      icon: '🧪',
      submenu: [
        { label: 'Domain Overview', icon: '🏠', route: '/chemistry' },
        { label: 'Discovery Interface', icon: '🔍', route: '/chemistry/discover' }
      ]
    },
    {
      label: 'Mathematics',
      icon: '📐',
      submenu: [
        { label: 'Domain Overview', icon: '🏠', route: '/math' },
        { label: 'Discovery Interface', icon: '🔍', route: '/math/discover' }
      ]
    },
    { separator: true },
    {
      label: 'Test Reports',
      icon: '📋',
      route: '/report'
    }
  ];

  constructor(
    private domainConfigRegistry: DomainConfigRegistry,
    private injector: Injector,
    private router: Router
  ) {
    this.domainConfigRegistry.registerDomainProviders(DOMAIN_PROVIDERS, this.injector);
  }

  /**
   * Navigate to selected domain or submenu item
   * Handles both direct routes and submenu items
   */
  navigateToDomain(event: any) {
    const selectedItem = event.value;

    // Handle direct routes
    if (selectedItem.route) {
      this.router.navigate([selectedItem.route]);
    }
    // Handle submenu items (clicking on parent opens submenu)
    else if (selectedItem.submenu) {
      // For parent items, navigate to the first submenu item (domain overview)
      const firstSubmenuItem = selectedItem.submenu[0];
      if (firstSubmenuItem && firstSubmenuItem.route) {
        this.router.navigate([firstSubmenuItem.route]);
      }
    }

    // Reset dropdown after navigation
    setTimeout(() => {
      const dropdown = document.querySelector('.domain-dropdown .p-dropdown-trigger');
      if (dropdown instanceof HTMLElement) {
        dropdown.click();
      }
    }, 100);
  }
}

