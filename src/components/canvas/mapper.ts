import type { Node, Edge } from '@xyflow/react';
import {
  Submission,
  ArchitecturalGraph,
  ClassNodeData,
  RelationshipData,
  NodeType,
} from '../../domain/Submission';

export type ClassNodeUiData = {
  [key: string]: unknown;
  id: string;
  name: string;
  type: NodeType;
  properties: string;
  methods: string;
  onChange?: (updated: Partial<ClassNodeData>) => void;
  isReadOnly?: boolean;
};

export type ClassFlowNode = Node<ClassNodeUiData, 'classNode'>;
export type ClassFlowEdge = Edge;

/**
 * Converts React Flow UI state (nodes + edges) into an immutable domain Submission
 */
export function graphToSubmission(nodes: Node[], edges: Edge[]): Submission {
  const domainNodes: ClassNodeData[] = nodes.map((n) => {
    const data = (n.data || {}) as Record<string, unknown>;
    const nodeType = (data.type as NodeType) || NodeType.CLASS;
    return {
      id: n.id,
      name: typeof data.name === 'string' ? data.name : '',
      type: nodeType,
      properties: typeof data.properties === 'string' ? data.properties : '',
      methods: typeof data.methods === 'string' ? data.methods : '',
    };
  });

  const domainEdges: RelationshipData[] = edges.map((e) => ({
    id: e.id,
    sourceId: e.source,
    targetId: e.target,
    label: typeof e.label === 'string' ? e.label : undefined,
  }));

  const graph: ArchitecturalGraph = {
    nodes: domainNodes,
    edges: domainEdges,
  };

  return {
    format: 'REACT_FLOW_GRAPH',
    content: graph,
    submittedAt: new Date(),
  };
}

/**
 * Reconstructs React Flow UI nodes and edges from a domain Submission
 */
export function submissionToGraph(
  submission: Submission,
  onNodeChange?: (id: string, updated: Partial<ClassNodeData>) => void,
  isReadOnly: boolean = false
): { nodes: ClassFlowNode[]; edges: ClassFlowEdge[] } {
  if (
    submission.format !== 'REACT_FLOW_GRAPH' ||
    typeof submission.content !== 'object' ||
    !submission.content
  ) {
    return { nodes: [], edges: [] };
  }

  const graph = submission.content as ArchitecturalGraph;
  const nodes: ClassFlowNode[] = (graph.nodes || []).map((node, index) => ({
    id: node.id,
    type: 'classNode',
    position: {
      x: 80 + (index % 3) * 320,
      y: 80 + Math.floor(index / 3) * 260,
    },
    data: {
      ...node,
      onChange: onNodeChange ? (updated) => onNodeChange(node.id, updated) : undefined,
      isReadOnly,
    },
  }));

  const edges: ClassFlowEdge[] = (graph.edges || []).map((edge) => ({
    id: edge.id,
    source: edge.sourceId,
    target: edge.targetId,
    label: edge.label,
  }));

  return { nodes, edges };
}
