import { Component, Injector } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DomainConfigRegistry } from '../framework/services';
import { DOMAIN_PROVIDERS } from '../domain-config/domain-providers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'generic-prime';

  // Domain navigation menu items with TieredMenu structure (nested items with flyout submenus)
  domainMenuItems: MenuItem[] = [
    {
      label: 'Automobiles',
      icon: '🚗',
      items: [
        { label: 'Autos Home', icon: '🏠', routerLink: '/automobiles' },
        { label: 'Autos Discover', icon: '🔍', routerLink: '/automobiles/discover' }
      ]
    },
    {
      label: 'Agriculture',
      icon: '🌾',
      items: [
        { label: 'Agriculture Home', icon: '🏠', routerLink: '/agriculture' },
        { label: 'Agriculture Discover', icon: '🔍', routerLink: '/agriculture/discover' }
      ]
    },
    {
      label: 'Physics',
      icon: '⚛️',
      items: [
        { label: 'Physics Home', icon: '🏠', routerLink: '/physics' },
        { label: 'Physics Discover', icon: '🔍', routerLink: '/physics/discover' }
      ]
    },
    {
      label: 'Chemistry',
      icon: '🧪',
      items: [
        { label: 'Chemistry Home', icon: '🏠', routerLink: '/chemistry' },
        { label: 'Chemistry Discover', icon: '🔍', routerLink: '/chemistry/discover' }
      ]
    },
    {
      label: 'Mathematics',
      icon: '📐',
      items: [
        { label: 'Math Home', icon: '🏠', routerLink: '/math' },
        { label: 'Math Discover', icon: '🔍', routerLink: '/math/discover' }
      ]
    },
    {
      label: 'Test Reports',
      icon: '📋',
      items: [
        { label: 'View Test Reports', icon: '📊', routerLink: '/report' }
      ]
    }
  ];

  constructor(
    private domainConfigRegistry: DomainConfigRegistry,
    private injector: Injector
  ) {
    this.domainConfigRegistry.registerDomainProviders(DOMAIN_PROVIDERS, this.injector);
  }
}

