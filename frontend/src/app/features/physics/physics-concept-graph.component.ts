import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHYSICS_CONCEPT_GRAPH, ConceptNode, ConceptEdge } from './physics-concept-graph';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cytoscape = require('cytoscape');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dagre = require('cytoscape-dagre');

// Register the dagre layout
cytoscape.use(dagre);

interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    level: string;
    description: string;
    color?: string;
  };
}

interface CytoscapeEdge {
  data: {
    source: string;
    target: string;
    label: string;
  };
}

@Component({
  selector: 'app-physics-concept-graph',
  templateUrl: './physics-concept-graph.component.html',
  styleUrls: ['./physics-concept-graph.component.scss']
})
export class PhysicsConceptGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cytoscapeContainer') containerRef!: ElementRef<HTMLDivElement>;

  conceptGraph = PHYSICS_CONCEPT_GRAPH;
  selectedNode: ConceptNode | null = null;

  private cy: any;
  private resizeListener!: () => void;

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
      wheelSensitivity: 0.1,
      panningEnabled: true,
      userPanningEnabled: true,
      zoomingEnabled: true,
      userZoomingEnabled: true
    });

    // Fit graph to container
    this.cy.fit();

    // Add event listeners
    this.cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      const nodeId = node.id();
      this.selectedNode =
        this.conceptGraph.nodes.find((n) => n.id === nodeId) || null;
      console.log('[PhysicsConceptGraph] Selected node:', nodeId);
    });

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
          'font-size': '12px',
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
          'label': 'data(label)',
          'font-size': '11px',
          'color': '#b0b0b0',
          'text-background-color': 'rgba(26, 26, 26, 0.9)',
          'text-background-opacity': 1,
          'text-background-padding': '4px',
          'edge-text-rotation': 'autorotate',
          'text-margin-y': '-10px',
          'curve-style': 'bezier',
          'arrow-scale': 1.5
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
  }
}
