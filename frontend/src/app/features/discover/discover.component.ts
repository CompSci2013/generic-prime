import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { DomainConfig } from '../../../framework/models';

/**
 * Discover Component
 *
 * **DOMAIN-AGNOSTIC** - Main feature component for data discovery.
 * Orchestrates display of domain-configured components.
 *
 * Architecture:
 * - Configuration-driven component composition
 * - Delegates to reusable framework components
 * - Domain configuration injected via DOMAIN_CONFIG token
 *
 * @template TFilters - Domain-specific filter model type
 * @template TData - Domain-specific data model type
 * @template TStatistics - Domain-specific statistics model type
 */
@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverComponent<TFilters = any, TData = any, TStatistics = any> {
  /**
   * Domain configuration (injected, works with any domain)
   */
  domainConfig: DomainConfig<TFilters, TData, TStatistics>;

  constructor(
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>
  ) {
    // Store injected config (works with any domain)
    this.domainConfig = domainConfig as DomainConfig<TFilters, TData, TStatistics>;
  }
}
