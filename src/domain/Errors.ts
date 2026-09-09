export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export class ImmutableAttemptError extends DomainError {
  constructor() {
    super('A completed attempt cannot be modified or evaluated again');
    this.name = 'ImmutableAttemptError';
  }
}

export class DuplicateEvaluationError extends DomainError {
  constructor() {
    super('Attempt is already being evaluated');
    this.name = 'DuplicateEvaluationError';
  }
}
