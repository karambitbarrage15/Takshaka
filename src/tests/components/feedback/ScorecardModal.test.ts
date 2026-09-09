import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { ScorecardModal } from '../../../components/feedback/ScorecardModal';
import { Feedback } from '../../../domain/Feedback';

describe('ScorecardModal Component', () => {
  const sampleFeedback: Feedback = {
    overallScore: 85,
    rubricEvaluations: [
      {
        criterion: 'Vehicle Abstraction',
        score: 4,
        evidence: 'Vehicle interface used across Spot',
        concern: 'Missing motorcycle vehicle type',
        suggestion: 'Add Motorcycle class',
        confidence: 'HIGH',
      },
    ],
    strengths: ['Clear encapsulation of spots', 'Strategy pattern for fees'],
    improvements: ['Decouple spot finding into FloorManager'],
  };

  it('1. Returns null when isOpen is false', () => {
    const element = ScorecardModal({
      isOpen: false,
      onClose: () => {},
      onRetry: () => {},
      feedback: sampleFeedback,
      attemptNumber: 1,
      problemTitle: 'Design a Parking Lot',
    });

    expect(element).toBeNull();
  });

  it('2. Returns null when feedback is null', () => {
    const element = ScorecardModal({
      isOpen: true,
      onClose: () => {},
      onRetry: () => {},
      feedback: null,
      attemptNumber: 1,
      problemTitle: 'Design a Parking Lot',
    });

    expect(element).toBeNull();
  });

  it('3. Renders modal dialog when isOpen is true with feedback', () => {
    const element = ScorecardModal({
      isOpen: true,
      onClose: () => {},
      onRetry: () => {},
      feedback: sampleFeedback,
      attemptNumber: 2,
      problemTitle: 'Design a Parking Lot',
    });

    expect(element).not.toBeNull();
    expect(React.isValidElement(element)).toBe(true);
    expect(element?.props.role).toBe('dialog');
    expect(element?.props['aria-modal']).toBe('true');
  });

  it('4. Correctly triggers onClose callback', () => {
    const onCloseSpy = vi.fn();
    const element = ScorecardModal({
      isOpen: true,
      onClose: onCloseSpy,
      onRetry: () => {},
      feedback: sampleFeedback,
      attemptNumber: 1,
      problemTitle: 'Design a Parking Lot',
    });

    // Traverse element to find close button
    const header = element?.props.children.props.children[0];
    const closeBtn = header.props.children[1];
    closeBtn.props.onClick();

    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('5. Correctly triggers onRetry callback from Try Again button', () => {
    const onRetrySpy = vi.fn();
    const element = ScorecardModal({
      isOpen: true,
      onClose: () => {},
      onRetry: onRetrySpy,
      feedback: sampleFeedback,
      attemptNumber: 1,
      problemTitle: 'Design a Parking Lot',
    });

    // Traverse to footer actions
    const footer = element?.props.children.props.children[2];
    const tryAgainBtn = footer.props.children[1];
    tryAgainBtn.props.onClick();

    expect(onRetrySpy).toHaveBeenCalledTimes(1);
  });

  it('6. Displays Passing Architecture for score >= 75 and Needs Refinement for score < 75', () => {
    const passingElement = ScorecardModal({
      isOpen: true,
      onClose: () => {},
      onRetry: () => {},
      feedback: { ...sampleFeedback, overallScore: 80 },
      attemptNumber: 1,
      problemTitle: 'Test',
    });

    const body = passingElement?.props.children.props.children[1];
    const banner = body.props.children[0];
    const verdict = banner.props.children[0].props.children[1].props.children;
    expect(verdict).toBe('Passing Architecture');

    const failingElement = ScorecardModal({
      isOpen: true,
      onClose: () => {},
      onRetry: () => {},
      feedback: { ...sampleFeedback, overallScore: 60 },
      attemptNumber: 1,
      problemTitle: 'Test',
    });

    const failBody = failingElement?.props.children.props.children[1];
    const failBanner = failBody.props.children[0];
    const failVerdict = failBanner.props.children[0].props.children[1].props.children;
    expect(failVerdict).toBe('Needs Refinement');
  });

  it('7. Renders strengths, improvements, and rubric details when present', () => {
    const element = ScorecardModal({
      isOpen: true,
      onClose: () => {},
      onRetry: () => {},
      feedback: sampleFeedback,
      attemptNumber: 1,
      problemTitle: 'Design a Parking Lot',
    });

    expect(element).not.toBeNull();
    const body = element?.props.children.props.children[1];
    // Rubric section is at index 2 (0: Score Banner, 1: Strengths/Improvements grid, 2: Rubric Assessment)
    const rubricSection = body.props.children[2];
    expect(rubricSection).toBeDefined();
    // Rubric items container is index 1 of rubricSection
    const rubricItems = rubricSection.props.children[1].props.children;
    expect(rubricItems).toHaveLength(1);
    const headerRow = rubricItems[0].props.children[0];
    expect(headerRow.props.children[0].props.children).toBe('Vehicle Abstraction');
  });
});



