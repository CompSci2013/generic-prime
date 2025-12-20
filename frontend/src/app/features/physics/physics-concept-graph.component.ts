import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHYSICS_CONCEPT_GRAPH, ConceptNode, ConceptEdge } from './physics-concept-graph';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cytoscape = require('cytoscape');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dagre = require('cytoscape-dagre');

// Register the dagre layout
cytoscape.use(dagre);

/**
 * Cytoscape Node Data Structure
 *
 * Defines the data format for nodes in the Cytoscape graph
 */
interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    level: string;
    description: string;
    color?: string;
  };
}

/**
 * Cytoscape Edge Data Structure
 *
 * Defines the data format for edges (connections) in the Cytoscape graph visualization.
 * This interface structures edge data for use with Cytoscape.js library, providing the
 * connection information between nodes in physics concept graphs.
 *
 * @interface CytoscapeEdge
 * @property {Object} data - Data object containing edge properties
 * @property {string} data.source - Unique ID of the source (origin) node in the edge
 * @property {string} data.target - Unique ID of the target (destination) node in the edge
 * @property {string} data.label - Textual label describing the relationship type or nature
 *           displayed in tooltips or on hover in the visualization
 *
 * @remarks
 * This is Cytoscape.js's standard edge format. The data object is passed directly to
 * the Cytoscape instance during graph initialization. Edges are always directional,
 * with arrows pointing from source to target node in the visualization.
 *
 * @example
 * ```typescript
 * const edge: CytoscapeEdge = {
 *   data: {
 *     source: 'node-1',
 *     target: 'node-2',
 *     label: 'depends-on'
 *   }
 * };
 * ```
 *
 * @see CytoscapeNode - Companion node data structure
 * @see PhysicsConceptGraphComponent - Component using this interface
 */
interface CytoscapeEdge {
  data: {
    source: string;
    target: string;
    label: string;
  };
}

/**
 * Physics Concept Graph Component
 *
 * Renders an interactive Cytoscape.js graph visualization showing the relationships and dependencies
 * between physics concepts in the PhD curriculum. Uses the dagre layout algorithm for hierarchical
 * positioning and supports pan, zoom, and node selection interactions.
 *
 * @remarks
 * - Uses Cytoscape.js library for graph rendering and interaction
 * - Applies dagre layout for left-to-right hierarchical arrangement
 * - Color-codes nodes by learning level (foundational, intermediate, advanced)
 * - Shows edge labels on hover via custom tooltip
 * - Provides click navigation to detailed knowledge graphs for specific topics
 * - Handles responsive canvas sizing and window resize events
 *
 * @architecture
 * **Purpose**: Interactive visualization of physics concept dependencies
 * **Pattern**: Canvas-based graph component with Cytoscape.js
 * **Libraries**:
 *   - Cytoscape.js: Core graph rendering and interaction
 *   - Cytoscape-dagre: Hierarchical layout algorithm
 * **Navigation Flow**:
 *   - User arrives from /physics → Views concept graph at /physics/concept-graph
 *   - Clicks node (e.g., Classical Mechanics) → Navigates to /physics/classical-mechanics-graph
 *   - Can pan, zoom, and explore the full curriculum graph
 *
 * @template
 * The component uses an interactive graph layout:
 * 1. **Header Section**: Title, subtitle, and back button
 * 2. **Canvas Wrapper**: Cytoscape container with fit-to-view button
 * 3. **Edge Tooltip**: Position-tracked tooltip for edge hover labels
 * 4. **Legend Section**: Color key for learning levels
 * 5. **Info Panel**: Dynamic panel showing selected node details
 * 6. **Instructions**: User guide for graph interaction
 *
 * @styling
 * - Dark theme with level-specific node colors
 * - Foundational: #64c8ff (cyan)
 * - Intermediate: #ffa500 (orange)
 * - Advanced/Specialization: #ff6b9d (pink)
 * - Canvas: 500px height with responsive adjustments
 * - Animations: fadeInDown, fadeInUp, slideIn
 *
 * @example
 * ```typescript
 * // Usage in routing module
 * {
 *   path: 'concept-graph',
 *   component: PhysicsConceptGraphComponent
 * }
 * ```
 *
 * @seeAlso
 * - {@link PHYSICS_CONCEPT_GRAPH} - Data source for graph nodes and edges
 * - {@link KnowledgeGraphComponent} - Generic reusable graph component
 * - {@link ClassicalMechanicsGraphComponent} - Detailed topic graph
 * - {@link ConceptNode} - Node data interface
 * - {@link ConceptEdge} - Edge data interface
 *
 * @lifecycle
 * - **ngOnInit**: Logs initialization
 * - **ngAfterViewInit**: Initializes Cytoscape graph, sets up event listeners
 * - **ngOnDestroy**: Destroys Cytoscape instance, removes event listeners
 *
 * @version 1.0
 * @since 1.0.0 (Added as part of physics domain implementation)
 */
