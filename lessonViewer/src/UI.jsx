// HonPhysics/lessonViewer/src/UI.jsx
import React, { useEffect, useMemo, useState } from "react";

/** Tabs — match existing lesson style (indigo primary, zinc secondary) */
export function Tabs({ items = [], active, onChange }) {
  return (
    <nav className="flex flex-wrap gap-1">
      {items.map((key) => (
        <button
          key={key}
          onClick={() => onChange?.(key)}
          className={`px-2.5 py-1.5 rounded-xl text-xs sm:text-sm ${
            key === active ? "bg-indigo-600" : "bg-zinc-800 hover:bg-zinc-700"
          }`}
        >
          {labelForTab(key)}
        </button>
      ))}
    </nav>
  );
}

function labelForTab(k) {
  const map = {
    overview: "Overview",
    notes: "Notes",
    interactive: "Interactive",
    tool: "Interactive", // backward-compat: show as “Interactive”
    examples: "Examples",
    practice: "Practice",
    images: "Images",
  };
  return map[k] || k;
}

/* ================= Outline parsing helpers ================= */

// Heuristic for “title lines” like: `The Mole (mol) as a Counting Unit`
// (no terminal punctuation, at least 3 words, not a bullet or marker)
function looksLikeTitle(line) {
  const t = String(line || "").trim();
  if (!t) return false;
  if (/^\s*[-•]/.test(t)) return false;                    // not a bullet
  if (/^\d+[.)]\s/.test(t)) return false;                  // not 1. / 1)
  if (/^[A-Za-z][.)]\s/.test(t)) return false;             // not A. / A) / a.
  if (/^(?:I|II|III|IV|V|VI|VII|VIII|IX|X|i|ii|iii|iv|v|vi|vii|viii|ix|x)[.)]\s/.test(t)) return false; // not Roman I–X
  if (/[.!?:;]\s*$/.test(t)) return false;                 // no terminal punctuation
  if (t.split(/\s+/).length < 3) return false;             // at least 3 words
  if ((t.match(/[A-Za-z]/g) || []).length < 5) return false;
  if (t.includes(":")) return false;                       // avoid “Target:” headings
  return true;
}

// Explicit marker regexes
const RX_TOP_ROMAN =
  /^(?:I|II|III|IV|V|VI|VII|VIII|IX|X)[.)]\s+/;            // whitelist I–X only
const RX_LOW_ROMAN =
  /^(?:i|ii|iii|iv|v|vi|vii|viii|ix|x)[.)]\s+/;            // whitelist i–x only
const RX_UPPER_LETTER = /^[A-Z][.)]\s+/;                   // A. / A)
const RX_LOWER_LETTER = /^[a-z][.)]\s+/;                   // a. / a)
const RX_NUMBER       = /^\d+[.)]\s+/;                     // 1. / 1)
const RX_BULLET       = /^\s*-\s+/;

function outlineInfo(rawLine = "") {
  const line = String(rawLine ?? "");
  const trimmed = line.trim();

  // Image marker
  const img = /^\s*\/\/image\s*_\s*(.+)$/i.exec(trimmed);
  if (img) return { kind: "image", text: img[1].trim(), level: 0 };

  // ---- Explicit markers (ORDER MATTERS) ----
  // Prioritize letters & numbers so "C." doesn't get mis-read as Roman 100
  if (RX_UPPER_LETTER.test(trimmed)) return { kind: "heading", text: trimmed, level: 2 };
  if (RX_NUMBER.test(trimmed))       return { kind: "heading", text: trimmed, level: 3 };
  if (RX_LOWER_LETTER.test(trimmed)) return { kind: "subpoint", text: trimmed, level: 4 };
  if (RX_TOP_ROMAN.test(trimmed))    return { kind: "heading", text: trimmed, level: 1 };
  if (RX_LOW_ROMAN.test(trimmed))    return { kind: "heading", text: trimmed, level: 1 };
  if (RX_BULLET.test(line))          return { kind: "bullet",  text: line.replace(RX_BULLET, ""), level: 5 };

  // Implicit heading
  if (looksLikeTitle(trimmed)) return { kind: "heading", text: trimmed, level: 2 };

  return { kind: "para", text: line, level: 0 };
}

function padClass(level) {
  switch (level) {
    case 1: return "pl-0";
    case 2: return "pl-4";
    case 3: return "pl-8";
    case 4: return "pl-12";
    case 5: return "pl-5";
    default: return "pl-0";
  }
}

/* === Minimal inline markdown (bold/italic/underscore) ===
     Passes through HTML like <sub>/<sup> so formulas render. */
function mdToHtml(s = "") {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}
const Rich = ({ text = "" }) => (
  <span dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />
);

/* ================= Prompt (arrays of lines) ================= */
export function PromptBlock({ items = [], imagesBase = "" }) {
  return (
    <section className="space-y-3 leading-relaxed text-zinc-100">
      {items.map((line, idx) => (
        <PromptLine key={idx} line={line} imagesBase={imagesBase} />
      ))}
    </section>
  );
}

