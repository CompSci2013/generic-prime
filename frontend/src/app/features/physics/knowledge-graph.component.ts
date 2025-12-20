/**
 * Knowledge Graph Component
 *
 * @fileoverview
 * Generic reusable component for displaying interactive knowledge graphs using Cytoscape.js.
 * This component serves as a foundation for visualizing concept relationships, topic hierarchies,
 * and dependency networks in any subject domain.
 *
 * @remarks
 * Architecture:
 * - Accepts graph data via @Input properties (nodes and edges)
 * - Initializes Cytoscape.js instance with Dagre hierarchical layout
 * - Provides interactive features: pan, zoom, node selection, edge tooltips
 * - Handles window resize and cleanup on destroy
 * - Configurable title, subtitle, and back route
 *
 * Cytoscape Features:
 * - Dagre layout algorithm (left-to-right hierarchical)
 * - Node styling with color-coded levels
 * - Edge hover tooltips showing relationship types
 * - Click to select nodes and view details
 * - Fit-to-view button for centering graph
 * - Mouse wheel zoom and pan controls
 *
 * Template Features:
 * - Header with configurable title and subtitle
 * - Canvas wrapper for Cytoscape container
 * - Legend showing level color coding
 * - Info panel for selected node details
 * - Instructions for user interaction
 *
 * Styling:
 * - Dark theme with gradient background
 * - Level-based node coloring (foundational: blue, core: orange, advanced: pink)
 * - Animated entrance effects (fadeIn, slideIn)
 * - Responsive design with mobile breakpoints
 *
 * @example
 * ```html
 * <app-knowledge-graph
 *   [graphData]="myGraphData"
 *   [title]="'My Knowledge Graph'"
 *   [subtitle]="'Topic relationships'"
 *   [backRoute]="'/home'">
 * </app-knowledge-graph>
 * ```
 *
 * @see PhysicsConceptGraphComponent - Example usage
 * @see ClassicalMechanicsGraphComponent - Example usage
 *
 * @lifecycle
 * - ngOnInit: Initial logging
 * - ngAfterViewInit: Cytoscape initialization, event listeners setup
 * - ngOnDestroy: Cleanup listeners and Cytoscape instance
 *
 * @version 1.0
 * @since 2024
 */

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cytoscape = require('cytoscape');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dagre = require('cytoscape-dagre');

// Register the dagre layout
cytoscape.use(dagre);

/**
 * Represents a single node in the knowledge graph
 *
 * @interface KnowledgeNode
 * @property {string} id - Unique identifier for the node
 * @property {string} label - Display text for the node
 * @property {string} description - Detailed description shown on selection
 * @property {string} level - Categorization level for color coding
 * @property {string} [color] - Optional custom hex color
 */
export interface KnowledgeNode {
  id: string;
  label: string;
  description: string;
  level: string;
  color?: string;
}

/**
 * Represents a directed edge (relationship) between two nodes in a knowledge graph.
 *
 * Edges define the nature and direction of relationships between knowledge concepts,
 * topics, or entities. They are visualized as arrows in the Cytoscape.js graph with
 * optional labels describing the relationship type.
 *
 * @interface KnowledgeEdge
 * @property {string} source - ID of the source (origin) node. The edge originates from this node.
 * @property {string} target - ID of the target (destination) node. The edge points to this node.
 * @property {string} label - Descriptive label for the relationship type or connection name
 *           Common values:
 *           - 'prerequisite': Target requires source as prior knowledge
 *           - 'foundation': Source provides conceptual basis for target
 *           - 'extends': Target builds upon and extends knowledge from source
 *           - 'related': Conceptual or contextual connection between nodes
 *           - 'implements': Source implements or provides target interface/service
 *           - 'depends-on': Source depends on target for functionality
 *
 * @remarks
 * The edge is directional: source → target. Visual representation shows an arrow
 * pointing from source to target node. The label is displayed on hover in the UI.
 *
 * @example
 * {
 *   source: 'vectors-calculus',
 *   target: 'newtonian-mechanics',
 *   label: 'prerequisite'
 * }
 *
 * @see KnowledgeNode - Node interface paired with this edge
 * @see KnowledgeGraphComponent - Component that visualizes edges
 */
