"use client";

import { useCallback, useId, useState } from "react";

type Props = {
  code: string;
  variant?: "inline" | "game";
};

export function CopyCodeButton({ code, variant = "inline" }: Props) {
  const [copied, setCopied] = useState(false);
  const statusId = useId();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.dispatchEvent(
        new CustomEvent("site:toast", {
          detail: { message: "Code copied to clipboard" },
        }),
      );
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const isGame = variant === "game";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy code ${code}`}
      aria-describedby={copied ? statusId : undefined}
      className={
        isGame
          ? `inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-extrabold tracking-wide text-white transition-all duration-[250ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 hover:scale-[1.05] hover:brightness-110 active:scale-[0.95] ${
              copied
                ? "animate-copy-success border-emerald-400/70 bg-gradient-to-r from-emerald-600 to-teal-600 text-emerald-50 shadow-[0_0_28px_rgba(52,211,153,0.5)]"
                : "border-red-500/45 bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 shadow-[0_0_26px_rgba(239,68,68,0.45),0_0_24px_rgba(244,114,182,0.2)] hover:border-red-400/70 hover:shadow-[0_0_36px_rgba(239,68,68,0.55),0_0_28px_rgba(59,130,246,0.25)]"
            }`
          : `inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-[250ms] ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 hover:scale-[1.05] hover:brightness-110 active:scale-[0.95] ${
              copied
                ? "animate-copy-success border-emerald-500/55 bg-emerald-950/70 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                : "border-blue-500/35 bg-blue-950/50 text-blue-200 hover:border-red-400/45 hover:bg-red-950/45 hover:text-red-100 hover:shadow-[0_0_16px_rgba(239,68,68,0.22),0_0_20px_rgba(59,130,246,0.15)]"
            }`
      }
    >
      {copied ? (
        <>
          <CheckIcon />
          <span id={statusId} className="tabular-nums">
            Copied!
          </span>
        </>
      ) : (
        <>
          <CopyIcon />
          Copy code
        </>
      )}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
