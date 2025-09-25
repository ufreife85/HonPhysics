// PositionVelocityExplorer.jsx
// Classroom-first interactive (HonPhysics Unit 2 — Position, Displacement, Speed, Velocity)
// Focus: simple animation driven by Vi, Vf, Δt, with reference-frame toggle and x(t), v(t) graphs.
// No external libs beyond React + Tailwind.

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PositionVelocityExplorer() {
  /* =============================
   * Controls
   * ============================= */
  const [xi, setXi] = useState(0); // initial position (m)
  const [vi, setVi] = useState(5); // initial velocity (m/s)
  const [vf, setVf] = useState(5); // final velocity (m/s)
  const [T, setT] = useState(10); // duration (s)
  const [frameV, setFrameV] = useState(0); // moving frame velocity (m/s)
  const [showMovingOverlay, setShowMovingOverlay] = useState(true);
  const [mode, setMode] = useState("accel"); // 'accel' (Vi→Vf over T). If 'const', force vf=vi

  // Playback
  const [playing, setPlaying] = useState(true);
  const speed = 1; // playback speed multiplier
  const [t, setTnow] = useState(0); // current sim time
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);

  // Keep parameters sane
  const safeT = Math.max(0.1, Number(T) || 0);
  const safeVi = Number.isFinite(vi) ? vi : 0;
  const safeVf = mode === "const" ? safeVi : (Number.isFinite(vf) ? vf : safeVi);
  const a = (safeVf - safeVi) / safeT; // constant acceleration to go from Vi to Vf over T

  /* =============================
   * Kinematics helpers
   * ============================= */
  const xOfT = (tt) => xi + safeVi * tt + 0.5 * a * tt * tt;
  const vOfT = (tt) => safeVi + a * tt;
  const xPrimeOfT = (tt) => xOfT(tt) - frameV * tt;
  const vPrimeOfT = (tt) => vOfT(tt) - frameV;

  // Distance (path length) via sampling so it works even if velocity changes sign
  const sampleN = 400;
  const samples = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= sampleN; i++) {
      const tt = (i / sampleN) * safeT;
      arr.push({
        t: tt,
        x: xOfT(tt),
        v: vOfT(tt),
        xp: xPrimeOfT(tt),
        vp: vPrimeOfT(tt),
      });
    }
    return arr;
  }, [xi, safeVi, safeVf, a, safeT, frameV]);

  const totalDistance = useMemo(() => {
    let d = 0;
    for (let i = 1; i < samples.length; i++) {
      d += Math.abs(samples[i].x - samples[i - 1].x);
    }
    return d;
  }, [samples]);

  const deltaX = useMemo(() => xOfT(safeT) - xOfT(0), [safeT, xOfT]);
  const avgSpeed = safeT > 0 ? totalDistance / safeT : 0;
  const avgVel = safeT > 0 ? deltaX / safeT : 0;

  const deltaXPrime = useMemo(() => xPrimeOfT(safeT) - xPrimeOfT(0), [safeT, xPrimeOfT]);
  const totalDistancePrime = useMemo(() => {
    let d = 0;
    for (let i = 1; i < samples.length; i++) {
      d += Math.abs(samples[i].xp - samples[i - 1].xp);
    }
    return d;
  }, [samples]);
  const avgSpeedPrime = safeT > 0 ? totalDistancePrime / safeT : 0;
  const avgVelPrime = safeT > 0 ? deltaXPrime / safeT : 0;

  /* =============================
   * Animation loop
   * ============================= */
  useEffect(() => {
    const step = (ts) => {
      if (!playing) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000); // clamp step for stability
      lastTsRef.current = ts;
      setTnow((old) => {
        const next = old + dt;
        return next >= safeT ? safeT : next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, safeT]);

  const reset = () => setTnow(0);

  /* =============================
   * Graphing helpers (SVG)
   * ============================= */
  const pad = 0.08; // 8% padding on axes ranges

  // x(t) bounds
  const minX = useMemo(() => Math.min(...samples.map((s) => s.x)), [samples]);
  const maxX = useMemo(() => Math.max(...samples.map((s) => s.x)), [samples]);
  const xRange = maxX - minX || 1;
  const xLo = minX - pad * xRange;
  const xHi = maxX + pad * xRange;

  // v(t) bounds
  const minV = useMemo(() => Math.min(...samples.map((s) => s.v)), [samples]);
  const maxV = useMemo(() => Math.max(...samples.map((s) => s.v)), [samples]);
  const vRange = maxV - minV || 1;
  const vLo = minV - pad * vRange;
  const vHi = maxV + pad * vRange;

  // Prime bounds (overlay may exceed base). Merge ranges if overlay on.
  const minXp = useMemo(() => Math.min(...samples.map((s) => s.xp)), [samples]);
  const maxXp = useMemo(() => Math.max(...samples.map((s) => s.xp)), [samples]);
  const minVp = useMemo(() => Math.min(...samples.map((s) => s.vp)), [samples]);
  const maxVp = useMemo(() => Math.max(...samples.map((s) => s.vp)), [samples]);

  const xLoAll = showMovingOverlay ? Math.min(xLo, minXp) : xLo;
  const xHiAll = showMovingOverlay ? Math.max(xHi, maxXp) : xHi;
  const vLoAll = showMovingOverlay ? Math.min(vLo, minVp) : vLo;
  const vHiAll = showMovingOverlay ? Math.max(vHi, maxVp) : vHi;

  const W = 520, H = 240, L = 42, R = 12, Tpad = 10, B = 32; // chart box
  const tx = (tt) => L + ((tt / safeT) * (W - L - R));
  const tyX = (xx) => Tpad + (1 - (xx - xLoAll) / (xHiAll - xLoAll)) * (H - Tpad - B);
  const tyV = (vv) => Tpad + (1 - (vv - vLoAll) / (vHiAll - vLoAll)) * (H - Tpad - B);

  const pathFrom = (arr, yMap) => arr.map((p, i) => `${i ? "L" : "M"}${tx(p.t)},${yMap(p.val)}`).join(" ");

  const xPath = useMemo(() => pathFrom(samples.map((s) => ({ t: s.t, val: s.x })), tyX), [samples, xLoAll, xHiAll]);
  const vPath = useMemo(() => pathFrom(samples.map((s) => ({ t: s.t, val: s.v })), tyV), [samples, vLoAll, vHiAll]);
  const xpPath = useMemo(() => pathFrom(samples.map((s) => ({ t: s.t, val: s.xp })), tyX), [samples, xLoAll, xHiAll]);
  const vpPath = useMemo(() => pathFrom(samples.map((s) => ({ t: s.t, val: s.vp })), tyV), [samples, vLoAll, vHiAll]);

  const tickCount = 5;
  const tTicks = Array.from({ length: tickCount + 1 }, (_, i) => (i * safeT) / tickCount);
  const yTicksX = Array.from({ length: tickCount + 1 }, (_, i) => xLoAll + (i * (xHiAll - xLoAll)) / tickCount);
  const yTicksV = Array.from({ length: tickCount + 1 }, (_, i) => vLoAll + (i * (vHiAll - vLoAll)) / tickCount);

  const fmtN = (v, d = 2) => Number.isFinite(v) ? v.toFixed(d) : "—";

  /* =============================
   * Presets
   * ============================= */
  const applyPreset = (key) => {
    if (key === "cruise") {
      setXi(0); setVi(6); setVf(6); setT(10); setMode("const"); setFrameV(0); setTnow(0);
    } else if (key === "speedUp") {
      setXi(0); setVi(2); setVf(12); setT(8); setMode("accel"); setFrameV(0); setTnow(0);
    } else if (key === "brakeToStop") {
      setXi(0); setVi(10); setVf(0); setT(6); setMode("accel"); setFrameV(0); setTnow(0);
    } else if (key === "reverse") {
      setXi(0); setVi(8); setVf(-4); setT(6); setMode("accel"); setFrameV(0); setTnow(0);
    }
  };

  /* =============================
   * Layout
   * ============================= */
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 p-6 md:p-8">
        {/* Header & Presets */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-indigo-400">PositionVelocityExplorer</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("cruise")}>Preset: Cruise</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("speedUp")}>Preset: Speed Up</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("brakeToStop")}>Preset: Brake to Stop</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("reverse")}>Preset: Reverse Direction</button>
          </div>
        </div>

        {/* Controls & Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Controls */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-emerald-400 mb-3">Controls</h3>
            <div className="flex flex-wrap gap-3 mb-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="mode" className="accent-emerald-500" checked={mode === "const"} onChange={() => setMode("const")} />
                Constant velocity
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="mode" className="accent-emerald-500" checked={mode === "accel"} onChange={() => setMode("accel")} />
                Accelerate from Vi → Vf
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">x₀ (m)</label>
                <input type="number" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={xi} onChange={(e) => setXi(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Δt (s)</label>
                <input type="number" step="0.1" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={T} onChange={(e) => setT(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Vᵢ (m/s)</label>
                <input type="number" step="0.1" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={vi} onChange={(e) => setVi(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">V_f (m/s)</label>
                <input type="number" step="0.1" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={safeVf} onChange={(e) => setVf(Number(e.target.value))} disabled={mode === "const"} />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-zinc-400 mb-1">Frame velocity (m/s)</label>
              <div className="flex items-center gap-3">
                <input type="range" min={-30} max={30} step={1} className="w-full" value={frameV} onChange={(e) => setFrameV(Number(e.target.value))} />
                <div className="w-16 text-right text-sm text-zinc-300">{frameV}</div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm mt-2">
                <input type="checkbox" className="accent-emerald-500" checked={showMovingOverlay} onChange={(e) => setShowMovingOverlay(e.target.checked)} />
                Show moving-frame overlays
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
              <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={reset}>Reset</button>
              {/* {Removed playback speed control} */}
            </div>
          </div>

          {/* Animation pane */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 col-span-2">
            <h3 className="font-semibold text-lg text-amber-400 mb-3">Animation</h3>
            <div className="relative w-full h-24 mb-3">
              {/* track */}
              <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-700 rounded-full" />
              {/* map x(t) to pixel: use x-range from charts for consistency */}
              {(() => {
                const x = xOfT(Math.min(t, safeT));
                const xMin = xLoAll, xMax = xHiAll;
                const pct = ((x - xMin) / (xMax - xMin)) * 100;
                return (
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-amber-400 bg-amber-300/30 shadow-lg" style={{ left: `${pct}%`, top: "50%" }} />
                );
              })()}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between border-b border-zinc-800 pb-1"><span>t</span><span className="font-mono">{fmtN(Math.min(t, safeT), 2)} s</span></div>
              <div className="flex justify-between border-b border-zinc-800 pb-1"><span>x(t)</span><span className="font-mono">{fmtN(xOfT(Math.min(t, safeT)), 2)} m</span></div>
              <div className="flex justify-between"><span>v(t)</span><span className="font-mono">{fmtN(vOfT(Math.min(t, safeT)), 2)} m/s</span></div>
              <div className="flex justify-between"><span>a</span><span className="font-mono">{fmtN(a, 2)} m/s²</span></div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* x vs t */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-sky-400 mb-2">Position vs Time</h3>
            <ChartSVG
              width={W}
              height={H}
              xTicks={tTicks}
              yTicks={yTicksX}
              tx={tx}
              ty={tyX}
              xLabel="t (s)"
              yLabel="x (m)"
            >
              {/* ground frame */}
              <path d={xPath} fill="none" stroke="#38bdf8" strokeWidth={2} />
              {/* moving frame overlay */}
              {showMovingOverlay && (
                <path d={xpPath} fill="none" stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={2} />
              )}
              {/* time cursor */}
              <TimeCursor t={t} tx={tx} H={H} L={L} R={R} />
              <Legend items={[{ label: "Ground", color: "#38bdf8" }, showMovingOverlay ? { label: "Moving frame", color: "#f59e0b", dashed: true } : null].filter(Boolean)} />
            </ChartSVG>
          </div>

          {/* v vs t */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-purple-400 mb-2">Velocity vs Time</h3>
            <ChartSVG
              width={W}
              height={H}
              xTicks={tTicks}
              yTicks={yTicksV}
              tx={tx}
              ty={tyV}
              xLabel="t (s)"
              yLabel="v (m/s)"
            >
              <path d={vPath} fill="none" stroke="#c084fc" strokeWidth={2} />
              {showMovingOverlay && (
                <path d={vpPath} fill="none" stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={2} />
              )}
              <TimeCursor t={t} tx={tx} H={H} L={L} R={R} />
              <Legend items={[{ label: "Ground", color: "#c084fc" }, showMovingOverlay ? { label: "Moving frame", color: "#f59e0b", dashed: true } : null].filter(Boolean)} />
            </ChartSVG>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-amber-400 mb-3">Averages — Ground Frame</h3>
            <div className="space-y-2 text-sm md:text-base">
              <Row label="Δx" value={`${fmtN(deltaX, 3)} m`} />
              <Row label="Distance (path)" value={`${fmtN(totalDistance, 3)} m`} />
              <Row label="Average speed" value={`${fmtN(avgSpeed, 3)} m/s`} />
              <Row label="Average velocity" value={`${fmtN(avgVel, 3)} m/s`} />
            </div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-sky-400 mb-3">Averages — Moving Frame</h3>
            <div className="space-y-2 text-sm md:text-base">
              <Row label="Δx′" value={`${fmtN(deltaXPrime, 3)} m`} />
              <Row label="Distance′ (path)" value={`${fmtN(totalDistancePrime, 3)} m`} />
              <Row label="Average speed′" value={`${fmtN(avgSpeedPrime, 3)} m/s`} />
              <Row label="Average velocity′" value={`${fmtN(avgVelPrime, 3)} m/s`} />
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-6 text-xs text-zinc-500 text-center">
          <p>Mode “Constant velocity” keeps Vᵢ = V_f. Mode “Accelerate” uses constant acceleration so Vᵢ → V_f over Δt.</p>
        </div>
      </div>
    </div>
  );
}

/* =============================
 * Small helpers/components
 * ============================= */
function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-zinc-800 pb-1">
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function ChartSVG({ width, height, xTicks, yTicks, tx, ty, xLabel, yLabel, children }) {
  const L = 42, R = 12, T = 10, B = 32;
  return (
    <svg width={"100%"} viewBox={`0 0 ${width} ${height}`} className="bg-zinc-950 rounded-lg border border-zinc-800">
      {/* Axes */}
      <line x1={L} y1={height - B} x2={width - R} y2={height - B} stroke="#71717a" strokeWidth={1} />
      <line x1={L} y1={T} x2={L} y2={height - B} stroke="#71717a" strokeWidth={1} />

      {/* Ticks X */}
      {xTicks.map((tt, i) => (
        <g key={`tx-${i}`}>
          <line x1={tx(tt)} y1={height - B} x2={tx(tt)} y2={height - B + 6} stroke="#71717a" />
          <text x={tx(tt)} y={height - 8} fill="#a1a1aa" fontSize={10} textAnchor="middle">{tt.toFixed(0)}</text>
        </g>
      ))}

      {/* Ticks Y */}
      {yTicks.map((yy, i) => (
        <g key={`ty-${i}`}>
          <line x1={L - 6} y1={ty(yy)} x2={L} y2={ty(yy)} stroke="#71717a" />
          <text x={L - 8} y={ty(yy) + 3} fill="#a1a1aa" fontSize={10} textAnchor="end">{yy.toFixed(0)}</text>
        </g>
      ))}

      {/* Labels */}
      <text x={(width - L - R) / 2 + L} y={height - 4} fill="#cbd5e1" fontSize={11} textAnchor="middle">{xLabel}</text>
      <text x={12} y={T + 10} fill="#cbd5e1" fontSize={11} textAnchor="start">{yLabel}</text>

      {children}
    </svg>
  );
}

function TimeCursor({ t, tx, H, L, R }) {
  const x = tx(t);
  return (
    <g>
      <line x1={x} y1={10} x2={x} y2={H - 32} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 4" />
    </g>
  );
}

function Legend({ items }) {
  // items: [{label, color, dashed?}]
  return (
    <g>
      {items.map((it, idx) => (
        <g key={idx} transform={`translate(${60 + idx * 150}, 18)`}>
          <line x1={0} y1={0} x2={24} y2={0} stroke={it.color} strokeWidth={3} strokeDasharray={it.dashed ? "6 4" : ""} />
          <text x={30} y={4} fill="#e4e4e7" fontSize={11}>{it.label}</text>
        </g>
      ))}
    </g>
  );
}

function fmtN(v, d = 2) {
  return Number.isFinite(v) ? v.toFixed(d) : "—";
}
