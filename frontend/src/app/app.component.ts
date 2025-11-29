import { Component, Injector } from '@angular/core';
import { DomainConfigRegistry } from '../framework/services';
import { DOMAIN_PROVIDERS } from '../domain-config/domain-providers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'generic-prime';

  constructor(
    private domainConfigRegistry: DomainConfigRegistry,
    private injector: Injector
  ) {
    this.domainConfigRegistry.registerDomainProviders(DOMAIN_PROVIDERS, this.injector);
  }
}

