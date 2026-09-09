export enum NodeType {
  CLASS = 'CLASS',
  ABSTRACT_CLASS = 'ABSTRACT_CLASS',
  INTERFACE = 'INTERFACE',
  ENUM = 'ENUM',
}

export interface ClassNodeData {
  readonly id: string;
  readonly name: string;
  readonly type: NodeType;
  readonly properties: string;
  readonly methods: string;
}

export interface RelationshipData {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly label?: string;
}

export interface ArchitecturalGraph {
  readonly nodes: readonly ClassNodeData[];
  readonly edges: readonly RelationshipData[];
}

export interface Submission {
  readonly format: 'REACT_FLOW_GRAPH' | 'TEXT';
  readonly content: ArchitecturalGraph | string;
  readonly submittedAt?: Date;
}
