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

  // Domain navigation menu items - flat structure with grouping labels
  domainMenuItems = [
    { label: 'Home', icon: '🏠', route: '/' },
    { separator: true },
    { label: 'Automobiles', icon: '🚗', groupLabel: 'Automobiles' },
    { label: 'Autos Home', icon: '🏠', route: '/automobiles', indent: true },
    { label: 'Autos Discover', icon: '🔍', route: '/automobiles/discover', indent: true },
    { label: 'Agriculture', icon: '🌾', groupLabel: 'Agriculture' },
    { label: 'Agriculture Home', icon: '🏠', route: '/agriculture', indent: true },
    { label: 'Agriculture Discover', icon: '🔍', route: '/agriculture/discover', indent: true },
    { label: 'Physics', icon: '⚛️', groupLabel: 'Physics' },
    { label: 'Physics Home', icon: '🏠', route: '/physics', indent: true },
    { label: 'Physics Discover', icon: '🔍', route: '/physics/discover', indent: true },
    { label: 'Chemistry', icon: '🧪', groupLabel: 'Chemistry' },
    { label: 'Chemistry Home', icon: '🏠', route: '/chemistry', indent: true },
    { label: 'Chemistry Discover', icon: '🔍', route: '/chemistry/discover', indent: true },
    { label: 'Mathematics', icon: '📐', groupLabel: 'Mathematics' },
    { label: 'Math Home', icon: '🏠', route: '/math', indent: true },
    { label: 'Math Discover', icon: '🔍', route: '/math/discover', indent: true },
    { separator: true },
    { label: 'Test Reports', icon: '📋', route: '/report' }
  ];

  constructor(
    private domainConfigRegistry: DomainConfigRegistry,
    private injector: Injector,
    private router: Router
  ) {
    this.domainConfigRegistry.registerDomainProviders(DOMAIN_PROVIDERS, this.injector);
  }

  /**
   * Navigate to selected menu item
   * Handles direct routes and navigates away from menu items with submenus
   */
  navigateToDomain(event: any) {
    const selectedItem = event.value;

    // Only navigate if the item has a direct route
    if (selectedItem && selectedItem.route) {
      this.router.navigate([selectedItem.route]);

      // Reset dropdown after navigation
      setTimeout(() => {
        const dropdown = document.querySelector('.domain-dropdown .p-dropdown-trigger');
        if (dropdown instanceof HTMLElement) {
          dropdown.click();
        }
      }, 100);
    }
  }
}

