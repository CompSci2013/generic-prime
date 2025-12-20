import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createAutomobilePickerConfigs } from '../../../domain-config/automobile/configs/automobile.picker-configs';
import { DomainConfig } from '../../../framework/models';
import { PickerSelectionEvent } from '../../../framework/models/picker-config.interface';
import {
  PopOutMessage,
  PopOutMessageType
} from '../../../framework/models/popout.interface';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { PickerConfigRegistry } from '../../../framework/services/picker-config-registry.service';
import { PopOutContextService } from '../../../framework/services/popout-context.service';
import { ResourceManagementService } from '../../../framework/services/resource-management.service';
import { UrlStateService } from '../../../framework/services/url-state.service';

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
  providers: [ResourceManagementService]
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
    public resourceService: ResourceManagementService<any, any, any>
  ) {
    this.domainConfig = domainConfig;
  }

  ngOnInit(): void {
    console.log('[PanelPopout] ngOnInit() starting...');

    // Register picker configurations (needed for BasePickerComponent in pop-out)
    // TODO: Make this domain-agnostic by using domain config
    const pickerConfigs = createAutomobilePickerConfigs(this.injector);
    this.pickerRegistry.registerMultiple(pickerConfigs);
    console.log('[PanelPopout] ✅ Registered picker configs');

    // Extract route parameters
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.gridId = params['gridId'];
      this.panelId = params['panelId'];
      this.panelType = params['type'];

      console.log(
        `[PanelPopout] ✅ Route params received - Grid: ${this.gridId}, Panel: ${this.panelId}, Type: ${this.panelType}`
      );

      // Initialize as pop-out
      this.popOutContext.initializeAsPopOut(this.panelId);
      console.log('[PanelPopout] ✅ Initialized as pop-out in PopOutContextService');

      // Trigger change detection
      this.cdr.markForCheck();
      console.log('[PanelPopout] ✅ Triggered change detection via markForCheck()');
    });

    // Subscribe to messages from main window
    this.popOutContext
      .getMessages$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        console.log('[PanelPopout] ⬇️  Message received from PopOutContextService:', message);
        this.handleMessage(message);
      });
    console.log('[PanelPopout] ✅ Subscribed to PopOutContextService messages');

    console.log('[PanelPopout] ✅ ngOnInit() complete');
  }

  /**
   * Handle messages from main window
   *
   * @param message - Message from main window
   */
  private async handleMessage(message: PopOutMessage): Promise<void> {
    console.log('[PanelPopout] 📨 handleMessage() processing:', message.type);

    switch (message.type) {
      case PopOutMessageType.CLOSE_POPOUT:
        console.log('[PanelPopout] 🔴 Received CLOSE_POPOUT message, closing window...');
        // Close window when requested
        window.close();
        break;

      case PopOutMessageType.STATE_UPDATE:
        // Sync full state from main window
        // Main window URL → state$ → BroadcastChannel → pop-out
        if (message.payload && message.payload.state) {
          console.log('[PanelPopout] 🟢 Received STATE_UPDATE message');
          console.log('[PanelPopout] State payload:', message.payload.state);
          this.resourceService.syncStateFromExternal(message.payload.state);
          console.log('[PanelPopout] ✅ Called resourceService.syncStateFromExternal()');
          this.cdr.markForCheck();
          console.log('[PanelPopout] ✅ Triggered change detection');
        } else {
          console.warn('[PanelPopout] ⚠️  STATE_UPDATE missing payload.state');
        }
        break;

      case PopOutMessageType.URL_PARAMS_SYNC:
        // Sync URL parameters from main window
        // Needed for Query Control and other components that listen to URL params
        if (message.payload && message.payload.params) {
          console.log('[PanelPopout] 🔵 Received URL_PARAMS_SYNC message');
          console.log('[PanelPopout] URL params payload:', message.payload.params);
          // Update pop-out's URL parameters (this triggers QueryControl to update its filters)
          await this.urlState.setParams(message.payload.params);
          console.log('[PanelPopout] ✅ Called urlState.setParams()');
          this.cdr.markForCheck();
          console.log('[PanelPopout] ✅ Triggered change detection');
        } else {
          console.warn('[PanelPopout] ⚠️  URL_PARAMS_SYNC missing payload.params');
        }
        break;

      default:
        console.warn('[PanelPopout] ⚠️  Unknown message type:', message.type);
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
