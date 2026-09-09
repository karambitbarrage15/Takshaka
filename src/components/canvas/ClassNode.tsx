'use client';

import React, { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeType } from '../../domain/Submission';
import { ClassFlowNode } from './mapper';

function ClassNodeComponent({ id, data }: NodeProps<ClassFlowNode>) {
  const isReadOnly = !!data.isReadOnly;

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      data.onChange?.({ name: e.target.value });
    },
    [data]
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      data.onChange?.({ type: e.target.value as NodeType });
    },
    [data]
  );

  const handlePropertiesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      data.onChange?.({ properties: e.target.value });
    },
    [data]
  );

  const handleMethodsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      data.onChange?.({ methods: e.target.value });
    },
    [data]
  );

  return (
    <div className="w-64 rounded-lg border-2 border-border bg-card shadow-md transition-shadow hover:shadow-lg text-card-foreground">
      {/* 4 Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-3 !w-3 !bg-primary hover:!bg-primary/80"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-3 !w-3 !bg-primary hover:!bg-primary/80"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-3 !w-3 !bg-primary hover:!bg-primary/80"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-3 !w-3 !bg-primary hover:!bg-primary/80"
      />

      {/* Header with Type and Class Name */}
      <div className="border-b border-border bg-muted/60 p-2.5">
        <div className="flex items-center justify-between gap-1 pb-1">
          {isReadOnly ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground border border-border">
              {data.type || NodeType.CLASS}
            </span>
          ) : (
            <select
              value={data.type || NodeType.CLASS}
              onChange={handleTypeChange}
              disabled={isReadOnly}
              className="nodrag rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-foreground"
            >
              <option value={NodeType.CLASS}>class</option>
              <option value={NodeType.ABSTRACT_CLASS}>abstract class</option>
              <option value={NodeType.INTERFACE}>interface</option>
              <option value={NodeType.ENUM}>enum</option>
            </select>
          )}
          <span className="text-[10px] font-mono text-muted-foreground">#{id.slice(-4)}</span>
        </div>

        <input
          type="text"
          value={data.name || ''}
          onChange={handleNameChange}
          placeholder="ClassName"
          disabled={isReadOnly}
          className="nodrag w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-bold text-foreground focus:border-primary focus:bg-card focus:outline-none"
        />
      </div>

      {/* Properties Section */}
      <div className="border-b border-border p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Properties
        </div>
        <textarea
          rows={3}
          value={data.properties || ''}
          onChange={handlePropertiesChange}
          placeholder="- id: string&#10;- status: Status"
          disabled={isReadOnly}
          className="nodrag mt-1 w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:bg-card focus:outline-none"
        />
      </div>

      {/* Methods Section */}
      <div className="p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Methods
        </div>
        <textarea
          rows={3}
          value={data.methods || ''}
          onChange={handleMethodsChange}
          placeholder="+ execute(): void&#10;+ getId(): string"
          disabled={isReadOnly}
          className="nodrag mt-1 w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:bg-card focus:outline-none"
        />
      </div>
    </div>
  );
}

export const ClassNode = memo(ClassNodeComponent);
