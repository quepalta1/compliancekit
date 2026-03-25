import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  FileChild,
  Footer,
  PageNumber,
  AlignmentType,
  Packer,
  TableOfContents,
  StyleLevel,
  WidthType,
  BorderStyle,
  ShadingType,
  NumberFormat,
  PageBreak,
} from "docx";

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
// Inline markdown parser
// Splits a single line into an array of TextRun instances, handling **bold**
// and *italic* markers. Runs are emitted in document order so mixed inline
// formatting works correctly (e.g. "some **bold** and *italic* text").
// ---------------------------------------------------------------------------

function parseInlineFormatting(
  line: string,
  baseOptions?: { font?: string; size?: number }
): TextRun[] {
  const runs: TextRun[] = [];
  // Regex captures **bold** or *italic* segments and the text around them.
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: line.slice(lastIndex, match.index),
          font: baseOptions?.font ?? "Calibri",
          size: baseOptions?.size ?? 22, // 11pt
        })
      );
    }

    if (match[2] !== undefined) {
      // **bold**
      runs.push(
        new TextRun({
          text: match[2],
          bold: true,
          font: baseOptions?.font ?? "Calibri",
          size: baseOptions?.size ?? 22,
        })
      );
    } else if (match[3] !== undefined) {
      // *italic*
      runs.push(
        new TextRun({
          text: match[3],
          italics: true,
          font: baseOptions?.font ?? "Calibri",
          size: baseOptions?.size ?? 22,
        })
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining plain text after the last match (or the entire line if no match)
  if (lastIndex < line.length) {
    runs.push(
      new TextRun({
        text: line.slice(lastIndex),
        font: baseOptions?.font ?? "Calibri",
        size: baseOptions?.size ?? 22,
      })
    );
  }

  // If the line was empty, still return one empty run so the paragraph exists
  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text: "",
        font: baseOptions?.font ?? "Calibri",
        size: baseOptions?.size ?? 22,
      })
    );
  }

  return runs;
}

// ---------------------------------------------------------------------------
// Content block → Paragraph[]
// ---------------------------------------------------------------------------

function contentToParagraphs(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      // Blank line → spacing paragraph
      paragraphs.push(new Paragraph({ spacing: { after: 120 } }));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      // Bullet point
      const bulletText = trimmed.slice(2);
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseInlineFormatting(bulletText),
          spacing: { after: 60 },
        })
      );
    } else {
      // Regular paragraph
      paragraphs.push(
        new Paragraph({
          children: parseInlineFormatting(trimmed),
          spacing: { after: 120, line: 276 }, // 1.15 line spacing
        })
      );
    }
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Glossary → Table
// ---------------------------------------------------------------------------

function buildGlossaryTable(glossary: GlossaryEntry[]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "2B579A" },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Term",
                bold: true,
                color: "FFFFFF",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: "2B579A" },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Definition",
                bold: true,
                color: "FFFFFF",
                font: "Calibri",
                size: 22,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const dataRows = glossary.map(
    (entry, index) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading:
              index % 2 === 0
                ? { type: ShadingType.SOLID, color: "F2F2F2" }
                : undefined,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: entry.term,
                    bold: true,
                    font: "Calibri",
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            shading:
              index % 2 === 0
                ? { type: ShadingType.SOLID, color: "F2F2F2" }
                : undefined,
            children: [
              new Paragraph({
                children: parseInlineFormatting(entry.definition),
              }),
            ],
          }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "BFBFBF" },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "BFBFBF",
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "BFBFBF",
      },
    },
    rows: [headerRow, ...dataRows],
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function renderPolicyDocx(
  policy: PolicyOutput,
  organizationName: string
): Promise<Buffer> {
  // ---- Title page --------------------------------------------------------

  const titlePageChildren: FileChild[] = [
    // Spacer to push title toward center
    new Paragraph({ spacing: { before: 4000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: organizationName,
          font: "Calibri",
          size: 32, // 16pt
          color: "666666",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: policy.title,
          font: "Calibri",
          size: 56, // 28pt
          bold: true,
          color: "2B579A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: `Version ${policy.version}`,
          font: "Calibri",
          size: 24, // 12pt
          color: "999999",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [
        new TextRun({
          text: `Effective Date: ${policy.effectiveDate}`,
          font: "Calibri",
          size: 24,
          color: "999999",
        }),
      ],
    }),
    // Force page break after title page
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  // ---- Table of Contents -------------------------------------------------

  const tocChildren: FileChild[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: "Table of Contents",
          font: "Calibri",
        }),
      ],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
      stylesWithLevels: [
        new StyleLevel("Heading1", 1),
        new StyleLevel("Heading2", 2),
        new StyleLevel("Heading3", 3),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];

  // ---- Sections ----------------------------------------------------------

  const sectionChildren: FileChild[] = [];

  for (const section of policy.sections) {
    // Section heading (Heading 1 so TOC picks it up)
    sectionChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 200 },
        children: [
          new TextRun({
            text: section.heading,
            font: "Calibri",
          }),
        ],
      })
    );

    // Section body
    sectionChildren.push(...contentToParagraphs(section.content));
  }

  // ---- Glossary ----------------------------------------------------------

  const glossaryChildren: FileChild[] = [];

  if (policy.glossary && policy.glossary.length > 0) {
    glossaryChildren.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
    glossaryChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 200 },
        children: [
          new TextRun({
            text: "Glossary",
            font: "Calibri",
          }),
        ],
      })
    );
    glossaryChildren.push(
      new Paragraph({ spacing: { after: 120 } }) // spacer before table
    );
  }

  // ---- Assemble document -------------------------------------------------

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22, // 11pt
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 36, // 18pt
            bold: true,
            color: "2B579A",
          },
          paragraph: {
            spacing: { before: 360, after: 200 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 30, // 15pt
            bold: true,
            color: "404040",
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${policy.title} — ${organizationName}`,
                    font: "Calibri",
                    size: 16, // 8pt
                    color: "999999",
                  }),
                  new TextRun({
                    text: "    |    Page ",
                    font: "Calibri",
                    size: 16,
                    color: "999999",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Calibri",
                    size: 16,
                    color: "999999",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...titlePageChildren,
          ...tocChildren,
          ...sectionChildren,
          ...glossaryChildren,
          // Glossary table must be a top-level child of the section
          ...(policy.glossary && policy.glossary.length > 0
            ? [buildGlossaryTable(policy.glossary)]
            : []),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc) as Promise<Buffer>;
}
