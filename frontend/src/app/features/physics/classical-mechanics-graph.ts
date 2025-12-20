/**
 * Classical Mechanics Topic Graph Data Structure
 *
 * @fileoverview
 * Defines the complete topic dependency graph for the Classical Mechanics course.
 * Represents hierarchical relationships between topics from foundational concepts
 * (vectors, Newtonian mechanics) through core topics (rigid bodies, gravitation)
 * to advanced topics (Lagrangian, Hamiltonian, relativity).
 *
 * @remarks
 * Graph Structure:
 * - 18 nodes representing classical mechanics topics
 * - 27 edges showing prerequisite, foundation, extension relationships
 * - 3 levels: foundational (blue), core (orange), advanced (pink)
 * - Organized to support curriculum planning and concept mapping
 *
 * Relationship Types:
 * - "prerequisite": Required knowledge before studying target topic
 * - "foundation": Provides conceptual basis for target topic
 * - "extends": Target topic builds upon and expands source topic
 * - "related": Topics share connections but no strict dependency
 *
 * Usage:
 * - Used by ClassicalMechanicsGraphComponent
 * - Visualized via KnowledgeGraphComponent with Cytoscape.js
 * - Exported as constant CLASSICAL_MECHANICS_GRAPH
 * - Nodes: id, label, description, level, color
 * - Edges: source, target, relationship label
 *
 * Course Coverage:
 * - Foundational: Vectors/Calculus, Newtonian Mechanics, 1D Motion (3 topics)
 * - Core: 2D/3D Motion, Particle Systems, Rigid Bodies, Gravitation, Rotating Frames, Continuous Media (6 topics)
 * - Advanced: Lagrange Equations, Tensors, Rigid Body Rotation, Small Vibrations, Special Relativity, Relativistic Dynamics, Central Forces, Hamiltonian (9 topics)
 *
 * @see ClassicalMechanicsGraphComponent
 * @see KnowledgeGraphComponent
 * @see PhysicsKnowledgePath (syllabus details)
 *
 * @version 1.0
 * @since 2024
 */

/**
 * Represents a single topic node in the classical mechanics curriculum
 *
 * @interface TopicNode
 * @property {string} id - Unique identifier (kebab-case)
 * @property {string} label - Display name of the topic
 * @property {string} description - Brief explanation of topic content
 * @property {string} level - Academic level (foundational/core/advanced)
 * @property {string} [color] - Optional hex color for visualization
 */
export interface TopicNode {
  id: string;
  label: string;
  description: string;
  level: 'foundational' | 'core' | 'advanced';
  color?: string;
}

/**
 * Represents a directed edge between two topics
 *
 * @interface TopicEdge
 * @property {string} source - ID of the source topic node
 * @property {string} target - ID of the target topic node
 * @property {string} label - Relationship type (prerequisite/foundation/extends/related)
 */
export interface TopicEdge {
  source: string;
  target: string;
  label: string; // e.g., "prerequisite", "extends", "related"
}

/**
 * Complete topic graph data structure
 *
 * @interface TopicGraph
 * @property {TopicNode[]} nodes - All topic nodes
 * @property {TopicEdge[]} edges - All topic relationships
 */
export interface TopicGraph {
  nodes: TopicNode[];
  edges: TopicEdge[];
}

