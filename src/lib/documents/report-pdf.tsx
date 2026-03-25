import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Organization {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  score_pct: number | string;
  completed_at: string;
  status: string;
}

interface Control {
  id: string;
  control_code: string;
  title: string;
  sort_order: number;
}

interface ControlStatus {
  control_id: string;
  rag: string;
  score: number | string;
  remediation_summary: string | null;
  priority_rank: number;
}

interface RemediationAction {
  id: string;
  control_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
}

export interface ReportPdfParams {
  organization: Organization;
  assessment: Assessment;
  controls: Control[];
  controlStatuses: ControlStatus[];
  remediationActions: RemediationAction[];
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const colors = {
  primary: "#1e293b",
  secondary: "#475569",
  muted: "#94a3b8",
  border: "#e2e8f0",
  white: "#ffffff",
  redBg: "#fef2f2",
  redText: "#b91c1c",
  redDot: "#ef4444",
  amberBg: "#fffbeb",
  amberText: "#b45309",
  amberDot: "#f59e0b",
  greenBg: "#f0fdf4",
  greenText: "#15803d",
  greenDot: "#22c55e",
  coverBg: "#0f172a",
  coverAccent: "#3b82f6",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.primary,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: colors.coverBg,
    color: colors.white,
    paddingHorizontal: 60,
    paddingVertical: 80,
    justifyContent: "center",
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 16,
    color: colors.coverAccent,
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 12,
    color: "#cbd5e1",
    marginBottom: 6,
  },
  coverScore: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    color: colors.coverAccent,
    marginTop: 30,
  },
  coverScoreLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryCardLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  summaryCardValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ragDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  controlCode: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: colors.muted,
    width: 50,
  },
  controlTitle: {
    flex: 1,
    fontSize: 9,
  },
  ragBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  controlScore: {
    fontSize: 9,
    width: 35,
    textAlign: "right",
    color: colors.secondary,
  },
  remediationBlock: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remediationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  remediationSummary: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  actionPriority: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 6,
    marginTop: 1,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 1,
  },
  actionDescription: {
    fontSize: 8,
    color: colors.secondary,
    lineHeight: 1.3,
  },
  actionStatusBadge: {
    fontSize: 7,
    color: colors.muted,
    marginLeft: 6,
    marginTop: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.muted,
  },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function ragStyle(rag: string) {
  switch (rag) {
    case "red":
      return {
        dot: colors.redDot,
        bg: colors.redBg,
        text: colors.redText,
      };
    case "amber":
      return {
        dot: colors.amberDot,
        bg: colors.amberBg,
        text: colors.amberText,
      };
    case "green":
    default:
      return {
        dot: colors.greenDot,
        bg: colors.greenBg,
        text: colors.greenText,
      };
  }
}

