"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, completeAssessment } from "@/server/actions/assessment";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Control {
  id: string;
  control_code: string;
  title: string;
  description: string;
  guidance: string;
  article_ref: string;
  sort_order: number;
}

interface ExistingAnswer {
  control_id: string;
  answer: string;
  note: string | null;
}

interface Props {
  assessmentId: string;
  controls: Control[];
  existingAnswers: ExistingAnswer[];
}

type AnswerValue = "yes" | "partial" | "no";

export function AssessmentFlow({
  assessmentId,
  controls,
  existingAnswers,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Build initial answers map from existing answers
  const initialAnswers: Record<string, { answer: AnswerValue; note: string }> =
    {};
  for (const ea of existingAnswers) {
    initialAnswers[ea.control_id] = {
      answer: ea.answer as AnswerValue,
      note: ea.note || "",
    };
  }

  const [answers, setAnswers] =
    useState<Record<string, { answer: AnswerValue; note: string }>>(
      initialAnswers,
    );

  // Find the first unanswered control, or the first control if all answered
  const firstUnanswered = controls.findIndex(
    (c) => !initialAnswers[c.id],
  );
  const [currentIndex, setCurrentIndex] = useState(
    firstUnanswered >= 0 ? firstUnanswered : 0,
  );
  const [error, setError] = useState<string | null>(null);

  const control = controls[currentIndex];
  const totalControls = controls.length;
  const answeredCount = Object.keys(answers).length;
  const isLastControl = currentIndex === totalControls - 1;
  const allAnswered = answeredCount === totalControls;
  const currentAnswer = answers[control?.id];

  function handleSelect(value: AnswerValue) {
    if (!control) return;
    setAnswers((prev) => ({
      ...prev,
      [control.id]: { answer: value, note: prev[control.id]?.note || "" },
    }));
  }

  function handleNoteChange(note: string) {
    if (!control) return;
    setAnswers((prev) => ({
      ...prev,
      [control.id]: { ...prev[control.id], note },
    }));
  }

  function saveAndNavigate(nextIndex: number) {
    if (!control || !currentAnswer) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.set("assessmentId", assessmentId);
      fd.set("controlId", control.id);
      fd.set("answer", currentAnswer.answer);
      fd.set("note", currentAnswer.note);

      const result = await submitAnswer(null, fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setCurrentIndex(nextIndex);
    });
  }

  function handleNext() {
    if (currentAnswer && !isLastControl) {
      saveAndNavigate(currentIndex + 1);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      if (currentAnswer) {
        saveAndNavigate(currentIndex - 1);
      } else {
        setCurrentIndex(currentIndex - 1);
      }
    }
  }

  function handleComplete() {
    if (!currentAnswer) return;

    startTransition(async () => {
      // Save current answer first
      const fd = new FormData();
      fd.set("assessmentId", assessmentId);
      fd.set("controlId", control.id);
      fd.set("answer", currentAnswer.answer);
      fd.set("note", currentAnswer.note);

      const saveResult = await submitAnswer(null, fd);
      if (saveResult?.error) {
        setError(saveResult.error);
        return;
      }

      // Now complete
      const result = await completeAssessment(assessmentId);
      if (result?.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  if (!control) return null;

  const answerOptions: {
    value: AnswerValue;
    label: string;
    selectedBorder: string;
    selectedBg: string;
    selectedText: string;
  }[] = [
    {
      value: "yes",
      label: "Yes — fully implemented",
      selectedBorder: "border-[#16a34a]",
      selectedBg: "bg-green-50",
      selectedText: "text-green-900",
    },
    {
      value: "partial",
      label: "Partial — some measures in place",
      selectedBorder: "border-[#f59e0b]",
      selectedBg: "bg-amber-50",
      selectedText: "text-amber-900",
    },
    {
      value: "no",
      label: "No — not implemented",
      selectedBorder: "border-[#dc2626]",
      selectedBg: "bg-red-50",
      selectedText: "text-red-900",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Gap Assessment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evaluate each NIS2 control for your organization.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            Control {currentIndex + 1} of {totalControls}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <Progress value={(answeredCount / totalControls) * 100} />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Control card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <Badge variant="secondary" className="font-mono">
              {control.control_code}
            </Badge>
            <span className="text-xs text-muted-foreground">{control.article_ref}</span>
          </div>
          <CardTitle className="text-lg">{control.title}</CardTitle>
          <CardDescription>{control.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Guidance */}
          <Card className="bg-muted/50">
            <CardContent className="py-3">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Guidance
              </p>
              <p className="text-sm">{control.guidance}</p>
            </CardContent>
          </Card>

          {/* Answer options as cards */}
          <div className="space-y-2">
            {answerOptions.map((opt) => {
              const isSelected = currentAnswer?.answer === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
                    isSelected
                      ? `${opt.selectedBorder} ${opt.selectedBg} ${opt.selectedText}`
                      : "border-transparent ring-1 ring-foreground/10 hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? opt.value === "yes"
                          ? "border-[#16a34a]"
                          : opt.value === "partial"
                            ? "border-[#f59e0b]"
                            : "border-[#dc2626]"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && (
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          opt.value === "yes"
                            ? "bg-[#16a34a]"
                            : opt.value === "partial"
                              ? "bg-[#f59e0b]"
                              : "bg-[#dc2626]"
                        }`}
                      />
                    )}
                  </div>
                  <span className="font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Optional note */}
          <div className="space-y-2">
            <Label htmlFor="note">Notes (optional)</Label>
            <Textarea
              id="note"
              rows={2}
              value={currentAnswer?.note || ""}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Add any relevant context or details..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentIndex === 0 || isPending}
          className={currentIndex === 0 ? "invisible" : ""}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          {allAnswered && (
            <Button
              onClick={handleComplete}
              disabled={isPending}
              className="bg-[#16a34a] hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              {isPending ? "Completing..." : "Complete Assessment"}
            </Button>
          )}

          {!isLastControl && (
            <Button
              onClick={handleNext}
              disabled={!currentAnswer || isPending}
            >
              {isPending ? "Saving..." : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {isLastControl && !allAnswered && (
            <Button
              onClick={() => {
                // Save current and go to first unanswered
                if (currentAnswer) {
                  startTransition(async () => {
                    const fd = new FormData();
                    fd.set("assessmentId", assessmentId);
                    fd.set("controlId", control.id);
                    fd.set("answer", currentAnswer.answer);
                    fd.set("note", currentAnswer.note);
                    await submitAnswer(null, fd);
                    const firstUnanswered = controls.findIndex(
                      (c) => !answers[c.id],
                    );
                    if (firstUnanswered >= 0) setCurrentIndex(firstUnanswered);
                  });
                }
              }}
              disabled={!currentAnswer || isPending}
            >
              Go to unanswered
            </Button>
          )}
        </div>
      </div>

      {/* Quick nav dots */}
      <div className="mt-6 flex flex-wrap gap-1 justify-center">
        {controls.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              if (currentAnswer) {
                saveAndNavigate(i);
              } else {
                setCurrentIndex(i);
              }
            }}
            title={`${c.control_code}: ${c.title}`}
            className={`h-3 w-3 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-primary"
                : answers[c.id]
                  ? "bg-primary/40"
                  : "bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
