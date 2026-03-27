"use client";

import { useActionState, useState } from "react";
import {
  submitOnboarding,
  type OnboardingActionState,
} from "@/server/actions/onboarding";
import {
  ONBOARDING_QUESTIONS,
} from "@/lib/compliance/classification";
import { ChevronLeft, ChevronRight, CheckCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

  const progressValue = ((step + (hasCurrentAnswer ? 1 : 0)) / totalSteps) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            NIS2 Applicability Assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            Answer 5 questions to determine your organization&apos;s NIS2
            classification.
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {step + 1} of {totalSteps}
          </span>
          <span>{Math.round(progressValue)}%</span>
        </div>
        <Progress value={progressValue} />
      </div>

      {state?.error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.label}</CardTitle>
          {currentQuestion.description && (
            <CardDescription>{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
                  answers[currentQuestion.id] === option.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-transparent ring-1 ring-foreground/10 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    answers[currentQuestion.id] === option.value
                      ? "border-primary"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {answers[currentQuestion.id] === option.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={!canGoBack}
          className={!canGoBack ? "invisible" : ""}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

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
            <Button type="submit" disabled={isPending}>
              <CheckCircle className="h-4 w-4" />
              {isPending ? "Submitting..." : "Complete Assessment"}
            </Button>
          </form>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!hasCurrentAnswer}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
