import { Problem } from '../domain/Problem';
import { Submission, ArchitecturalGraph, NodeType } from '../domain/Submission';
import { Feedback, RubricEvaluation } from '../domain/Feedback';
import { Evaluator } from '../domain/Evaluator';

export type LlmClient = (prompt: string) => Promise<string>;

export class AIEvaluator implements Evaluator {
  private readonly llmClient: LlmClient;

  constructor(customLlmClient?: LlmClient) {
    if (customLlmClient) {
      this.llmClient = customLlmClient;
    } else {
      this.llmClient = defaultLlmClient;
    }
  }

  public async evaluate(problem: Problem, submission: Submission): Promise<Feedback> {
    const prompt = this.buildEvaluationPrompt(problem, submission);
    const rawResponse = await this.llmClient(prompt);

    return this.parseAndValidateFeedback(rawResponse);
  }

  private buildEvaluationPrompt(problem: Problem, submission: Submission): string {
    const architectureDescription = this.formatSubmission(submission);

    const rubricDescription = problem.rubric
      .map((r, i) => `${i + 1}. [Criterion: "${r.description}"] (ID: ${r.id})`)
      .join('\n');

    const requirementsDescription = problem.requirements
      .map((req, i) => `${i + 1}. ${req}`)
      .join('\n');

    return `You are a Principal Software Architect conducting a Low-Level Design (LLD) interview.
Your task is to evaluate the candidate's architectural design against the problem requirements and specific evaluation rubric criteria.

IMPORTANT GUIDELINES:
1. Focus on ARCHITECTURAL DESIGN, responsibilities, abstractions, encapsulation, coupling, cohesion, and extensibility.
2. DO NOT evaluate code compilation or syntax. This is an architectural model.
3. You MUST evaluate every single criterion in the Rubric below.
4. DO NOT invent new rubric criteria. The supplied rubric is authoritative.
5. Provide specific evidence from the candidate's design for every score.

--- PROBLEM CONTEXT ---
Title: ${problem.title}
Description: ${problem.description}

Requirements:
${requirementsDescription}

--- AUTHORITATIVE EVALUATION RUBRIC ---
${rubricDescription}

--- CANDIDATE ARCHITECTURAL SUBMISSION ---
${architectureDescription}

--- REQUIRED OUTPUT FORMAT ---
Respond ONLY with a valid, raw JSON object (no markdown, no backticks, no preamble).
The JSON must adhere to this exact schema:
{
  "overallScore": <number between 0 and 100>,
  "rubricEvaluations": [
    {
      "criterion": "<exact rubric criterion text being evaluated>",
      "score": <number between 1 and 5>,
      "evidence": "<specific evidence from the candidate's classes/relationships>",
      "concern": "<optional concern if score < 5, or omit>",
      "suggestion": "<actionable architectural improvement suggestion>",
      "confidence": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "strengths": [
    "<specific architectural strength 1>",
    "<specific architectural strength 2>"
  ],
  "improvements": [
    "<specific architectural improvement 1>",
    "<specific architectural improvement 2>"
  ]
}`;
  }

