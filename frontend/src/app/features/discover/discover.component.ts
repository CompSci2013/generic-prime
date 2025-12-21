import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Params } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomainConfig } from '../../../framework/models';
import {
  buildWindowFeatures,
  PopOutMessageType,
  PopOutWindowRef
} from '../../../framework/models/popout.interface';
import { DOMAIN_CONFIG } from '../../../framework/services/domain-config-registry.service';
import { PopOutContextService } from '../../../framework/services/popout-context.service';
import { ResourceManagementService } from '../../../framework/services/resource-management.service';
import { UrlStateService } from '../../../framework/services/url-state.service';

/**
 * Discover Component - Core discovery interface orchestrator
 *
 * **DOMAIN-AGNOSTIC**: Works with any domain via dependency injection.
 * Single component renders different UIs based on DOMAIN_CONFIG.
 *
 * **Primary Responsibilities**:
 * 1. Orchestrate 3 framework panels (QueryControl, Statistics, ResultsTable)
 * 2. Manage panel lifecycle (collapse, drag-drop reorder, pop-out)
 * 3. Handle URL state synchronization with ResourceManagementService
 * 4. Manage pop-out windows (create, monitor, close)
 * 5. Broadcast state changes to all open pop-outs via BroadcastChannel
 * 6. Listen for messages from pop-outs and update URL/state
 *
 * **Architecture**: Configuration-Driven + URL-First + Pop-Out Aware
 *
 * ```
 * DiscoverComponent (main window)
 * ├─ URL changes
 * │  └─ ResourceManagementService detects change → fetchData()
 * │     └─ state$ emits new state
 * │        └─ broadcastStateToPopOuts() sends via BroadcastChannel
 * │
 * ├─ Panel renders
 * │  ├─ Query Control (filters$)
 * │  ├─ Statistics (statistics$)
 * │  └─ Results Table (results$)
 * │
 * └─ Pop-outs
 *    ├─ popOutPanel() opens new window
 *    ├─ PanelPopoutComponent initializes
 *    │  └─ ResourceManagementService (pop-out instance, autoFetch=false)
 *    │
 *    └─ BroadcastChannel sync
 *       ├─ Main → Pop-out: STATE_UPDATE (on URL change)
 *       └─ Pop-out → Main: FILTER_ADD, FILTER_REMOVE, etc.
 * ```
 *
 * **Key Features**:
 * - **Panel Management**: Collapse, drag-drop reorder, hide when popped out
 * - **Pop-Out Windows**: Open secondary windows via window.open()
 * - **BroadcastChannel**: Cross-window communication (one channel per panel)
 * - **Window Close Detection**: Polls every 500ms to detect user-closed windows
 * - **State Broadcasting**: Listens to state$ and broadcasts to all pop-outs
 * - **Change Detection**: OnPush strategy with manual markForCheck()
 * - **Cleanup**: Closes all pop-outs on beforeunload (page refresh/close)
 *
 * **Configuration**: Injected via DOMAIN_CONFIG token
 * - Works with any domain (Automobile, Agriculture, Physics, etc.)
 * - Domain config defines: filters, adapters, table columns, charts
 * - No hardcoded domain logic - all driven by config
 *
 * **Observable Pattern**:
 * - state$ from ResourceManagementService → broadcasts to pop-outs
 * - Pop-out messages received → update URL → trigger state$ → components re-render
 * - Messages flow: URL → state$ → BroadcastChannel → pop-out components
 *
 * @template TFilters - Domain-specific filter model (e.g., AutoSearchFilters)
 * @template TData - Domain-specific data model (e.g., VehicleResult)
 * @template TStatistics - Domain-specific statistics (e.g., VehicleStatistics)
 *
 * @example
 * ```typescript
 * // Works with any domain - same component, different configs
 * // Automobile domain
 * // <app-discover></app-discover> with AutomobileConfig
 *
 * // Agriculture domain (same component, different config)
 * // <app-discover></app-discover> with AgricultureConfig
 * ```
 */
