import { describe, expect, it } from "vitest";
import { summarizeCompliance } from "@/lib/network/summary";

describe("summarizeCompliance", () => {
  it("counts submitted statuses and pending requirements", () => {
    const summary = summarizeCompliance(5, [
      "compliant",
      "partial",
      "not_compliant",
    ]);

    expect(summary.totalRequirements).toBe(5);
    expect(summary.respondedRequirements).toBe(3);
    expect(summary.pendingRequirements).toBe(2);
    expect(summary.compliantCount).toBe(1);
    expect(summary.partialCount).toBe(1);
    expect(summary.notCompliantCount).toBe(1);
    expect(summary.notApplicableCount).toBe(0);
    expect(summary.completionPct).toBe(60);
  });

  it("returns zero completion when there are no requirements", () => {
    const summary = summarizeCompliance(0, []);

    expect(summary.totalRequirements).toBe(0);
    expect(summary.respondedRequirements).toBe(0);
    expect(summary.pendingRequirements).toBe(0);
    expect(summary.completionPct).toBe(0);
  });
});
