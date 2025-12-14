import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { PHYSICS_CONCEPT_GRAPH, ConceptNode, ConceptEdge } from './physics-concept-graph';

@Component({
  selector: 'app-physics-concept-graph',
  templateUrl: './physics-concept-graph.component.html',
  styleUrls: ['./physics-concept-graph.component.scss']
})
export class PhysicsConceptGraphComponent implements OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  conceptGraph = PHYSICS_CONCEPT_GRAPH;
  selectedNode: ConceptNode | null = null;
  hoveredNode: ConceptNode | null = null;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private nodePositions: Map<string, { x: number; y: number }> = new Map();
  private animationFrameId: number | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    this.ctx = ctx;

    // Set canvas size to window size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize node positions using force-directed layout
    this.initializeNodePositions();

    // Start animation loop
    this.animate();

    // Add click listener for node selection
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
  }

  private initializeNodePositions(): void {
    // Group nodes by level for better layout
    const levels = ['foundational', 'intermediate', 'advanced', 'specialization'];
    const nodesByLevel = new Map<string, ConceptNode[]>();

    levels.forEach(level => {
      nodesByLevel.set(level, this.conceptGraph.nodes.filter(n => n.level === level));
    });

    // Position nodes in columns by level
    const levelWidth = this.canvas.width / levels.length;
    const padding = 80;

    let levelIndex = 0;
    nodesByLevel.forEach((nodes, level) => {
      const x = (levelIndex + 0.5) * levelWidth;
      const verticalSpacing = (this.canvas.height - 2 * padding) / Math.max(1, nodes.length - 1);

      nodes.forEach((node, index) => {
        const y = padding + index * verticalSpacing;
        this.nodePositions.set(node.id, { x, y });
      });

      levelIndex++;
    });
  }

  private animate(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw edges first (so they appear behind nodes)
    this.drawEdges();

    // Draw nodes
    this.drawNodes();

    // Continue animation
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private drawEdges(): void {
    this.conceptGraph.edges.forEach(edge => {
      const source = this.nodePositions.get(edge.source);
      const target = this.nodePositions.get(edge.target);

      if (!source || !target) return;

      // Draw line
      this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(source.x, source.y);
      this.ctx.lineTo(target.x, target.y);
      this.ctx.stroke();

      // Draw arrow
      this.drawArrow(source.x, source.y, target.x, target.y);

      // Draw label
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      this.ctx.fillStyle = '#b0b0b0';
      this.ctx.font = '0.75rem Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(edge.label, midX, midY - 5);
    });
  }

  private drawArrow(fromX: number, fromY: number, toX: number, toY: number): void {
    const headlen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw arrowhead
    this.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawNodes(): void {
    this.conceptGraph.nodes.forEach(node => {
      const pos = this.nodePositions.get(node.id);
      if (!pos) return;

      const isSelected = this.selectedNode?.id === node.id;
      const isHovered = this.hoveredNode?.id === node.id;
      const radius = isSelected ? 30 : isHovered ? 25 : 20;

      // Draw circle
      this.ctx.fillStyle = node.color || '#64c8ff';
      this.ctx.globalAlpha = isSelected ? 1 : isHovered ? 0.9 : 0.7;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Draw border
      this.ctx.strokeStyle = isSelected ? '#ffffff' : (node.color || '#64c8ff');
      this.ctx.lineWidth = isSelected ? 3 : 2;
      this.ctx.stroke();

      this.ctx.globalAlpha = 1;

      // Draw label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 0.8rem Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      // Wrap text if needed
      const lines = this.wrapText(node.label, 18);
      const lineHeight = 12;
      const totalHeight = (lines.length - 1) * lineHeight;

      lines.forEach((line, index) => {
        this.ctx.fillText(line, pos.x, pos.y - totalHeight / 2 + index * lineHeight);
      });
    });
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  private handleCanvasClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a node
    for (const node of this.conceptGraph.nodes) {
      const pos = this.nodePositions.get(node.id);
      if (!pos) continue;

      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance < 30) {
        this.selectedNode = node;
        return;
      }
    }

    this.selectedNode = null;
  }

  private handleCanvasMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.hoveredNode = null;

    // Check if mouse is over a node
    for (const node of this.conceptGraph.nodes) {
      const pos = this.nodePositions.get(node.id);
      if (!pos) continue;

      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (distance < 25) {
        this.hoveredNode = node;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }

    this.canvas.style.cursor = 'default';
  }

  goBack(): void {
    this.router.navigate(['/physics']);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}