@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResourceManagementService]
})
export class DiscoverComponent<TFilters = any, TData = any, TStatistics = any>
  implements OnInit, OnDestroy {
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

  constructor(
    @Inject(DOMAIN_CONFIG) domainConfig: DomainConfig<any, any, any>,
    public resourceService: ResourceManagementService<
      TFilters,
      TData,
      TStatistics
    >,
    private popOutContext: PopOutContextService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private urlStateService: UrlStateService
  ) {
    // Store injected config (works with any domain)
    this.domainConfig = domainConfig as DomainConfig<
      TFilters,
      TData,
      TStatistics
    >;
  }

  /**
   * Angular lifecycle hook - Initialize component
   *
   * **Initialization Sequence**:
   * 1. Initialize PopOutContextService as parent window
   * 2. Set up beforeunload handler to close pop-outs on page refresh
   * 3. Subscribe to pop-out context messages
   * 4. Subscribe to pop-out BroadcastChannel messages via RxJS Subject
   * 5. Subscribe to ResourceManagementService.state$ and broadcast to all pop-outs
   *
   * **Observable Subscriptions**:
   * - popOutContext.getMessages$(): Pop-out context messages from PopOutContextService
   * - popoutMessages$: BroadcastChannel messages wrapped in RxJS Subject
   * - resourceService.state$: State changes that need to broadcast to pop-outs
   *
   * **Why RxJS Subject for BroadcastChannel?**
   * BroadcastChannel callbacks run outside Angular's zone, bypassing change detection.
   * By pushing events into popoutMessages$ Subject, we bring them into Angular zone
   * so Angular automatically triggers change detection and component updates.
   *
   * **Memory Management**:
   * All subscriptions are cleaned up via takeUntil(destroy$) in ngOnDestroy.
   */
  ngOnInit(): void {
    console.log('[Discover] ngOnInit() called');

    // STEP 1: Initialize PopOutContextService as parent (main) window
    // This marks the service as "not a pop-out" (as opposed to PanelPopoutComponent)
    // Allows PopOutContextService to distinguish main window from pop-outs
    this.popOutContext.initializeAsParent();
    console.log('[Discover] Initialized as parent window');

    // STEP 3: Close all pop-outs when user refreshes/closes main window
    // beforeunload is more reliable than unload for cleanup
    // Ensures pop-out windows are explicitly closed before main window unloads
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    console.log('[Discover] beforeunload handler attached');

    // STEP 4: Listen for messages from pop-outs via PopOutContextService
    // PopOutContextService maintains a global subscription to BroadcastChannel
    // This captures any messages sent by pop-outs (PANEL_READY, etc.)
    this.popOutContext
      .getMessages$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        console.log('[Discover] PopOutContextService message received:', message);
        this.handlePopOutMessage('', message);
      });
    console.log('[Discover] Subscribed to popOutContext messages');

    // STEP 5: Subscribe to pop-out BroadcastChannel messages
    // BroadcastChannel.onmessage callbacks run OUTSIDE Angular zone
    // We push them into popoutMessages$ Subject to bring them INTO Angular zone
    // This ensures Angular detects changes and re-renders components
    // Each panel's popOutPanel() method sets up channel.onmessage listener
    this.popoutMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ panelId, event }) => {
        console.log('[Discover] BroadcastChannel message from panel:', panelId, event.data);
        this.handlePopOutMessage(panelId, event.data);
      });
    console.log('[Discover] Subscribed to popoutMessages$ subject');

    // STEP 6: Broadcast state changes to all open pop-outs
    // URL-First Architecture: Main window is source of truth
    // Flow: URL change → ResourceManagementService.fetchData() →
    //       state$ emits → broadcastStateToPopOuts() → BroadcastChannel →
    //       pop-outs' ResourceManagementService.syncStateFromExternal() → pop-out components re-render
    // This subscription fires every time state$ emits (filters, results, loading, error, statistics)
    this.resourceService.state$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      console.log('[Discover] State changed, broadcasting to pop-outs:', state);
      this.broadcastStateToPopOuts(state);
    });
    console.log('[Discover] Subscribed to resourceService.state$ for broadcasting');

    // Note: URL parameter broadcasting to pop-outs is now handled exclusively through STATE_UPDATE
    // messages (broadcastStateUpdateToPopOuts). Pop-out Query Control subscribes to STATE_UPDATE
    // via BroadcastChannel and extracts filters from the state payload.
    // Previous URL_PARAMS_SYNC mechanism was redundant and has been removed (Session 40).
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
      'statistics-panel': 'Statistics',
      'results-table': 'Results'
    };
    return titleMap[panelId] || panelId;
  }

  /**
   * Get panel type for routing by panel ID
   *
   * @param panelId - Panel identifier
   * @returns Panel type for pop-out routing
   */
  getPanelType(panelId: string): string {
    const typeMap: { [key: string]: string } = {
      'query-control': 'query-control',
      'statistics-panel': 'statistics',
      'results-table': 'results'
    };
    return typeMap[panelId] || panelId;
  }

  /**
   * Pop out a panel to a separate window
   *
   * @param panelId - Panel identifier (e.g., 'query-control', 'statistics-panel', 'results-table')
   * @param panelType - Panel type for routing (e.g., 'query-control', 'statistics', 'results')
   */
  popOutPanel(panelId: string, panelType: string): void {
    console.log(`[Discover] popOutPanel() called - panelId: ${panelId}, panelType: ${panelType}`);

    // Check if already popped out
    if (this.poppedOutPanels.has(panelId)) {
      console.warn(`[Discover] Panel ${panelId} is already popped out`);
      return;
    }

    // Build pop-out URL with query parameter to indicate this is a pop-out
    // Same app URL, but with ?popout=panelId flag that AppComponent detects to hide header
    // This approach is used by GoldenLayout and other layout libraries - same app, different UI mode
    const url = `/panel/${this.gridId}/${panelId}/${panelType}?popout=${panelId}`;
    console.log(`[Discover] Opening pop-out window at URL: ${url}`);

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
    console.log(`[Discover] window.open() returned:`, popoutWindow ? 'SUCCESS' : 'BLOCKED');

    if (!popoutWindow) {
      // Pop-up blocked
      console.error(`[Discover] Pop-up BLOCKED for panel: ${panelId}`);
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
    console.log(`[Discover] Marked panel as popped out. Total popped out: ${this.poppedOutPanels.size}`);

    // Set up BroadcastChannel for this panel
    const channel = this.popOutContext.createChannelForPanel(panelId);
    console.log(`[Discover] Created BroadcastChannel for panel: ${panelId}`);

    // Listen for messages from pop-out (Observable Pattern)
    // Push browser API events to RxJS Subject for handling in Angular zone
    channel.onmessage = event => {
      console.log(`[Discover] BroadcastChannel.onmessage received from ${panelId}:`, event.data);
      this.popoutMessages$.next({ panelId, event });
    };
    console.log(`[Discover] Set up channel.onmessage listener for panel: ${panelId}`);

    // Monitor for window close
    const checkInterval = window.setInterval(() => {
      if (popoutWindow.closed) {
        console.log(`[Discover] Detected pop-out window closed for panel: ${panelId}`);
        this.onPopOutClosed(panelId, channel, checkInterval);
      }
    }, 500);
    console.log(`[Discover] Set up window close monitor for panel: ${panelId}`);

    // Store reference
    this.popoutWindows.set(panelId, {
      window: popoutWindow,
      channel,
      checkInterval,
      panelId,
      panelType
    });
    console.log(`[Discover] Stored popout reference. Total popouts: ${this.popoutWindows.size}`);

    // Trigger change detection to hide panel
    this.cdr.markForCheck();

    console.log(`[Discover] ✅ Successfully popped out panel: ${panelId}`);
  }

  /**
   * Handle messages from pop-out windows
   *
   * @param panelId - Panel identifier
   * @param message - Message from pop-out
   */
  private async handlePopOutMessage(_panelId: string, message: any): Promise<void> {
    console.log(
      `[Discover] Message from pop-out:`,
      message.type,
      message.payload
    );

    switch (message.type) {
      case PopOutMessageType.PANEL_READY:
        // Pop-out is ready - broadcast current state immediately
        // (state$ subscription only fires on changes, not on initial subscription)
        console.log('[Discover] Pop-out ready, broadcasting current state');
        const currentState = this.resourceService.getCurrentState();
        this.broadcastStateToPopOuts(currentState);
        break;

      case PopOutMessageType.URL_PARAMS_CHANGED:
        // Pop-out sent URL params change - update main window URL
        console.log(
          '[Discover] URL params change from pop-out - RECEIVED PARAMS:',
          message.payload?.params
        );
        if (message.payload?.params) {
          // Update the single source of truth (the URL)
          // This triggers the normal state update flow:
          // 1. URL change detected by resourceService.watchUrlChanges()
          // 2. fetchData() API call happens
          // 3. API response updates state with results + statistics
          // 4. state$ subscription fires and broadcasts complete state to pop-outs
          // DO NOT manually broadcast incomplete state here - that causes race conditions
          // where pop-outs receive state with empty results before API completes
          console.log('[Discover] URL update will trigger state$ subscription and broadcast');
          await this.urlStateService.setParams(message.payload.params);
          console.log('[Discover] urlStateService.setParams() called in main window.');
        }
        break;

      case PopOutMessageType.CLEAR_ALL_FILTERS:
        // Pop-out requested to clear all filters - clear all URL params
        console.log('[Discover] Clear all filters from pop-out');
        await this.urlStateService.clearParams();
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
  private onPopOutClosed(
    panelId: string,
    channel: BroadcastChannel,
    checkInterval: number
  ): void {
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
  async onUrlParamsChange(params: Params): Promise<void> {
    await this.urlStateService.setParams(params);
  }

  /**
   * Handle clear all filters request
   * Clears all URL query parameters
   */
  async onClearAllFilters(): Promise<void> {
    await this.urlStateService.clearParams();
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
