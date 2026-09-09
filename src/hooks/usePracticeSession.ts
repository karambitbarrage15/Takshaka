'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const [history, setHistory] = useState<Attempt[]>([]);
  const [nodes, setNodes] = useState<ClassFlowNode[]>([]);
  const [edges, setEdges] = useState<ClassFlowEdge[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Keep references to current state for debounced saves
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const attemptRef = useRef(attempt);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    attemptRef.current = attempt;
  }, [nodes, edges, attempt]);

  const isLocked =
    attempt?.status === AttemptStatus.EVALUATING ||
    attempt?.status === AttemptStatus.COMPLETED;

  // Refresh attempt history for the current problem
  const refreshHistory = useCallback(async () => {
    try {
      const records = await service.getHistoryForProblem(problemId);
      setHistory(records);
      return records;
    } catch (err) {
      console.error('Failed to load attempt history:', err);
      return [];
    }
  }, [problemId, service]);

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

  // Chronological 1-based attempt number
  const attemptNumber = useMemo(() => {
    if (!attempt) return 1;
    const sorted = [...history].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const idx = sorted.findIndex((a) => a.id === attempt.id);
    return idx >= 0 ? idx + 1 : history.length + 1;
  }, [history, attempt]);

  // Initialize or load attempt on mount
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      try {
        const records = await service.getHistoryForProblem(problemId);
        if (!isMounted) return;
        setHistory(records);

        // Selection rule:
        // 1. Find most recent DRAFT attempt (createdAt descending)
        const drafts = records
          .filter((a) => a.status === AttemptStatus.DRAFT)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        let activeAttempt: Attempt;
        if (drafts.length > 0) {
          activeAttempt = drafts[0];
        } else if (records.length > 0) {
          // 2. If no draft exists, load most recent attempt (completed or failed)
          const sorted = [...records].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          activeAttempt = sorted[0];
        } else {
          // 3. No attempts exist: Start fresh DRAFT with blank canvas
          activeAttempt = await service.startAttempt(problemId, {
            format: 'REACT_FLOW_GRAPH',
            content: { nodes: [], edges: [] },
          });
          const updatedHistory = await service.getHistoryForProblem(problemId);
          if (isMounted) setHistory(updatedHistory);
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

  // Select an attempt from History
  const selectAttempt = useCallback(
    (attemptId: string) => {
      const target = history.find((a) => a.id === attemptId);
      if (!target) return;

      setAttempt(target);
      const locked =
        target.status === AttemptStatus.EVALUATING ||
        target.status === AttemptStatus.COMPLETED;

      const restored = submissionToGraph(target.submission, handleNodeDataChange, locked);
      setNodes(restored.nodes);
      setEdges(restored.edges);
      setSaveStatus('saved');
      setIsHistoryOpen(false);
      // NOTE: Do NOT automatically open scorecard modal when viewing history!
    },
    [history, handleNodeDataChange]
  );

  // Start Blank Attempt
  const startBlankAttempt = useCallback(async () => {
    try {
      setIsLoading(true);
      const newAttempt = await service.startAttempt(problemId, {
        format: 'REACT_FLOW_GRAPH',
        content: { nodes: [], edges: [] },
      });

      setAttempt(newAttempt);
      setNodes([]);
      setEdges([]);
      setSaveStatus('saved');
      setIsHistoryOpen(false);
      setIsScorecardOpen(false);
      await refreshHistory();
    } catch (err) {
      console.error('Failed to start blank attempt:', err);
    } finally {
      setIsLoading(false);
    }
  }, [problemId, service, refreshHistory]);

  // Try Again / Retry from COMPLETED attempt
  const handleRetry = useCallback(async () => {
    const currentAttempt = attemptRef.current;
    if (!currentAttempt) return;

    try {
      setIsLoading(true);
      // Calls domain retry() which clones submission and creates new DRAFT attempt
      const newDraftAttempt = await service.retryAttempt(currentAttempt.id);

      setAttempt(newDraftAttempt);
      // Canvas is unlocked for the new draft
      const restored = submissionToGraph(
        newDraftAttempt.submission,
        handleNodeDataChange,
        false
      );
      setNodes(restored.nodes);
      setEdges(restored.edges);
      setSaveStatus('saved');
      setIsScorecardOpen(false);
      await refreshHistory();
    } catch (err) {
      console.error('Failed to retry attempt:', err);
    } finally {
      setIsLoading(false);
    }
  }, [service, handleNodeDataChange, refreshHistory]);

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

  // Submit Architecture and call AI evaluation pipeline
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
      await refreshHistory();

      // Update nodes to read-only during evaluation
      setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isReadOnly: true,
          },
        }))
      );

      // 5. Call /api/evaluate backend pipeline
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          submission,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.feedback) {
        // Complete attempt with validated AI feedback
        const completedAttempt = await service.completeAttempt(
          evaluatingAttempt.id,
          result.feedback
        );
        setAttempt(completedAttempt);
        await refreshHistory();

        // EXACT CONDITION: Automatically open scorecard ONLY here upon successful completion
        setIsScorecardOpen(true);
      } else {
        // Fail attempt with descriptive error
        const errorMsg = result.error || `Evaluation failed with status ${res.status}`;
        const failedAttempt = await service.failAttempt(evaluatingAttempt.id, errorMsg);
        setAttempt(failedAttempt);
        await refreshHistory();

        // Unlock nodes if evaluation failed so user can resubmit
        setNodes((currentNodes) =>
          currentNodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isReadOnly: false,
            },
          }))
        );
      }
    } catch (err: unknown) {
      console.error('Failed to submit and evaluate architecture:', err);
      const errMsg = err instanceof Error ? err.message : 'Network error during evaluation';
      if (attemptRef.current) {
        const failedAttempt = await service.failAttempt(attemptRef.current.id, errMsg);
        setAttempt(failedAttempt);
        await refreshHistory();
        setNodes((currentNodes) =>
          currentNodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              isReadOnly: false,
            },
          }))
        );
      }
    }
  }, [isLocked, problemId, service, refreshHistory]);

  return {
    attempt,
    history,
    attemptNumber,
    nodes,
    edges,
    isLoading,
    isLocked,
    saveStatus,
    isScorecardOpen,
    isHistoryOpen,
    setIsScorecardOpen,
    setIsHistoryOpen,
    selectAttempt,
    startBlankAttempt,
    handleRetry,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addClassNode,
    saveDraft,
    submitArchitecture,
  };
}
