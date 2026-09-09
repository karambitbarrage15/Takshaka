import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAttemptRepository } from '../../infrastructure/LocalStorageAttemptRepository';
import { Attempt, AttemptStatus } from '../../domain/Attempt';
import { Submission, NodeType } from '../../domain/Submission';
import { Feedback } from '../../domain/Feedback';
import { DuplicateEvaluationError, ImmutableAttemptError } from '../../domain/Errors';

class MockStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
}

describe('LocalStorageAttemptRepository', () => {
  let storage: MockStorage;
  let repo: LocalStorageAttemptRepository;

  const sampleSubmission: Submission = {
    format: 'REACT_FLOW_GRAPH',
    content: {
      nodes: [
        {
          id: 'n1',
          name: 'ParkingLot',
          type: NodeType.CLASS,
          properties: 'floors: List<Floor>',
          methods: 'park(Vehicle): Ticket',
        },
      ],
      edges: [
        {
          id: 'e1',
          sourceId: 'n1',
          targetId: 'n2',
          label: 'has-a',
        },
      ],
    },
    submittedAt: new Date('2026-09-10T00:00:00.000Z'),
  };

  const sampleFeedback: Feedback = {
    overallScore: 85,
    rubricEvaluations: [
      {
        criterion: 'Class Responsibilities',
        score: 4,
        evidence: 'ParkingLot delegates spot finding',
        concern: 'Fee calculation could be decoupled',
        suggestion: 'Introduce FeeStrategy',
        confidence: 'HIGH',
      },
    ],
    strengths: ['Clear encapsulation'],
    improvements: ['Extract fee strategy'],
  };

  beforeEach(() => {
    storage = new MockStorage();
    repo = new LocalStorageAttemptRepository(storage, 'test_attempts');
  });

  it('1. Rehydrates authentic Attempt domain instances with behavior intact', async () => {
    const attempt = new Attempt('att-1', 'parking-lot', sampleSubmission, AttemptStatus.DRAFT);
    await repo.save(attempt);

    const loaded = await repo.getById('att-1');
    expect(loaded).not.toBeNull();
    expect(loaded).toBeInstanceOf(Attempt);

    // Verify domain methods still work on rehydrated instance
    loaded!.startEvaluation();
    expect(loaded!.status).toBe(AttemptStatus.EVALUATING);

    // Duplicate evaluation invariant holds
    expect(() => loaded!.startEvaluation()).toThrow(DuplicateEvaluationError);
  });

  it('2. Fully rehydrates nested domain data and preserves Date instances', async () => {
    const createdAt = new Date('2026-09-09T12:00:00.000Z');
    const attempt = new Attempt(
      'att-nested',
      'elevator-system',
      sampleSubmission,
      AttemptStatus.COMPLETED,
      sampleFeedback,
      null,
      createdAt
    );

    await repo.save(attempt);

    const loaded = await repo.getById('att-nested');
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe('att-nested');
    expect(loaded!.problemId).toBe('elevator-system');
    expect(loaded!.status).toBe(AttemptStatus.COMPLETED);
    expect(loaded!.createdAt).toBeInstanceOf(Date);
    expect(loaded!.createdAt.toISOString()).toBe(createdAt.toISOString());

    // Submission check
    expect(loaded!.submission.format).toBe('REACT_FLOW_GRAPH');
    expect(loaded!.submission.submittedAt).toBeInstanceOf(Date);
    expect(loaded!.submission.submittedAt!.toISOString()).toBe(sampleSubmission.submittedAt!.toISOString());

    const graph = loaded!.submission.content as typeof sampleSubmission.content;
    expect(typeof graph).toBe('object');
    if (typeof graph === 'object') {
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0].name).toBe('ParkingLot');
      expect(graph.nodes[0].type).toBe(NodeType.CLASS);
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0].label).toBe('has-a');
    }

    // Feedback check
    expect(loaded!.feedback).not.toBeNull();
    expect(loaded!.feedback!.overallScore).toBe(85);
    expect(loaded!.feedback!.rubricEvaluations).toHaveLength(1);
    expect(loaded!.feedback!.rubricEvaluations[0].criterion).toBe('Class Responsibilities');
    expect(loaded!.feedback!.rubricEvaluations[0].confidence).toBe('HIGH');
    expect(loaded!.feedback!.strengths).toEqual(['Clear encapsulation']);

    // Completed invariant check
    expect(() => loaded!.startEvaluation()).toThrow(ImmutableAttemptError);
  });

  it('3. Handles corrupted JSON and invalid records without crashing', async () => {
    // Corrupted non-JSON string
    storage.setItem('test_attempts', 'NOT_VALID_JSON{]');
    expect(await repo.getById('any-id')).toBeNull();
    expect(await repo.getAllForProblem('parking-lot')).toEqual([]);

    // Valid JSON but incompatible structure
    storage.setItem(
      'test_attempts',
      JSON.stringify({
        'bad-1': { id: 'bad-1', problemId: 'parking-lot' }, // missing submission, status
        'good-1': {
          id: 'good-1',
          problemId: 'parking-lot',
          status: AttemptStatus.DRAFT,
          submission: { format: 'TEXT', content: 'class Car {}' },
          feedback: null,
          error: null,
          createdAt: new Date().toISOString(),
        },
      })
    );

    expect(await repo.getById('bad-1')).toBeNull();
    const loadedGood = await repo.getById('good-1');
    expect(loadedGood).toBeInstanceOf(Attempt);
    expect(loadedGood!.id).toBe('good-1');

    const all = await repo.getAllForProblem('parking-lot');
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('good-1');
  });

  it('4. Returns empty array when storage is empty', async () => {
    const results = await repo.getAllForProblem('parking-lot');
    expect(results).toEqual([]);
  });

  it('5. Correctly saves multiple attempts and filters by problemId', async () => {
    const attempt1 = new Attempt('att-p1-1', 'parking-lot', sampleSubmission, AttemptStatus.DRAFT);
    const attempt2 = new Attempt('att-p1-2', 'parking-lot', sampleSubmission, AttemptStatus.COMPLETED, sampleFeedback);
    const attempt3 = new Attempt('att-p2-1', 'elevator-system', sampleSubmission, AttemptStatus.DRAFT);

    await repo.save(attempt1);
    await repo.save(attempt2);
    await repo.save(attempt3);

    const parkingAttempts = await repo.getAllForProblem('parking-lot');
    expect(parkingAttempts).toHaveLength(2);
    expect(parkingAttempts.map((a) => a.id)).toEqual(['att-p1-1', 'att-p1-2']);

    const elevatorAttempts = await repo.getAllForProblem('elevator-system');
    expect(elevatorAttempts).toHaveLength(1);
    expect(elevatorAttempts[0].id).toBe('att-p2-1');
  });

  it('6. Overwrites existing attempt on save rather than duplicating', async () => {
    const attempt = new Attempt('att-update', 'parking-lot', sampleSubmission, AttemptStatus.DRAFT);
    await repo.save(attempt);

    // Mutate and save with same ID
    attempt.startEvaluation();
    await repo.save(attempt);

    const all = await repo.getAllForProblem('parking-lot');
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('att-update');
    expect(all[0].status).toBe(AttemptStatus.EVALUATING);
  });

  it('7. Operates safely without crashing when storage is unavailable (SSR safety)', async () => {
    const ssrRepo = new LocalStorageAttemptRepository(undefined, 'ssr_test');
    // When window is undefined (e.g. Node/SSR), it gracefully no-ops
    const attempt = new Attempt('ssr-1', 'parking-lot', sampleSubmission);
    await expect(ssrRepo.save(attempt)).resolves.toBeUndefined();
    await expect(ssrRepo.getById('ssr-1')).resolves.toBeNull();
    await expect(ssrRepo.getAllForProblem('parking-lot')).resolves.toEqual([]);
  });

  it('8. Catches storage.setItem QuotaExceededError without crashing the application', async () => {
    const quotaStorage: Storage = {
      length: 0,
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {
        throw new Error('QuotaExceededError: storage full');
      },
    };

    const quotaRepo = new LocalStorageAttemptRepository(quotaStorage, 'quota_key');
    const attempt = new Attempt('att-q', 'parking-lot', sampleSubmission);

    // Save should swallow quota error gracefully
    await expect(quotaRepo.save(attempt)).resolves.toBeUndefined();
  });

  it('9. Drops corrupted records with invalid nodeType during rehydration', async () => {
    storage.setItem(
      'test_attempts',
      JSON.stringify({
        'bad-node-type': {
          id: 'bad-node-type',
          problemId: 'parking-lot',
          status: AttemptStatus.DRAFT,
          submission: {
            format: 'REACT_FLOW_GRAPH',
            content: {
              nodes: [
                {
                  id: 'n1',
                  name: 'Car',
                  type: 'INVALID_TYPE_ENUM', // invalid NodeType
                  properties: '',
                  methods: '',
                },
              ],
              edges: [],
            },
          },
          feedback: null,
          error: null,
          createdAt: new Date().toISOString(),
        },
      })
    );

    const loaded = await repo.getById('bad-node-type');
    expect(loaded).toBeNull();
  });

  it('10. getAllForProblem sorts attempts chronologically by createdAt', async () => {
    const older = new Attempt(
      'older',
      'parking-lot',
      sampleSubmission,
      AttemptStatus.COMPLETED,
      sampleFeedback,
      null,
      new Date('2026-09-01T10:00:00.000Z')
    );
    const newer = new Attempt(
      'newer',
      'parking-lot',
      sampleSubmission,
      AttemptStatus.DRAFT,
      null,
      null,
      new Date('2026-09-02T10:00:00.000Z')
    );

    // Save out of order
    await repo.save(newer);
    await repo.save(older);

    const results = await repo.getAllForProblem('parking-lot');
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('older');
    expect(results[1].id).toBe('newer');
  });
});

