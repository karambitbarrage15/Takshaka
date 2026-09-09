export interface RubricEvaluation {
  readonly criterion: string;
  readonly score: number;
  readonly evidence: string;
  readonly concern?: string;
  readonly suggestion?: string;
  readonly confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Feedback {
  readonly overallScore: number;
  readonly rubricEvaluations: readonly RubricEvaluation[];
  readonly strengths: readonly string[];
  readonly improvements: readonly string[];
}
