import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PHYSICS_CONCEPT_GRAPH, ConceptNode } from './physics-concept-graph';

@Component({
  selector: 'app-physics-concept-graph',
  templateUrl: './physics-concept-graph.component.html',
  styleUrls: ['./physics-concept-graph.component.scss']
})
export class PhysicsConceptGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  conceptGraph = PHYSICS_CONCEPT_GRAPH;
  selectedNode: ConceptNode | null = null;
  hoveredNode: ConceptNode | null = null;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private nodePositions: Map<string, { x: number; y: number }> = new Map();
  private animationFrameId: number | null = null;
  private resizeListener!: () => void;

  constructor(private router: Router) {}

  ngOnInit(): void {
    console.log('[PhysicsConceptGraph] ngOnInit()');
  }

  ngAfterViewInit(): void {
    console.log('[PhysicsConceptGraph] ngAfterViewInit()');

    if (!this.canvasRef) {
      console.error('Canvas ref not available');
      return;
    }

    this.canvas = this.canvasRef.nativeElement;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas context');
      return;
    }
    this.ctx = ctx;

    // Set canvas size to window size
    this.resizeCanvas();

    // Use arrow function to preserve 'this'
    this.resizeListener = () => this.resizeCanvas();
    window.addEventListener('resize', this.resizeListener);

    // Initialize node positions
    this.initializeNodePositions();
    console.log('[PhysicsConceptGraph] Node positions initialized');

    // Start animation loop
    this.animate();
    console.log('[PhysicsConceptGraph] Animation started');

    // Add click listener for node selection
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    console.log(`[PhysicsConceptGraph] Resizing canvas to ${width}x${height}`);

    this.canvas.width = width;
    this.canvas.height = height;
  }

  private initializeNodePositions(): void {
    // Group nodes by level for better layout
    const levels = ['foundational', 'intermediate', 'advanced', 'specialization'];
    const nodesByLevel = new Map<string, ConceptNode[]>();

    levels.forEach((level) => {
      nodesByLevel.set(level, this.conceptGraph.nodes.filter(n => n.level as string === level));
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
    const nodeRadius = 20;

    this.conceptGraph.edges.forEach((edge, index) => {
      const source = this.nodePositions.get(edge.source);
      const target = this.nodePositions.get(edge.target);

      if (!source || !target) return;

      // Calculate the actual line points accounting for node radius
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const angle = Math.atan2(dy, dx);

      const startX = source.x + nodeRadius * Math.cos(angle);
      const startY = source.y + nodeRadius * Math.sin(angle);
      const endX = target.x - nodeRadius * Math.cos(angle);
      const endY = target.y - nodeRadius * Math.sin(angle);

      // Draw line
      this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Draw arrowhead at both ends
      this.drawArrowHead(endX, endY, angle);

      // Draw label with background - positioned far from nodes
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // Offset label perpendicular to the line (alternate above/below)
      // Increased offset distance to avoid overlap with nodes
      const offsetDistance = 35;
      const perpAngle = angle + (index % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);
      const labelX = midX + offsetDistance * Math.cos(perpAngle);
      const labelY = midY + offsetDistance * Math.sin(perpAngle);

      this.drawLabelWithBackground(edge.label, labelX, labelY, 0.7);
    });
  }

  private drawArrowHead(x: number, y: number, angle: number): void {
    const headlen = 15;

    // Draw arrowhead at the endpoint
    this.ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
    this.ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawLabelWithBackground(text: string, x: number, y: number, fontSize: number): void {
    // Measure text
    this.ctx.font = `${fontSize}rem Arial`;
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 16; // Actual font size in pixels

    // Draw semi-transparent background box
    const padding = 6;
    this.ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    this.ctx.fillRect(
      x - textWidth / 2 - padding,
      y - textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // Draw border for visibility
    this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      x - textWidth / 2 - padding,
      y - textHeight / 2 - padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );

    // Draw text
    this.ctx.fillStyle = '#e8e8e8';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x, y);
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

      // Draw label with better readability
      // Wrap text if needed
      const lines = this.wrapText(node.label, 18);
      const lineHeight = 13;
      const totalHeight = (lines.length - 1) * lineHeight;

      // Draw text directly on nodes (they're large enough)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 0.85rem Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

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
