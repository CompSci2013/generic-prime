import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router } from '@angular/router';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cytoscape = require('cytoscape');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dagre = require('cytoscape-dagre');

// Register the dagre layout
cytoscape.use(dagre);

export interface KnowledgeNode {
  id: string;
  label: string;
  description: string;
  level: string;
  color?: string;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

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
        this.graphData.nodes.find((n) => n.id === nodeId) || null;
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

    console.log('[KnowledgeGraph] Cytoscape initialized');
  }

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