@Component({
  selector: 'app-physics-concept-graph',
  templateUrl: './physics-concept-graph.component.html',
  styleUrls: ['./physics-concept-graph.component.scss']
})
export class PhysicsConceptGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cytoscapeContainer') containerRef!: ElementRef<HTMLDivElement>;

  conceptGraph = PHYSICS_CONCEPT_GRAPH;
  selectedNode: ConceptNode | null = null;
  hoveredEdgeLabel: string | null = null;
  tooltipPos: { top: string; left: string } | null = null;

  private cy: any;
  private resizeListener!: () => void;
  private mouseMoveListener!: (e: MouseEvent) => void;

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('[PhysicsConceptGraph] ngOnInit()');
  }

  ngAfterViewInit(): void {
    console.log('[PhysicsConceptGraph] ngAfterViewInit()');

    if (!this.containerRef) {
      console.error('Container ref not available');
      return;
    }

    // Convert data to Cytoscape format
    const elements = this.buildCytoscapeElements();

    // Initialize Cytoscape
    this.cy = cytoscape({
      container: this.containerRef.nativeElement,
      elements: elements,
      style: this.getCytoscapeStyle(),
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        spacingFactor: 1.5,
        nodeSep: 100,
        rankSep: 150,
        animate: true,
        animationDuration: 500,
        fit: true,
        padding: 40
      },
      wheelSensitivity: 0.75,
      panningEnabled: true,
      userPanningEnabled: true,
      zoomingEnabled: true,
      userZoomingEnabled: true
    });

    // Fit graph to container
    this.cy.fit();

    // Add event listeners for nodes
    this.cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const nodeId = node.id();
      this.selectedNode =
        this.conceptGraph.nodes.find((n) => n.id === nodeId) || null;
      console.log('[PhysicsConceptGraph] Selected node:', nodeId);

      // Navigate to knowledge graph if node has one
      this.navigateToNodeGraph(nodeId);
    });

    // Add event listeners for edges - hover to show tooltip
    this.cy.on('mouseover', 'edge', (evt: any) => {
      const edge = evt.target;
      this.hoveredEdgeLabel = edge.data('label');
    });

    this.cy.on('mouseout', 'edge', () => {
      this.hoveredEdgeLabel = null;
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

    // Add click outside graph to deselect
    this.cy.on('tap', (evt: any) => {
      if (evt.target === this.cy) {
        this.selectedNode = null;
      }
    });

    // Handle window resize
    this.resizeListener = () => this.handleResize();
    window.addEventListener('resize', this.resizeListener);

    console.log('[PhysicsConceptGraph] Cytoscape initialized');
  }

  private buildCytoscapeElements(): any[] {
    const elements: any[] = [];

    // Add nodes
    this.conceptGraph.nodes.forEach((node) => {
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
    this.conceptGraph.edges.forEach((edge) => {
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

  private handleResize(): void {
    if (this.cy) {
      this.cy.resize();
      this.cy.fit();
    }
  }

  fitGraph(): void {
    if (this.cy) {
      this.cy.fit(null, 40);
    }
  }

  navigateToNodeGraph(nodeId: string): void {
    // Navigate to knowledge graph for nodes that have them
    if (nodeId === 'mechanics-foundations') {
      this.router.navigate(['/physics/classical-mechanics-graph']);
    }
    // Add more node-to-graph mappings as knowledge graphs are created for other topics
  }

  goBack(): void {
    this.router.navigate(['/physics']);
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
