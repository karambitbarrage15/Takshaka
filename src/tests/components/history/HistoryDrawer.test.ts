import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { HistoryDrawer } from '../../../components/history/HistoryDrawer';
import { Attempt, AttemptStatus } from '../../../domain/Attempt';

describe('HistoryDrawer Component', () => {
  const attempt1 = new Attempt(
    'att-1',
    'parking-lot',
    { format: 'REACT_FLOW_GRAPH', content: { nodes: [], edges: [] } },
    AttemptStatus.COMPLETED,
    { overallScore: 85, rubricEvaluations: [], strengths: [], improvements: [] },
    null,
    new Date('2026-09-10T01:00:00.000Z')
  );

  const attempt2 = new Attempt(
    'att-2',
    'parking-lot',
    { format: 'REACT_FLOW_GRAPH', content: { nodes: [], edges: [] } },
    AttemptStatus.DRAFT,
    null,
    null,
    new Date('2026-09-10T02:00:00.000Z')
  );

  it('1. Returns null when isOpen is false', () => {
    const element = HistoryDrawer({
      isOpen: false,
      onClose: () => {},
      attempts: [attempt1, attempt2],
      activeAttemptId: 'att-2',
      onSelectAttempt: () => {},
      onStartBlankAttempt: () => {},
    });

    expect(element).toBeNull();
  });

  it('2. Renders history dialog when isOpen is true', () => {
    const element = HistoryDrawer({
      isOpen: true,
      onClose: () => {},
      attempts: [attempt1, attempt2],
      activeAttemptId: 'att-2',
      onSelectAttempt: () => {},
      onStartBlankAttempt: () => {},
    });

    expect(element).not.toBeNull();
    expect(React.isValidElement(element)).toBe(true);
    expect(element?.props.role).toBe('dialog');
  });

  it('3. Triggers onClose callback from header button', () => {
    const onCloseSpy = vi.fn();
    const element = HistoryDrawer({
      isOpen: true,
      onClose: onCloseSpy,
      attempts: [attempt1],
      activeAttemptId: 'att-1',
      onSelectAttempt: () => {},
      onStartBlankAttempt: () => {},
    });

    const header = element?.props.children.props.children[0];
    const closeBtn = header.props.children[1];
    closeBtn.props.onClick();

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('4. Triggers onStartBlankAttempt callback from action button', () => {
    const onStartBlankSpy = vi.fn();
    const element = HistoryDrawer({
      isOpen: true,
      onClose: () => {},
      attempts: [attempt1],
      activeAttemptId: 'att-1',
      onSelectAttempt: () => {},
      onStartBlankAttempt: onStartBlankSpy,
    });

    const actionSection = element?.props.children.props.children[1];
    const startBlankBtn = actionSection.props.children;
    startBlankBtn.props.onClick();

    expect(onStartBlankSpy).toHaveBeenCalledTimes(1);
  });

  it('5. Triggers onSelectAttempt callback with selected attempt ID', () => {
    const onSelectSpy = vi.fn();
    const element = HistoryDrawer({
      isOpen: true,
      onClose: () => {},
      attempts: [attempt1, attempt2],
      activeAttemptId: 'att-2',
      onSelectAttempt: onSelectSpy,
      onStartBlankAttempt: () => {},
    });

    const listSection = element?.props.children.props.children[2];
    const firstItem = listSection.props.children[0]; // Newest first (attempt2)
    firstItem.props.onClick();

    expect(onSelectSpy).toHaveBeenCalledWith('att-2');
  });

  it('6. Renders empty history notice when attempts array is empty', () => {
    const element = HistoryDrawer({
      isOpen: true,
      onClose: () => {},
      attempts: [],
      activeAttemptId: null,
      onSelectAttempt: () => {},
      onStartBlankAttempt: () => {},
    });

    const emptyNotice = element?.props.children.props.children[2];
    expect(emptyNotice.props.children.props.children).toBe('No attempts yet. Start designing on the canvas.');
  });
});


