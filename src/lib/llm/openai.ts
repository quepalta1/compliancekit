import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    // Return a mock that produces a fake policy response
    return {
      chat: {
        completions: {
          create: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: "Demo Policy Document",
                    version: "1.0",
                    effectiveDate: new Date().toISOString().slice(0, 10),
                    sections: [
                      {
                        heading: "Purpose and Scope",
                        content:
                          "This policy establishes the framework for managing cybersecurity risk within the organization. It applies to all employees, contractors, and third-party service providers who access organizational information systems.\n\nThe policy is designed to ensure compliance with NIS2 Directive requirements and align with ISO 27001 best practices.",
                      },
                      {
                        heading: "Roles and Responsibilities",
                        content:
                          "- **Chief Information Security Officer (CISO)**: Owns the policy and ensures its implementation\n- **Department Heads**: Responsible for compliance within their teams\n- **All Staff**: Must follow security procedures and report incidents\n- **IT Operations**: Implements technical controls and monitors systems",
                      },
                      {
                        heading: "Risk Assessment Methodology",
                        content:
                          "The organization shall conduct risk assessments at least annually and whenever significant changes occur. The methodology includes:\n\n- Asset identification and valuation\n- Threat and vulnerability analysis\n- Impact and likelihood assessment\n- Risk treatment planning and tracking\n\nRisks shall be evaluated using a 5x5 matrix combining likelihood and impact scores.",
                      },
                      {
                        heading: "Incident Response",
                        content:
                          "All security incidents must be reported within 24 hours of detection. The incident response process includes:\n\n- **Detection**: Automated monitoring and manual reporting channels\n- **Triage**: Classification by severity (Critical, High, Medium, Low)\n- **Containment**: Immediate steps to limit damage\n- **Recovery**: Restoration of affected systems\n- **Lessons Learned**: Post-incident review within 5 business days",
                      },
                      {
                        heading: "Review and Updates",
                        content:
                          "This policy shall be reviewed annually or following significant security incidents. Changes must be approved by the CISO and communicated to all affected parties within 30 days of approval.",
                      },
                    ],
                    glossary: [
                      {
                        term: "NIS2",
                        definition:
                          "Network and Information Security Directive 2 — EU directive on cybersecurity",
                      },
                      {
                        term: "CISO",
                        definition: "Chief Information Security Officer",
                      },
                      {
                        term: "Risk Treatment",
                        definition:
                          "The process of selecting and implementing measures to modify risk",
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    } as unknown as OpenAI;
  }

  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}
