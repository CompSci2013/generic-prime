/**
 * Physics Concept Graph Data Structure
 *
 * @fileoverview
 * Defines the complete concept dependency graph for physics curriculum with specialization
 * in Thermodynamics and Solid State Matter. This graph represents the hierarchical progression
 * from foundational physics concepts through intermediate core topics to advanced PhD-level
 * specializations.
 *
 * @remarks
 * The graph structure enables visualization of:
 * - Prerequisite relationships between concepts
 * - Conceptual dependencies and progression paths
 * - Level-based organization (foundational → intermediate → advanced → specialization)
 * - Cross-topic connections and relationships
 *
 * Structure:
 * - 17 nodes representing major physics concepts
 * - 26 edges representing relationships (prerequisites, foundations, extensions)
 * - 4 concept levels: foundational, intermediate, advanced, specialization
 * - Color-coded by level for visual clarity
 *
 * Usage:
 * - Used by PhysicsConceptGraphComponent for Cytoscape.js visualization
 * - Exported as constant PHYSICS_CONCEPT_GRAPH
 * - Nodes include id, label, level, description, color
 * - Edges include source, target, relationship label
 *
 * @see PhysicsConceptGraphComponent
 * @see KnowledgeGraphComponent
 *
 * @version 1.0
 * @since 2024
 */

/**
 * Represents a single concept node in the physics curriculum graph
 *
 * @interface ConceptNode
 * @property {string} id - Unique identifier for the concept (kebab-case)
 * @property {string} label - Display name of the concept
 * @property {string} level - Academic level (foundational/intermediate/advanced/specialization)
 * @property {string} description - Brief explanation of the concept
 * @property {string} [color] - Optional hex color for visualization (defaults by level)
 */
export interface ConceptNode {
  id: string;
  label: string;
  level: 'foundational' | 'intermediate' | 'advanced' | 'specialization';
  description: string;
  color?: string;
}

/**
 * Represents a directed edge between two concepts showing their relationship
 *
 * @interface ConceptEdge
 * @property {string} source - ID of the source concept node
 * @property {string} target - ID of the target concept node
 * @property {string} label - Type of relationship (e.g., "leads to", "required for", "extends", "foundation for")
 */
export interface ConceptEdge {
  source: string;
  target: string;
  label: string; // e.g., "leads to", "required for", "extends"
}

/**
 * Complete physics concept graph data structure
 *
 * @interface PhysicsConceptGraph
 * @property {ConceptNode[]} nodes - Array of all concept nodes in the graph
 * @property {ConceptEdge[]} edges - Array of all directed edges showing relationships
 */
export interface PhysicsConceptGraph {
  nodes: ConceptNode[];
  edges: ConceptEdge[];
}

/**
 * Physics Concept Graph - Thermodynamics & Solid State Matter Specialization
 *
 * This graph shows the conceptual dependencies and relationships between physics
 * concepts studied in the PhD curriculum with specialization in Thermodynamics
 * and Solid State Matter.
 */