export interface KnowledgeEdge {
  source: string;
  target: string;
  label: string;
}

/**
 * Complete graph data structure containing all nodes and edges
 *
 * @interface KnowledgeGraphData
 * @property {KnowledgeNode[]} nodes - All nodes in the graph
 * @property {KnowledgeEdge[]} edges - All edges connecting nodes
 */
export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

/**
 * Generic Knowledge Graph Component
 *
 * Renders an interactive Cytoscape.js visualization from provided graph data.
 * Supports pan, zoom, node selection, and edge relationship display.
 */
@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrls: ['./knowledge-graph.component.scss']
})
export class KnowledgeGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cytoscapeContainer') containerRef!: ElementRef<HTMLDivElement>;
  @Input() graphData!: KnowledgeGraphData;
  @Input() title = 'Knowledge Graph';
  @Input() subtitle = '';
  @Input() backRoute = '/physics';

  selectedNode: KnowledgeNode | null = null;
  hoveredEdgeLabel: string | null = null;
  tooltipPos: { top: string; left: string } | null = null;

  private cy: any;
  private resizeListener!: () => void;
  private mouseMoveListener!: (e: MouseEvent) => void;

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('[KnowledgeGraph] ngOnInit()');
  }

  ngAfterViewInit(): void {
    console.log('[KnowledgeGraph] ngAfterViewInit()');
    console.log('[KnowledgeGraph] Graph data:', this.graphData);
    console.log('[KnowledgeGraph] Container ref:', this.containerRef);

    if (!this.containerRef) {
      console.error('Container ref not available');
      return;
    }

    if (!this.graphData) {
      console.error('Graph data not available');
      return;
    }

    console.log('[KnowledgeGraph] Building elements with', this.graphData.nodes.length, 'nodes and', this.graphData.edges.length, 'edges');
    console.log('[KnowledgeGraph] Container element:', this.containerRef.nativeElement);
    console.log('[KnowledgeGraph] Container size:', this.containerRef.nativeElement.offsetWidth, 'x', this.containerRef.nativeElement.offsetHeight);
    console.log('[KnowledgeGraph] Container computed style:', window.getComputedStyle(this.containerRef.nativeElement));

    // Ensure the container has proper display and sizing
    const container = this.containerRef.nativeElement;
    if (container.offsetHeight === 0 || container.offsetWidth === 0) {
      console.warn('[KnowledgeGraph] Container has zero dimensions, attempting to force layout recalculation');
      // Force reflow
      void container.offsetHeight;
    }

    // Convert data to Cytoscape format
    const elements = this.buildCytoscapeElements();
    console.log('[KnowledgeGraph] Created elements:', elements.length);

    try {
      // Initialize Cytoscape
      this.cy = cytoscape({
        container: container,
        elements: elements,
        style: this.getCytoscapeStyle(),
        layout: {
          name: 'dagre',
          rankDir: 'LR',
          spacingFactor: 1.5,
          nodeSep: 100,
          rankSep: 150,
          animate: false,
          animationDuration: 0,
          fit: true,
          padding: 40
        },
        wheelSensitivity: 0.75,
        panningEnabled: true,
        userPanningEnabled: true,
        zoomingEnabled: true,
        userZoomingEnabled: true
      });
      console.log('[KnowledgeGraph] Cytoscape initialized successfully');

      // Add event listeners for nodes
      this.cy.on('tap', 'node', (evt: any) => {
        const node = evt.target;
        const nodeId = node.id();
        this.selectedNode =
          this.graphData!.nodes.find((n) => n.id === nodeId) || null;
        console.log('[KnowledgeGraph] Selected node:', nodeId);
      });

      // Add event listeners for edges - hover to show tooltip
      this.cy.on('mouseover', 'edge', (evt: any) => {
        const edge = evt.target;
        this.hoveredEdgeLabel = edge.data('label');
      });

      this.cy.on('mouseout', 'edge', () => {
        this.hoveredEdgeLabel = null;
      });

      // Add click outside graph to deselect
      this.cy.on('tap', (evt: any) => {
        if (evt.target === this.cy) {
          this.selectedNode = null;
        }
      });

      // Add mouse move listener to track cursor position for tooltip
      this.mouseMoveListener = (e: MouseEvent) => {
        if (this.hoveredEdgeLabel) {
          this.tooltipPos = {
            left: e.clientX + 'px',
            top: (e.clientY + 12) + 'px'
          };
        }
      };
      document.addEventListener('mousemove', this.mouseMoveListener);

      // Handle window resize
      this.resizeListener = () => this.handleResize();
      window.addEventListener('resize', this.resizeListener);

      // Fit graph to container after a short delay to ensure rendering
      setTimeout(() => {
        this.cy.fit();
        console.log('[KnowledgeGraph] Graph fitted to view');
      }, 200);

      console.log('[KnowledgeGraph] Event listeners and resize handler attached');
    } catch (error) {
      console.error('[KnowledgeGraph] Error initializing Cytoscape:', error);
    }
  }

  /**
   * Converts graph data to Cytoscape.js element format
   *
   * @private
   * @returns {any[]} Array of Cytoscape elements (nodes and edges)
   */
  private buildCytoscapeElements(): any[] {
    const elements: any[] = [];

    // Add nodes
    this.graphData.nodes.forEach((node) => {
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          level: node.level,
          description: node.description,
          color: node.color
        }
      });
    });

    // Add edges
    this.graphData.edges.forEach((edge) => {
      elements.push({
        data: {
          source: edge.source,
          target: edge.target,
          label: edge.label
        }
      });
    });

    return elements;
  }

  /**
   * Defines Cytoscape.js visual styling for nodes and edges
   *
   * @private
   * @returns {any[]} Cytoscape style array with selectors and style properties
   */
  private getCytoscapeStyle(): any[] {
    return [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'width': '60px',
          'height': '60px',
          'font-size': '18px',
          'color': '#ffffff',
          'font-weight': 'bold',
          'text-wrap': 'wrap',
          'text-max-width': '55px',
          'text-background-color': 'rgba(0,0,0,0)',
          'text-background-opacity': 0,
          'border-color': '#64c8ff',
          'border-width': '2px',
          'transition-property':
            'background-color, border-width, box-shadow',
          'transition-duration': '0.3s'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': '3px',
          'border-color': '#ffffff',
          'width': '80px',
          'height': '80px',
          'background-color': 'data(color)',
          'box-shadow': '0 0 0 3px rgba(100, 200, 255, 0.5)'
        }
      },
      {
        selector: 'node:hover',
        style: {
          'background-color': 'data(color)',
          'opacity': 0.9,
          'cursor': 'pointer'
        }
      },
      {
        selector: 'edge',
        style: {
          'line-color': 'rgba(100, 200, 255, 0.5)',
          'target-arrow-color': 'rgba(100, 200, 255, 0.6)',
          'target-arrow-shape': 'triangle',
          'width': '2px',
          'label': '',
          'curve-style': 'bezier',
          'arrow-scale': 2.625
        }
      },
      {
        selector: 'edge:hover',
        style: {
          'line-color': 'rgba(100, 200, 255, 0.8)',
          'width': '3px'
        }
      }
    ];
  }

  /**
   * Handles window resize events by resizing and refitting the graph
   *
   * @private
   */
  private handleResize(): void {
    if (this.cy) {
      this.cy.resize();
      this.cy.fit();
    }
  }

  /**
   * Fits the graph to the viewport with padding
   * Called by the "Fit to View" button
   */
  fitGraph(): void {
    if (this.cy) {
      this.cy.fit(null, 40);
    }
  }

  /**
   * Navigates back to the configured back route
   */
  goBack(): void {
    this.router.navigate([this.backRoute]);
  }

  ngOnDestroy(): void {
    if (this.cy) {
      this.cy.destroy();
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
  }
}