function PromptLine({ line, imagesBase }) {
  const info = useMemo(() => outlineInfo(line), [line]);

  if (info.kind === "image") {
    const src = imagesBase + info.text;
    return (
      <img
        src={src}
        alt={info.text}
        className="mx-auto w-full max-w-2xl rounded-xl border border-zinc-800 shadow"
      />
    );
  }

  if (info.kind === "heading") {
    if (info.level === 1) {
      return <h2 className={`mt-4 text-xl font-semibold text-zinc-100 ${padClass(info.level)}`}><Rich text={info.text} /></h2>;
    }
    if (info.level === 2) {
      return <h3 className={`mt-3 text-lg font-semibold text-zinc-100 ${padClass(info.level)}`}><Rich text={info.text} /></h3>;
    }
    return <h4 className={`mt-2 text-base font-semibold text-zinc-100 ${padClass(info.level)}`}><Rich text={info.text} /></h4>;
  }

  if (info.kind === "subpoint") {
    return <p className={`text-zinc-100/90 ${padClass(info.level)}`}><Rich text={info.text} /></p>;
  }

  if (info.kind === "bullet") {
    return (
      <div className={`flex items-start gap-2 ${padClass(info.level)}`}>
        <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-zinc-300/90" />
        <p className="text-zinc-100/90"><Rich text={info.text} /></p>
      </div>
    );
  }

  return <p className={`text-zinc-100/90 ${padClass(info.level)}`}><Rich text={info.text} /></p>;
}

/* ================= Stepper (keyboard + swipe + floating controls) ================= */
export function Stepper({ steps = [], imagesBase = "" }) {
  const [revealed, setRevealed] = useState(0);
  const all = steps.length;
  const visible = steps.slice(0, revealed);

  const revealNext = () => setRevealed((n) => Math.min(all, n + 1));
  const revealPrev = () => setRevealed((n) => Math.max(0, n - 1));
  const revealAll  = () => setRevealed(all);
  const reset      = () => setRevealed(0);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.isComposing) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); revealNext(); }
      else if (e.key === "ArrowLeft")              { e.preventDefault(); revealPrev(); }
      else if (e.key.toLowerCase() === "a")        { e.preventDefault(); revealAll(); }
      else if (e.key.toLowerCase() === "r")        { e.preventDefault(); reset(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [all]);

  const [touchStart, setTouchStart] = useState(null);
  const onTouchStart = (e) => {
    const t = e.changedTouches?.[0];
    if (!t) return;
    setTouchStart({ x: t.clientX, y: t.clientY, time: Date.now() });
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches?.[0];
    if (!t || !touchStart) return;
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const dt = Date.now() - touchStart.time;
    if (dt <= 600 && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) revealNext(); else revealPrev();
    }
    setTouchStart(null);
  };

  const renderStep = (s, idx) => {
    const lines = String(s ?? "").split("\n");
    const classified = lines.map((ln) => outlineInfo(ln));
    const heading = classified.find((c) => c.kind === "heading");
    const headingLevel = heading?.level ?? 0;
    const headingOrImages = classified.filter((c) => c.kind === "heading" || c.kind === "image");
    const body = classified.filter((c) => c.kind !== "heading" && c.kind !== "image");
    const bodyIndent =
      headingLevel === 1 ? "ml-0"
      : headingLevel === 2 ? "ml-4"
      : headingLevel === 3 ? "ml-8"
      : headingLevel === 4 ? "ml-12"
      : "ml-0";

    return (
      <li key={idx} className="space-y-2">
        {headingOrImages.map((c, i) =>
          c.kind === "image"
            ? <PromptLine key={`himg-${i}`} line={`//image _ ${c.text}`} imagesBase={imagesBase} />
            : <PromptLine key={`h-${i}`} line={c.text} imagesBase={imagesBase} />
        )}
        {body.length > 0 && (
          <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 ${bodyIndent}`}>
            {body.map((c, i) => (
              <PromptLine key={`b-${i}`} line={c.text} imagesBase={imagesBase} />
            ))}
          </div>
        )}
      </li>
    );
  };

  return (
    <section
      className="text-zinc-100"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur px-2 py-2">
        <button onClick={revealPrev} disabled={revealed <= 0}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">◀</button>
        <button onClick={revealNext} disabled={revealed >= all}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm">Next</button>
        <button onClick={revealAll} disabled={revealed >= all}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">All</button>
        <button onClick={reset} disabled={revealed === 0}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm">Reset</button>
        <span className="ml-1 text-xs text-zinc-300">{revealed}/{all}</span>
      </div>
      <ol className="space-y-3 pb-24">
        {visible.map((s, i) => renderStep(s, i))}
      </ol>
    </section>
  );
}

/** ToolLauncher — keep Open Tool button AND embed inline */
export function ToolLauncher({ tool }) {
  const resolveUrl = (t) => {
    if (!t) return "";
    if (typeof t === "string") return t;
    return t.href || t.tool || t.url || "";
  };
  const url = resolveUrl(tool);
  const label = (typeof tool === "object" && tool.label) || "Open Tool";
  const height = (typeof tool === "object" && (tool.height || tool.iframeHeight)) || "70vh";
  const embed = (typeof tool === "object" && "embed" in tool) ? !!tool.embed : true;

  if (!url) {
    return <div className="text-sm opacity-70">No tool URL provided.</div>;
  }

  const Primary = (
    <a href={url} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
      {label} ↗
    </a>
  );

  if (!embed) return <div className="py-2">{Primary}</div>;

  return (
    <div className="space-y-3 text-zinc-100">
      <div className="text-sm text-zinc-300">
        {Primary} <span className="opacity-70">(Embedded preview below.)</span>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2">
        <iframe title={label} src={url} className="w-full rounded-xl"
          style={{ height }} loading="lazy" />
      </div>
    </div>
  );
}
