import { Submission } from './Submission';
import { Feedback } from './Feedback';
import { InvalidStateTransitionError, ImmutableAttemptError, DuplicateEvaluationError } from './Errors';

export enum AttemptStatus {
  DRAFT = 'DRAFT',
  EVALUATING = 'EVALUATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Attempt {
  private _status: AttemptStatus;
  private _submission: Submission;
  private _feedback: Feedback | null;
  private _error: string | null;

  constructor(
    public readonly id: string,
    public readonly problemId: string,
    submission: Submission,
    status: AttemptStatus = AttemptStatus.DRAFT,
    feedback: Feedback | null = null,
    error: string | null = null
  ) {
    this._status = status;
    this._submission = submission;
    this._feedback = feedback;
    this._error = error;
  }

  get status(): AttemptStatus {
    return this._status;
  }

  get submission(): Submission {
    return this._submission;
  }

  get feedback(): Feedback | null {
    return this._feedback;
  }

  get error(): string | null {
    return this._error;
  }

  public updateSubmission(newSubmission: Submission): void {
    if (this._status === AttemptStatus.COMPLETED) {
      throw new ImmutableAttemptError();
    }
    if (this._status === AttemptStatus.EVALUATING) {
      throw new InvalidStateTransitionError(this._status, 'UPDATE_SUBMISSION');
    }
    this._submission = newSubmission;
  }

  public startEvaluation(): void {
    if (this._status === AttemptStatus.COMPLETED) {
      throw new ImmutableAttemptError();
    }
    if (this._status === AttemptStatus.EVALUATING) {
      throw new DuplicateEvaluationError();
    }
    
    this._status = AttemptStatus.EVALUATING;
    this._error = null;
  }

  public complete(feedback: Feedback): void {
    if (this._status !== AttemptStatus.EVALUATING) {
      throw new InvalidStateTransitionError(this._status, AttemptStatus.COMPLETED);
    }
    this._feedback = feedback;
    this._status = AttemptStatus.COMPLETED;
  }

  public fail(errorMessage: string): void {
    if (this._status !== AttemptStatus.EVALUATING) {
      throw new InvalidStateTransitionError(this._status, AttemptStatus.FAILED);
    }
    this._error = errorMessage;
    this._status = AttemptStatus.FAILED;
  }

  public retry(newAttemptId: string): Attempt {
    const clonedSubmission: Submission = {
      ...this._submission,
      submittedAt: undefined,
    };
    
    return new Attempt(
      newAttemptId,
      this.problemId,
      clonedSubmission,
      AttemptStatus.DRAFT
    );
  }
}
