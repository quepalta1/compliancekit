import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PolicySection {
  heading: string;
  content: string;
}

interface GlossaryEntry {
  term: string;
  definition: string;
}

interface PolicyOutput {
  title: string;
  version: string;
  effectiveDate: string;
  sections: PolicySection[];
  glossary?: GlossaryEntry[];
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const colors = {
  primary: "#2B579A",
  darkGray: "#404040",
  mediumGray: "#666666",
  lightGray: "#999999",
  tableHeaderBg: "#2B579A",
  tableAltRowBg: "#F2F2F2",
  tableBorder: "#BFBFBF",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.darkGray,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },

  // Title page
  titlePage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  orgName: {
    fontSize: 16,
    color: colors.mediumGray,
    marginBottom: 16,
  },
  policyTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: colors.lightGray,
    marginBottom: 4,
  },

  // Table of contents header
  tocHeader: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 16,
  },
  tocEntry: {
    fontSize: 11,
    color: colors.primary,
    marginBottom: 6,
    paddingLeft: 8,
  },

  // Section
  sectionHeading: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginTop: 24,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 12,
  },
  bulletDot: {
    width: 14,
    fontSize: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },

  // Glossary
  glossaryHeading: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginTop: 32,
    marginBottom: 12,
  },
  table: {
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.tableHeaderBg,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: colors.tableAltRowBg,
  },
  tableCellTerm: {
    width: "30%",
    padding: 6,
    borderRight: `1 solid ${colors.tableBorder}`,
    borderBottom: `1 solid ${colors.tableBorder}`,
  },
  tableCellDef: {
    width: "70%",
    padding: 6,
    borderBottom: `1 solid ${colors.tableBorder}`,
  },
  tableHeaderText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  tableCellTermText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  tableCellDefText: {
    fontSize: 11,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 8,
    color: colors.lightGray,
  },
});

// ---------------------------------------------------------------------------
// Inline formatting helper
// @react-pdf/renderer <Text> elements can be nested for bold/italic runs.
// We parse **bold** and *italic* and return an array of <Text> elements.
// ---------------------------------------------------------------------------

function renderInlineText(text: string, key: string): React.ReactElement {
  const parts: React.ReactElement[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`${key}-${partIndex++}`}>
          {text.slice(lastIndex, match.index)}
        </Text>
      );
    }

    if (match[2] !== undefined) {
      parts.push(
        <Text key={`${key}-${partIndex++}`} style={{ fontFamily: "Helvetica-Bold" }}>
          {match[2]}
        </Text>
      );
    } else if (match[3] !== undefined) {
      parts.push(
        <Text key={`${key}-${partIndex++}`} style={{ fontFamily: "Helvetica-Oblique" }}>
          {match[3]}
        </Text>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <Text key={`${key}-${partIndex++}`}>{text.slice(lastIndex)}</Text>
    );
  }

  if (parts.length === 0) {
    return <Text key={key}>{text}</Text>;
  }

  return <Text key={key}>{parts}</Text>;
}

// ---------------------------------------------------------------------------
// Content block renderer
// ---------------------------------------------------------------------------

function renderContent(
  content: string,
  sectionKey: string
): React.ReactElement[] {
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    const key = `${sectionKey}-line-${idx}`;

    if (trimmed === "") {
      elements.push(<View key={key} style={{ height: 6 }} />);
      return;
    }

    if (trimmed.startsWith("- ")) {
      const bulletText = trimmed.slice(2);
      elements.push(
        <View key={key} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>{"\u2022"}</Text>
          <View style={styles.bulletText}>
            {renderInlineText(bulletText, `${key}-text`)}
          </View>
        </View>
      );
    } else {
      elements.push(
        <View key={key} style={styles.paragraph}>
          {renderInlineText(trimmed, `${key}-text`)}
        </View>
      );
    }
  });

  return elements;
}

// ---------------------------------------------------------------------------
// Document component
// ---------------------------------------------------------------------------

interface PolicyDocumentProps {
  policy: PolicyOutput;
  organizationName: string;
}

function PolicyDocument({
  policy,
  organizationName,
}: PolicyDocumentProps): React.ReactElement {
  const hasGlossary = policy.glossary && policy.glossary.length > 0;

  return (
    <Document
      title={policy.title}
      author={organizationName}
      subject={`${policy.title} — Version ${policy.version}`}
    >
      {/* Title Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.titlePage}>
          <Text style={styles.orgName}>{organizationName}</Text>
          <Text style={styles.policyTitle}>{policy.title}</Text>
          <Text style={styles.metaText}>Version {policy.version}</Text>
          <Text style={styles.metaText}>
            Effective Date: {policy.effectiveDate}
          </Text>
        </View>
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${policy.title} — ${organizationName}    |    Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* Table of Contents */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.tocHeader}>Table of Contents</Text>
        {policy.sections.map((section, idx) => (
          <Text key={`toc-${idx}`} style={styles.tocEntry}>
            {idx + 1}. {section.heading}
          </Text>
        ))}
        {hasGlossary && (
          <Text style={styles.tocEntry}>
            {policy.sections.length + 1}. Glossary
          </Text>
        )}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${policy.title} — ${organizationName}    |    Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* Content Pages */}
      <Page size="A4" style={styles.page} wrap>
        {policy.sections.map((section, idx) => (
          <View key={`section-${idx}`} wrap={false}>
            <Text style={styles.sectionHeading}>
              {idx + 1}. {section.heading}
            </Text>
            {renderContent(section.content, `section-${idx}`)}
          </View>
        ))}

        {/* Glossary */}
        {hasGlossary && (
          <View wrap={false}>
            <Text style={styles.glossaryHeading}>Glossary</Text>
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.tableHeaderRow}>
                <View style={styles.tableCellTerm}>
                  <Text style={styles.tableHeaderText}>Term</Text>
                </View>
                <View style={styles.tableCellDef}>
                  <Text style={styles.tableHeaderText}>Definition</Text>
                </View>
              </View>
              {/* Data Rows */}
              {policy.glossary!.map((entry, idx) => (
                <View
                  key={`glossary-${idx}`}
                  style={idx % 2 === 0 ? styles.tableRowAlt : styles.tableRow}
                >
                  <View style={styles.tableCellTerm}>
                    <Text style={styles.tableCellTermText}>{entry.term}</Text>
                  </View>
                  <View style={styles.tableCellDef}>
                    <Text style={styles.tableCellDefText}>
                      {entry.definition}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `${policy.title} — ${organizationName}    |    Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function renderPolicyPdf(
  policy: PolicyOutput,
  organizationName: string
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <PolicyDocument policy={policy} organizationName={organizationName} />
  );

  // renderToBuffer returns a NodeJS.ReadableStream in some versions, or a
  // Buffer-like object. Ensure we always return a proper Buffer.
  return Buffer.from(buffer);
}
