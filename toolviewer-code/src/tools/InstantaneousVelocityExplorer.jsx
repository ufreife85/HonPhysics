// InstantaneousVelocityExplorer.jsx
// HonPhysics Unit 2.3 — Instantaneous Velocity
// Focused interactive: x–t graph with draggable SECANT (avg velocity) and TANGENT estimate (instantaneous velocity)
// Modes: Constant velocity (a = 0) or Constant acceleration. No playback/frame-speed to keep it simple.
// Dependencies: React + Tailwind only.

import React, { useMemo, useState } from "react";

export default function InstantaneousVelocityExplorer() {
  /* ------------------------- Controls ------------------------- */
  const [mode, setMode] = useState("accel"); // 'const' | 'accel'
  const [x0, setX0] = useState(0);
  const [vi, setVi] = useState(5);
  const [a, setA] = useState(2); // used only in accel mode
  const [T, setT] = useState(10);

  // Secant (average velocity) times
  const [t1, setT1] = useState(1);
  const [t2, setT2] = useState(3);

  // Tangent (instantaneous velocity) time & small half-window h
  const [t0, setT0] = useState(4);
  const [h, setH] = useState(0.5); // 0.05 .. T/4
  const [showExact, setShowExact] = useState(false);

  const aEff = mode === "const" ? 0 : a;

  /* ------------------------- Kinematics ------------------------- */
  const xOfT = (t) => x0 + vi * t + 0.5 * aEff * t * t;
  const vOfT = (t) => vi + aEff * t;

  // Guard values
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const safeT = Math.max(0.5, Number(T) || 0);
  const mint = 0, maxt = safeT;
  const safeT1 = clamp(Math.min(t1, t2 - 0.0001), mint, maxt);
  const safeT2 = clamp(Math.max(t2, t1 + 0.0001), mint, maxt);
  const safeT0 = clamp(t0, mint, maxt);
  const safeH = clamp(h, 0.05, Math.max(0.1, safeT / 4));

  // Secant slope (average velocity)
  const x1 = xOfT(safeT1);
  const x2 = xOfT(safeT2);
  const vAvg = (x2 - x1) / (safeT2 - safeT1);

  // Tangent slope estimate via symmetric difference
  const tL = clamp(safeT0 - safeH, mint, maxt);
  const tR = clamp(safeT0 + safeH, mint, maxt);
  const xL = xOfT(tL);
  const xR = xOfT(tR);
  const vInstApprox = (xR - xL) / (tR - tL);
  const vInstExact = vOfT(safeT0);

  // Total displacement and average speed/velocity over [0, T]
  const deltaX = xOfT(safeT) - xOfT(0);
  // Distance (path) for these simple models is |deltaX| because x(t) is monotonic if vi and aEff keep sign; keep formula simple for Unit 2.3
  const distancePath = Math.abs(deltaX);
  const vBarWhole = deltaX / safeT;
  const speedAvgWhole = Math.abs(deltaX) / safeT;

  /* ------------------------- Sampling for chart ------------------------- */
  const N = 240;
  const samples = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * safeT;
      arr.push({ t, x: xOfT(t) });
    }
    return arr;
  }, [x0, vi, aEff, safeT]);

  /* ------------------------- Chart scales ------------------------- */
  const W = 680, H = 320, Lpad = 46, Rpad = 18, Tpad = 14, Bpad = 36;
  const minX = Math.min(...samples.map(s => s.x), xOfT(safeT0));
  const maxX = Math.max(...samples.map(s => s.x), xOfT(safeT0));
  const rX = maxX - minX || 1;
  const xLo = minX - 0.08 * rX, xHi = maxX + 0.08 * rX;
  const tx = (t) => Lpad + (t / safeT) * (W - Lpad - Rpad);
  const ty = (x) => Tpad + (1 - (x - xLo) / (xHi - xLo)) * (H - Tpad - Bpad);
  const fmt = (v, d=2) => Number.isFinite(v) ? v.toFixed(d) : "—";

  // Build SVG path string
  const xPath = useMemo(() => {
    return samples.map((p, i) => `${i ? "L" : "M"}${tx(p.t)},${ty(p.x)}`).join(" ");
  }, [samples, xLo, xHi, safeT]);

  // Secant line endpoints
  const secX1 = tx(safeT1), secY1 = ty(x1);
  const secX2 = tx(safeT2), secY2 = ty(x2);

  // Tangent line across full chart
  const mTan = vInstApprox; // slope in x per 1 s
  const bTan = xOfT(safeT0) - mTan * safeT0; // x = m t + b
  const tanYat = (t) => ty(mTan * t + bTan);
  const tanX1 = tx(0), tanY1 = tanYat(0);
  const tanX2 = tx(safeT), tanY2 = tanYat(safeT);

  /* ------------------------- UI ------------------------- */
  const applyPreset = (key) => {
    if (key === "const15") {
      setMode("const"); setX0(0); setVi(15); setA(0); setT(5); setT1(1); setT2(3); setT0(2.5); setH(0.5);
    } else if (key === "speedUp") {
      setMode("accel"); setX0(0); setVi(0); setA(4); setT(6); setT1(1.0); setT2(3.0); setT0(4.0); setH(0.4);
    } else if (key === "brake") {
      setMode("accel"); setX0(0); setVi(12); setA(-2.5); setT(8); setT1(2.0); setT2(5.0); setT0(6.0); setH(0.5);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 p-6 md:p-8">
        {/* Header + Presets */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-indigo-400">InstantaneousVelocityExplorer</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("const15")}>
              Preset: Constant 15 m/s (0–5 s)
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("speedUp")}>
              Preset: Speed Up (a &gt; 0)
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("brake")}>
              Preset: Slow Down (a &lt; 0)
            </button>
          </div>
        </div>

        {/* Controls & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls card */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-emerald-400 mb-3">Controls</h3>

            <div className="flex flex-wrap gap-3 mb-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="mode" className="accent-emerald-500" checked={mode === "const"} onChange={() => setMode("const")} />
                Constant velocity (a = 0)
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="mode" className="accent-emerald-500" checked={mode === "accel"} onChange={() => setMode("accel")} />
                Constant acceleration
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">x₀ (m)</label>
                <input type="number" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={x0} onChange={(e) => setX0(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Δt total (s)</label>
                <input type="number" step="0.5" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={T} onChange={(e) => setT(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Vᵢ (m/s)</label>
                <input type="number" step="0.5" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={vi} onChange={(e) => setVi(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">a (m/s²)</label>
                <input type="number" step="0.5" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={a} onChange={(e) => setA(Number(e.target.value))} disabled={mode === "const"} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Secant t₁ (s)</label>
                <input type="range" min={0} max={safeT - 0.1} step={0.1} className="w-full" value={safeT1} onChange={(e) => setT1(Number(e.target.value))} />
                <div className="text-right text-sm text-zinc-300">{fmt(safeT1,1)} s</div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Secant t₂ (s)</label>
                <input type="range" min={0.1} max={safeT} step={0.1} className="w-full" value={safeT2} onChange={(e) => setT2(Number(e.target.value))} />
                <div className="text-right text-sm text-zinc-300">{fmt(safeT2,1)} s</div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tangent at t₀ (s)</label>
                <input type="range" min={0} max={safeT} step={0.1} className="w-full" value={safeT0} onChange={(e) => setT0(Number(e.target.value))} />
                <div className="text-right text-sm text-zinc-300">{fmt(safeT0,1)} s</div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tangent window h (s)</label>
                <input type="range" min={0.05} max={Math.max(0.1, safeT/4)} step={0.05} className="w-full" value={safeH} onChange={(e) => setH(Number(e.target.value))} />
                <div className="text-right text-sm text-zinc-300">h = {fmt(safeH,2)} s</div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <input id="showExact" type="checkbox" className="accent-emerald-500" checked={showExact} onChange={(e) => setShowExact(e.target.checked)} />
              <label htmlFor="showExact">Show exact v(t₀) (teacher check)</label>
            </div>
          </div>

          {/* Chart card */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 lg:col-span-2">
            <h3 className="font-semibold text-lg text-amber-400 mb-2">Position vs Time (x–t)</h3>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950 rounded-lg border border-zinc-800">
              {/* Axes */}
              <line x1={Lpad} y1={H - Bpad} x2={W - Rpad} y2={H - Bpad} stroke="#71717a" strokeWidth={1} />
              <line x1={Lpad} y1={Tpad} x2={Lpad} y2={H - Bpad} stroke="#71717a" strokeWidth={1} />
              {/* x(t) path */}
              <path d={xPath} fill="none" stroke="#38bdf8" strokeWidth={2.25} />

              {/* Secant line */}
              <line x1={secX1} y1={secY1} x2={secX2} y2={secY2} stroke="#34d399" strokeWidth={2} />
              {/* Secant points */}
              <circle cx={secX1} cy={secY1} r={4} fill="#34d399" />
              <circle cx={secX2} cy={secY2} r={4} fill="#34d399" />

              {/* Tangent line estimate (full width) */}
              <line x1={tanX1} y1={tanY1} x2={tanX2} y2={tanY2} stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" />
              {/* Tangent center point */}
              <circle cx={tx(safeT0)} cy={ty(xOfT(safeT0))} r={4} fill="#f59e0b" />

              {/* Cursor labels */}
              <text x={W - Rpad - 6} y={Tpad + 12} fontSize={11} fill="#a1a1aa" textAnchor="end">t (s)</text>
              <text x={12} y={Tpad + 12} fontSize={11} fill="#a1a1aa" textAnchor="start">x (m)</text>
            </svg>

            {/* Readouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm md:text-base">
              <div className="rounded-lg border border-zinc-800 p-3">
                <div className="font-semibold text-emerald-400 mb-1">Secant — Average Velocity</div>
                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Δx = x(t₂) − x(t₁)</span><span className="font-mono">{fmt(x2 - x1, 2)} m</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Δt = t₂ − t₁</span><span className="font-mono">{fmt(safeT2 - safeT1, 2)} s</span></div>
                <div className="flex justify-between"><span>v̄ = Δx / Δt</span><span className="font-mono">{fmt(vAvg, 3)} m/s</span></div>
              </div>
              <div className="rounded-lg border border-zinc-800 p-3">
                <div className="font-semibold text-amber-400 mb-1">Tangent — Instantaneous Velocity (estimate)</div>
                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Use symmetric window ±h</span><span className="font-mono">h = {fmt(safeH,2)} s</span></div>
                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Δx = x(t₀+h) − x(t₀−h)</span><span className="font-mono">{fmt(xR - xL, 2)} m</span></div>
                <div className="flex justify-between"><span>v(t₀) ≈ Δx / (2h)</span><span className="font-mono">{fmt(vInstApprox, 3)} m/s</span></div>
                {showExact && (
                  <div className="mt-2 flex justify-between text-sky-300"><span>Exact v(t₀)</span><span className="font-mono">{fmt(vInstExact, 3)} m/s</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Whole-interval metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm md:text-base">
          <div className="rounded-lg border border-zinc-800 p-3">
            <div className="font-semibold text-zinc-200 mb-1">Over 0 → Δt total</div>
            <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Δt total</span><span className="font-mono">{fmt(safeT,2)} s</span></div>
            <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Δx total</span><span className="font-mono">{fmt(deltaX,2)} m</span></div>
            <div className="flex justify-between"><span>Average velocity (Δx/Δt)</span><span className="font-mono">{fmt(vBarWhole,3)} m/s</span></div>
          </div>
          <div className="rounded-lg border border-zinc-800 p-3">
            <div className="font-semibold text-zinc-200 mb-1">Distance & Speed</div>
            <div className="flex justify-between border-b border-zinc-800 pb-1"><span>Distance (path)</span><span className="font-mono">{fmt(distancePath,2)} m</span></div>
            <div className="flex justify-between"><span>Average speed (distance/Δt)</span><span className="font-mono">{fmt(speedAvgWhole,3)} m/s</span></div>
          </div>
          <div className="rounded-lg border border-zinc-800 p-3">
            <div className="font-semibold text-zinc-200 mb-1">Quick reminders</div>
            <ul className="list-disc list-inside text-zinc-300 space-y-1">
              <li>On x–t, slope = velocity.</li>
              <li>Secant → average over an interval.</li>
              <li>Tangent → instantaneous at a point.</li>
              <li>Units check: m/s (not m or s).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