function priorityStyle(priority: string) {
  switch (priority) {
    case "high":
      return { bg: colors.redBg, text: colors.redText };
    case "medium":
      return { bg: colors.amberBg, text: colors.amberText };
    case "low":
    default:
      return { bg: colors.greenBg, text: colors.greenText };
  }
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ComplianceReport({
  organization,
  assessment,
  controls,
  controlStatuses,
  remediationActions,
}: ReportPdfParams) {
  const controlMap = new Map(controls.map((c) => [c.id, c]));
  const score = Number(assessment.score_pct);
  const redCount = controlStatuses.filter((cs) => cs.rag === "red").length;
  const amberCount = controlStatuses.filter((cs) => cs.rag === "amber").length;
  const greenCount = controlStatuses.filter((cs) => cs.rag === "green").length;
  const completedDate = new Date(assessment.completed_at).toLocaleDateString(
    "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const needsRemediation = controlStatuses.filter(
    (cs) => cs.rag === "red" || cs.rag === "amber",
  );

  return (
    <Document>
      {/* ---- Cover Page ---- */}
      <Page size="A4" style={s.coverPage}>
        <Text style={s.coverTitle}>Compliance Assessment Report</Text>
        <Text style={s.coverSubtitle}>NIS2 Framework</Text>
        <Text style={s.coverMeta}>Organization: {organization.name}</Text>
        <Text style={s.coverMeta}>Date: {completedDate}</Text>
        <Text style={s.coverScore}>{score.toFixed(0)}%</Text>
        <Text style={s.coverScoreLabel}>Overall Compliance Score</Text>
      </Page>

      {/* ---- Executive Summary ---- */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Executive Summary</Text>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={[s.summaryCardLabel, { color: colors.secondary }]}>
              Overall Score
            </Text>
            <Text style={[s.summaryCardValue, { color: colors.primary }]}>
              {score.toFixed(0)}%
            </Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryCardLabel, { color: colors.redText }]}>
              Red
            </Text>
            <Text style={[s.summaryCardValue, { color: colors.redText }]}>
              {redCount}
            </Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryCardLabel, { color: colors.amberText }]}>
              Amber
            </Text>
            <Text style={[s.summaryCardValue, { color: colors.amberText }]}>
              {amberCount}
            </Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryCardLabel, { color: colors.greenText }]}>
              Green
            </Text>
            <Text style={[s.summaryCardValue, { color: colors.greenText }]}>
              {greenCount}
            </Text>
          </View>
        </View>

        {/* ---- Control Status Detail ---- */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>
          Control Status Detail
        </Text>

        {/* Header row */}
        <View
          style={[
            s.controlRow,
            {
              backgroundColor: "#f1f5f9",
              borderBottomWidth: 2,
              borderBottomColor: colors.secondary,
            },
          ]}
        >
          <View style={[s.ragDot, { backgroundColor: "transparent" }]} />
          <Text
            style={[
              s.controlCode,
              { fontFamily: "Helvetica-Bold", fontSize: 8 },
            ]}
          >
            Code
          </Text>
          <Text style={[s.controlTitle, { fontFamily: "Helvetica-Bold" }]}>
            Control
          </Text>
          <Text
            style={[s.ragBadge, { backgroundColor: "transparent", width: 40 }]}
          >
            Status
          </Text>
          <Text style={[s.controlScore, { fontFamily: "Helvetica-Bold" }]}>
            Score
          </Text>
        </View>

        {controlStatuses.map((cs) => {
          const control = controlMap.get(cs.control_id);
          const rs = ragStyle(cs.rag);
          return (
            <View key={cs.control_id} style={s.controlRow} wrap={false}>
              <View style={[s.ragDot, { backgroundColor: rs.dot }]} />
              <Text style={s.controlCode}>{control?.control_code ?? ""}</Text>
              <Text style={s.controlTitle}>{control?.title ?? ""}</Text>
              <Text
                style={[
                  s.ragBadge,
                  { backgroundColor: rs.bg, color: rs.text },
                ]}
              >
                {cs.rag.toUpperCase()}
              </Text>
              <Text style={s.controlScore}>
                {(Number(cs.score) * 100).toFixed(0)}%
              </Text>
            </View>
          );
        })}

        <View style={s.footer} fixed>
          <Text>Generated by ComplianceKit</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* ---- Remediation Summary ---- */}
      {needsRemediation.length > 0 && (
        <Page size="A4" style={s.page}>
          <Text style={s.sectionTitle}>Remediation Summary</Text>

          {needsRemediation.map((cs) => {
            const control = controlMap.get(cs.control_id);
            const rs = ragStyle(cs.rag);
            const relatedActions = remediationActions.filter(
              (a) => a.control_id === cs.control_id,
            );

            return (
              <View key={cs.control_id} style={s.remediationBlock} wrap={false}>
                <View style={s.remediationHeader}>
                  <View style={[s.ragDot, { backgroundColor: rs.dot }]} />
                  <Text style={s.controlCode}>
                    {control?.control_code ?? ""}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 10,
                      fontFamily: "Helvetica-Bold",
                    }}
                  >
                    {control?.title ?? ""}
                  </Text>
                  <Text
                    style={[
                      s.ragBadge,
                      { backgroundColor: rs.bg, color: rs.text },
                    ]}
                  >
                    {cs.rag.toUpperCase()}
                  </Text>
                </View>

                {cs.remediation_summary && (
                  <Text style={s.remediationSummary}>
                    {cs.remediation_summary}
                  </Text>
                )}

                {relatedActions.map((action) => {
                  const ps = priorityStyle(action.priority);
                  return (
                    <View key={action.id} style={s.actionItem}>
                      <Text
                        style={[
                          s.actionPriority,
                          { backgroundColor: ps.bg, color: ps.text },
                        ]}
                      >
                        {action.priority.toUpperCase()}
                      </Text>
                      <View style={s.actionContent}>
                        <Text style={s.actionTitle}>{action.title}</Text>
                        {action.description && (
                          <Text style={s.actionDescription}>
                            {action.description}
                          </Text>
                        )}
                      </View>
                      <Text style={s.actionStatusBadge}>{action.status}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}

          {/* ---- Remediation Action Summary Table ---- */}
          {remediationActions.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { marginTop: 16 }]}>
                All Remediation Actions
              </Text>
              {remediationActions.map((action) => {
                const ps = priorityStyle(action.priority);
                const control = controlMap.get(action.control_id);
                return (
                  <View
                    key={action.id}
                    style={[
                      s.controlRow,
                      { alignItems: "flex-start", gap: 6 },
                    ]}
                    wrap={false}
                  >
                    <Text
                      style={[
                        s.actionPriority,
                        { backgroundColor: ps.bg, color: ps.text },
                      ]}
                    >
                      {action.priority.toUpperCase()}
                    </Text>
                    <Text style={[s.controlCode, { width: 45, marginTop: 1 }]}>
                      {control?.control_code ?? ""}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.actionTitle}>{action.title}</Text>
                      {action.description && (
                        <Text style={s.actionDescription}>
                          {action.description}
                        </Text>
                      )}
                    </View>
                    <Text style={s.actionStatusBadge}>{action.status}</Text>
                  </View>
                );
              })}
            </>
          )}

          <View style={s.footer} fixed>
            <Text>Generated by ComplianceKit</Text>
            <Text
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
          </View>
        </Page>
      )}
    </Document>
  );
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export async function renderComplianceReportPdf(
  params: ReportPdfParams,
): Promise<Buffer> {
  const buffer = await renderToBuffer(<ComplianceReport {...params} />);
  return Buffer.from(buffer);
}
