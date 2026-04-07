import type { SupplierComplianceStatus } from "@/lib/constants";

export interface ComplianceSummary {
  totalRequirements: number;
  respondedRequirements: number;
  pendingRequirements: number;
  compliantCount: number;
  partialCount: number;
  notCompliantCount: number;
  notApplicableCount: number;
  completionPct: number;
}

export function summarizeCompliance(
  totalRequirements: number,
  statuses: SupplierComplianceStatus[],
): ComplianceSummary {
  const compliantCount = statuses.filter((status) => status === "compliant").length;
  const partialCount = statuses.filter((status) => status === "partial").length;
  const notCompliantCount = statuses.filter(
    (status) => status === "not_compliant",
  ).length;
  const notApplicableCount = statuses.filter(
    (status) => status === "not_applicable",
  ).length;
  const respondedRequirements = statuses.length;
  const pendingRequirements = Math.max(totalRequirements - respondedRequirements, 0);
  const completionPct =
    totalRequirements === 0
      ? 0
      : Math.round((respondedRequirements / totalRequirements) * 100);

  return {
    totalRequirements,
    respondedRequirements,
    pendingRequirements,
    compliantCount,
    partialCount,
    notCompliantCount,
    notApplicableCount,
    completionPct,
  };
}
