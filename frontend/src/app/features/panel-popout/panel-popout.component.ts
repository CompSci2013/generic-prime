import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  Injector
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PopOutContextService } from '../../../framework/services/popout-context.service';
import { PopOutMessage, PopOutMessageType } from '../../../framework/models/popout.interface';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { DomainConfig } from '../../../framework/models';
import { PickerSelectionEvent } from '../../../framework/models/picker-config.interface';
import { UrlStateService } from '../../../framework/services/url-state.service';
import { PickerConfigRegistry } from '../../../framework/services/picker-config-registry.service';
import { createAutomobilePickerConfigs } from '../../../domain-config/automobile/configs/automobile.picker-configs';
import { ResourceManagementService, RESOURCE_MANAGEMENT_SERVICE } from '../../../framework/services/resource-management.service';

/**
 * Panel Popout Component
 *
 * Container component for pop-out windows.
 * Renders different panel types based on route parameters.
 *
 * Route: `/panel/:gridId/:panelId/:type` (NO query params)
 *
 * Architecture:
 * - Initializes as pop-out via PopOutContextService
 * - Receives STATE_UPDATE messages from main window via BroadcastChannel
 * - Syncs state to ResourceManagementService (no API calls)
 * - Components subscribe to ResourceManagementService observables naturally
 * - URL-First: Main window URL is source of truth, pop-out receives derived state
 *
 * State Flow:
 * 1. Main window URL changes → ResourceManagementService updates state
 * 2. Main window broadcasts STATE_UPDATE to pop-outs
 * 3. Pop-out receives STATE_UPDATE → syncs to ResourceManagementService
 * 4. Components subscribe to observables and render
 *
 * @example
 * ```
 * // URL: /panel/discover/manufacturer-model-picker/picker
 * // Renders: <app-base-picker>
 * // State comes from BroadcastChannel (synced from main window)
 * ```
 */
@Component({
  selector: 'app-panel-popout',
  templateUrl: './panel-popout.component.html',
  styleUrls: ['./panel-popout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: RESOURCE_MANAGEMENT_SERVICE,
      useFactory: (urlState: UrlStateService, domainConfig: DomainConfig<any, any, any>) => {
        return new ResourceManagementService(urlState, {
          filterMapper: domainConfig.urlMapper,
          apiAdapter: domainConfig.apiAdapter,
          cacheKeyBuilder: domainConfig.cacheKeyBuilder,
          defaultFilters: {} as any,
          supportsHighlights: domainConfig.features?.highlights ?? false,
          highlightPrefix: 'h_',
          autoFetch: false  // Pop-outs receive state from main window, no API calls needed
        });
      },
      deps: [UrlStateService, DOMAIN_CONFIG]
    }
  ]
})
export class PanelPopoutComponent implements OnInit, OnDestroy {
  /**
   * Grid identifier from route
   */
  gridId: string = '';

  /**
   * Panel identifier from route
   */
  panelId: string = '';

  /**
   * Panel type (determines which component to render)
   */
  panelType: string = '';

  /**
   * Domain configuration (injected)
   */
  domainConfig: DomainConfig<any, any, any>;

  /**
   * Destroy signal for subscription cleanup
   */
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private popOutContext: PopOutContextService,
    private cdr: ChangeDetectorRef,
    private pickerRegistry: PickerConfigRegistry,
    private injector: Injector,
    private urlState: UrlStateService,
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>,
    @Inject(RESOURCE_MANAGEMENT_SERVICE) private resourceService: ResourceManagementService<any, any, any>
  ) {
    this.domainConfig = domainConfig;
  }

  ngOnInit(): void {
    // Register picker configurations (needed for BasePickerComponent in pop-out)
    // TODO: Make this domain-agnostic by using domain config
    const pickerConfigs = createAutomobilePickerConfigs(this.injector);
    this.pickerRegistry.registerMultiple(pickerConfigs);
    console.log('[PanelPopout] Registered picker configs');

    // Extract route parameters
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.gridId = params['gridId'];
        this.panelId = params['panelId'];
        this.panelType = params['type'];

        console.log(`[PanelPopout] Initialized - Grid: ${this.gridId}, Panel: ${this.panelId}, Type: ${this.panelType}`);

        // Initialize as pop-out
        this.popOutContext.initializeAsPopOut(this.panelId);

        // Trigger change detection
        this.cdr.markForCheck();
      });

    // Subscribe to messages from main window
    this.popOutContext.getMessages$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.handleMessage(message);
      });
  }

  /**
   * Handle messages from main window
   *
   * @param message - Message from main window
   */
  private handleMessage(message: PopOutMessage): void {
    console.log('[PanelPopout] Received message:', message.type);

    switch (message.type) {
      case PopOutMessageType.CLOSE_POPOUT:
        // Close window when requested
        window.close();
        break;

      case PopOutMessageType.STATE_UPDATE:
        // Sync full state from main window
        // Main window URL → state$ → BroadcastChannel → pop-out
        if (message.payload && message.payload.state) {
          console.log('[PanelPopout] Syncing state from main window');
          this.resourceService.syncStateFromExternal(message.payload.state);
          this.cdr.markForCheck();
        }
        break;
    }
  }

  /**
   * Get panel title for display
   *
   * @returns Panel title
   */
  getPanelTitle(): string {
    const titleMap: { [key: string]: string } = {
      'query-control': 'Query Control',
      'manufacturer-model-picker': 'Manufacturer-Model Picker',
      'statistics-panel': 'Statistics',
      'results-table': 'Results'
    };

    return titleMap[this.panelId] || this.panelId;
  }

  /**
   * Get picker config ID based on panel ID
   *
   * @returns Picker configuration ID
   */
  getPickerConfigId(): string {
    return this.panelId;
  }

  /**
   * Handle URL parameter changes from child components
   * Sends message to main window - main window updates its URL and broadcasts STATE_UPDATE
   *
   * @param params - URL parameters from child component
   */
  onUrlParamsChange(params: any): void {
    console.log('[PanelPopout] URL params change request:', params);

    // Send URL_PARAMS_CHANGED to main window
    // Main window will update its URL, which triggers state update, which broadcasts to pop-outs
    this.popOutContext.sendMessage({
      type: PopOutMessageType.URL_PARAMS_CHANGED,
      payload: { params },
      timestamp: Date.now()
    });
  }

  /**
   * Handle clear all filters request
   * Sends message to main window to clear all URL params
   */
  onClearAllFilters(): void {
    console.log('[PanelPopout] Clear all filters request');

    this.popOutContext.sendMessage({
      type: PopOutMessageType.CLEAR_ALL_FILTERS,
      timestamp: Date.now()
    });
  }

  /**
   * Handle picker selection changes
   * Sends message to main window which updates URL and broadcasts STATE_UPDATE
   *
   * @param event - Picker selection event
   */
  onPickerSelectionChange(event: PickerSelectionEvent<any>): void {
    console.log('[PanelPopout] Picker selection change:', event);

    // Send picker selection event to main window
    // Main window will update its URL, which triggers state update, which broadcasts to pop-outs
    if (event.urlValue !== undefined) {
      this.popOutContext.sendMessage({
        type: PopOutMessageType.PICKER_SELECTION_CHANGE,
        payload: event,
        timestamp: Date.now()
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
