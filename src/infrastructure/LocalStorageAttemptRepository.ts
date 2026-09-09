import { Attempt, AttemptStatus } from '../domain/Attempt';
import { AttemptRepository } from '../domain/AttemptRepository';
import { Submission, NodeType, ClassNodeData, RelationshipData, ArchitecturalGraph } from '../domain/Submission';
import { Feedback, RubricEvaluation } from '../domain/Feedback';

interface SerializedSubmission {
  format: 'REACT_FLOW_GRAPH' | 'TEXT';
  content: unknown;
  submittedAt?: string;
}

interface SerializedAttempt {
  id: string;
  problemId: string;
  status: string;
  submission: SerializedSubmission;
  feedback: unknown | null;
  error: string | null;
  createdAt: string;
}

export class LocalStorageAttemptRepository implements AttemptRepository {
  private readonly storage: Storage | null;
  private readonly storageKey: string;

  constructor(storage?: Storage, storageKey: string = 'lld_attempts') {
    if (storage !== undefined) {
      this.storage = storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = null;
    }
    this.storageKey = storageKey;
  }

  public async save(attempt: Attempt): Promise<void> {
    if (!this.storage) {
      return;
    }

    const map = this.loadRawMap();
    const serialized = this.serialize(attempt);
    map[attempt.id] = serialized;
    this.saveRawMap(map);
  }

  public async getById(id: string): Promise<Attempt | null> {
    if (!this.storage) {
      return null;
    }

    const map = this.loadRawMap();
    const raw = map[id];
    if (!raw) {
      return null;
    }

    return this.rehydrate(raw);
  }

