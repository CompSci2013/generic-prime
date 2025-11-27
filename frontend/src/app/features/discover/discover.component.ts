import { Component, Inject, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { DomainConfig } from '../../../framework/models';
import { PickerConfigRegistry } from '../../../framework/services/picker-config-registry.service';
import { PickerSelectionEvent } from '../../../framework/models/picker-config.interface';
import { createAutomobilePickerConfigs } from '../../../domain-config/automobile/configs/automobile.picker-configs';
import { Injector } from '@angular/core';
import { PopOutContextService } from '../../../framework/services/popout-context.service';
import { PopOutWindowRef, buildWindowFeatures, PopOutMessageType } from '../../../framework/models/popout.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { UrlStateService } from '../../../framework/services/url-state.service';
import { Params } from '@angular/router';
import { ResourceManagementService, RESOURCE_MANAGEMENT_SERVICE } from '../../../framework/services/resource-management.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
 * - Supports pop-out windows for multi-monitor setups
 * - Coordinates URL state between main window and pop-outs
 *
 * @template TFilters - Domain-specific filter model type
 * @template TData - Domain-specific data model type
 * @template TStatistics - Domain-specific statistics model type
 */
@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
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
          highlightPrefix: 'h_'
        });
      },
      deps: [UrlStateService, DOMAIN_CONFIG]
    }
  ]
})
export class DiscoverComponent<TFilters = any, TData = any, TStatistics = any> implements OnInit, OnDestroy {
  /**
   * Domain configuration (injected, works with any domain)
   */
  domainConfig: DomainConfig<TFilters, TData, TStatistics>;

  /**
   * Set of panel IDs that are currently popped out
   * Pop-outs are closed on page refresh (beforeunload)
   */
  private poppedOutPanels = new Set<string>();

  /**
   * Map of collapsed panel states (panel ID → collapsed boolean)
   */
  collapsedPanels = new Map<string, boolean>();

  /**
   * Ordered list of panel IDs (defines display order)
   */
  panelOrder: string[] = [
    'query-control',
    'manufacturer-model-picker',
    'statistics-panel',
    'results-table'
  ];

  /**
   * Map of pop-out windows and their associated channels
   */
  private popoutWindows = new Map<string, PopOutWindowRef>();

  /**
   * Destroy signal for subscription cleanup
   */
  private destroy$ = new Subject<void>();

  /**
   * Bound beforeunload handler (needs reference for removeEventListener)
   */
  private beforeUnloadHandler = () => this.closeAllPopOuts();

  /**
   * RxJS Subject for pop-out messages (Observable Pattern)
   * Pushes browser API events into Angular zone for change detection
   */
  private popoutMessages$ = new Subject<{
    panelId: string;
    event: MessageEvent;
  }>();

  /**
   * Grid identifier for routing
   */
  private readonly gridId = 'discover';

  /**
   * Debug: Current URL state for display
   */
  debugUrlState = '(loading...)';

  constructor(
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>,
    @Inject(RESOURCE_MANAGEMENT_SERVICE) private resourceService: ResourceManagementService<TFilters, TData, TStatistics>,
    private pickerRegistry: PickerConfigRegistry,
    private injector: Injector,
    private popOutContext: PopOutContextService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private urlStateService: UrlStateService
  ) {
    // Store injected config (works with any domain)
    this.domainConfig = domainConfig as DomainConfig<TFilters, TData, TStatistics>;
  }

