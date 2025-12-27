import { ErrorHandler, importProvidersFrom, Injector } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { GlobalErrorHandler } from '../framework/services/global-error.handler';
import { DOMAIN_CONFIG } from '../framework/services/domain-config-registry.service';
import { createAutomobileDomainConfig } from '../domain-config/automobile';
import { FrameworkModule } from '../framework/framework.module';
import { UiKitModule } from '../framework/ui-kit/ui-kit.module';

/**
 * Application Configuration (Standalone Bootstrap)
 *
 * Configures the Generic-Prime application using Angular 15+ standalone APIs.
 * Replaces the traditional AppModule with functional providers.
 *
 * Providers:
 * - provideRouter: Configures application routing
 * - provideHttpClient: Enables HTTP communication
 * - provideAnimations: Enables Angular animations for PrimeNG
 * - MessageService: PrimeNG toast/message service
 * - GlobalErrorHandler: Application-wide error handling
 * - DOMAIN_CONFIG: Domain configuration factory for automobile domain
 * - FrameworkModule: Framework components and services (imported via importProvidersFrom)
 * - UiKitModule: UI component library facade (imported via importProvidersFrom)
 */
export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(FrameworkModule, UiKitModule),
    MessageService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: DOMAIN_CONFIG,
      useFactory: createAutomobileDomainConfig,
      deps: [Injector]
    }
  ]
};
