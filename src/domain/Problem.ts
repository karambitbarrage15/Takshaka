export interface RubricCriterion {
  id: string;
  description: string;
}

export type Rubric = readonly RubricCriterion[];

export interface Problem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly requirements: readonly string[];
  readonly rubric: Rubric;
}
