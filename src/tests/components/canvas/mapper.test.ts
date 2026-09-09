import { describe, it, expect } from 'vitest';
import { graphToSubmission, submissionToGraph, ClassFlowNode } from '../../../components/canvas/mapper';
import { NodeType, Submission, ArchitecturalGraph } from '../../../domain/Submission';
import type { Edge } from '@xyflow/react';

describe('Canvas Mapper (React Flow <-> Domain Boundary)', () => {
  it('1. Correctly serializes React Flow nodes and edges to domain Submission', () => {
    const rfNodes: ClassFlowNode[] = [
      {
        id: 'node-1',
        type: 'classNode',
        position: { x: 100, y: 100 },
        data: {
          id: 'node-1',
          name: 'ParkingLot',
          type: NodeType.CLASS,
          properties: 'floors: List<Floor>',
          methods: 'park(Vehicle): Ticket\nunpark(Ticket): void',
        },
      },
      {
        id: 'node-2',
        type: 'classNode',
        position: { x: 400, y: 100 },
        data: {
          id: 'node-2',
          name: 'Vehicle',
          type: NodeType.ABSTRACT_CLASS,
          properties: 'licensePlate: string',
          methods: 'getType(): VehicleType',
        },
      },
    ];

    const rfEdges: Edge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        label: 'manages',
      },
    ];

    const submission = graphToSubmission(rfNodes, rfEdges);

    expect(submission.format).toBe('REACT_FLOW_GRAPH');
    expect(submission.submittedAt).toBeInstanceOf(Date);

    const graph = submission.content as ArchitecturalGraph;
    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes[0]).toEqual({
      id: 'node-1',
      name: 'ParkingLot',
      type: NodeType.CLASS,
      properties: 'floors: List<Floor>',
      methods: 'park(Vehicle): Ticket\nunpark(Ticket): void',
    });
    expect(graph.nodes[1].type).toBe(NodeType.ABSTRACT_CLASS);

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toEqual({
      id: 'edge-1',
      sourceId: 'node-1',
      targetId: 'node-2',
      label: 'manages',
    });
  });

  it('2. Correctly serializes an empty graph without error', () => {
    const submission = graphToSubmission([], []);
    expect(submission.format).toBe('REACT_FLOW_GRAPH');
    const graph = submission.content as ArchitecturalGraph;
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it('3. Reconstructs React Flow nodes and edges from domain Submission', () => {
    const domainSubmission: Submission = {
      format: 'REACT_FLOW_GRAPH',
      content: {
        nodes: [
          {
            id: 'c1',
            name: 'ElevatorCar',
            type: NodeType.CLASS,
            properties: 'currentFloor: int',
            methods: 'moveUp(): void',
          },
        ],
        edges: [
          {
            id: 'e1',
            sourceId: 'c1',
            targetId: 'c2',
            label: 'notifies',
          },
        ],
      },
    };

    let changeLogged: { id: string; updated: unknown } | null = null;
    const { nodes, edges } = submissionToGraph(
      domainSubmission,
      (id, updated) => {
        changeLogged = { id, updated };
      },
      true
    );

    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('c1');
    expect(nodes[0].type).toBe('classNode');
    expect(nodes[0].data.name).toBe('ElevatorCar');
    expect(nodes[0].data.isReadOnly).toBe(true);

    // Verify change handler attached
    nodes[0].data.onChange?.({ name: 'ElevatorCarV2' });
    expect(changeLogged).toEqual({ id: 'c1', updated: { name: 'ElevatorCarV2' } });

    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('e1');
    expect(edges[0].source).toBe('c1');
    expect(edges[0].target).toBe('c2');
    expect(edges[0].label).toBe('notifies');
  });

  it('4. Handles non-REACT_FLOW_GRAPH submissions gracefully', () => {
    const textSubmission: Submission = {
      format: 'TEXT',
      content: 'class ParkingLot {}',
    };

    const { nodes, edges } = submissionToGraph(textSubmission);
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it('5. Handles null or undefined submission content without crashing', () => {
    const nullSubmission = {
      format: 'REACT_FLOW_GRAPH',
      content: null,
    } as unknown as Submission;

    const { nodes, edges } = submissionToGraph(nullSubmission);
    expect(nodes).toEqual([]);
    expect(edges).toEqual([]);
  });

  it('6. Safely defaults missing node fields (name, type, properties, methods) in graphToSubmission', () => {
    const bareNode = {
      id: 'bare-1',
      type: 'classNode',
      position: { x: 0, y: 0 },
      data: {} as ClassFlowNode['data'], // missing all fields
    };

    const submission = graphToSubmission([bareNode], []);
    const graph = submission.content as ArchitecturalGraph;
    expect(graph.nodes[0].name).toBe('');
    expect(graph.nodes[0].type).toBe(NodeType.CLASS);
    expect(graph.nodes[0].properties).toBe('');
    expect(graph.nodes[0].methods).toBe('');
  });
});

