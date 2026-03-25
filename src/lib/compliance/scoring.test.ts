import { describe, it, expect } from "vitest";
import {
  answerToScore,
  scoreToRag,
  calculateOverallScore,
  generateRemediationSummary,
  generateRemediationActions,
} from "./scoring";

describe("answerToScore", () => {
  it("maps 'yes' to 1", () => {
    expect(answerToScore("yes")).toBe(1);
  });

  it("maps 'partial' to 0.5", () => {
    expect(answerToScore("partial")).toBe(0.5);
  });

  it("maps 'no' to 0", () => {
    expect(answerToScore("no")).toBe(0);
  });
});

describe("scoreToRag", () => {
  it("returns 'green' for scores >= 0.8", () => {
    expect(scoreToRag(1)).toBe("green");
    expect(scoreToRag(0.8)).toBe("green");
    expect(scoreToRag(0.95)).toBe("green");
  });

  it("returns 'amber' for scores >= 0.4 and < 0.8", () => {
    expect(scoreToRag(0.5)).toBe("amber");
    expect(scoreToRag(0.4)).toBe("amber");
    expect(scoreToRag(0.79)).toBe("amber");
  });

  it("returns 'red' for scores < 0.4", () => {
    expect(scoreToRag(0)).toBe("red");
    expect(scoreToRag(0.39)).toBe("red");
    expect(scoreToRag(0.1)).toBe("red");
  });
});

describe("calculateOverallScore", () => {
  it("returns 0 for empty array", () => {
    expect(calculateOverallScore([])).toBe(0);
  });

  it("returns 100 for all 'yes' with equal weights", () => {
    const answers = [
      { answer: "yes" as const, weight: 1 },
      { answer: "yes" as const, weight: 1 },
      { answer: "yes" as const, weight: 1 },
    ];
    expect(calculateOverallScore(answers)).toBe(100);
  });

  it("returns 0 for all 'no' with equal weights", () => {
    const answers = [
      { answer: "no" as const, weight: 1 },
      { answer: "no" as const, weight: 1 },
    ];
    expect(calculateOverallScore(answers)).toBe(0);
  });

  it("returns 50 for all 'partial' with equal weights", () => {
    const answers = [
      { answer: "partial" as const, weight: 1 },
      { answer: "partial" as const, weight: 1 },
    ];
    expect(calculateOverallScore(answers)).toBe(50);
  });

  it("correctly handles weighted scoring", () => {
    // yes (weight 2) = 2, no (weight 1) = 0 → 2/3 * 100 ≈ 66.67
    const answers = [
      { answer: "yes" as const, weight: 2 },
      { answer: "no" as const, weight: 1 },
    ];
    const score = calculateOverallScore(answers);
    expect(score).toBeCloseTo(66.67, 1);
  });

  it("calculates mixed answers correctly", () => {
    // yes=1, partial=0.5, no=0, all weight 1 → 1.5/3 * 100 = 50
    const answers = [
      { answer: "yes" as const, weight: 1 },
      { answer: "partial" as const, weight: 1 },
      { answer: "no" as const, weight: 1 },
    ];
    expect(calculateOverallScore(answers)).toBe(50);
  });
});

describe("generateRemediationSummary", () => {
  it("returns monitoring message for green controls", () => {
    const summary = generateRemediationSummary(
      "Test Control",
      "Some guidance",
      "green",
      "yes",
    );
    expect(summary).toContain("monitoring");
  });

  it("includes control title for amber controls", () => {
    const summary = generateRemediationSummary(
      "Access Control",
      "Check access policies",
      "amber",
      "partial",
    );
    expect(summary).toContain("Access Control");
  });

  it("includes urgency language for red controls", () => {
    const summary = generateRemediationSummary(
      "Incident Response",
      "Define procedures",
      "red",
      "no",
    );
    expect(summary).toContain("Incident Response");
    expect(summary).toContain("not implemented");
  });
});

describe("generateRemediationActions", () => {
  it("returns empty array for green controls", () => {
    const actions = generateRemediationActions(
      "ctrl-1",
      "Test",
      "guidance",
      "green",
      "yes",
    );
    expect(actions).toHaveLength(0);
  });

  it("returns high-priority action for red controls", () => {
    const actions = generateRemediationActions(
      "ctrl-1",
      "Backup Policy",
      "Ensure backups are tested",
      "red",
      "no",
    );
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].priority).toBe("high");
    expect(actions[0].title).toContain("Backup Policy");
  });

  it("returns medium-priority action for amber controls", () => {
    const actions = generateRemediationActions(
      "ctrl-1",
      "Risk Assessment",
      "Formalize risk process",
      "amber",
      "partial",
    );
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].priority).toBe("medium");
  });
});
