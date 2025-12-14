import { Component } from '@angular/core';
import { CLASSICAL_MECHANICS_GRAPH } from './classical-mechanics-graph';
import { KnowledgeGraphData } from './knowledge-graph.component';

@Component({
  selector: 'app-classical-mechanics-graph',
  template: `
    <app-knowledge-graph
      [graphData]="graphData"
      [title]="'Classical Mechanics Knowledge Graph'"
      [subtitle]="'Topic relationships and dependencies'"
      [backRoute]="'/physics'">
    </app-knowledge-graph>
  `
})
export class ClassicalMechanicsGraphComponent {
  graphData: KnowledgeGraphData = {
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
}
