"use server";

import { createClient } from "@/lib/supabase/server";
import {
  classifyNis2,
  type OnboardingAnswers,
  type Sector,
  type EmployeeCount,
  type AnnualRevenue,
  type EssentialServiceAnswer,
  type Country,
} from "@/lib/compliance/classification";
import { redirect } from "next/navigation";

export type OnboardingActionState = { error: string } | null;

export async function submitOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const answers: OnboardingAnswers = {
    sector: formData.get("sector") as Sector,
    employee_count: formData.get("employee_count") as EmployeeCount,
    annual_revenue: formData.get("annual_revenue") as AnnualRevenue,
    provides_essential_service: formData.get("provides_essential_service") as EssentialServiceAnswer,
    country: formData.get("country") as Country,
  };

  if (
    !answers.sector ||
    !answers.employee_count ||
    !answers.annual_revenue ||
    !answers.provides_essential_service ||
    !answers.country
  ) {
    return { error: "Please answer all questions before continuing." };
  }

  const classification = classifyNis2(answers);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // Look up the user's current organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_organization_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.last_organization_id) {
    return { error: "No organization found. Please create one first." };
  }

  const organizationId = profile.last_organization_id;

  // Insert onboarding response
  const { error: insertError } = await supabase
    .from("onboarding_responses")
    .insert({
      organization_id: organizationId,
      answers_json: answers,
      derived_result_json: classification,
      completed_by: user.id,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  // Update the organization with derived fields
  const { error: updateError } = await supabase
    .from("organizations")
    .update({
      sector: answers.sector,
      employee_band: answers.employee_count,
      country_code: answers.country,
      entity_class: classification.entity_class,
      nis2_applicable: classification.nis2_applicable,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", organizationId);

  if (updateError) {
    return { error: updateError.message };
  }

  redirect("/app/dashboard");
}
