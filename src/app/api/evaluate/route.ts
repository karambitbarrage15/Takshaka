import { NextRequest, NextResponse } from 'next/server';
import { getProblemById } from '../../../data/problems';
import { AIEvaluator } from '../../../infrastructure/AIEvaluator';
import { Submission, ArchitecturalGraph } from '../../../domain/Submission';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problemId, submission } = body as {
      problemId?: string;
      submission?: Submission;
    };

    if (!problemId || typeof problemId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid problemId parameter.' },
        { status: 400 }
      );
    }

    if (!submission || typeof submission !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid submission payload.' },
        { status: 400 }
      );
    }

    if (submission.format !== 'REACT_FLOW_GRAPH' && submission.format !== 'TEXT') {
      return NextResponse.json(
        { success: false, error: 'Unsupported submission format. Must be REACT_FLOW_GRAPH or TEXT.' },
        { status: 400 }
      );
    }

    // Look up problem definition and rubric
    const problem = getProblemById(problemId);
    if (!problem) {
      return NextResponse.json(
        { success: false, error: `Problem with id '${problemId}' not found.` },
        { status: 404 }
      );
    }

    // Check for non-empty architectural canvas
    if (submission.format === 'REACT_FLOW_GRAPH') {
      const graph = submission.content as ArchitecturalGraph;
      if (!graph || !Array.isArray(graph.nodes) || graph.nodes.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot evaluate an empty canvas. Please design at least one class or interface.',
          },
          { status: 400 }
        );
      }
    }

    // Execute evaluation through Evaluator interface
    const evaluator = new AIEvaluator();
    const feedback = await evaluator.evaluate(problem, submission);

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred during evaluation.';
    console.error('API /api/evaluate error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
