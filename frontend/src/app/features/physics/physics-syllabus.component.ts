import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PhysicsNode } from './physics-knowledge-path';

/**
 * Physics Syllabus Detail Component
 *
 * Displays detailed syllabus for a selected physics course node
 * Retrieves node data from sessionStorage (set by parent component)
 */
@Component({
  selector: 'app-physics-syllabus',
  templateUrl: './physics-syllabus.component.html',
  styleUrls: ['./physics-syllabus.component.scss']
})
export class PhysicsSyllabusComponent implements OnInit {
  selectedNode: PhysicsNode | null = null;
  nodeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get node ID from route params
    this.route.params.subscribe(params => {
      this.nodeId = params['nodeId'];
      this.loadNodeData();
    });
  }

  /**
   * Load node data from sessionStorage
   */
  private loadNodeData(): void {
    const storedNode = sessionStorage.getItem('selectedPhysicsNode');
    if (storedNode) {
      this.selectedNode = JSON.parse(storedNode);
    } else if (this.nodeId) {
      // Fallback: navigate back if no data
      this.router.navigate(['/physics']);
    }
  }

  /**
   * Navigate back to physics main page
   */
  goBack(): void {
    this.router.navigate(['/physics']);
  }
}
