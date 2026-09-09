import { Attempt } from '../domain/Attempt';
import { AttemptRepository } from '../domain/AttemptRepository';
import { Submission } from '../domain/Submission';
import { Feedback } from '../domain/Feedback';
import { AttemptNotFoundError } from '../domain/Errors';

export class PracticeSessionService {
  constructor(
    private readonly attemptRepo: AttemptRepository,
    private readonly idGenerator: () => string = () =>
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2)
  ) {}

  public async startAttempt(
    problemId: string,
    initialSubmission: Submission = {
      format: 'REACT_FLOW_GRAPH',
      content: { nodes: [], edges: [] },
    }
  ): Promise<Attempt> {
    const id = this.idGenerator();
    const attempt = new Attempt(id, problemId, initialSubmission);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async getAttempt(attemptId: string): Promise<Attempt | null> {
    return this.attemptRepo.getById(attemptId);
  }

  public async saveDraft(attemptId: string, submission: Submission): Promise<Attempt> {
    const attempt = await this.requireAttempt(attemptId);
    attempt.updateSubmission(submission);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async submitAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.requireAttempt(attemptId);
    attempt.startEvaluation();
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async completeAttempt(attemptId: string, feedback: Feedback): Promise<Attempt> {
    const attempt = await this.requireAttempt(attemptId);
    attempt.complete(feedback);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async failAttempt(attemptId: string, errorMessage: string): Promise<Attempt> {
    const attempt = await this.requireAttempt(attemptId);
    attempt.fail(errorMessage);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async retryAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.requireAttempt(attemptId);
    const newAttemptId = this.idGenerator();
    const newAttempt = attempt.retry(newAttemptId);
    await this.attemptRepo.save(newAttempt);
    return newAttempt;
  }

  public async getHistoryForProblem(problemId: string): Promise<Attempt[]> {
    return this.attemptRepo.getAllForProblem(problemId);
  }

  private async requireAttempt(attemptId: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.getById(attemptId);
    if (!attempt) {
      throw new AttemptNotFoundError(attemptId);
    }
    return attempt;
  }
}
