import { Attempt } from './Attempt';

export interface AttemptRepository {
  save(attempt: Attempt): Promise<void>;
  getById(id: string): Promise<Attempt | null>;
  getAllForProblem(problemId: string): Promise<Attempt[]>;
}
