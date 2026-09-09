'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import { Attempt, AttemptStatus } from '../domain/Attempt';
import { NodeType, ClassNodeData } from '../domain/Submission';
import { PracticeSessionService } from '../application/PracticeSessionService';
import { LocalStorageAttemptRepository } from '../infrastructure/LocalStorageAttemptRepository';
import {
  ClassFlowNode,
  ClassFlowEdge,
  graphToSubmission,
  submissionToGraph,
} from '../components/canvas/mapper';

export function usePracticeSession(problemId: string) {
  const [service] = useState(() => {
    const repo = new LocalStorageAttemptRepository();
    return new PracticeSessionService(repo);
  });

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [nodes, setNodes] = useState<ClassFlowNode[]>([]);
  const [edges, setEdges] = useState<ClassFlowEdge[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Keep references to current state for debounced saves
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const attemptRef = useRef(attempt);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    attemptRef.current = attempt;
  }, [nodes, edges, attempt]);

  const isLocked = attempt?.status === AttemptStatus.EVALUATING || attempt?.status === AttemptStatus.COMPLETED;

  // Node content change callback
  const handleNodeDataChange = useCallback(
    (id: string, updated: Partial<ClassNodeData>) => {
      if (isLocked) return;
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updated,
              },
            };
          }
          return node;
        })
      );
      setSaveStatus('unsaved');
    },
    [isLocked]
  );

  // Initialize or load attempt on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      try {
        const history = await service.getHistoryForProblem(problemId);
        // Find existing DRAFT attempt if available, otherwise latest
        const existingDraft = history.find((a) => a.status === AttemptStatus.DRAFT);
        let activeAttempt: Attempt;

        if (existingDraft) {
          activeAttempt = existingDraft;
        } else {
          // Rule: Start with BLANK canvas (empty nodes and edges)
          activeAttempt = await service.startAttempt(problemId, {
            format: 'REACT_FLOW_GRAPH',
            content: { nodes: [], edges: [] },
          });
        }

        if (isMounted) {
          setAttempt(activeAttempt);
          const locked =
            activeAttempt.status === AttemptStatus.EVALUATING ||
            activeAttempt.status === AttemptStatus.COMPLETED;

          const restored = submissionToGraph(
            activeAttempt.submission,
            handleNodeDataChange,
            locked
          );
          setNodes(restored.nodes);
          setEdges(restored.edges);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Failed to initialize practice session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [problemId, service, handleNodeDataChange]);

  // React Flow changes
  const onNodesChange = useCallback(
    (changes: NodeChange<ClassFlowNode>[]) => {
      if (isLocked) return;
      setNodes((nds) => applyNodeChanges<ClassFlowNode>(changes, nds));
      setSaveStatus('unsaved');
    },
    [isLocked]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<ClassFlowEdge>[]) => {
      if (isLocked) return;
      setEdges((eds) => applyEdgeChanges<ClassFlowEdge>(changes, eds));
      setSaveStatus('unsaved');
    },
    [isLocked]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (isLocked) return;
      setEdges((eds) => addEdge({ ...connection, label: 'uses' }, eds));
      setSaveStatus('unsaved');
    },
    [isLocked]
  );

  // Add Class Node
  const addClassNode = useCallback(() => {
    if (isLocked) return;
    const newId = `class_${Date.now().toString(36)}`;
    const newNode: ClassFlowNode = {
      id: newId,
      type: 'classNode',
      position: {
        x: 100 + (nodes.length % 3) * 280,
        y: 80 + Math.floor(nodes.length / 3) * 220,
      },
      data: {
        id: newId,
        name: `Class${nodes.length + 1}`,
        type: NodeType.CLASS,
        properties: '',
        methods: '',
        onChange: (updated) => handleNodeDataChange(newId, updated),
        isReadOnly: false,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setSaveStatus('unsaved');
  }, [isLocked, nodes.length, handleNodeDataChange]);

  // Save Draft (explicit or debounced)
  const saveDraft = useCallback(async () => {
    const currentAttempt = attemptRef.current;
    if (!currentAttempt || currentAttempt.status === AttemptStatus.COMPLETED) {
      return;
    }

    setSaveStatus('saving');
    try {
      const submission = graphToSubmission(nodesRef.current, edgesRef.current);
      const updated = await service.saveDraft(currentAttempt.id, submission);
      setAttempt(updated);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save draft:', err);
      setSaveStatus('unsaved');
    }
  }, [service]);

  // Debounced autosave (~1500ms)
  useEffect(() => {
    if (saveStatus !== 'unsaved' || isLocked) {
      return;
    }

    const timer = setTimeout(() => {
      saveDraft();
    }, 1500);

    return () => clearTimeout(timer);
  }, [saveStatus, isLocked, saveDraft]);

  // Submit Architecture
  const submitArchitecture = useCallback(async () => {
    const currentAttempt = attemptRef.current;
    if (!currentAttempt || isLocked) {
      return;
    }

    try {
      setSaveStatus('saving');
      // 1. Serialize current canvas
      const submission = graphToSubmission(nodesRef.current, edgesRef.current);
      // 2. Save final submission / draft
      await service.saveDraft(currentAttempt.id, submission);
      // 3. Transition Attempt to EVALUATING
      const evaluatingAttempt = await service.submitAttempt(currentAttempt.id);
      // 4. Update attempt state and lock canvas
      setAttempt(evaluatingAttempt);
      setSaveStatus('saved');

      // Update nodes to read-only
      setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isReadOnly: true,
          },
        }))
      );
    } catch (err) {
      console.error('Failed to submit architecture:', err);
    }
  }, [isLocked, service]);

  return {
    attempt,
    nodes,
    edges,
    isLoading,
    isLocked,
    saveStatus,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addClassNode,
    saveDraft,
    submitArchitecture,
  };
}
