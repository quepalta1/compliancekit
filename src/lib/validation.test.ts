import { describe, it, expect } from "vitest";
import {
  signupSchema,
  loginSchema,
  createOrganizationSchema,
} from "./validation";

describe("signupSchema", () => {
  it("accepts valid input", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      fullName: "Jane Doe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      fullName: "Jane",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "short",
      fullName: "Jane",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty fullName", () => {
    const result = signupSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      fullName: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("createOrganizationSchema", () => {
  it("accepts valid input", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme Corp",
      slug: "acme-corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme Corp",
      slug: "Acme-Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme Corp",
      slug: "acme corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too-short slug", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme Corp",
      slug: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects too-short name", () => {
    const result = createOrganizationSchema.safeParse({
      name: "A",
      slug: "acme",
    });
    expect(result.success).toBe(false);
  });

  it("accepts slug with numbers and hyphens", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Company 123",
      slug: "company-123",
    });
    expect(result.success).toBe(true);
  });
});
