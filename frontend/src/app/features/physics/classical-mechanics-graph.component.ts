import { Component, OnInit } from '@angular/core';
import { CLASSICAL_MECHANICS_GRAPH } from './classical-mechanics-graph';
import { KnowledgeGraphData } from './knowledge-graph.component';

@Component({
  selector: 'app-classical-mechanics-graph',
  template: `
    <app-knowledge-graph
      *ngIf="graphData"
      [graphData]="graphData"
      [title]="'Classical Mechanics Knowledge Graph'"
      [subtitle]="'Topic relationships and dependencies'"
      [backRoute]="'/physics'">
    </app-knowledge-graph>
  `
})
export class ClassicalMechanicsGraphComponent implements OnInit {
  graphData: KnowledgeGraphData | null = null;

  ngOnInit(): void {
    console.log('[ClassicalMechanicsGraph] ngOnInit()');
    this.graphData = {
      nodes: CLASSICAL_MECHANICS_GRAPH.nodes.map(node => ({
        id: node.id,
        label: node.label,
        description: node.description,
        level: node.level,
        color: node.color
      })),
      edges: CLASSICAL_MECHANICS_GRAPH.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        label: edge.label
      }))
    };
    console.log('[ClassicalMechanicsGraph] Graph data initialized');
  }
}
