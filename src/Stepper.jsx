// DROP-IN PATCH: Replace your existing OutlineReveal and Stepper components
// to add iPad-friendly controls: tap-to-advance, swipe left/right, and a
// floating mobile toolbar (Prev • Next • Reset). Tailwind-based.

import React, { useEffect, useMemo, useRef, useState } from "react";

// --- helper labels (unchanged) ---
const roman = (n) => { const r=["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"], v=[1000,900,500,400,100,90,50,40,10,9,5,4,1]; let s="",i=0; while(n>0){ if(n>=v[i]){s+=r[i]; n-=v[i];} else i++; } return s; };
const alpha = (n) => String.fromCharCode(64 + n);

function NumberLabel({ depth, index }) {
  if (depth === 0) return <span className="font-semibold mr-2">{roman(index)}.</span>;
  if (depth === 1) return <span className="font-semibold mr-2">{alpha(index)}.</span>;
  if (depth === 2) return <span className="font-semibold mr-2">{index}.</span>;
  return <span className="font-semibold mr-2">•</span>;
}

// ================= OutlineReveal (touch-enabled) =================
export function OutlineReveal({ outline }) {
  // flatten
  function flattenOutline(nodes, depth = 0, path = []) {
    let flat = [];
    nodes.forEach((n, i) => {
      const here = { depth, index: i + 1, path: [...path, i + 1], node: n };
      flat.push(here);
      if (n.children) flat = flat.concat(flattenOutline(n.children, depth + 1, [...path, i + 1]));
    });
    return flat;
  }

  const flat = useMemo(() => flattenOutline(outline), [outline]);
  const [revealed, setRevealed] = useState(0);
  const containerRef = useRef(null);
  const touchStart = useRef(null);
  const TAP_ADVANCE = true; // tap to reveal next

  // keyboard shortcuts remain
  useEffect(() => {
    const onKey = (e) => {
      if (["ArrowRight", " "]?.includes(e.key)) { e.preventDefault(); setRevealed((r) => Math.min(r + 1, flat.length)); }
      if (["ArrowLeft", "Backspace"]?.includes(e.key)) { e.preventDefault(); setRevealed((r) => Math.max(r - 1, 0)); }
      if (e.key.toLowerCase() === "r") setRevealed(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flat.length]);

  // touch gestures (swipe left/right, two-finger tap reset)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      if (e.touches.length === 1) touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
      if (e.touches.length === 2) {
        // two-finger quick tap to reset
        setRevealed(0);
      }
    };
    const onTouchEnd = (e) => {
      const start = touchStart.current; touchStart.current = null;
      if (!start) return;
      const dx = (e.changedTouches?.[0]?.clientX ?? start.x) - start.x;
      const dy = (e.changedTouches?.[0]?.clientY ?? start.y) - start.y;
      const dt = Date.now() - start.t;
      const isSwipe = Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy);
      const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 250;
      if (isSwipe) {
        if (dx < 0) setRevealed((r) => Math.min(r + 1, flat.length)); // swipe left → next
        else setRevealed((r) => Math.max(r - 1, 0)); // swipe right → prev
      } else if (isTap && TAP_ADVANCE) {
        setRevealed((r) => Math.min(r + 1, flat.length));
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [flat.length]);

  const next = () => setRevealed((r) => Math.min(r + 1, flat.length));
  const prev = () => setRevealed((r) => Math.max(r - 1, 0));
  const reset = () => setRevealed(0);
  const all = () => setRevealed(flat.length);
  const isShown = (idx) => idx < revealed;

  const renderTree = (nodes, depth = 0, parentIndex = []) => (
    <ol className={depth === 0 ? "space-y-3" : depth === 1 ? "ml-6 space-y-2" : "ml-10 space-y-1"}>
      {nodes.map((n, i) => {
        const idxInFlat = flat.findIndex((f) => f.node === n && f.depth === depth && f.index === i + 1 && JSON.stringify(f.path) === JSON.stringify([...parentIndex, i + 1]));
        const visible = isShown(idxInFlat + 1);
        return (
          <li key={i} className={visible ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}>
            <div className="flex items-start gap-2">
              <NumberLabel depth={depth} index={i + 1} />
              <div className="leading-relaxed max-w-prose">{n.text}</div>
            </div>
            {n.image && (
              <div className="ml-8 mt-2">
                <img src={n.image} alt={n.text} className="rounded-xl shadow max-w-full border border-zinc-700" />
              </div>
            )}
            {n.children && visible && renderTree(n.children, depth + 1, [...parentIndex, i + 1])}
          </li>
        );
      })}
    </ol>
  );

  return (
    <div ref={containerRef} className="relative bg-zinc-900 text-zinc-100 rounded-2xl p-4 sm:p-6 shadow-xl border border-zinc-800">
      {/* Header controls remain for desktop */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-lg font-semibold tracking-tight">Theory (Notes) — tap, swipe, or use buttons</div>
        <div className="hidden sm:flex gap-2">
          <button onClick={prev} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">◀︎ Prev</button>
          <button onClick={next} className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500">Reveal next</button>
          <button onClick={all} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Reveal all</button>
          <button onClick={reset} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Reset</button>
        </div>
      </div>

      {renderTree(outline)}

      <div className="mt-4 text-sm text-zinc-400">Progress: {Math.min(revealed, flat.length)} / {flat.length}</div>

      {/* Mobile floating toolbar */}
      <div className="sm:hidden fixed bottom-4 inset-x-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 rounded-2xl shadow-lg px-3 py-2 backdrop-blur">
          <button onClick={prev} className="h-12 w-12 rounded-xl bg-zinc-800 text-zinc-100 text-xl">◀︎</button>
          <button onClick={next} className="h-12 px-5 rounded-xl bg-indigo-600 text-white text-sm font-semibold">Next</button>
          <button onClick={reset} className="h-12 w-12 rounded-xl bg-zinc-800 text-zinc-100 text-sm">R</button>
        </div>
      </div>

      {/* Gesture hint for iPad users */}
      <div className="sm:hidden mt-3 text-xs text-zinc-400">Tip: Tap to advance • Swipe left = next • Swipe right = back • Two‑finger tap = reset</div>
    </div>
  );
}

// ================= Stepper (touch-friendly) =================
export function Stepper({ title, steps, calc }) {
  const [i, setI] = useState(0);
  const panelRef = useRef(null);
  const t = useRef(null);

  useEffect(() => {
    const el = panelRef.current; if (!el) return;
    const onTS = (e)=>{ if(e.touches.length===1) t.current={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}; };
    const onTE = (e)=>{ const s=t.current; t.current=null; if(!s) return; const dx=(e.changedTouches?.[0]?.clientX??s.x)-s.x; const dy=(e.changedTouches?.[0]?.clientY??s.y)-s.y; const isSwipe=Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy); if(isSwipe){ if(dx<0) setI((k)=>Math.min(steps.length, k+1)); else setI((k)=>Math.max(0, k-1)); } };
    el.addEventListener('touchstart', onTS, {passive:true});
    el.addEventListener('touchend', onTE, {passive:true});
    return ()=>{ el.removeEventListener('touchstart', onTS); el.removeEventListener('touchend', onTE); };
  }, [steps?.length]);

  return (
    <div ref={panelRef} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold pr-2 max-w-prose">{title}</div>
        <div className="hidden sm:flex gap-2">
          <button onClick={()=>setI((k)=>Math.max(0,k-1))} className="px-3 py-1.5 rounded-xl bg-zinc-800">◀︎</button>
          <button onClick={()=>setI((k)=>Math.min(steps.length,k+1))} className="px-3 py-1.5 rounded-xl bg-indigo-600">Reveal step</button>
          <button onClick={()=>setI(0)} className="px-3 py-1.5 rounded-xl bg-zinc-800">Reset</button>
        </div>
      </div>
      <ol className="ml-6 list-decimal space-y-2">
        {steps.map((t, idx) => (
          <li key={idx} className={idx < i ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}>{t}</li>
        ))}
      </ol>
      {i >= steps.length && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-900/40 border border-emerald-800">
          <div className="font-semibold">Answer</div>
          <div className="text-emerald-200">{calc()}</div>
        </div>
      )}
      {/* Mobile bar */}
      <div className="sm:hidden mt-3 flex gap-2">
        <button onClick={()=>setI((k)=>Math.max(0,k-1))} className="h-12 w-12 rounded-xl bg-zinc-800 text-zinc-100">◀︎</button>
        <button onClick={()=>setI((k)=>Math.min(steps.length,k+1))} className="flex-1 h-12 rounded-xl bg-indigo-600 text-white font-semibold">Next</button>
        <button onClick={()=>setI(0)} className="h-12 w-16 rounded-xl bg-zinc-800 text-zinc-100">Reset</button>
      </div>
      <div className="sm:hidden mt-2 text-xs text-zinc-400">Swipe left/right to step • Long‑press then drag if you need to scroll</div>
    </div>
  );
}

/*
USAGE:
- Import these two components into your App.jsx and pass the existing data you already have:

import { OutlineReveal, Stepper } from "./TouchRevealPatch"; // or paste inline

<OutlineReveal outline={outline} />

*/
