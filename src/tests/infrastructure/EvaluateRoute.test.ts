import { describe, it, expect, vi } from 'vitest';
import { POST } from '../../app/api/evaluate/route';
import { NextRequest } from 'next/server';
import { AIEvaluator } from '../../infrastructure/AIEvaluator';

import { Feedback } from '../../domain/Feedback';

describe('POST /api/evaluate Route Handler', () => {
  function createRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('1. Returns 400 if problemId is missing', async () => {
    const req = createRequest({ submission: { format: 'TEXT', content: 'test' } });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('problemId');
  });

  it('2. Returns 400 if submission is missing', async () => {
    const req = createRequest({ problemId: 'parking-lot' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('submission');
  });

  it('3. Returns 400 if submission format is unsupported', async () => {
    const req = createRequest({
      problemId: 'parking-lot',
      submission: { format: 'UNSUPPORTED', content: {} },
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('format');
  });

  it('4. Returns 404 if problemId does not exist', async () => {
    const req = createRequest({
      problemId: 'unknown-problem',
      submission: { format: 'TEXT', content: 'class A {}' },
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toContain('not found');
  });

  it('5. Returns 400 if REACT_FLOW_GRAPH submission has empty canvas', async () => {
    const req = createRequest({
      problemId: 'parking-lot',
      submission: {
        format: 'REACT_FLOW_GRAPH',
        content: { nodes: [], edges: [] },
      },
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Cannot evaluate an empty canvas');
  });

  it('6. Returns 200 with Feedback on successful evaluation', async () => {
    const mockFeedback: Feedback = {
      overallScore: 85,
      rubricEvaluations: [
        { criterion: 'Vehicle abstraction', score: 4, evidence: 'ok', confidence: 'HIGH' },
      ],
      strengths: ['Good'],
      improvements: ['Refactor'],
    };

    const evalSpy = vi.spyOn(AIEvaluator.prototype, 'evaluate').mockResolvedValueOnce(mockFeedback);

    const req = createRequest({
      problemId: 'parking-lot',
      submission: {
        format: 'REACT_FLOW_GRAPH',
        content: {
          nodes: [{ id: '1', name: 'ParkingLot', type: 'CLASS', properties: '', methods: '' }],
          edges: [],
        },
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.feedback).toEqual(mockFeedback);

    evalSpy.mockRestore();
  });

  it('7. Returns 500 when evaluator fails', async () => {
    const evalSpy = vi
      .spyOn(AIEvaluator.prototype, 'evaluate')
      .mockRejectedValueOnce(new Error('AI provider connection timeout'));

    const req = createRequest({
      problemId: 'parking-lot',
      submission: {
        format: 'TEXT',
        content: 'class ParkingLot {}',
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('AI provider connection timeout');

    evalSpy.mockRestore();
  });

  it('8. Returns 500 with graceful error message when request body is unparseable JSON', async () => {
    const brokenReq = new NextRequest('http://localhost:3000/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'NOT_JSON{]',
    });

    const res = await POST(brokenReq);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
  });

  it('9. Successfully evaluates elevator-system problem with correct rubric mapping', async () => {
    const mockFeedback: Feedback = {
      overallScore: 90,
      rubricEvaluations: [
        {
          criterion: 'Elevator dispatch logic is isolated behind a DispatchStrategy interface.',
          score: 5,
          evidence: 'LOOK dispatch strategy used',
          confidence: 'HIGH',
        },
      ],
      strengths: ['Great strategy isolation'],
      improvements: [],
    };

    const evalSpy = vi.spyOn(AIEvaluator.prototype, 'evaluate').mockResolvedValueOnce(mockFeedback);

    const req = createRequest({
      problemId: 'elevator-system',
      submission: {
        format: 'REACT_FLOW_GRAPH',
        content: {
          nodes: [{ id: '1', name: 'ElevatorCar', type: 'CLASS', properties: '', methods: '' }],
          edges: [],
        },
      },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.feedback.overallScore).toBe(90);

    evalSpy.mockRestore();
  });
});

