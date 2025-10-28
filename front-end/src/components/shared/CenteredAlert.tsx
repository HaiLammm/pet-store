"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export type Banner = {
  variant: "default" | "destructive";
  title: string;
  message?: string;
};

type Props = {
  banner: Banner | null;
  onClose: () => void;
  // optional duration override in ms, default 5000
  durationMs?: number;
};

export default function CenteredAlert({
  banner,
  onClose,
  durationMs = 5000,
}: Props) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [progressToZero, setProgressToZero] = useState(false);
  const durationClass = (() => {
    switch (durationMs) {
      case 2000:
        return "[animation-duration:2000ms]";
      case 3000:
        return "[animation-duration:3000ms]";
      case 5000:
        return "[animation-duration:5000ms]";
      case 7000:
        return "[animation-duration:7000ms]";
      case 10000:
        return "[animation-duration:10000ms]";
      default:
        return "[animation-duration:5000ms]";
    }
  })();

  useEffect(() => {
    if (!banner) return;
    setShow(true);
    setProgressToZero(false);
    const raf = requestAnimationFrame(() => setProgressToZero(true));
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 200);
    }, durationMs);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [banner, durationMs, onClose]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!banner) return null;

  const overlay = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      {/* backdrop (click to dismiss) - no dimming */}
      <button
        aria-label="Close alert"
        className="absolute inset-0 bg-transparent pointer-events-auto"
        onClick={() => {
          setShow(false);
          setTimeout(onClose, 200);
        }}
      />
      {/* content */}
      <div
        className={`relative w-full max-w-md transition-all duration-200 ease-out pointer-events-auto ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Alert
          variant={banner.variant}
          className="relative flex flex-col gap-2 px-4 py-3 rounded-xl shadow-lg border border-black/10 bg-white text-gray-900 [&>svg]:left-0 [&>svg]:top-0 [&>svg~*]:pl-0"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            {banner.variant === "destructive" ? (
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            )}
            <div className="mr-2 flex flex-col">
              <AlertTitle>{banner.title}</AlertTitle>
              {banner.message && (
                <AlertDescription>{banner.message}</AlertDescription>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end"></div>
          {/* progress track & bar at the bottom */}
          <div className="mt-1 h-1 bg-gray-200/80 overflow-hidden">
            <div
              className={`h-full w-full ${
                banner.variant === "destructive" ? "bg-red-500" : "bg-blue-500"
              } ${
                progressToZero ? "animate-[bar-shrink_linear_forwards]" : ""
              } ${durationClass}`}
            />
          </div>
        </Alert>
      </div>
    </div>
  );

  // Render in a portal to avoid being affected by parent stacking contexts
  if (!banner) return null;
  if (mounted && typeof window !== "undefined") {
    return createPortal(overlay, document.body);
  }
  return overlay;
}
