import { describe, it, expect } from "vitest";
import {
  classifyNis2,
  type OnboardingAnswers,
  ONBOARDING_QUESTIONS,
  ANNEX_I_SECTORS,
  ANNEX_II_SECTORS,
  EU_COUNTRIES,
} from "./classification";

function makeAnswers(
  overrides: Partial<OnboardingAnswers> = {},
): OnboardingAnswers {
  return {
    sector: "energy",
    employee_count: "250_plus",
    annual_revenue: "over_50m",
    provides_essential_service: "yes",
    country: "DE",
    ...overrides,
  };
}

describe("classifyNis2", () => {
  // Non-EU
  it("classifies non-EU entities as out_of_scope", () => {
    const result = classifyNis2(makeAnswers({ country: "non_eu" }));
    expect(result.nis2_applicable).toBe(false);
    expect(result.entity_class).toBe("out_of_scope");
  });

  // Non-listed sector
  it("classifies 'other' sector as out_of_scope", () => {
    const result = classifyNis2(makeAnswers({ sector: "other" }));
    expect(result.nis2_applicable).toBe(false);
    expect(result.entity_class).toBe("out_of_scope");
  });

  // Annex I + Large → essential
  it("classifies large Annex I entity as essential", () => {
    const result = classifyNis2(
      makeAnswers({ sector: "energy", employee_count: "250_plus" }),
    );
    expect(result.nis2_applicable).toBe(true);
    expect(result.entity_class).toBe("essential");
  });

  // Annex I + Medium → important
  it("classifies medium Annex I entity as important", () => {
    const result = classifyNis2(
      makeAnswers({
        sector: "health",
        employee_count: "50_to_249",
        annual_revenue: "10m_to_50m",
      }),
    );
    expect(result.nis2_applicable).toBe(true);
    expect(result.entity_class).toBe("important");
  });

  // Annex I + Small + Essential Service → important
  it("classifies small Annex I entity providing essential service as important", () => {
    const result = classifyNis2(
      makeAnswers({
        sector: "drinking_water",
        employee_count: "under_50",
        annual_revenue: "under_10m",
        provides_essential_service: "yes",
      }),
    );
    expect(result.nis2_applicable).toBe(true);
    expect(result.entity_class).toBe("important");
  });

  // Annex I + Small + No essential service → out_of_scope
  it("classifies small Annex I entity without essential service as out_of_scope", () => {
    const result = classifyNis2(
      makeAnswers({
        sector: "transport",
        employee_count: "under_50",
        annual_revenue: "under_10m",
        provides_essential_service: "no",
      }),
    );
    expect(result.nis2_applicable).toBe(false);
    expect(result.entity_class).toBe("out_of_scope");
  });

  // Annex II + Large → important
  it("classifies large Annex II entity as important", () => {
    const result = classifyNis2(
      makeAnswers({ sector: "food", employee_count: "250_plus" }),
    );
    expect(result.nis2_applicable).toBe(true);
    expect(result.entity_class).toBe("important");
  });

  // Annex II + Medium → important
  it("classifies medium Annex II entity as important", () => {
    const result = classifyNis2(
      makeAnswers({
        sector: "chemicals",
        employee_count: "50_to_249",
        annual_revenue: "10m_to_50m",
      }),
    );
    expect(result.nis2_applicable).toBe(true);
    expect(result.entity_class).toBe("important");
  });

  // Annex II + Small → out_of_scope
  it("classifies small Annex II entity as out_of_scope", () => {
    const result = classifyNis2(
      makeAnswers({
        sector: "postal_courier",
        employee_count: "under_50",
        annual_revenue: "under_10m",
        provides_essential_service: "no",
      }),
    );
    expect(result.nis2_applicable).toBe(false);
    expect(result.entity_class).toBe("out_of_scope");
  });

  // Revenue-based size: under_50 employees but over_50m revenue → large
  it("uses revenue for size when employees are small but revenue is large", () => {
    const result = classifyNis2(
      makeAnswers({
        sector: "banking",
        employee_count: "under_50",
        annual_revenue: "over_50m",
      }),
    );
    expect(result.nis2_applicable).toBe(true);
    expect(result.entity_class).toBe("essential");
  });

  // Every result includes an explanation
  it("always returns a non-empty explanation", () => {
    const cases: OnboardingAnswers[] = [
      makeAnswers(),
      makeAnswers({ country: "non_eu" }),
      makeAnswers({ sector: "other" }),
      makeAnswers({
        sector: "food",
        employee_count: "under_50",
        annual_revenue: "under_10m",
        provides_essential_service: "no",
      }),
    ];
    for (const answers of cases) {
      const result = classifyNis2(answers);
      expect(result.explanation.length).toBeGreaterThan(0);
    }
  });
});

describe("onboarding questions", () => {
  it("has exactly 5 questions", () => {
    expect(ONBOARDING_QUESTIONS).toHaveLength(5);
  });

  it("covers all required question IDs", () => {
    const ids = ONBOARDING_QUESTIONS.map((q) => q.id);
    expect(ids).toContain("sector");
    expect(ids).toContain("employee_count");
    expect(ids).toContain("annual_revenue");
    expect(ids).toContain("provides_essential_service");
    expect(ids).toContain("country");
  });

  it("has at least 2 options per question", () => {
    for (const q of ONBOARDING_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("sector lists", () => {
  it("Annex I has 11 sectors", () => {
    expect(ANNEX_I_SECTORS).toHaveLength(11);
  });

  it("Annex II has 7 sectors", () => {
    expect(ANNEX_II_SECTORS).toHaveLength(7);
  });

  it("no overlap between Annex I and II", () => {
    const overlap = ANNEX_I_SECTORS.filter((s) =>
      (ANNEX_II_SECTORS as readonly string[]).includes(s),
    );
    expect(overlap).toHaveLength(0);
  });
});

describe("EU countries", () => {
  it("has 27 EU member states", () => {
    expect(EU_COUNTRIES).toHaveLength(27);
  });
});