  private formatSubmission(submission: Submission): string {
    if (submission.format === 'TEXT') {
      return typeof submission.content === 'string'
        ? submission.content
        : JSON.stringify(submission.content);
    }

    if (
      submission.format === 'REACT_FLOW_GRAPH' &&
      typeof submission.content === 'object' &&
      submission.content !== null
    ) {
      const graph = submission.content as ArchitecturalGraph;
      const nodes = graph.nodes || [];
      const edges = graph.edges || [];

      if (nodes.length === 0) {
        return 'Empty architecture submission: No classes or interfaces were defined.';
      }

      const classesText = nodes
        .map((n) => {
          const typeStr =
            n.type === NodeType.INTERFACE
              ? 'interface'
              : n.type === NodeType.ABSTRACT_CLASS
              ? 'abstract class'
              : n.type === NodeType.ENUM
              ? 'enum'
              : 'class';

          const propertiesStr = n.properties?.trim()
            ? n.properties
                .split('\n')
                .map((p) => `    ${p.trim()}`)
                .join('\n')
            : '    (none)';

          const methodsStr = n.methods?.trim()
            ? n.methods
                .split('\n')
                .map((m) => `    ${m.trim()}`)
                .join('\n')
            : '    (none)';

          return `${typeStr} ${n.name || 'Unnamed'} (ID: ${n.id}):\n  Properties:\n${propertiesStr}\n  Methods:\n${methodsStr}`;
        })
        .join('\n\n');

      const relationshipsText =
        edges.length > 0
          ? edges
              .map((e) => {
                const sourceNode = nodes.find((n) => n.id === e.sourceId);
                const targetNode = nodes.find((n) => n.id === e.targetId);
                const sourceName = sourceNode?.name || e.sourceId;
                const targetName = targetNode?.name || e.targetId;
                const label = e.label ? ` --[${e.label}]--> ` : ' ----> ';
                return `  ${sourceName}${label}${targetName}`;
              })
              .join('\n')
          : '  (No relationships defined)';

      return `Classes and Interfaces:\n${classesText}\n\nRelationships:\n${relationshipsText}`;
    }

    return 'Unknown submission format';
  }

  private parseAndValidateFeedback(rawText: string): Feedback {
    let cleaned = rawText.trim();
    // Strip markdown code fences if model wrapped response in ```json ... ```
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('AI returned malformed JSON response.');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI response is not a JSON object.');
    }

    const obj = parsed as Record<string, unknown>;

    if (typeof obj.overallScore !== 'number' || obj.overallScore < 0 || obj.overallScore > 100) {
      throw new Error('Invalid or missing overallScore in AI evaluation.');
    }

    if (!Array.isArray(obj.rubricEvaluations) || obj.rubricEvaluations.length === 0) {
      throw new Error('Missing rubricEvaluations in AI evaluation.');
    }

    const rubricEvaluations: RubricEvaluation[] = [];
    for (const item of obj.rubricEvaluations) {
      if (!item || typeof item !== 'object') {
        throw new Error('Malformed rubric evaluation entry.');
      }
      const ev = item as Record<string, unknown>;
      if (typeof ev.criterion !== 'string' || !ev.criterion.trim()) {
        throw new Error('Missing criterion in rubric evaluation.');
      }
      if (typeof ev.score !== 'number') {
        throw new Error('Missing or invalid score in rubric evaluation.');
      }
      if (typeof ev.evidence !== 'string' || !ev.evidence.trim()) {
        throw new Error('Missing evidence in rubric evaluation.');
      }

      let confidence: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH';
      if (ev.confidence === 'LOW' || ev.confidence === 'MEDIUM' || ev.confidence === 'HIGH') {
        confidence = ev.confidence;
      }

      rubricEvaluations.push({
        criterion: ev.criterion,
        score: ev.score,
        evidence: ev.evidence,
        concern: typeof ev.concern === 'string' ? ev.concern : undefined,
        suggestion: typeof ev.suggestion === 'string' ? ev.suggestion : undefined,
        confidence,
      });
    }

    const strengths = Array.isArray(obj.strengths)
      ? obj.strengths.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [];

    const improvements = Array.isArray(obj.improvements)
      ? obj.improvements.filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
      : [];

    return {
      overallScore: Math.round(obj.overallScore),
      rubricEvaluations,
      strengths,
      improvements,
    };
  }
}

/**
 * Default production LLM client supporting Gemini and OpenAI via environment variables.
 */
async function defaultLlmClient(prompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Empty response from Gemini API.');
    }
    return candidateText;
  }

  if (openaiKey) {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Software Architect evaluator. Respond strictly in JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI API.');
    }
    return content;
  }

  throw new Error(
    'No AI provider API key found. Please set GEMINI_API_KEY or OPENAI_API_KEY in your environment.'
  );
}
