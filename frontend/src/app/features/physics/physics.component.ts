import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PHYSICS_KNOWLEDGE_PATH, PhysicsNode, SyllabusItem } from './physics-knowledge-path';

@Component({
  selector: 'app-physics',
  templateUrl: './physics.component.html',
  styleUrls: ['./physics.component.scss']
})
export class PhysicsComponent {
  knowledgeTiers: PhysicsNode[] = PHYSICS_KNOWLEDGE_PATH;

  constructor(private router: Router) {}

  /**
   * Calculate total estimated hours for a syllabus
   */
  getTotalHours(syllabus: SyllabusItem[]): number {
    return syllabus.reduce((total, item) => total + item.estimatedHours, 0);
  }

  /**
   * Navigate to syllabus detail page for a selected node
   */
  navigateToNode(node: PhysicsNode): void {
    // Store node in session for the detail page to access
    sessionStorage.setItem('selectedPhysicsNode', JSON.stringify(node));
    this.router.navigate(['/physics/syllabus', node.id]);
  }
}