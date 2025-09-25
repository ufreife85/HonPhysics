export function Stepper({ steps = [] }) {
  const [revealed, setRevealed] = useState(0);
  const all = steps.length;
  const visible = steps.slice(0, revealed);

  const revealNext = () => setRevealed((n) => Math.min(all, n + 1));
  const revealAll  = () => setRevealed(all);
  const reset      = () => setRevealed(0);

  // --- Keyboard: works immediately on mount (no click needed)
  useEffect(() => {
    const onKey = (e) => {
      // ignore if typing in inputs/textareas
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.isComposing) return;

      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); revealNext(); }
      else if (e.key.toLowerCase() === "a")        { e.preventDefault(); revealAll();  }
      else if (e.key.toLowerCase() === "r")        { e.preventDefault(); reset();      }
      else if (e.key === "ArrowLeft")              { e.preventDefault(); setRevealed((n)=>Math.max(0,n-1)); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [all]);

  // --- Touch: iPad swipe (left = next, right = previous)
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

    const SWIPE_DIST = 40; // px
    const SWIPE_TIME = 600; // ms
    if (dt <= SWIPE_TIME && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_DIST) {
      if (dx < 0) revealNext();                           // swipe left -> next
      else setRevealed((n) => Math.max(0, n - 1));        // swipe right -> previous
    }
    setTouchStart(null);
  };

  return (
    <section
      className="text-zinc-100"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-live="polite"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={revealNext}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-50"
          disabled={revealed >= all}
        >
          Reveal next
        </button>
        <button
          onClick={revealAll}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          disabled={revealed >= all}
          title="Shortcut: A"
        >
          Reveal all
        </button>
        <button
          onClick={reset}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          title="Shortcuts: R / ⟵ to step back"
        >
          Reset (R)
        </button>
        <span className="text-xs text-zinc-400">{revealed}/{all} shown</span>
      </div>

      <ol className="space-y-3">
        {visible.map((s, i) => (
          <li
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
          >
            {s}
          </li>
        ))}
      </ol>
    </section>
  );
}
