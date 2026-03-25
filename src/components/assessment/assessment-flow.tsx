"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitAnswer, completeAssessment } from "@/server/actions/assessment";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

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

  const answerOptions: { value: AnswerValue; label: string; color: string }[] =
    [
      {
        value: "yes",
        label: "Yes — fully implemented",
        color: "border-green-500 bg-green-50 text-green-900",
      },
      {
        value: "partial",
        label: "Partial — some measures in place",
        color: "border-amber-500 bg-amber-50 text-amber-900",
      },
      {
        value: "no",
        label: "No — not implemented",
        color: "border-red-500 bg-red-50 text-red-900",
      },
    ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gap Assessment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Evaluate each NIS2 control for your organization.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>
            Control {currentIndex + 1} of {totalControls}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${(answeredCount / totalControls) * 100}%`,
            }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Control card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-mono font-medium text-gray-600">
            {control.control_code}
          </span>
          <span className="text-xs text-gray-400">{control.article_ref}</span>
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          {control.title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{control.description}</p>

        <div className="mt-3 rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
            Guidance
          </p>
          <p className="text-sm text-gray-700">{control.guidance}</p>
        </div>

        {/* Answer options */}
        <div className="mt-5 space-y-2">
          {answerOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                currentAnswer?.answer === opt.value
                  ? opt.color
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  currentAnswer?.answer === opt.value
                    ? opt.value === "yes"
                      ? "border-green-500"
                      : opt.value === "partial"
                        ? "border-amber-500"
                        : "border-red-500"
                    : "border-gray-300"
                }`}
              >
                {currentAnswer?.answer === opt.value && (
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      opt.value === "yes"
                        ? "bg-green-500"
                        : opt.value === "partial"
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                  />
                )}
              </div>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Optional note */}
        <div className="mt-4">
          <label
            htmlFor="note"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Notes (optional)
          </label>
          <textarea
            id="note"
            rows={2}
            value={currentAnswer?.note || ""}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Add any relevant context or details..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0 || isPending}
          className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:invisible"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="flex gap-3">
          {allAnswered && (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" />
              {isPending ? "Completing..." : "Complete Assessment"}
            </button>
          )}

          {!isLastControl && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!currentAnswer || isPending}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {isLastControl && !allAnswered && (
            <button
              type="button"
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
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Go to unanswered
            </button>
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
                ? "bg-blue-600"
                : answers[c.id]
                  ? "bg-blue-300"
                  : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
