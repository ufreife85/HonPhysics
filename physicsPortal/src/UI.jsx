// APChem/lessonViewer/src/UI.jsx
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
  if (/^\s*[-•]/.test(t)) return false;              // not a bullet
  if (/^\d+[.)]\s/.test(t)) return false;             // not 1. / 1) ...
  if (/^[A-Za-z][.)]\s/.test(t)) return false;        // not A. / A) / a. ...
  if (/^[IVXLCDMivxlcdm]+[.)]\s/.test(t)) return false; // not I. / i) ...
  if (/[.!?:;]\s*$/.test(t)) return false;            // no terminal punctuation
  if (t.split(/\s+/).length < 3) return false;        // at least 3 words
  // at least 5 letters total
  if ((t.match(/[A-Za-z]/g) || []).length < 5) return false;
  return true;
}

function outlineInfo(rawLine = "") {
  const line = String(rawLine ?? "");
  const trimmed = line.trim();

  // Image marker
  const img = /^\s*\/\/image\s*_\s*(.+)$/i.exec(trimmed);
  if (img) return { kind: "image", text: img[1].trim(), level: 0 };

  // Explicit markers (highest fidelity)
  if (/^[IVXLCDM]+[.)]\s+/.test(trimmed)) return { kind: "heading", text: trimmed, level: 1, marker: "roman" };
  if (/^[ivxlcdm]+[.)]\s+/.test(trimmed)) return { kind: "heading", text: trimmed, level: 1, marker: "roman" };
  if (/^[A-Z][.)]\s+/.test(trimmed))      return { kind: "heading", text: trimmed, level: 2, marker: "alpha" };
  if (/^\d+[.)]\s+/.test(trimmed))        return { kind: "heading", text: trimmed, level: 3, marker: "numeric" };
  if (/^[a-z][.)]\s+/.test(trimmed))      return { kind: "subpoint", text: trimmed, level: 4, marker: "alpha-lower" };
  if (/^\s*-\s+/.test(line))              return { kind: "bullet",  text: line.replace(/^\s*-\s+/, ""), level: 5 };

  // Implicit heading (title line) — for content like your 1.1 notes
  if (looksLikeTitle(trimmed))            return { kind: "heading", text: trimmed, level: 2, marker: "title" };

  // Default paragraph
  return { kind: "para", text: line, level: 0 };
}

function padClass(level) {
  // Visible indentation by outline level
  switch (level) {
    case 1: return "pl-0";   // Roman
    case 2: return "pl-4";   // A./Title
    case 3: return "pl-8";   // 1.
    case 4: return "pl-12";  // a.
    case 5: return "pl-5";   // bullets
    default: return "pl-0";
  }
}

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
      return <h2 className={`mt-4 text-xl font-semibold text-zinc-100 ${padClass(info.level)}`}>{info.text}</h2>;
    }
    if (info.level === 2) {
      return <h3 className={`mt-3 text-lg font-semibold text-zinc-100 ${padClass(info.level)}`}>{info.text}</h3>;
    }
    return <h4 className={`mt-2 text-base font-semibold text-zinc-100 ${padClass(info.level)}`}>{info.text}</h4>;
  }

  if (info.kind === "subpoint") {
    return <p className={`text-zinc-100/90 ${padClass(info.level)}`}>{info.text}</p>;
  }

  if (info.kind === "bullet") {
    return (
      <div className={`flex items-start gap-2 ${padClass(info.level)}`}>
        <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-zinc-300/90" />
        <p className="text-zinc-100/90">{info.text}</p>
      </div>
    );
  }

  // paragraph
  return <p className={`text-zinc-100/90 ${padClass(info.level)}`}>{info.text}</p>;
}

/* ================= Stepper (keyboard + swipe + outline-aware) ================= */
/* ============ Stepper (keyboard + swipe + outline-aware + FLOATING CONTROLS) ============ */
export function Stepper({ steps = [], imagesBase = "" }) {
  const [revealed, setRevealed] = useState(0);
  const all = steps.length;
  const visible = steps.slice(0, revealed);

  const revealNext = () => setRevealed((n) => Math.min(all, n + 1));
  const revealPrev = () => setRevealed((n) => Math.max(0, n - 1));
  const revealAll  = () => setRevealed(all);
  const reset      = () => setRevealed(0);

  // Keyboard (global; works immediately)
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.isComposing) return;

      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); revealNext(); }
      else if (e.key === "ArrowLeft")              { e.preventDefault(); revealPrev(); }
      else if (e.key.toLowerCase() === "a")        { e.preventDefault(); revealAll();  }
      else if (e.key.toLowerCase() === "r")        { e.preventDefault(); reset();      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [all]);

  // Touch swipe (left = next, right = back)
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

    const SWIPE_DIST = 40;
    const SWIPE_TIME = 600;
    if (dt <= SWIPE_TIME && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_DIST) {
      if (dx < 0) revealNext(); else revealPrev();
    }
    setTouchStart(null);
  };

  // Outline-aware rendering
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
        {/* Headings & images (bare, preserve outline) */}
        {headingOrImages.map((c, i) =>
          c.kind === "image"
            ? <PromptLine key={`himg-${i}`} line={`//image _ ${c.text}`} imagesBase={imagesBase} />
            : <PromptLine key={`h-${i}`} line={c.text} imagesBase={imagesBase} />
        )}

        {/* Body (card) */}
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
      aria-live="polite"
    >
      {/* FLOATING CONTROLS (fixed bottom-right) */}
      <div
        className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 backdrop-blur px-2 py-2"
        role="toolbar"
        aria-label="Reveal controls"
      >
        <button
          onClick={revealPrev}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          title="Previous (←)"
          aria-label="Reveal previous"
          disabled={revealed <= 0}
        >
          ◀
        </button>
        <button
          onClick={revealNext}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-50"
          title="Next (→ or Space)"
          aria-label="Reveal next"
          disabled={revealed >= all}
        >
          Reveal next
        </button>
        <button
          onClick={revealAll}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          title="Reveal all (A)"
          aria-label="Reveal all"
          disabled={revealed >= all}
        >
          All
        </button>
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          title="Reset (R)"
          aria-label="Reset"
          disabled={revealed === 0}
        >
          Reset
        </button>
        <span className="ml-1 rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-300" aria-live="polite">
          {revealed}/{all}
        </span>
      </div>

      {/* Give content breathing room so the floating bar doesn’t overlap last items */}
      <ol className="space-y-3 pb-24">
        {visible.map((s, i) => renderStep(s, i))}
      </ol>
    </section>
  );
}


/** ToolLauncher — primary button matches your primary action */
export function ToolLauncher({ tool }) {
  if (!tool || typeof tool !== "object") return null;
  const { label = "Open Tool", href = "", launch = "new-tab" } = tool;

  const Primary = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
    >
      {label}
      <span aria-hidden>↗</span>
    </a>
  );

  if (launch === "embed" && href) {
    return (
      <div className="space-y-3 text-zinc-100">
        <div className="text-sm text-zinc-300">
          Embedded view (same origin). If it looks cramped, use the new-tab button.
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2">
          <iframe title={label} src={href} className="h-[70vh] w-full rounded-xl" />
        </div>
        <div>{Primary}</div>
      </div>
    );
  }

  return <div className="py-2">{Primary}</div>;
}
