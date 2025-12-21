import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * User preferences service for persisting application state
 *
 * Manages user preferences with localStorage backend, providing:
 * - Panel order persistence (drag-drop reorder)
 * - Collapsed panel state persistence
 * - Graceful handling of quota errors and private browsing
 * - Domain-aware key namespacing
 *
 * **Architecture**:
 * - Uses BehaviorSubject for reactive state management
 * - localStorage for cross-session persistence
 * - Domain-aware keys to support multiple domains (automobiles, physics, etc.)
 * - Graceful degradation when storage unavailable (private browsing, quota exceeded)
 *
 * **Storage Format**:
 * ```
 * localStorage['prefs:automobiles:panelOrder'] = ['query-control', 'statistics-panel', ...]
 * localStorage['prefs:automobiles:collapsedPanels'] = ['query-control', 'statistics-panel']
 * ```
 *
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private prefs: UserPreferencesService) {}
 *
 * // Get current panel order
 * this.prefs.getPanelOrder().subscribe(order => {
 *   this.panelOrder = order;
 * });
 *
 * // Save new order after drag-drop
 * this.prefs.savePanelOrder(newOrder);
 *
 * // Get collapsed panels
 * this.prefs.getCollapsedPanels().subscribe(collapsed => {
 *   // update UI
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  /**
   * Default panel order when localStorage is empty
   * @private
   */
  private readonly DEFAULT_PANEL_ORDER = [
    'query-control',
    'manufacturer-model-picker',
    'statistics-panel',
    'results-table'
  ];

  /**
   * Default collapsed panels (none by default)
   * @private
   */
  private readonly DEFAULT_COLLAPSED_PANELS: string[] = [];

  /**
   * Current domain for key namespacing
   * Extracted from current route (e.g., 'automobiles', 'physics')
   * @private
   */
  private currentDomain = this.extractCurrentDomain();

  /**
   * BehaviorSubject for panel order state
   * Emits current order immediately on subscription
   * @private
   */
  private panelOrderSubject = new BehaviorSubject<string[]>(this.loadPanelOrder());

  /**
   * BehaviorSubject for collapsed panels state
   * Emits current collapsed panels immediately on subscription
   * @private
   */
  private collapsedPanelsSubject = new BehaviorSubject<string[]>(this.loadCollapsedPanels());

  /**
   * Storage availability flag
   * Set to false if localStorage is unavailable (private browsing, quota exceeded)
   * @private
   */
  private storageAvailable = this.checkStorageAvailable();

  constructor() {
    // Initialize subjects with loaded values
    this.panelOrderSubject.next(this.loadPanelOrder());
    this.collapsedPanelsSubject.next(this.loadCollapsedPanels());
  }

  /**
   * Get panel order observable
   * Emits current order immediately, then on every change
   *
   * @returns Observable of panel order array
   */
  getPanelOrder(): Observable<string[]> {
    return this.panelOrderSubject.asObservable();
  }

  /**
   * Get collapsed panels observable
   * Emits current collapsed panels immediately, then on every change
   *
   * @returns Observable of collapsed panel IDs
   */
  getCollapsedPanels(): Observable<string[]> {
    return this.collapsedPanelsSubject.asObservable();
  }

  /**
   * Save panel order to preferences
   * Called after user drags panels to reorder
   *
   * @param order - New panel order array
   */
  savePanelOrder(order: string[]): void {
    // Update subject (triggers subscribers)
    this.panelOrderSubject.next(order);

    // Persist to localStorage if available
    if (this.storageAvailable) {
      try {
        const key = this.getPrefKey('panelOrder');
        localStorage.setItem(key, JSON.stringify(order));
      } catch (e) {
        // Handle quota exceeded or other storage errors
        this.handleStorageError(e);
      }
    }
  }

  /**
   * Save collapsed panels state to preferences
   * Called when user collapses/expands panels
   *
   * @param panels - Array of collapsed panel IDs
   */
  saveCollapsedPanels(panels: string[]): void {
    // Update subject (triggers subscribers)
    this.collapsedPanelsSubject.next(panels);

    // Persist to localStorage if available
    if (this.storageAvailable) {
      try {
        const key = this.getPrefKey('collapsedPanels');
        localStorage.setItem(key, JSON.stringify(panels));
      } catch (e) {
        // Handle quota exceeded or other storage errors
        this.handleStorageError(e);
      }
    }
  }

  /**
   * Reset preferences for current domain
   * Returns to default panel order and collapsed state
   *
   * @param domain - Optional domain to reset (defaults to current domain)
   */
  reset(domain?: string): void {
    const targetDomain = domain || this.currentDomain;

    if (this.storageAvailable) {
      try {
        const orderKey = this.getPrefKey('panelOrder', targetDomain);
        const collapsedKey = this.getPrefKey('collapsedPanels', targetDomain);

        localStorage.removeItem(orderKey);
        localStorage.removeItem(collapsedKey);
      } catch (e) {
        // Ignore errors on reset
      }
    }

    // Update subjects to defaults
    this.panelOrderSubject.next(this.DEFAULT_PANEL_ORDER);
    this.collapsedPanelsSubject.next(this.DEFAULT_COLLAPSED_PANELS);
  }

  /**
   * Load panel order from localStorage
   * Falls back to defaults if not found or if storage unavailable
   *
   * @private
   * @returns Panel order array
   */
  private loadPanelOrder(): string[] {
    if (!this.storageAvailable) {
      return this.DEFAULT_PANEL_ORDER;
    }

    try {
      const key = this.getPrefKey('panelOrder');
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate it's an array
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // JSON parse error or other issues - use default
    }

    return this.DEFAULT_PANEL_ORDER;
  }

  /**
   * Load collapsed panels from localStorage
   * Falls back to empty array (no panels collapsed) if not found
   *
   * @private
   * @returns Array of collapsed panel IDs
   */
  private loadCollapsedPanels(): string[] {
    if (!this.storageAvailable) {
      return this.DEFAULT_COLLAPSED_PANELS;
    }

    try {
      const key = this.getPrefKey('collapsedPanels');
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate it's an array
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // JSON parse error or other issues - use default
    }

    return this.DEFAULT_COLLAPSED_PANELS;
  }

  /**
   * Get storage key with domain prefix
   * Keys are namespaced per domain for multi-domain support
   *
   * @private
   * @param preference - Preference name (e.g., 'panelOrder')
   * @param domain - Optional domain (defaults to current domain)
   * @returns Namespaced storage key
   */
  private getPrefKey(preference: string, domain?: string): string {
    const targetDomain = domain || this.currentDomain;
    return `prefs:${targetDomain}:${preference}`;
  }

  /**
   * Check if localStorage is available
   * Returns false in private browsing mode or quota exceeded
   *
   * @private
   * @returns True if localStorage is available and writable
   */
  private checkStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      // Private browsing or quota exceeded
      return false;
    }
  }

  /**
   * Handle storage errors gracefully
   * Logs error and disables storage for future operations
   *
   * @private
   * @param error - Error from localStorage operation
   */
  private handleStorageError(error: any): void {
    // Disable storage for future operations
    this.storageAvailable = false;

    // Log in debug mode only (don't pollute console in production)
    if (isDevMode()) {
      console.debug('[UserPreferencesService] Storage error:', error);
    }
  }

  /**
   * Extract current domain from URL or route
   * Returns 'automobiles' from '/automobiles/discover'
   * Returns 'physics' from '/physics/discover'
   *
   * @private
   * @returns Current domain name
   */
  private extractCurrentDomain(): string {
    // Get domain from current URL path
    const path = window.location.pathname;

    // Match patterns like /automobiles/, /physics/, etc.
    const match = path.match(/\/([a-z]+)\//);
    if (match && match[1]) {
      return match[1];
    }

    // Default to 'automobiles' if extraction fails
    return 'automobiles';
  }
}
