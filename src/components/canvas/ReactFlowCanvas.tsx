'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from '@xyflow/react';
import { ClassNode } from './ClassNode';
import { ClassFlowNode, ClassFlowEdge } from './mapper';

interface ReactFlowCanvasProps {
  nodes: ClassFlowNode[];
  edges: ClassFlowEdge[];
  onNodesChange: OnNodesChange<ClassFlowNode>;
  onEdgesChange: OnEdgesChange<ClassFlowEdge>;
  onConnect: OnConnect;
  isLocked: boolean;
}

export function ReactFlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isLocked,
}: ReactFlowCanvasProps) {
  const nodeTypes = useMemo(
    () => ({
      classNode: ClassNode,
    }),
    []
  );

  return (
    <div className="relative h-full w-full bg-zinc-50 dark:bg-zinc-950">
      <ReactFlow<ClassFlowNode, ClassFlowEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={isLocked ? undefined : onNodesChange}
        onEdgesChange={isLocked ? undefined : onEdgesChange}
        onConnect={isLocked ? undefined : onConnect}
        nodeTypes={nodeTypes}
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
        fitView
        className="h-full w-full"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls showInteractive={!isLocked} />
      </ReactFlow>

      {/* Empty State Watermark */}
      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white/70 p-8 shadow-sm backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/70">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Blank Architectural Canvas
            </h4>
            <p className="mt-1 max-w-xs text-xs text-zinc-500 dark:text-zinc-400">
              Click <span className="font-semibold text-blue-600 dark:text-blue-400">+ Add Class</span> on
              the toolbar above to add your first domain class.
            </p>
          </div>
        </div>
      )}

      {/* Locked Overlay Banner */}
      {isLocked && (
        <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 shadow-md dark:border-amber-700 dark:bg-amber-950/90">
          <p className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-200">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-amber-500" />
            Architecture submitted. Canvas is locked in EVALUATING state.
          </p>
        </div>
      )}
    </div>
  );
}
