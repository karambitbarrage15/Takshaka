import { describe, it, expect } from 'vitest';
import { AIEvaluator, LlmClient } from '../../infrastructure/AIEvaluator';
import { Problem } from '../../domain/Problem';
import { Submission, NodeType } from '../../domain/Submission';

describe('AIEvaluator (Infrastructure)', () => {
  const sampleProblem: Problem = {
    id: 'test-problem',
    title: 'Test Problem',
    description: 'Design a system',
    requirements: ['Req 1', 'Req 2'],
    rubric: [
      { id: 'crit-1', description: 'Single Responsibility Principle' },
      { id: 'crit-2', description: 'Extensible Strategy Pattern' },
    ],
  };

  const sampleSubmission: Submission = {
    format: 'REACT_FLOW_GRAPH',
    content: {
      nodes: [
        {
          id: 'n1',
          name: 'ParkingLot',
          type: NodeType.CLASS,
          properties: 'spots: List<Spot>',
          methods: 'park(Vehicle): Ticket',
        },
      ],
      edges: [],
    },
  };

  it('1. Valid AI response produces valid Feedback-shaped output', async () => {
    const mockLlm: LlmClient = async () =>
      JSON.stringify({
        overallScore: 88,
        rubricEvaluations: [
          {
            criterion: 'Single Responsibility Principle',
            score: 4,
            evidence: 'ParkingLot delegates spot finding',
            concern: 'Spot sizing is tightly coupled',
            suggestion: 'Introduce SpotManager',
            confidence: 'HIGH',
          },
          {
            criterion: 'Extensible Strategy Pattern',
            score: 5,
            evidence: 'Fee calculation uses Strategy',
            suggestion: 'Good use of interfaces',
            confidence: 'HIGH',
          },
        ],
        strengths: ['Clear encapsulation', 'Good naming'],
        improvements: ['Decouple spot allocation'],
      });

    const evaluator = new AIEvaluator(mockLlm);
    const feedback = await evaluator.evaluate(sampleProblem, sampleSubmission);

    expect(feedback.overallScore).toBe(88);
    expect(feedback.rubricEvaluations).toHaveLength(2);
    expect(feedback.rubricEvaluations[0].criterion).toBe('Single Responsibility Principle');
    expect(feedback.rubricEvaluations[0].score).toBe(4);
    expect(feedback.rubricEvaluations[0].evidence).toBe('ParkingLot delegates spot finding');
    expect(feedback.strengths).toEqual(['Clear encapsulation', 'Good naming']);
    expect(feedback.improvements).toEqual(['Decouple spot allocation']);
  });

  it('2. Rubric criteria and requirements are passed into the LLM prompt', async () => {
    let capturedPrompt = '';
    const mockLlm: LlmClient = async (prompt) => {
      capturedPrompt = prompt;
      return JSON.stringify({
        overallScore: 80,
        rubricEvaluations: [
          {
            criterion: 'Single Responsibility Principle',
            score: 4,
            evidence: 'Present',
            confidence: 'HIGH',
          },
        ],
        strengths: [],
        improvements: [],
      });
    };

    const evaluator = new AIEvaluator(mockLlm);
    await evaluator.evaluate(sampleProblem, sampleSubmission);

    expect(capturedPrompt).toContain('Single Responsibility Principle');
    expect(capturedPrompt).toContain('Extensible Strategy Pattern');
    expect(capturedPrompt).toContain('Req 1');
    expect(capturedPrompt).toContain('ParkingLot');
  });

  it('3. Strips markdown backticks (```json ... ```) gracefully', async () => {
    const mockLlm: LlmClient = async () => `\`\`\`json
{
  "overallScore": 90,
  "rubricEvaluations": [
    {
      "criterion": "Single Responsibility Principle",
      "score": 5,
      "evidence": "Clean boundaries",
      "confidence": "HIGH"
    }
  ],
  "strengths": ["Clean"],
  "improvements": []
}
\`\`\``;

    const evaluator = new AIEvaluator(mockLlm);
    const feedback = await evaluator.evaluate(sampleProblem, sampleSubmission);
    expect(feedback.overallScore).toBe(90);
  });

  it('4. Rejects malformed JSON from AI provider safely', async () => {
    const mockLlm: LlmClient = async () => 'NOT_VALID_JSON{]';
    const evaluator = new AIEvaluator(mockLlm);

    await expect(evaluator.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'AI returned malformed JSON response.'
    );
  });

  it('5. Rejects response missing overallScore or rubricEvaluations', async () => {
    const mockLlmMissingScore: LlmClient = async () =>
      JSON.stringify({
        rubricEvaluations: [],
      });

    const evaluator = new AIEvaluator(mockLlmMissingScore);
    await expect(evaluator.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'Invalid or missing overallScore in AI evaluation.'
    );

    const mockLlmMissingRubrics: LlmClient = async () =>
      JSON.stringify({
        overallScore: 85,
        rubricEvaluations: [],
      });

    const evaluator2 = new AIEvaluator(mockLlmMissingRubrics);
    await expect(evaluator2.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'Missing rubricEvaluations in AI evaluation.'
    );
  });

  it('6. Rejects response with malformed rubric entry', async () => {
    const mockLlm: LlmClient = async () =>
      JSON.stringify({
        overallScore: 80,
        rubricEvaluations: [
          {
            criterion: '', // empty criterion
            score: 4,
            evidence: 'Evidence',
          },
        ],
      });

    const evaluator = new AIEvaluator(mockLlm);
    await expect(evaluator.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'Missing criterion in rubric evaluation.'
    );
  });

  it('7. Handles upstream AI provider failure safely', async () => {
    const failingLlm: LlmClient = async () => {
      throw new Error('Gemini quota exceeded (429)');
    };

    const evaluator = new AIEvaluator(failingLlm);
    await expect(evaluator.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'Gemini quota exceeded (429)'
    );
  });

  it('8. Supports TEXT submission format without error', async () => {
    const textSubmission: Submission = {
      format: 'TEXT',
      content: 'interface Vehicle { ... } class Car implements Vehicle { ... }',
    };

    let promptContent = '';
    const mockLlm: LlmClient = async (p) => {
      promptContent = p;
      return JSON.stringify({
        overallScore: 75,
        rubricEvaluations: [
          { criterion: 'Single Responsibility Principle', score: 3, evidence: 'ok', confidence: 'HIGH' },
        ],
        strengths: [],
        improvements: [],
      });
    };

    const evaluator = new AIEvaluator(mockLlm);
    const feedback = await evaluator.evaluate(sampleProblem, textSubmission);

    expect(feedback.overallScore).toBe(75);
    expect(promptContent).toContain('interface Vehicle { ... }');
  });

  it('9. Safely defaults invalid or unprovided confidence to HIGH', async () => {
    const mockLlm: LlmClient = async () =>
      JSON.stringify({
        overallScore: 82,
        rubricEvaluations: [
          {
            criterion: 'Single Responsibility Principle',
            score: 4,
            evidence: 'Good delegation',
            confidence: 'INVALID_CONFIDENCE', // unrecognized string
          },
        ],
        strengths: [],
        improvements: [],
      });

    const evaluator = new AIEvaluator(mockLlm);
    const feedback = await evaluator.evaluate(sampleProblem, sampleSubmission);
    expect(feedback.rubricEvaluations[0].confidence).toBe('HIGH');
  });

  it('10. Rejects overallScore exceeding 100 or below 0', async () => {
    const mockLlmOver100: LlmClient = async () =>
      JSON.stringify({
        overallScore: 105,
        rubricEvaluations: [
          { criterion: 'Single Responsibility Principle', score: 5, evidence: 'great' },
        ],
      });

    const evaluatorOver = new AIEvaluator(mockLlmOver100);
    await expect(evaluatorOver.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'Invalid or missing overallScore in AI evaluation.'
    );

    const mockLlmBelow0: LlmClient = async () =>
      JSON.stringify({
        overallScore: -5,
        rubricEvaluations: [
          { criterion: 'Single Responsibility Principle', score: 1, evidence: 'bad' },
        ],
      });

    const evaluatorUnder = new AIEvaluator(mockLlmBelow0);
    await expect(evaluatorUnder.evaluate(sampleProblem, sampleSubmission)).rejects.toThrow(
      'Invalid or missing overallScore in AI evaluation.'
    );
  });

  it('11. Formats empty graph architecture submission cleanly in prompt', async () => {
    let captured = '';
    const mockLlm: LlmClient = async (prompt) => {
      captured = prompt;
      return JSON.stringify({
        overallScore: 0,
        rubricEvaluations: [
          { criterion: 'Single Responsibility Principle', score: 1, evidence: 'None provided' },
        ],
        strengths: [],
        improvements: ['Add classes'],
      });
    };

    const emptySubmission: Submission = {
      format: 'REACT_FLOW_GRAPH',
      content: { nodes: [], edges: [] },
    };

    const evaluator = new AIEvaluator(mockLlm);
    await evaluator.evaluate(sampleProblem, emptySubmission);
    expect(captured).toContain('Empty architecture submission: No classes or interfaces were defined.');
  });
});