export const PHYSICS_CONCEPT_GRAPH: PhysicsConceptGraph = {
  // Nodes represent key physics concepts
  nodes: [
    // Foundation Level
    {
      id: 'mechanics-foundations',
      label: 'Classical Mechanics',
      level: 'foundational',
      description: 'Newton\'s laws, kinematics, dynamics',
      color: '#64c8ff'
    },
    {
      id: 'calculus',
      label: 'Mathematical Methods',
      level: 'foundational',
      description: 'Calculus, differential equations, linear algebra',
      color: '#64c8ff'
    },
    {
      id: 'oscillations',
      label: 'Oscillations & Waves',
      level: 'foundational',
      description: 'Simple harmonic motion, wave mechanics',
      color: '#64c8ff'
    },

    // Intermediate Level - Core Physics
    {
      id: 'electromagnetism',
      label: 'Electromagnetism',
      level: 'intermediate',
      description: 'Maxwell\'s equations, electromagnetic fields',
      color: '#ffa500'
    },
    {
      id: 'thermodynamics-intro',
      label: 'Thermodynamics Basics',
      level: 'intermediate',
      description: 'First & second laws, entropy, free energy',
      color: '#ffa500'
    },
    {
      id: 'quantum-mechanics-intro',
      label: 'Quantum Mechanics Foundations',
      level: 'intermediate',
      description: 'Wave functions, Schrödinger equation, uncertainty principle',
      color: '#ffa500'
    },
    {
      id: 'statistical-mechanics',
      label: 'Statistical Mechanics',
      level: 'intermediate',
      description: 'Ensemble theory, probability distributions, ensembles',
      color: '#ffa500'
    },

    // Advanced Level - PhD Core
    {
      id: 'quantum-mechanics-advanced',
      label: 'Advanced Quantum Mechanics',
      level: 'advanced',
      description: 'Perturbation theory, scattering, field quantization',
      color: '#ff6b9d'
    },
    {
      id: 'thermodynamics-advanced',
      label: 'Advanced Thermodynamics',
      level: 'advanced',
      description: 'Phase transitions, critical phenomena, non-equilibrium',
      color: '#ff6b9d'
    },
    {
      id: 'solid-state-foundations',
      label: 'Solid State Physics Fundamentals',
      level: 'advanced',
      description: 'Crystal structures, lattice dynamics, band theory',
      color: '#ff6b9d'
    },
    {
      id: 'materials-physics',
      label: 'Materials Physics',
      level: 'advanced',
      description: 'Electronic properties, magnetic properties, transport',
      color: '#ff6b9d'
    },

    // Specialization Level
    {
      id: 'thermodynamics-spec',
      label: 'Thermodynamics Specialization',
      level: 'specialization',
      description: 'Specialized research in thermodynamic systems and processes',
      color: '#ff6b9d'
    },
    {
      id: 'solid-state-spec',
      label: 'Solid State Physics Specialization',
      level: 'specialization',
      description: 'Research in crystalline materials and condensed matter',
      color: '#ff6b9d'
    },
    {
      id: 'statistical-field-theory',
      label: 'Statistical Field Theory',
      level: 'specialization',
      description: 'Field-theoretic approach to phase transitions and critical phenomena',
      color: '#ff6b9d'
    },
    {
      id: 'quantum-condensed-matter',
      label: 'Quantum Condensed Matter',
      level: 'specialization',
      description: 'Quantum effects in condensed matter systems',
      color: '#ff6b9d'
    }
  ],

  // Edges represent relationships and dependencies
  edges: [
    // Foundational → Intermediate
    { source: 'mechanics-foundations', target: 'oscillations', label: 'leads to' },
    { source: 'mechanics-foundations', target: 'electromagnetism', label: 'foundation for' },
    { source: 'calculus', target: 'mechanics-foundations', label: 'required for' },
    { source: 'oscillations', target: 'quantum-mechanics-intro', label: 'foundation for' },
    { source: 'mechanics-foundations', target: 'thermodynamics-intro', label: 'foundation for' },

    // Intermediate connections
    { source: 'thermodynamics-intro', target: 'statistical-mechanics', label: 'leads to' },
    { source: 'quantum-mechanics-intro', target: 'statistical-mechanics', label: 'foundation for' },
    { source: 'electromagnetism', target: 'quantum-mechanics-intro', label: 'required for' },

    // Intermediate → Advanced
    { source: 'quantum-mechanics-intro', target: 'quantum-mechanics-advanced', label: 'leads to' },
    { source: 'thermodynamics-intro', target: 'thermodynamics-advanced', label: 'leads to' },
    { source: 'statistical-mechanics', target: 'thermodynamics-advanced', label: 'foundation for' },
    { source: 'electromagnetism', target: 'solid-state-foundations', label: 'foundation for' },
    { source: 'quantum-mechanics-intro', target: 'solid-state-foundations', label: 'foundation for' },
    { source: 'solid-state-foundations', target: 'materials-physics', label: 'leads to' },

    // Advanced → Specialization
    { source: 'quantum-mechanics-advanced', target: 'quantum-condensed-matter', label: 'leads to' },
    { source: 'thermodynamics-advanced', target: 'thermodynamics-spec', label: 'leads to' },
    { source: 'thermodynamics-advanced', target: 'statistical-field-theory', label: 'foundation for' },
    { source: 'statistical-mechanics', target: 'statistical-field-theory', label: 'foundation for' },
    { source: 'solid-state-foundations', target: 'solid-state-spec', label: 'leads to' },
    { source: 'materials-physics', target: 'solid-state-spec', label: 'extends' },
    { source: 'quantum-mechanics-advanced', target: 'solid-state-spec', label: 'foundation for' },
    { source: 'thermodynamics-advanced', target: 'quantum-condensed-matter', label: 'foundation for' },
    { source: 'solid-state-foundations', target: 'quantum-condensed-matter', label: 'foundation for' },

    // Cross-specialization
    { source: 'thermodynamics-spec', target: 'statistical-field-theory', label: 'related' },
    { source: 'solid-state-spec', target: 'quantum-condensed-matter', label: 'related' }
  ]
};
