'use client';

import React from 'react';
import { Problem } from '../../domain/Problem';
import { AttemptStatus } from '../../domain/Attempt';
import { ProblemPanel } from './ProblemPanel';
import { CanvasToolbar } from '../canvas/CanvasToolbar';
import { ReactFlowCanvas } from '../canvas/ReactFlowCanvas';
import { usePracticeSession } from '../../hooks/usePracticeSession';

interface WorkspaceProps {
  problem: Problem;
}

export function Workspace({ problem }: WorkspaceProps) {
  const {
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
  } = usePracticeSession(problem.id);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Loading practice session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Left Pane: Problem Requirements & Rubric (35% width, min 360px, max 480px) */}
      <div className="w-[380px] shrink-0 border-r border-zinc-200 dark:border-zinc-800">
        <ProblemPanel problem={problem} />
      </div>

      {/* Right Pane: React Flow Canvas Workspace (flex-1) */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Canvas Toolbar */}
        <CanvasToolbar
          onAddClass={addClassNode}
          onSaveDraft={saveDraft}
          onSubmit={submitArchitecture}
          saveStatus={saveStatus}
          attemptStatus={attempt?.status || AttemptStatus.DRAFT}
          isLocked={isLocked}
          nodeCount={nodes.length}
        />

        {/* Canvas Area */}
        <div className="relative flex-1">
          <ReactFlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isLocked={isLocked}
          />
        </div>
      </main>
    </div>
  );
}
