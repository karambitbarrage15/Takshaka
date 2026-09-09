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
    <div className="w-64 rounded-lg border-2 border-zinc-300 bg-white shadow-md transition-shadow hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {/* 4 Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!h-3 !w-3 !bg-blue-500 hover:!bg-blue-600"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!h-3 !w-3 !bg-blue-500 hover:!bg-blue-600"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!h-3 !w-3 !bg-blue-500 hover:!bg-blue-600"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!h-3 !w-3 !bg-blue-500 hover:!bg-blue-600"
      />

      {/* Header with Type and Class Name */}
      <div className="border-b border-zinc-200 bg-zinc-100 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/80">
        <div className="flex items-center justify-between gap-1 pb-1">
          {isReadOnly ? (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {data.type || NodeType.CLASS}
            </span>
          ) : (
            <select
              value={data.type || NodeType.CLASS}
              onChange={handleTypeChange}
              disabled={isReadOnly}
              className="nodrag rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <option value={NodeType.CLASS}>class</option>
              <option value={NodeType.ABSTRACT_CLASS}>abstract class</option>
              <option value={NodeType.INTERFACE}>interface</option>
              <option value={NodeType.ENUM}>enum</option>
            </select>
          )}
          <span className="text-[10px] font-mono text-zinc-400">#{id.slice(-4)}</span>
        </div>

        <input
          type="text"
          value={data.name || ''}
          onChange={handleNameChange}
          placeholder="ClassName"
          disabled={isReadOnly}
          className="nodrag w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-bold text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:text-zinc-50 dark:focus:bg-zinc-950"
        />
      </div>

      {/* Properties Section */}
      <div className="border-b border-zinc-200 p-2 dark:border-zinc-800">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Properties
        </div>
        <textarea
          rows={3}
          value={data.properties || ''}
          onChange={handlePropertiesChange}
          placeholder="- id: string&#10;- status: Status"
          disabled={isReadOnly}
          className="nodrag mt-1 w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:text-zinc-200 dark:focus:bg-zinc-950"
        />
      </div>

      {/* Methods Section */}
      <div className="p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Methods
        </div>
        <textarea
          rows={3}
          value={data.methods || ''}
          onChange={handleMethodsChange}
          placeholder="+ execute(): void&#10;+ getId(): string"
          disabled={isReadOnly}
          className="nodrag mt-1 w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs text-zinc-800 placeholder-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:text-zinc-200 dark:focus:bg-zinc-950"
        />
      </div>
    </div>
  );
}

export const ClassNode = memo(ClassNodeComponent);
