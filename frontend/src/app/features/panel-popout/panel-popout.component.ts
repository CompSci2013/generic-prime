import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PopOutContextService } from '../../../framework/services/popout-context.service';
import { PopOutMessage, PopOutMessageType } from '../../../framework/models/popout.interface';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { DomainConfig } from '../../../framework/models';
import { PickerSelectionEvent } from '../../../framework/models/picker-config.interface';
import { Params } from '@angular/router';
import { UrlStateService } from '../../../framework/services/url-state.service';
import { ResourceManagementService, RESOURCE_MANAGEMENT_SERVICE } from '../../../framework/services/resource-management.service';

/**
 * Panel Popout Component
 *
 * Container component for pop-out windows.
 * Renders different panel types based on route parameters.
 *
 * Route: `/panel/:gridId/:panelId/:type`
 *
 * Architecture:
 * - Initializes as pop-out via PopOutContextService
 * - Subscribes to cross-window messages via BroadcastChannel
 * - Renders appropriate component based on `type` parameter
 * - URL-first state management (watches own URL)
 *
 * @example
 * ```
 * // URL: /panel/discover/model-picker/picker
 * // Renders: <app-base-picker>
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
          defaultFilters: {} as any
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
    private router: Router,
    private popOutContext: PopOutContextService,
    private cdr: ChangeDetectorRef,
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>
  ) {
    this.domainConfig = domainConfig;
  }

  ngOnInit(): void {
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

      case PopOutMessageType.URL_PARAMS_SYNC:
        // Sync URL params from main window
        this.syncUrlParams(message.payload.params);
        break;

      // Other message types handled by child components
      // (they subscribe to PopOutContextService directly)
    }
  }

  /**
   * Sync URL parameters from main window
   * Updates the pop-out's URL to match the main window
   *
   * @param params - URL parameters from main window
   */
  private syncUrlParams(params: Params): void {
    console.log('[PanelPopout] Syncing URL params from main window:', params);

    // Update URL without triggering navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      replaceUrl: true,
      queryParamsHandling: ''
    });
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
   * Sends message to main window instead of updating URL directly
   *
   * @param params - URL parameters to update
   */
  onUrlParamsChange(params: Params): void {
    console.log('[PanelPopout] URL params change request:', params);

    // Send message to main window to update URL
    this.popOutContext.sendMessage({
      type: PopOutMessageType.URL_PARAMS_CHANGED,
      payload: { params },
      timestamp: Date.now()
    });
  }

  /**
   * Handle picker selection changes
   * Sends message to main window to update URL
   *
   * @param event - Picker selection event
   */
  onPickerSelectionChange(event: PickerSelectionEvent<any>): void {
    console.log('[PanelPopout] Picker selection change:', event);

    // Extract URL param from selection event
    const params: Params = {};

    // The selection event contains the URL param name and value
    // We need to extract it from the event
    // For now, send as generic URL params change
    if (event.urlValue) {
      // We need to know the param name - it should be in the picker config
      // For manufacturer-model-picker, it's typically 'modelCombos'
      // We'll send the whole event and let main window handle it
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