export const CLASSICAL_MECHANICS_GRAPH: TopicGraph = {
  nodes: [
    // Foundational Topics
    {
      id: 'newtonian-mechanics',
      label: 'Elements of Newtonian Mechanics',
      description: 'Newton\'s laws, forces, and basic dynamics',
      level: 'foundational',
      color: '#64c8ff'
    },
    {
      id: 'vectors-calculus',
      label: 'Vectors & Calculus',
      description: 'Vector algebra, differentiation, and integration',
      level: 'foundational',
      color: '#64c8ff'
    },
    {
      id: 'kinematics-1d',
      label: 'Motion in One Dimension',
      description: 'Kinematics and dynamics in 1D, velocity, acceleration',
      level: 'foundational',
      color: '#64c8ff'
    },

    // Core Topics
    {
      id: 'kinematics-3d',
      label: 'Motion in Two/Three Dimensions',
      description: 'Projectile motion, curved paths, vector dynamics',
      level: 'core',
      color: '#ffa500'
    },
    {
      id: 'systems-particles',
      label: 'Motion of Systems of Particles',
      description: 'Center of mass, momentum conservation, collisions',
      level: 'core',
      color: '#ffa500'
    },
    {
      id: 'rigid-bodies',
      label: 'Rigid Bodies and Rotation about an Axis',
      description: 'Moment of inertia, angular momentum, torque',
      level: 'core',
      color: '#ffa500'
    },
    {
      id: 'gravitation',
      label: 'Gravitation',
      description: 'Newton\'s law of gravitation, orbital mechanics, gravity fields',
      level: 'core',
      color: '#ffa500'
    },
    {
      id: 'moving-coordinates',
      label: 'Moving Coordinate Systems',
      description: 'Rotating frames, fictitious forces, Coriolis effect',
      level: 'core',
      color: '#ffa500'
    },
    {
      id: 'continuous-media',
      label: 'Intro to Mechanics of Continuous Media',
      description: 'Stress, strain, elasticity, fluid basics',
      level: 'core',
      color: '#ffa500'
    },

    // Advanced Topics
    {
      id: 'lagrange-equations',
      label: 'Lagrange\'s Equations',
      description: 'Generalized coordinates, principle of least action',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'tensors',
      label: 'Tensors: Algebra, Inertia & Stress',
      description: 'Tensor notation, inertia tensors, stress tensors',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'rigid-body-rotation',
      label: 'Theory of Rigid Body Rotation',
      description: 'Rotation matrices, Euler angles, angular velocity',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'small-vibrations',
      label: 'Theory of Small Vibrations',
      description: 'Normal modes, coupled oscillators, stability analysis',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'special-relativity',
      label: 'Special Relativity',
      description: 'Lorentz transformations, spacetime, relativistic mechanics',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'relativistic-dynamics',
      label: 'Relativistic Dynamics',
      description: 'Energy-momentum, relativistic collisions, fields',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'central-forces',
      label: 'Central Forces',
      description: 'Two-body problems, Kepler\'s laws, scattering',
      level: 'advanced',
      color: '#ff6b9d'
    },
    {
      id: 'hamiltonian',
      label: 'Hamiltonian Mechanics',
      description: 'Phase space, canonical transformations, action-angle variables',
      level: 'advanced',
      color: '#ff6b9d'
    }
  ],

  edges: [
    // Foundational → Core
    { source: 'vectors-calculus', target: 'newtonian-mechanics', label: 'prerequisite' },
    { source: 'newtonian-mechanics', target: 'kinematics-1d', label: 'foundation' },
    { source: 'kinematics-1d', target: 'kinematics-3d', label: 'extends' },
    { source: 'newtonian-mechanics', target: 'kinematics-3d', label: 'foundation' },
    { source: 'kinematics-1d', target: 'systems-particles', label: 'foundation' },
    { source: 'kinematics-3d', target: 'systems-particles', label: 'foundation' },
    { source: 'systems-particles', target: 'rigid-bodies', label: 'extends' },
    { source: 'newtonian-mechanics', target: 'gravitation', label: 'foundation' },
    { source: 'kinematics-3d', target: 'gravitation', label: 'related' },
    { source: 'rigid-bodies', target: 'moving-coordinates', label: 'foundation' },
    { source: 'systems-particles', target: 'continuous-media', label: 'extends' },

    // Core → Advanced
    { source: 'kinematics-3d', target: 'lagrange-equations', label: 'foundation' },
    { source: 'systems-particles', target: 'lagrange-equations', label: 'foundation' },
    { source: 'rigid-bodies', target: 'tensors', label: 'foundation' },
    { source: 'rigid-bodies', target: 'rigid-body-rotation', label: 'extends' },
    { source: 'systems-particles', target: 'small-vibrations', label: 'foundation' },
    { source: 'newtonian-mechanics', target: 'special-relativity', label: 'prerequisite' },
    { source: 'special-relativity', target: 'relativistic-dynamics', label: 'extends' },
    { source: 'gravitation', target: 'central-forces', label: 'foundation' },
    { source: 'kinematics-3d', target: 'central-forces', label: 'foundation' },
    { source: 'lagrange-equations', target: 'hamiltonian', label: 'extends' },

    // Cross-topic relationships
    { source: 'lagrange-equations', target: 'rigid-body-rotation', label: 'related' },
    { source: 'lagrange-equations', target: 'small-vibrations', label: 'related' },
    { source: 'tensors', target: 'continuous-media', label: 'related' },
    { source: 'moving-coordinates', target: 'special-relativity', label: 'related' }
  ]
};
