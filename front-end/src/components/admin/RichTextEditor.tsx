"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type Quill from "quill";
type QuillRange = { index: number; length: number } | null;
import "quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List as ListIcon,
  ListOrdered,
  Type as TypeIcon,
  ChevronDown,
} from "lucide-react";

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

// We intentionally avoid Quill's built-in toolbar to use shadcn controls

type Formats = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  background?: string;
  align?: string;
  list?: "bullet" | "ordered" | undefined;
  size?: "small" | "large" | "huge" | undefined;
};

function ToolbarButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm
        transition-colors hover:bg-red-50 hover:border-red-300
        ${
          active
            ? "bg-red-50 border-red-400 text-red-700"
            : "bg-white border-gray-300"
        }
      `}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const lastHtmlRef = useRef<string>("");
  const [formats, setFormats] = useState<Formats>({});
  const [open, setOpen] = useState<{
    align?: boolean;
    list?: boolean;
    size?: boolean;
  }>({});
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted || !containerRef.current) return;
      // Lazy-load Quill only on client to avoid SSR issues
      const QuillCtor = (await import("quill")).default;

      if (!quillRef.current) {
        quillRef.current = new QuillCtor(containerRef.current, {
          theme: "snow",
          placeholder,
          modules: {
            // We provide our own custom toolbar using shadcn buttons
            toolbar: false,
          },
        });

        quillRef.current.on("text-change", () => {
          const html = (quillRef.current!.root as HTMLElement)?.innerHTML || "";
          // Avoid loops when we programmatically set the same HTML
          if (html === lastHtmlRef.current) return;
          lastHtmlRef.current = html;
          onChangeRef.current(html);
        });

        quillRef.current.on("selection-change", (range: QuillRange) => {
          if (!quillRef.current) return;
          if (!range) {
            // Editor blurred; clear active format indicators
            setFormats({});
            return;
          }
          const f = quillRef.current.getFormat(
            range.index,
            range.length || 0
          ) as Formats;
          setFormats(f);
        });
      }

      // Initialize content if different
      if (typeof value === "string" && value !== lastHtmlRef.current) {
        if (quillRef.current) {
          // Use Quill API to paste HTML so formats are applied correctly
          quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
          lastHtmlRef.current = value || "";
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [value, placeholder]);

  // Helpers to apply formats via Quill API
  type InlineKey = "bold" | "italic" | "underline";
  const toggleInline = (key: InlineKey) => {
    const q = quillRef.current;
    if (!q) return;
    const current = (formats[key] ?? false) as boolean;
    const next = !current;
    q.format(key, next);
  };

  const setAlign = (val: "left" | "center" | "right" | "justify") => {
    const q = quillRef.current;
    if (!q) return;
    // Quill uses false to clear (default left)
    if (val === "left") q.format("align", false);
    else q.format("align", val);
  };

  const setList = (val: "bullet" | "ordered") => {
    const q = quillRef.current;
    if (!q) return;
    q.format("list", val);
  };

  const setSize = (val: "small" | "" | "large" | "huge") => {
    const q = quillRef.current;
    if (!q) return;
    // empty string means default size (clear)
    if (val === "") q.format("size", false);
    else q.format("size", val);
  };

  const sizes = useMemo(
    () => [
      { label: "S", value: "small" as const },
      { label: "M", value: "" as const }, // default (clear)
      { label: "L", value: "large" as const },
      { label: "XL", value: "huge" as const },
    ],
    []
  );

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-white">
        <ToolbarButton
          title="Bold"
          active={formats.bold}
          onClick={() => toggleInline("bold")}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={formats.italic}
          onClick={() => toggleInline("italic")}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={formats.underline}
          onClick={() => toggleInline("underline")}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <div className="relative">
          <ToolbarButton
            title="Align"
            onClick={() => setOpen((o) => ({ ...o, align: !o.align }))}
          >
            <AlignLeft className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </ToolbarButton>
          {open.align && (
            <div
              className="absolute z-20 mt-1 w-44 rounded-md border border-gray-300 bg-white p-1 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  setAlign("left");
                  setOpen((o) => ({ ...o, align: false }));
                }}
              >
                <AlignLeft className="h-4 w-4" /> Left
              </button>
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  setAlign("center");
                  setOpen((o) => ({ ...o, align: false }));
                }}
              >
                <AlignCenter className="h-4 w-4" /> Center
              </button>
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  setAlign("right");
                  setOpen((o) => ({ ...o, align: false }));
                }}
              >
                <AlignRight className="h-4 w-4" /> Right
              </button>
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  setAlign("justify");
                  setOpen((o) => ({ ...o, align: false }));
                }}
              >
                <AlignJustify className="h-4 w-4" /> Justify
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton
            title="List"
            onClick={() => setOpen((o) => ({ ...o, list: !o.list }))}
          >
            <ListIcon className="h-4 w-4" />
            <ChevronDown className="h-3 w-3" />
          </ToolbarButton>
          {open.list && (
            <div
              className="absolute z-20 mt-1 w-44 rounded-md border border-gray-300 bg-white p-1 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  setList("bullet");
                  setOpen((o) => ({ ...o, list: false }));
                }}
              >
                <ListIcon className="h-4 w-4" /> Bulleted list
              </button>
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-100"
                onClick={() => {
                  setList("ordered");
                  setOpen((o) => ({ ...o, list: false }));
                }}
              >
                <ListOrdered className="h-4 w-4" /> Numbered list
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <ToolbarButton
            title="Size"
            onClick={() => setOpen((o) => ({ ...o, size: !o.size }))}
          >
            <TypeIcon className="h-4 w-4" />
            <span className="text-xs font-medium">
              {(() => {
                const current = formats.size ?? "";
                return sizes.find((s) => s.value === current)?.label ?? "N";
              })()}
            </span>
            <ChevronDown className="h-3 w-3" />
          </ToolbarButton>
          {open.size && (
            <div
              className="absolute z-20 mt-1 w-28 rounded-md border border-gray-300 bg-white p-1 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {sizes.map((s) => (
                <button
                  key={s.value}
                  className={`flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-gray-100 ${
                    (formats.size ?? "") === s.value ? "text-red-700" : ""
                  }`}
                  onClick={() => {
                    setSize(s.value);
                    setOpen((o) => ({ ...o, size: false }));
                  }}
                >
                  <span className="text-sm">{s.label}</span>
                  <span
                    className={`leading-none ${
                      s.value === "small"
                        ? "text-xs"
                        : s.value === "large"
                        ? "text-[18px]"
                        : s.value === "huge"
                        ? "text-2xl"
                        : "text-base"
                    }`}
                  >
                    Aa
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          <label className="text-xs text-gray-500">Text</label>
          <Input
            type="color"
            className="w-10 p-1 h-8"
            title="Text color"
            value={(formats.color as string) || "#000000"}
            onChange={(e) => quillRef.current?.format("color", e.target.value)}
          />
          <label className="text-xs text-gray-500">Bg</label>
          <Input
            type="color"
            className="w-10 p-1 h-8"
            title="Background color"
            value={(formats.background as string) || "#ffffff"}
            onChange={(e) =>
              quillRef.current?.format("background", e.target.value)
            }
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={() => {
            const q = quillRef.current;
            if (!q) return;
            const sel = q.getSelection();
            if (!sel) return;
            q.removeFormat(sel.index, sel.length || 0);
          }}
        >
          Clear
        </Button>
      </div>

      {/* Quill mounts here */}
      <div className="relative">
        <style jsx global>{`
          .ql-container {
            min-height: 180px;
            border: none;
          }
          .ql-editor {
            min-height: 180px;
            padding: 12px 14px;
            cursor: text;
          }
        `}</style>
        <div ref={containerRef} className="min-h-[180px]" />
      </div>
    </div>
  );
}
