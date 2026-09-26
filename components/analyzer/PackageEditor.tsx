"use client";

import { useRef } from "react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Lightweight JSON tokenizer for visual highlighting only; not used for parsing. */
function highlightJson(code: string): string {
  const escaped = escapeHtml(code);
  return escaped.replace(
    /("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-sky-300";
      if (/^"/.test(match)) {
        cls = /:\s*$/.test(match) ? "text-violet-300" : "text-emerald-300";
      } else if (/true|false/.test(match)) {
        cls = "text-amber-300";
      } else if (/null/.test(match)) {
        cls = "text-zinc-500";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

interface PackageEditorProps {
  value: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
}

export function PackageEditor({ value, onChange, onLoadExample }: PackageEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function syncScroll() {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = value.slice(0, start) + "  " + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-colors focus-within:border-indigo-400/40">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </span>
          <span>package.json</span>
        </span>
        <button
          type="button"
          onClick={onLoadExample}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-indigo-400/40 hover:text-zinc-50"
        >
          Load Example
        </button>
      </div>
      <div className="relative h-96 font-mono text-[13px] leading-6">
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre p-4 text-zinc-100"
          dangerouslySetInnerHTML={{ __html: highlightJson(value) + "\n" }}
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="Paste your package.json here..."
          className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent p-4 text-transparent caret-indigo-300 outline-none"
        />
      </div>
    </div>
  );
}
