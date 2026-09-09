'use client';

import React from 'react';
import { Problem } from '../../domain/Problem';
import { AttemptStatus } from '../../domain/Attempt';
import { ProblemPanel } from './ProblemPanel';
import { CanvasToolbar } from '../canvas/CanvasToolbar';
import { ReactFlowCanvas } from '../canvas/ReactFlowCanvas';
import { ScorecardModal } from '../feedback/ScorecardModal';
import { HistoryDrawer } from '../history/HistoryDrawer';
import { usePracticeSession } from '../../hooks/usePracticeSession';

interface WorkspaceProps {
  problem: Problem;
}

export function Workspace({ problem }: WorkspaceProps) {
  const {
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
      {/* Left Pane: Problem Requirements & Rubric (380px) */}
      <div className="w-[380px] shrink-0 border-r border-zinc-200 dark:border-zinc-800">
        <ProblemPanel problem={problem} />
      </div>

      {/* Right Pane: React Flow Canvas Workspace */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Canvas Toolbar */}
        <CanvasToolbar
          onAddClass={addClassNode}
          onSaveDraft={saveDraft}
          onSubmit={submitArchitecture}
          saveStatus={saveStatus}
          attemptStatus={attempt?.status || AttemptStatus.DRAFT}
          attemptNumber={attemptNumber}
          isLocked={isLocked}
          nodeCount={nodes.length}
          historyCount={history.length}
          hasFeedback={!!attempt?.feedback}
          onOpenScorecard={() => setIsScorecardOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
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

      {/* Scorecard Modal */}
      <ScorecardModal
        isOpen={isScorecardOpen}
        onClose={() => setIsScorecardOpen(false)}
        onRetry={handleRetry}
        feedback={attempt?.feedback || null}
        attemptNumber={attemptNumber}
        problemTitle={problem.title}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        attempts={history}
        activeAttemptId={attempt?.id || null}
        onSelectAttempt={selectAttempt}
        onStartBlankAttempt={startBlankAttempt}
      />
    </div>
  );
}
