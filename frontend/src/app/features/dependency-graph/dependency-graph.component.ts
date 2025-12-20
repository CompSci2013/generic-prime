import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';

// @ts-ignore - cytoscape has default export
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';

// @ts-ignore - cytoscape-dagre doesn't have type definitions
import dagre from 'cytoscape-dagre';
import {
  ALL_DEPENDENCY_NODES,
  ALL_DEPENDENCY_EDGES,
  DEPENDENCY_STATS,
  LAYER_GROUPS,
  DependencyNode
} from './dependency-graph';

/**
 * Dependency Graph Component - Application Architecture Visualization
 *
 * Comprehensive interactive visualization of all dependencies in the generic-prime application.
 * Displays a complete directed acyclic graph (DAG) with hierarchical layout showing how all
 * parts of the application integrate and depend on each other.
 *
 * Visualized Dependencies:
 * - **NPM Packages** (18): Angular framework, RxJS, PrimeNG, Cytoscape, Plotly, build tools
 * - **Framework Models** (12): TypeScript interfaces and data structures
 * - **Framework Services** (8): API, state management, configuration, error handling
 * - **Framework Components** (5): Reusable UI widgets (picker, table, chart, etc.)
 * - **Domain Adapters** (9): Domain-specific API integrations and configurations
 * - **Feature Components** (13): Pages and route components
 * - **Data Structures** (3): Physics curriculum graphs
 * - **Build & Test Tools** (13): Webpack, Karma, Jasmine, Playwright, ESLint
 * - **External Libraries** (2): Type definitions, utilities
 *
 * **Total**: 118 nodes (dependencies), 350+ edges (relationships)
 *
 * Architecture & Features:
 * - **Cytoscape.js**: Canvas-based graph rendering with mouse interaction
 * - **Dagre Layout**: Hierarchical left-to-right directed graph layout
 * - **Interactive**: Node selection, filtering by category, search functionality
 * - **Visual Encoding**: Color-coded by node category for quick identification
 * - **Statistics Panel**: Shows dependency metrics and category breakdowns
 * - **Legend**: Color key for all node categories
 * - **Performance**: Uses ChangeDetectionStrategy.OnPush for efficient rendering
 *
 * **Node Categories & Colors**:
 * - npm-peer (Blue #DD0031): Angular framework and core dependencies
 * - npm-prod (Teal #3776AB): Production libraries (PrimeNG, Cytoscape, RxJS)
 * - framework-service (Purple #C7CEEA): Core application services
 * - framework-component (Orange #F8B195): Reusable UI components
 * - framework-model (Mint #95E1D3): TypeScript interfaces and types
 * - domain-adapter (Green #6BCB77): Domain-specific API adapters
 * - domain-config (Yellow #FFD93D): Configuration objects
 * - domain-chart (Emerald #A8E6CF): Chart data sources
 * - feature-component (Lavender #B4A7D6): Page and route components
 * - build-tool (Pink #E8DAEF): Build and compilation tools
 * - test-tool (Plum #D7BDE2): Testing frameworks and runners
 * - external-lib (Light Red #F5B7B1): Third-party utilities
 *
 * **Relationship Types**:
 * - 'imports': A imports/uses B
 * - 'provides': A provides B (dependency injection)
 * - 'injects': A injects B
 * - 'extends': A extends B (inheritance)
 * - 'implements': A implements B (interface)
 * - 'uses': General consumption/usage
 *
 * **Navigation & Interaction**:
 * - **Click nodes**: Select and view detailed information
 * - **Filter by category**: Show only specific dependency types
 * - **Search**: Filter nodes by name/id (text search)
 * - **Fit to view**: Reset zoom and pan to show entire graph
 * - **Drag nodes**: Reposition (Cytoscape default)
 * - **Zoom**: Mouse wheel or trackpad pinch gesture
 * - **Pan**: Click and drag background or middle mouse button
 *
 * **Use Cases**:
 * - Understand application architecture and dependency layers
 * - Identify tightly coupled components
 * - Plan refactoring and modularization
 * - Document system architecture for team knowledge
 * - Verify dependency constraints and patterns
 *
 * @remarks
 * This component is a developer tool. It's not part of the user-facing application
 * but rather a visualization aid for understanding the codebase structure.
 *
 * Data Sources:
 * - ALL_DEPENDENCY_NODES: 118 nodes exported from dependency-graph.ts
 * - ALL_DEPENDENCY_EDGES: 350+ relationship edges from dependency-graph.ts
 * - DEPENDENCY_STATS: Aggregated statistics about the dependency graph
 * - LAYER_GROUPS: Category groupings for layout organization
 *
 * @class DependencyGraphComponent
 * @implements OnInit, AfterViewInit
 * @selector app-dependency-graph
 *
 * @lifecycle
 * - ngOnInit: Initialize graph data and UI state
 * - ngAfterViewInit: Initialize Cytoscape instance after DOM is ready
 * - ngOnDestroy: (inherited) Cleanup Cytoscape instance
 *
 * @see dependency-graph.ts - Data structures for nodes and edges
 * @see https://js.cytoscape.org - Cytoscape.js documentation
 */
