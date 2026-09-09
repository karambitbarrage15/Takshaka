import { Problem } from './Problem';
import { Submission } from './Submission';
import { Feedback } from './Feedback';

export interface Evaluator {
  evaluate(problem: Problem, submission: Submission): Promise<Feedback>;
}
