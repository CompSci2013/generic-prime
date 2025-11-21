import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { DomainConfig } from '../../../framework/models';
import { PickerConfigRegistry } from '../../../framework/services/picker-config-registry.service';
import { PickerSelectionEvent } from '../../../framework/models/picker-config.interface';
import { createAutomobilePickerConfigs } from '../../../domain-config/automobile/configs/automobile.picker-configs';
import { Injector } from '@angular/core';

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
export class DiscoverComponent<TFilters = any, TData = any, TStatistics = any> implements OnInit {
  /**
   * Domain configuration (injected, works with any domain)
   */
  domainConfig: DomainConfig<TFilters, TData, TStatistics>;

  constructor(
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>,
    private pickerRegistry: PickerConfigRegistry,
    private injector: Injector
  ) {
    // Store injected config (works with any domain)
    this.domainConfig = domainConfig as DomainConfig<TFilters, TData, TStatistics>;
  }

  ngOnInit(): void {
    // Register picker configurations
    const pickerConfigs = createAutomobilePickerConfigs(this.injector);
    this.pickerRegistry.registerMultiple(pickerConfigs);
  }

  /**
   * Handle picker selection changes
   *
   * @param event - Picker selection event containing selected items and URL value
   */
  onPickerSelectionChange(event: PickerSelectionEvent<any>): void {
    console.log('Picker selection changed:', event);
    console.log('Selected items:', event.selections);
    console.log('URL value:', event.urlValue);

    // The picker automatically updates the URL via its internal logic
    // No additional action needed here unless you want to trigger side effects
  }
}