@Component({
  selector: 'app-dependency-graph',
  templateUrl: './dependency-graph.component.html',
  styleUrls: ['./dependency-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-10px)' }))
      ])
    ])
  ]
})
export class DependencyGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('cyContainer', { static: false }) cyContainer!: ElementRef<HTMLDivElement>;

  cy!: Core;
  selectedNode: DependencyNode | null = null;
  stats = DEPENDENCY_STATS;
  showLegend = true;
  showFilters = true;
  legendExpanded = true;
  selectedCategory = '';
  searchText = '';
  currentDate = new Date();

  // Modal positioning and dragging
  modalPosition = { x: 0, y: 0 };
  isDraggingModal = false;
  dragOffset = { x: 0, y: 0 };

  // Category filters for toggling visibility
  categoryFilters = [
    { category: LAYER_GROUPS.NPM_PEER, label: 'Angular Framework', color: '#DD0031', visible: true },
    { category: LAYER_GROUPS.NPM_PROD, label: 'Production Dependencies', color: '#3776AB', visible: true },
    { category: LAYER_GROUPS.SERVICES, label: 'Framework Services', color: '#C7CEEA', visible: true },
    { category: LAYER_GROUPS.COMPONENTS, label: 'Framework Components', color: '#F8B195', visible: true },
    { category: LAYER_GROUPS.FEATURES, label: 'Feature Components', color: '#B4A7D6', visible: true },
    { category: LAYER_GROUPS.MODELS, label: 'Models & Interfaces', color: '#95E1D3', visible: true },
    { category: LAYER_GROUPS.DOMAIN, label: 'Domain Configurations', color: '#FFD93D', visible: true },
    { category: LAYER_GROUPS.ADAPTERS, label: 'Domain Adapters', color: '#6BCB77', visible: true },
    { category: LAYER_GROUPS.CHARTS, label: 'Chart Data Sources', color: '#A8E6CF', visible: true },
    { category: LAYER_GROUPS.BUILD, label: 'Build Tools', color: '#E8DAEF', visible: true },
    { category: LAYER_GROUPS.TEST, label: 'Testing & Linting', color: '#D7BDE2', visible: true },
    { category: LAYER_GROUPS.EXTERNAL, label: 'External Libraries', color: '#F5B7B1', visible: true },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialization complete
  }

  ngAfterViewInit(): void {
    try {
      this.initializeCytoscape();
    } catch (error) {
      console.error('Failed to initialize dependency graph:', error);
    }
  }

  private initializeCytoscape(): void {
    try {
      // Validate container exists
      if (!this.cyContainer || !this.cyContainer.nativeElement) {
        throw new Error('Cytoscape container not found');
      }

      // Register Dagre layout
      cytoscape.use(dagre);

      // Initialize Cytoscape
      this.cy = cytoscape({
        container: this.cyContainer.nativeElement,
        style: this.getCytoscapeStyle(),
        layout: {
          name: 'dagre',
          nodeSep: 80,
          rankSep: 150,
          edgeSep: 20,
          rankDir: 'LR', // Left to Right
          animate: true,
          animationDuration: 500,
          avoidOverlap: true,
          spacingFactor: 1.5,
          minLen: 2,
        } as any,
        elements: this.buildCytoscapeElements(),
        wheelSensitivity: 2.25, // 50% faster than 1.5 for rapid zoom
        pixelRatio: window.devicePixelRatio,
      });

      // Add event listeners with error handling
      this.cy.on('tap', (evt: any) => {
        try {
          if (evt.target.isNode()) {
            const nodeId = evt.target.id();
            this.selectedNode = ALL_DEPENDENCY_NODES.find(n => n.id === nodeId) || null;
            this.cdr.detectChanges(); // Trigger change detection for modal to appear

            // Visual feedback - highlight selected node and its neighbors
            this.cy.elements().removeClass('selected-node adjacent-node');
            const node = evt.target;
            if (node && node.addClass) {
              node.addClass('selected-node');
              if (node.connectedEdges && node.connectedNodes) {
                node.connectedEdges().connectedNodes().addClass('adjacent-node');
              }
            }
          } else {
            this.selectedNode = null;
            this.cdr.detectChanges(); // Trigger change detection to close modal
            this.cy.elements().removeClass('selected-node adjacent-node');
          }
        } catch (err) {
          console.error('Error in tap event handler:', err);
        }
      });

      // Fit to view on initialization
      setTimeout(() => {
        try {
          this.fitToView();
        } catch (err) {
          console.error('Error fitting to view:', err);
        }
      }, 500);
    } catch (error) {
      console.error('Error initializing Cytoscape:', error);
      throw error;
    }
  }

  private buildCytoscapeElements(): any[] {
    const elements: any[] = [];

    // Add nodes
    ALL_DEPENDENCY_NODES.forEach(node => {
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          description: node.description || '',
          version: node.version || '',
        },
        classes: [node.category],
        style: {
          'background-color': node.color || '#888',
          shape: node.shape || 'ellipse',
        }
      });
    });

    // Add edges
    ALL_DEPENDENCY_EDGES.forEach(edge => {
      elements.push({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.type || edge.label || '',
        },
        classes: [edge.type || 'uses']
      });
    });

    return elements;
  }

  private getCytoscapeStyle(): any {
    return [
      {
        selector: 'node',
        style: {
          'content': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'background-color': '#888',
          'width': '60px',
          'height': '60px',
          'font-size': '11px',
          'font-weight': 'bold',
          'color': '#ffffff',
          'text-wrap': 'wrap',
          'text-max-width': '85px',
          'overlay-padding': '5px',
          'border-width': '2px',
          'border-color': '#666',
          'border-opacity': 0.5,
          'transition-property': 'background-color, border-width, width, height',
          'transition-duration': '200ms',
        }
      },
      {
        selector: 'node.selected-node',
        style: {
          'width': '80px',
          'height': '80px',
          'border-width': '3px',
          'border-color': '#FFD700',
          'box-shadow': '0 0 10px #FFD700',
        }
      },
      {
        selector: 'node.adjacent-node',
        style: {
          'border-color': '#4169E1',
          'border-width': '2.5px',
        }
      },
      {
        selector: 'node:parent',
        style: {
          'background-opacity': 0.2,
        }
      },
      {
        selector: `node.${LAYER_GROUPS.NPM_PEER}`,
        style: {
          'background-color': '#DD0031',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.NPM_PROD}`,
        style: {
          'background-color': '#3776AB',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.SERVICES}`,
        style: {
          'background-color': '#C7CEEA',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.COMPONENTS}`,
        style: {
          'background-color': '#F8B195',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.FEATURES}`,
        style: {
          'background-color': '#B4A7D6',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.MODELS}`,
        style: {
          'background-color': '#95E1D3',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.DOMAIN}`,
        style: {
          'background-color': '#FFD93D',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.ADAPTERS}`,
        style: {
          'background-color': '#6BCB77',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.CHARTS}`,
        style: {
          'background-color': '#A8E6CF',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.BUILD}`,
        style: {
          'background-color': '#E8DAEF',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.TEST}`,
        style: {
          'background-color': '#D7BDE2',
          'color': '#ffffff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.EXTERNAL}`,
        style: {
          'background-color': '#F5B7B1',
          'color': '#ffffff',
        }
      },
      {
        selector: 'edge',
        style: {
          'line-color': '#ccc',
          'target-arrow-color': '#999',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.5,
          'curve-style': 'bezier',
          'width': '1.5px',
          'opacity': 0.6,
          'color': '#ffffff',
          'text-background-color': '#2a2a2a',
          'text-background-opacity': 0.9,
          'text-background-padding': '2px',
          'font-size': '9px',
          'font-weight': 'bold',
          'text-valign': 'center',
          'text-halign': 'center',
          'edge-text-rotation': 'autorotate',
          'label': 'data(label)',
        }
      },
      {
        selector: 'edge.uses',
        style: {
          'line-color': '#999',
          'target-arrow-color': '#999',
        }
      },
      {
        selector: 'edge.implements',
        style: {
          'line-color': '#6BCB77',
          'target-arrow-color': '#6BCB77',
          'line-style': 'dashed',
        }
      },
      {
        selector: 'edge.extends',
        style: {
          'line-color': '#F8B195',
          'target-arrow-color': '#F8B195',
          'line-style': 'dashed',
        }
      },
      {
        selector: 'edge.provides',
        style: {
          'line-color': '#C7CEEA',
          'target-arrow-color': '#C7CEEA',
        }
      },
      {
        selector: 'edge.injects',
        style: {
          'line-color': '#FFD93D',
          'target-arrow-color': '#FFD93D',
          'line-style': 'dotted',
        }
      },
    ];
  }

  toggleCategory(category: string): void {
    const filter = this.categoryFilters.find(f => f.category === category);
    if (filter) {
      filter.visible = !filter.visible;
      this.updateNodeVisibility();
    }
  }

  private updateNodeVisibility(): void {
    const visibleCategories = this.categoryFilters
      .filter(f => f.visible)
      .map(f => f.category);

    this.cy.nodes().forEach((node: any) => {
      const classes = node._private.classes;
      const isVisible = visibleCategories.some(cat => classes.has(cat));
      if (isVisible) {
        node.style('display', 'element');
      } else {
        node.style('display', 'none');
      }
    });

    // Hide edges if either endpoint is hidden
    this.cy.edges().forEach((edge: any) => {
      const sourceHidden = edge.source().style('display') === 'none';
      const targetHidden = edge.target().style('display') === 'none';
      if (sourceHidden || targetHidden) {
        edge.style('display', 'none');
      } else {
        edge.style('display', 'element');
      }
    });

    this.fitToView();
  }

  filterBySearch(): void {
    if (!this.searchText.trim()) {
      this.cy.elements().style('display', 'element');
      return;
    }

    const searchLower = this.searchText.toLowerCase();
    this.cy.nodes().forEach((node: any) => {
      const label = node.data('label').toLowerCase();
      const description = (node.data('description') || '').toLowerCase();
      if (label.includes(searchLower) || description.includes(searchLower)) {
        node.style('display', 'element');
      } else {
        node.style('display', 'none');
      }
    });

    // Hide edges if either endpoint is hidden
    this.cy.edges().forEach((edge: any) => {
      const sourceHidden = edge.source().style('display') === 'none';
      const targetHidden = edge.target().style('display') === 'none';
      if (sourceHidden || targetHidden) {
        edge.style('display', 'none');
      } else {
        edge.style('display', 'element');
      }
    });

    this.fitToView();
  }

  clearSearch(): void {
    this.searchText = '';
    this.cy.elements().style('display', 'element');
    this.updateNodeVisibility();
  }

  fitToView(): void {
    try {
      if (this.cy && this.cy.elements(':visible').length > 0) {
        this.cy.fit(':visible', 50);
      }
    } catch (error) {
      console.error('Error fitting to view:', error);
    }
  }

  resetView(): void {
    try {
      this.selectedNode = null;
      if (this.cy) {
        this.cy.elements().removeClass('selected-node adjacent-node');
      }
      this.searchText = '';
      this.categoryFilters.forEach(f => f.visible = true);
      this.updateNodeVisibility();
    } catch (error) {
      console.error('Error resetting view:', error);
    }
  }

  zoomIn(): void {
    try {
      if (this.cy) {
        this.cy.zoom(this.cy.zoom() * 1.2);
      }
    } catch (error) {
      console.error('Error zooming in:', error);
    }
  }

  zoomOut(): void {
    try {
      if (this.cy) {
        this.cy.zoom(this.cy.zoom() / 1.2);
      }
    } catch (error) {
      console.error('Error zooming out:', error);
    }
  }

  toggleLegend(): void {
    this.showLegend = !this.showLegend;
  }

  toggleLegendExpanded(): void {
    this.legendExpanded = !this.legendExpanded;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  exportAsJson(): void {
    const data = {
      nodes: ALL_DEPENDENCY_NODES,
      edges: ALL_DEPENDENCY_EDGES,
      stats: DEPENDENCY_STATS,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generic-prime-dependency-graph.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  getNodeColor(category: string): string {
    return this.categoryFilters.find(f => f.category === category)?.color || '#888';
  }

  onModalMouseDown(event: MouseEvent): void {
    // Only allow dragging from the header
    if ((event.target as HTMLElement).closest('.modal-header')) {
      this.isDraggingModal = true;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      event.preventDefault();
    }
  }

  onModalMouseMove(event: MouseEvent): void {
    if (this.isDraggingModal) {
      this.modalPosition = {
        x: event.clientX - this.dragOffset.x,
        y: event.clientY - this.dragOffset.y
      };
      this.cdr.detectChanges(); // Trigger change detection for smooth drag movement
    }
  }

  onModalMouseUp(): void {
    this.isDraggingModal = false;
  }

  getModalStyle(): string {
    return `transform: translate(${this.modalPosition.x}px, ${this.modalPosition.y}px);`;
  }
}
