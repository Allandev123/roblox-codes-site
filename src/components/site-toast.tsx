"use client";

import { useEffect, useState } from "react";

type ToastVariant = "success" | "error" | "default";

type ToastPayload = { message: string; variant?: ToastVariant };

type ToastEvent = CustomEvent<ToastPayload>;

function isToastEvent(value: Event): value is ToastEvent {
  return value instanceof CustomEvent && typeof value.detail?.message === "string";
}

export function SiteToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>("default");

  useEffect(() => {
    let timeoutId: number | null = null;

    const onToast = (event: Event) => {
      if (!isToastEvent(event)) return;
      setMessage(event.detail.message);
      setVariant(event.detail.variant ?? "default");
      if (timeoutId != null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setMessage(null), 2200);
    };

    window.addEventListener("site:toast", onToast as EventListener);
    return () => {
      window.removeEventListener("site:toast", onToast as EventListener);
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  const styles =
    variant === "error"
      ? "border-red-400/50 bg-red-950/85 text-red-100 shadow-[0_0_24px_rgba(248,113,113,0.22)]"
      : variant === "success"
        ? "border-emerald-400/45 bg-emerald-950/80 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.26)]"
        : "border-emerald-400/45 bg-emerald-950/80 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.26)]";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex justify-center px-4">
      <div
        className={`rounded-xl border px-4 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-300 ${
          message
            ? `translate-y-0 opacity-100 ${styles}`
            : "translate-y-3 border-transparent bg-transparent opacity-0"
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        {message ?? "Copied"}
      </div>
    </div>
  );
}
