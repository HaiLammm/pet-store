"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  children: ReactNode;
  dialogClassName?: string;
};

export default function ZoomableImage({
  src,
  alt,
  children,
  dialogClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [natural, setNatural] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 720,
  });

  // Reset stored size when closing
  useEffect(() => {
    if (!open) setNatural({ w: 0, h: 0 });
  }, [open]);

  // Track viewport to compute best-fit size
  useEffect(() => {
    if (!open) return;
    const onResize = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // Compute a fit-to-viewport scale (max 95vw x 85vh, limit upscaling to 1.5x)
  const computed = (() => {
    const maxW = viewport.w * 0.95;
    const maxH = viewport.h * 0.85;
    const w = natural.w || 1600;
    const h = natural.h || 1200;
    const fitScale = Math.min(maxW / w, maxH / h);
    const scale = Math.min(Math.max(fitScale, 0.1), 1.5);
    const renderW = Math.max(1, Math.round(w * scale));
    const renderH = Math.max(1, Math.round(h * scale));
    return { renderW, renderH };
  })();
  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-zoom-in">
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={
            dialogClassName ||
            "w-screen h-screen max-w-none p-0 bg-transparent border-0 shadow-none flex items-center justify-center"
          }
        >
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <div className="relative">
            {/* Controls */}
            <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 w-8 bg-black/60 text-white hover:bg-black/70"
                aria-label="Open original in new tab"
                title="Open original"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center h-8 w-8 bg-black/60 text-white hover:bg-black/70"
                aria-label="Close preview"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative max-h-[85vh] w-fit">
                <Image
                  src={src}
                  alt={alt}
                  width={computed.renderW}
                  height={computed.renderH}
                  className="h-auto object-contain select-none"
                  unoptimized={src.startsWith("http")}
                  priority
                  style={{
                    maxWidth: "95vw",
                    maxHeight: "85vh",
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img?.naturalWidth && img?.naturalHeight) {
                      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
