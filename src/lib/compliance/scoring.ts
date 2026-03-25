/* ------------------------------------------------------------------ */
/*  Assessment scoring and remediation helpers                        */
/* ------------------------------------------------------------------ */

import { ANSWER_SCORE_MAP, GREEN_THRESHOLD, AMBER_THRESHOLD } from '@/lib/constants';
import type { AssessmentAnswer, RagStatus } from '@/lib/constants';

export function answerToScore(answer: AssessmentAnswer): number {
  return ANSWER_SCORE_MAP[answer];
}

export function scoreToRag(score: number): RagStatus {
  if (score >= GREEN_THRESHOLD) return 'green';
  if (score >= AMBER_THRESHOLD) return 'amber';
  return 'red';
}

export function calculateOverallScore(
  answers: Array<{ answer: AssessmentAnswer; weight: number }>
): number {
  if (answers.length === 0) return 0;

  const totalWeightedScore = answers.reduce(
    (sum, a) => sum + answerToScore(a.answer) * a.weight,
    0
  );
  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);

  if (totalWeight === 0) return 0;

  return (totalWeightedScore / totalWeight) * 100;
}

/** Generate a remediation summary for a control based on its RAG status. */
export function generateRemediationSummary(
  controlTitle: string,
  controlGuidance: string,
  rag: RagStatus,
  _answer: AssessmentAnswer
): string {
  if (rag === 'green') {
    return 'Control is adequately implemented. Continue monitoring.';
  }

  if (rag === 'amber') {
    return `Partial implementation detected for "${controlTitle}". Review: ${controlGuidance} Consider formalizing and documenting existing practices.`;
  }

  return `"${controlTitle}" is not implemented. Priority action: ${controlGuidance} This control requires immediate attention to meet NIS2 requirements.`;
}

/** Generate remediation actions for red and amber controls. */
export function generateRemediationActions(
  _controlId: string,
  controlTitle: string,
  controlGuidance: string,
  rag: RagStatus,
  _answer: AssessmentAnswer
): Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }> {
  if (rag === 'green') return [];

  if (rag === 'red') {
    return [
      {
        title: `Implement ${controlTitle}`,
        description: `${controlGuidance} This control is currently not implemented and requires immediate attention.`,
        priority: 'high',
      },
    ];
  }

  // amber
  return [
    {
      title: `Formalize ${controlTitle}`,
      description: `${controlGuidance} Current implementation is partial. Document existing practices and address gaps.`,
      priority: 'medium',
    },
  ];
}