  public async getAllForProblem(problemId: string): Promise<Attempt[]> {
    if (!this.storage) {
      return [];
    }

    const map = this.loadRawMap();
    const attempts: Attempt[] = [];

    for (const key of Object.keys(map)) {
      const raw = map[key];
      if (raw && typeof raw === 'object' && (raw as Record<string, unknown>).problemId === problemId) {
        const attempt = this.rehydrate(raw);
        if (attempt) {
          attempts.push(attempt);
        }
      }
    }

    return attempts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  private serialize(attempt: Attempt): SerializedAttempt {
    return {
      id: attempt.id,
      problemId: attempt.problemId,
      status: attempt.status,
      submission: {
        format: attempt.submission.format,
        content: attempt.submission.content,
        submittedAt: attempt.submission.submittedAt ? attempt.submission.submittedAt.toISOString() : undefined,
      },
      feedback: attempt.feedback
        ? {
            overallScore: attempt.feedback.overallScore,
            rubricEvaluations: attempt.feedback.rubricEvaluations.map((re) => ({
              criterion: re.criterion,
              score: re.score,
              evidence: re.evidence,
              concern: re.concern,
              suggestion: re.suggestion,
              confidence: re.confidence,
            })),
            strengths: [...attempt.feedback.strengths],
            improvements: [...attempt.feedback.improvements],
          }
        : null,
      error: attempt.error,
      createdAt: attempt.createdAt.toISOString(),
    };
  }

  private rehydrate(raw: unknown): Attempt | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const candidate = raw as Record<string, unknown>;

    if (typeof candidate.id !== 'string' || !candidate.id.trim()) {
      return null;
    }

    if (typeof candidate.problemId !== 'string' || !candidate.problemId.trim()) {
      return null;
    }

    const statusStr = candidate.status;
    if (
      statusStr !== AttemptStatus.DRAFT &&
      statusStr !== AttemptStatus.EVALUATING &&
      statusStr !== AttemptStatus.COMPLETED &&
      statusStr !== AttemptStatus.FAILED
    ) {
      return null;
    }
    const status: AttemptStatus = statusStr;

    // Validate and rehydrate submission
    if (!candidate.submission || typeof candidate.submission !== 'object') {
      return null;
    }
    const rawSub = candidate.submission as Record<string, unknown>;

    if (rawSub.format !== 'REACT_FLOW_GRAPH' && rawSub.format !== 'TEXT') {
      return null;
    }

    let submissionContent: ArchitecturalGraph | string;
    if (rawSub.format === 'TEXT') {
      if (typeof rawSub.content !== 'string') {
        return null;
      }
      submissionContent = rawSub.content;
    } else {
      if (!rawSub.content || typeof rawSub.content !== 'object') {
        return null;
      }
      const rawGraph = rawSub.content as Record<string, unknown>;
      if (!Array.isArray(rawGraph.nodes) || !Array.isArray(rawGraph.edges)) {
        return null;
      }

      const nodes: ClassNodeData[] = [];
      for (const rawNode of rawGraph.nodes) {
        if (!rawNode || typeof rawNode !== 'object') return null;
        const n = rawNode as Record<string, unknown>;
        if (typeof n.id !== 'string' || typeof n.name !== 'string') return null;

        const nodeType = n.type as NodeType;
        if (
          nodeType !== NodeType.CLASS &&
          nodeType !== NodeType.ABSTRACT_CLASS &&
          nodeType !== NodeType.INTERFACE &&
          nodeType !== NodeType.ENUM
        ) {
          return null;
        }

        nodes.push({
          id: n.id,
          name: n.name,
          type: nodeType,
          properties: typeof n.properties === 'string' ? n.properties : '',
          methods: typeof n.methods === 'string' ? n.methods : '',
        });
      }

      const edges: RelationshipData[] = [];
      for (const rawEdge of rawGraph.edges) {
        if (!rawEdge || typeof rawEdge !== 'object') return null;
        const e = rawEdge as Record<string, unknown>;
        if (typeof e.id !== 'string' || typeof e.sourceId !== 'string' || typeof e.targetId !== 'string') {
          return null;
        }
        edges.push({
          id: e.id,
          sourceId: e.sourceId,
          targetId: e.targetId,
          label: typeof e.label === 'string' ? e.label : undefined,
        });
      }

      submissionContent = { nodes, edges };
    }

    let submittedAt: Date | undefined;
    if (typeof rawSub.submittedAt === 'string') {
      const parsedDate = new Date(rawSub.submittedAt);
      if (!isNaN(parsedDate.getTime())) {
        submittedAt = parsedDate;
      }
    }

    const submission: Submission = {
      format: rawSub.format,
      content: submissionContent,
      submittedAt,
    };

    // Validate and rehydrate feedback
    let feedback: Feedback | null = null;
    if (candidate.feedback && typeof candidate.feedback === 'object') {
      const fb = candidate.feedback as Record<string, unknown>;
      if (typeof fb.overallScore !== 'number') {
        return null;
      }

      if (!Array.isArray(fb.rubricEvaluations) || !Array.isArray(fb.strengths) || !Array.isArray(fb.improvements)) {
        return null;
      }

      const rubricEvaluations: RubricEvaluation[] = [];
      for (const rawEv of fb.rubricEvaluations) {
        if (!rawEv || typeof rawEv !== 'object') return null;
        const ev = rawEv as Record<string, unknown>;
        if (typeof ev.criterion !== 'string' || typeof ev.score !== 'number' || typeof ev.evidence !== 'string') {
          return null;
        }
        const conf = ev.confidence;
        if (conf !== 'LOW' && conf !== 'MEDIUM' && conf !== 'HIGH') {
          return null;
        }

        rubricEvaluations.push({
          criterion: ev.criterion,
          score: ev.score,
          evidence: ev.evidence,
          concern: typeof ev.concern === 'string' ? ev.concern : undefined,
          suggestion: typeof ev.suggestion === 'string' ? ev.suggestion : undefined,
          confidence: conf,
        });
      }

      feedback = {
        overallScore: fb.overallScore,
        rubricEvaluations,
        strengths: fb.strengths.filter((s): s is string => typeof s === 'string'),
        improvements: fb.improvements.filter((i): i is string => typeof i === 'string'),
      };
    }

    const error = typeof candidate.error === 'string' ? candidate.error : null;

    let createdAt: Date = new Date();
    if (typeof candidate.createdAt === 'string') {
      const parsedCreated = new Date(candidate.createdAt);
      if (!isNaN(parsedCreated.getTime())) {
        createdAt = parsedCreated;
      }
    }

    return new Attempt(
      candidate.id,
      candidate.problemId,
      submission,
      status,
      feedback,
      error,
      createdAt
    );
  }

  private loadRawMap(): Record<string, unknown> {
    if (!this.storage) {
      return {};
    }

    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }
      return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private saveRawMap(map: Record<string, unknown>): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(map));
    } catch {
      // Silently catch quota or environment errors
    }
  }
}
