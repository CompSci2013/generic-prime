import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

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
 * DependencyGraphComponent
 *
 * Comprehensive visualization of all dependencies in the generic-prime application.
 * Displays a directed acyclic graph (DAG) with:
 * - Every npm dependency from package.json
 * - Framework services and their relationships
 * - Framework components and their dependencies
 * - Feature components and their integration points
 * - Domain-specific configurations and adapters
 * - Build tools, testing frameworks, and external libraries
 *
 * The graph uses Cytoscape.js with the Dagre layout algorithm for hierarchical visualization.
 */
@Component({
  selector: 'app-dependency-graph',
  templateUrl: './dependency-graph.component.html',
  styleUrls: ['./dependency-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('cyContainer', { static: false }) cyContainer!: ElementRef<HTMLDivElement>;

  cy!: Core;
  selectedNode: DependencyNode | null = null;
  stats = DEPENDENCY_STATS;
  showLegend = true;
  showFilters = true;
  selectedCategory = '';
  searchText = '';

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

  ngOnInit(): void {
    // Initialization complete
  }

  ngAfterViewInit(): void {
    this.initializeCytoscape();
  }

  private initializeCytoscape(): void {
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
      wheelSensitivity: 0.75,
      pixelRatio: window.devicePixelRatio,
    });

    // Add event listeners
    this.cy.on('tap', (evt: any) => {
      if (evt.target.isNode()) {
        const nodeId = evt.target.id();
        this.selectedNode = ALL_DEPENDENCY_NODES.find(n => n.id === nodeId) || null;

        // Visual feedback - highlight selected node and its neighbors
        this.cy.elements().removeClass('selected-node adjacent-node');
        const node = evt.target;
        node.addClass('selected-node');
        node.connectedEdges().connectedNodes().addClass('adjacent-node');
      } else {
        this.selectedNode = null;
        this.cy.elements().removeClass('selected-node adjacent-node');
      }
    });

    // Fit to view on initialization
    setTimeout(() => {
      this.fitToView();
    }, 500);
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
          'color': '#fff',
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
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.COMPONENTS}`,
        style: {
          'background-color': '#F8B195',
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.FEATURES}`,
        style: {
          'background-color': '#B4A7D6',
          'color': '#fff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.MODELS}`,
        style: {
          'background-color': '#95E1D3',
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.DOMAIN}`,
        style: {
          'background-color': '#FFD93D',
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.ADAPTERS}`,
        style: {
          'background-color': '#6BCB77',
          'color': '#fff',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.CHARTS}`,
        style: {
          'background-color': '#A8E6CF',
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.BUILD}`,
        style: {
          'background-color': '#E8DAEF',
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.TEST}`,
        style: {
          'background-color': '#D7BDE2',
          'color': '#000',
        }
      },
      {
        selector: `node.${LAYER_GROUPS.EXTERNAL}`,
        style: {
          'background-color': '#F5B7B1',
          'color': '#000',
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
          'text-background-color': '#fff',
          'text-background-opacity': 0.8,
          'text-background-padding': '2px',
          'font-size': '9px',
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
    if (this.cy && this.cy.elements(':visible').length > 0) {
      this.cy.fit(':visible', 50);
    }
  }

  resetView(): void {
    this.selectedNode = null;
    this.cy.elements().removeClass('selected-node adjacent-node');
    this.searchText = '';
    this.categoryFilters.forEach(f => f.visible = true);
    this.updateNodeVisibility();
  }

  zoomIn(): void {
    this.cy.zoom(this.cy.zoom() * 1.2);
  }

  zoomOut(): void {
    this.cy.zoom(this.cy.zoom() / 1.2);
  }

  toggleLegend(): void {
    this.showLegend = !this.showLegend;
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
}
