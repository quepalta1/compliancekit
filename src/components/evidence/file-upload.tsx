"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadEvidenceFile } from "@/server/actions/evidence";
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  evidenceItemId: string;
}

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg";
const ACCEPTED_MIME = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export function FileUpload({ evidenceItemId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleUpload = useCallback(
    async (file: File) => {
      if (!ACCEPTED_MIME.includes(file.type)) {
        setStatus("error");
        setMessage("Only PDF and image files (PNG, JPG) are accepted.");
        return;
      }

      setStatus("uploading");
      setMessage(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.set("file", file);
      formData.set("evidence_item_id", evidenceItemId);

      const result = await uploadEvidenceFile(formData);

      if ("error" in result) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage(`${file.name} uploaded successfully.`);
        router.refresh();

        // Reset after a few seconds
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 3000);
      }
    },
    [evidenceItemId, router],
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input so the same file can be re-selected
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${status === "uploading" ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileSelect}
          className="hidden"
        />

        {status === "idle" && (
          <>
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              Drop a file here or click to upload
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, PNG, or JPG up to 10 MB
            </p>
          </>
        )}

        {status === "uploading" && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm font-medium text-blue-700">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="mt-2 text-sm font-medium text-green-700">
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm font-medium text-red-700">{message}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatus("idle");
                setMessage("");
              }}
              className="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
