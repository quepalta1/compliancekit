"use client";

import { useActionState, useState } from "react";
import {
  submitOnboarding,
  type OnboardingActionState,
} from "@/server/actions/onboarding";
import {
  ONBOARDING_QUESTIONS,
} from "@/lib/compliance/classification";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState<
    OnboardingActionState,
    FormData
  >(submitOnboarding, null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = ONBOARDING_QUESTIONS[step];
  const totalSteps = ONBOARDING_QUESTIONS.length;
  const isLastStep = step === totalSteps - 1;
  const canGoBack = step > 0;
  const hasCurrentAnswer = !!answers[currentQuestion.id];

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function handleNext() {
    if (hasCurrentAnswer && !isLastStep) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (canGoBack) {
      setStep((s) => s - 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          NIS2 Applicability Assessment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Answer 5 questions to determine your organization&apos;s NIS2
          classification.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>
            Question {step + 1} of {totalSteps}
          </span>
          <span>{Math.round(((step + (hasCurrentAnswer ? 1 : 0)) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((step + (hasCurrentAnswer ? 1 : 0)) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {state?.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Question */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentQuestion.label}
        </h2>
        {currentQuestion.description && (
          <p className="mt-1 text-sm text-gray-500">
            {currentQuestion.description}
          </p>
        )}

        <div className="mt-5 space-y-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                answers[currentQuestion.id] === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  answers[currentQuestion.id] === option.value
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {answers[currentQuestion.id] === option.value && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                )}
              </div>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={!canGoBack}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:invisible"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {isLastStep && hasCurrentAnswer ? (
          <form action={formAction}>
            {/* Pass all answers as hidden fields */}
            {ONBOARDING_QUESTIONS.map((q) => (
              <input
                key={q.id}
                type="hidden"
                name={q.id}
                value={answers[q.id] || ""}
              />
            ))}
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" />
              {isPending ? "Submitting..." : "Complete Assessment"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!hasCurrentAnswer}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
