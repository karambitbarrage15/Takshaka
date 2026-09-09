import { describe, it, expect, beforeEach } from 'vitest';
import { PracticeSessionService } from '../../application/PracticeSessionService';
import { AttemptRepository } from '../../domain/AttemptRepository';
import { Attempt, AttemptStatus } from '../../domain/Attempt';
import { Submission, NodeType } from '../../domain/Submission';
import { Feedback } from '../../domain/Feedback';
import {
  AttemptNotFoundError,
  DuplicateEvaluationError,
  ImmutableAttemptError,
  InvalidStateTransitionError,
} from '../../domain/Errors';

class InMemoryAttemptRepository implements AttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  async getById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  async getAllForProblem(problemId: string): Promise<Attempt[]> {
    return Array.from(this.attempts.values()).filter((a) => a.problemId === problemId);
  }
}

describe('PracticeSessionService (Application Layer)', () => {
  let repo: InMemoryAttemptRepository;
  let service: PracticeSessionService;
  let nextId: number;

  const mockIdGenerator = () => `att-${nextId++}`;

  const sampleSubmission: Submission = {
    format: 'REACT_FLOW_GRAPH',
    content: {
      nodes: [
        {
          id: 'n1',
          name: 'ParkingLot',
          type: NodeType.CLASS,
          properties: 'spots: List<Spot>',
          methods: 'parkVehicle(v: Vehicle): Ticket',
        },
      ],
      edges: [],
    },
  };

  const sampleFeedback: Feedback = {
    overallScore: 92,
    rubricEvaluations: [
      {
        criterion: 'Class Responsibilities',
        score: 5,
        evidence: 'ParkingLot encapsulates spot allocation',
        confidence: 'HIGH',
      },
    ],
    strengths: ['Great encapsulation'],
    improvements: [],
  };

  beforeEach(() => {
    repo = new InMemoryAttemptRepository();
    nextId = 1;
    service = new PracticeSessionService(repo, mockIdGenerator);
  });

  it('1. startAttempt creates and persists a DRAFT attempt with default content', async () => {
    const attempt = await service.startAttempt('parking-lot');

    expect(attempt.id).toBe('att-1');
    expect(attempt.problemId).toBe('parking-lot');
    expect(attempt.status).toBe(AttemptStatus.DRAFT);
    expect(attempt.submission.format).toBe('REACT_FLOW_GRAPH');

    const persisted = await repo.getById('att-1');
    expect(persisted).toBe(attempt);
  });

  it('2. startAttempt accepts custom initial submission', async () => {
    const attempt = await service.startAttempt('parking-lot', sampleSubmission);

    expect(attempt.submission).toBe(sampleSubmission);
    expect(attempt.status).toBe(AttemptStatus.DRAFT);
  });

  it('3. getAttempt works for existing and missing attempts', async () => {
    const missing = await service.getAttempt('non-existent');
    expect(missing).toBeNull();

    await service.startAttempt('parking-lot');
    const existing = await service.getAttempt('att-1');
    expect(existing).not.toBeNull();
    expect(existing!.id).toBe('att-1');
  });

  it('4. saveDraft updates a DRAFT attempt and persists it', async () => {
    await service.startAttempt('parking-lot');

    const updated = await service.saveDraft('att-1', sampleSubmission);
    expect(updated.submission).toBe(sampleSubmission);

    const persisted = await repo.getById('att-1');
    expect(persisted!.submission).toBe(sampleSubmission);
  });

  it('5. saveDraft cannot modify a COMPLETED attempt', async () => {
    await service.startAttempt('parking-lot');
    await service.submitAttempt('att-1');
    await service.completeAttempt('att-1', sampleFeedback);

    await expect(service.saveDraft('att-1', sampleSubmission)).rejects.toThrow(
      ImmutableAttemptError
    );
  });

  it('6. submitAttempt transitions DRAFT → EVALUATING and persists', async () => {
    await service.startAttempt('parking-lot');

    const evaluating = await service.submitAttempt('att-1');
    expect(evaluating.status).toBe(AttemptStatus.EVALUATING);

    const persisted = await repo.getById('att-1');
    expect(persisted!.status).toBe(AttemptStatus.EVALUATING);
  });

  it('7. duplicate evaluation is rejected by domain invariants', async () => {
    await service.startAttempt('parking-lot');
    await service.submitAttempt('att-1');

    await expect(service.submitAttempt('att-1')).rejects.toThrow(DuplicateEvaluationError);
  });

  it('8. completeAttempt transitions EVALUATING → COMPLETED and stores feedback', async () => {
    await service.startAttempt('parking-lot');
    await service.submitAttempt('att-1');

    const completed = await service.completeAttempt('att-1', sampleFeedback);
    expect(completed.status).toBe(AttemptStatus.COMPLETED);
    expect(completed.feedback).toBe(sampleFeedback);

    const persisted = await repo.getById('att-1');
    expect(persisted!.status).toBe(AttemptStatus.COMPLETED);
    expect(persisted!.feedback).toBe(sampleFeedback);
  });

  it('9. completeAttempt fails if attempt is not in EVALUATING state', async () => {
    await service.startAttempt('parking-lot');

    // Attempt is in DRAFT, cannot jump straight to COMPLETED
    await expect(service.completeAttempt('att-1', sampleFeedback)).rejects.toThrow(
      InvalidStateTransitionError
    );
  });

  it('10. failAttempt transitions EVALUATING → FAILED with error message', async () => {
    await service.startAttempt('parking-lot');
    await service.submitAttempt('att-1');

    const failed = await service.failAttempt('att-1', 'AI service timed out');
    expect(failed.status).toBe(AttemptStatus.FAILED);
    expect(failed.error).toBe('AI service timed out');

    const persisted = await repo.getById('att-1');
    expect(persisted!.status).toBe(AttemptStatus.FAILED);
    expect(persisted!.error).toBe('AI service timed out');
  });

  it('11. retryAttempt creates a NEW DRAFT attempt while keeping original unchanged', async () => {
    await service.startAttempt('parking-lot', sampleSubmission);
    await service.submitAttempt('att-1');
    await service.completeAttempt('att-1', sampleFeedback);

    const retryAttempt = await service.retryAttempt('att-1');

    // New attempt assertions
    expect(retryAttempt.id).toBe('att-2');
    expect(retryAttempt.problemId).toBe('parking-lot');
    expect(retryAttempt.status).toBe(AttemptStatus.DRAFT);
    expect(retryAttempt.submission.content).toEqual(sampleSubmission.content);

    // Original completed attempt remains immutable
    const original = await repo.getById('att-1');
    expect(original!.id).toBe('att-1');
    expect(original!.status).toBe(AttemptStatus.COMPLETED);
    expect(original!.feedback).toBe(sampleFeedback);
  });

  it('12. getHistoryForProblem correctly filters by problemId', async () => {
    await service.startAttempt('parking-lot');
    await service.startAttempt('parking-lot');
    await service.startAttempt('elevator-system');

    const parkingHistory = await service.getHistoryForProblem('parking-lot');
    expect(parkingHistory).toHaveLength(2);
    expect(parkingHistory.every((a) => a.problemId === 'parking-lot')).toBe(true);

    const elevatorHistory = await service.getHistoryForProblem('elevator-system');
    expect(elevatorHistory).toHaveLength(1);
    expect(elevatorHistory[0].problemId).toBe('elevator-system');
  });

  it('13. Operations throw AttemptNotFoundError when target attempt does not exist', async () => {
    await expect(service.saveDraft('ghost-id', sampleSubmission)).rejects.toThrow(
      AttemptNotFoundError
    );
    await expect(service.submitAttempt('ghost-id')).rejects.toThrow(AttemptNotFoundError);
    await expect(service.completeAttempt('ghost-id', sampleFeedback)).rejects.toThrow(
      AttemptNotFoundError
    );
    await expect(service.failAttempt('ghost-id', 'err')).rejects.toThrow(AttemptNotFoundError);
    await expect(service.retryAttempt('ghost-id')).rejects.toThrow(AttemptNotFoundError);
  });
});