  ngOnInit(): void {
    // Register picker configurations
    const pickerConfigs = createAutomobilePickerConfigs(this.injector);
    this.pickerRegistry.registerMultiple(pickerConfigs);

    // Initialize as parent window
    this.popOutContext.initializeAsParent();

    // Close all pop-outs when main window refreshes/closes
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Subscribe to messages from pop-out windows
    this.popOutContext.getMessages$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.handlePopOutMessage('', message);
      });

    // Subscribe to pop-out messages (RxJS Observable Pattern)
    // This brings BroadcastChannel events into Angular zone for change detection
    this.popoutMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ panelId, event }) => {
        this.handlePopOutMessage(panelId, event.data);
      });

    // Subscribe to state changes and broadcast to ALL pop-outs
    // URL-First: Main window URL → state$ → BroadcastChannel → pop-out components
    this.resourceService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.broadcastStateToPopOuts(state);
      });

    // DEBUG: Subscribe to URL params for debug display
    this.urlStateService.watchParams()
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.debugUrlState = JSON.stringify(params, null, 2);
        this.cdr.markForCheck();
      });
  }

  /**
   * Check if a panel is currently popped out
   *
   * @param panelId - Panel identifier
   * @returns True if panel is popped out
   */
  isPanelPoppedOut(panelId: string): boolean {
    return this.poppedOutPanels.has(panelId);
  }

  /**
   * Check if a panel is currently collapsed
   *
   * @param panelId - Panel identifier
   * @returns True if panel is collapsed
   */
  isPanelCollapsed(panelId: string): boolean {
    return this.collapsedPanels.get(panelId) ?? false;
  }

  /**
   * Toggle panel collapsed state
   *
   * @param panelId - Panel identifier
   */
  togglePanelCollapse(panelId: string): void {
    const currentState = this.collapsedPanels.get(panelId) ?? false;
    this.collapsedPanels.set(panelId, !currentState);
    this.cdr.markForCheck();
  }

  /**
   * Handle panel drag-drop to reorder panels
   *
   * @param event - CDK drag-drop event
   */
  onPanelDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.panelOrder, event.previousIndex, event.currentIndex);
    this.cdr.markForCheck();
    console.log('[Discover] Panel order updated:', this.panelOrder);
  }

  /**
   * Get panel title by panel ID
   *
   * @param panelId - Panel identifier
   * @returns Panel display title
   */
  getPanelTitle(panelId: string): string {
    const titleMap: { [key: string]: string } = {
      'query-control': 'Query Control',
      'manufacturer-model-picker': 'Manufacturer-Model Picker',
      'statistics-panel': 'Statistics',
      'results-table': 'Results'
    };
    return titleMap[panelId] || panelId;
  }

  /**
   * Pop out a panel to a separate window
   *
   * @param panelId - Panel identifier (e.g., 'query-control', 'manufacturer-model-picker')
   * @param panelType - Panel type for routing (e.g., 'query-control', 'picker', 'statistics', 'results')
   */
  popOutPanel(panelId: string, panelType: string): void {
    // Check if already popped out
    if (this.poppedOutPanels.has(panelId)) {
      console.warn(`Panel ${panelId} is already popped out`);
      return;
    }

    // Build pop-out URL (NO query params - state comes via BroadcastChannel)
    const url = `/panel/${this.gridId}/${panelId}/${panelType}`;

    // Window features
    const features = buildWindowFeatures({
      width: 1200,
      height: 800,
      left: 100,
      top: 100,
      resizable: true,
      scrollbars: true
    });

    // Open window (state will be broadcast via BroadcastChannel, not URL)
    const popoutWindow = window.open(url, `panel-${panelId}`, features);

    if (!popoutWindow) {
      // Pop-up blocked
      this.messageService.add({
        severity: 'warn',
        summary: 'Pop-up Blocked',
        detail: 'Please allow pop-ups for this site to use the pop-out feature',
        life: 5000
      });
      return;
    }

    // Track as popped out
    this.poppedOutPanels.add(panelId);

    // Set up BroadcastChannel for this panel
    const channel = this.popOutContext.createChannelForPanel(panelId);

    // Listen for messages from pop-out (Observable Pattern)
    // Push browser API events to RxJS Subject for handling in Angular zone
    channel.onmessage = (event) => {
      this.popoutMessages$.next({ panelId, event });
    };

    // Monitor for window close
    const checkInterval = window.setInterval(() => {
      if (popoutWindow.closed) {
        this.onPopOutClosed(panelId, channel, checkInterval);
      }
    }, 500);

    // Store reference
    this.popoutWindows.set(panelId, {
      window: popoutWindow,
      channel,
      checkInterval,
      panelId,
      panelType
    });

    // Trigger change detection to hide panel
    this.cdr.markForCheck();

    console.log(`[Discover] Popped out panel: ${panelId}`);
  }

  /**
   * Handle messages from pop-out windows
   *
   * @param panelId - Panel identifier
   * @param message - Message from pop-out
   */
  private handlePopOutMessage(panelId: string, message: any): void {
    console.log(`[Discover] Message from pop-out:`, message.type, message.payload);

    switch (message.type) {
      case PopOutMessageType.PICKER_SELECTION_CHANGE:
        // Handle picker selection from pop-out
        this.onPickerSelectionChangeAndUpdateUrl(message.payload);
        break;

      case PopOutMessageType.PANEL_READY:
        // Pop-out is ready - broadcast current state immediately
        // (state$ subscription only fires on changes, not on initial subscription)
        console.log('[Discover] Pop-out ready, broadcasting current state');
        const currentState = this.resourceService.getCurrentState();
        this.broadcastStateToPopOuts(currentState);
        break;

      case PopOutMessageType.URL_PARAMS_CHANGED:
        // Pop-out sent URL params change - update main window URL
        // This will trigger: URL change → ResourceManagementService → state$ → BroadcastChannel → pop-outs
        console.log('[Discover] URL params change from pop-out:', message.payload?.params);
        if (message.payload?.params) {
          this.urlStateService.setParams(message.payload.params);
        }
        break;
    }
  }

  /**
   * Handle pop-out window closure
   *
   * @param panelId - Panel identifier
   * @param channel - BroadcastChannel to close
   * @param checkInterval - Interval to clear
   */
  private onPopOutClosed(panelId: string, channel: BroadcastChannel, checkInterval: number): void {
    console.log(`[Discover] Pop-out ${panelId} closed, restoring panel`);

    // Clean up
    clearInterval(checkInterval);
    channel.close();
    this.popoutWindows.delete(panelId);
    this.poppedOutPanels.delete(panelId);

    // Trigger change detection to show panel again
    this.cdr.markForCheck();
  }

  /**
   * Handle URL parameter changes from components
   * Updates the URL in main window
   *
   * @param params - URL parameters to update
   */
  onUrlParamsChange(params: Params): void {
    console.log('[Discover] Updating URL params:', params);
    this.urlStateService.setParams(params);
  }

  /**
   * Handle picker selection changes and update URL
   *
   * @param event - Picker selection event containing selected items and URL value
   */
  onPickerSelectionChangeAndUpdateUrl(event: PickerSelectionEvent<any>): void {
    console.log('[Discover] Picker selection changed:', event);

    // Extract the URL param name from the picker config
    // For now, we'll use a hardcoded value - this should come from the picker config
    const paramName = 'modelCombos'; // TODO: Get from picker config

    // Update URL with the serialized selection and reset pagination
    this.urlStateService.setParams({
      [paramName]: event.urlValue || null,
      page: 1 // Reset to first page when selection changes (1-indexed)
    });
  }

  /**
   * Close all pop-out windows
   * Called on beforeunload to clean up pop-outs when main window refreshes
   */
  private closeAllPopOuts(): void {
    console.log('[Discover] Closing all pop-outs (main window unloading)');

    // Send CLOSE_POPOUT to all pop-outs
    this.popoutWindows.forEach(({ channel }) => {
      channel.postMessage({
        type: PopOutMessageType.CLOSE_POPOUT,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Broadcast full state to all pop-out windows
   * This is called whenever main window state changes
   *
   * Architecture: Main window URL is the single source of truth.
   * URL → ResourceManagementService → state$ → BroadcastChannel → pop-out windows
   * Pop-outs receive state and sync to their ResourceManagementService (no API calls)
   *
   * @param state - Current resource state
   */
  private broadcastStateToPopOuts(state: any): void {
    if (this.popoutWindows.size === 0) {
      return; // No pop-outs, skip broadcast
    }

    console.log('[Discover] Broadcasting state to all pop-outs:', {
      resultsCount: state.results?.length,
      filters: state.filters,
      popoutsCount: this.popoutWindows.size
    });

    // Send STATE_UPDATE to all pop-outs
    this.popoutWindows.forEach(({ channel }) => {
      channel.postMessage({
        type: PopOutMessageType.STATE_UPDATE,
        payload: { state },
        timestamp: Date.now()
      });
    });
  }

  ngOnDestroy(): void {
    // Remove beforeunload handler
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);

    // Clean up all pop-out windows
    this.popoutWindows.forEach(({ window, channel, checkInterval }) => {
      clearInterval(checkInterval);
      channel.close();
      if (window && !window.closed) {
        window.close();
      }
    });

    this.destroy$.next();
    this.destroy$.complete();
  }
}
