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
    <div className="relative h-full w-full bg-background text-foreground">
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
          <div className="rounded-xl border border-dashed border-border bg-card/80 p-8 shadow-sm backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-foreground">
              Blank Architectural Canvas
            </h4>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Click <span className="font-semibold text-primary">+ Add Class</span> on
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
