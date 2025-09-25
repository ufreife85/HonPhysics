// MotionGraphLab.jsx
// HonPhysics Unit 2.4 — Triplet Graph Lab (x–t, v–t, a–t)
// Purpose: Let students BUILD acceleration (a–t) as simple piecewise-constant segments and SEE how
// that generates v–t (by area/accumulation) and x–t (by double accumulation). Includes live cursor,
// shaded areas (Δv, Δx), and secant/tangent readouts for average/instantaneous values.
// Tech: React + Tailwind only.

import React, { useMemo, useState } from "react";

export default function MotionGraphLab() {
  /* -------------------- Parameters & State -------------------- */
  const [T, setT] = useState(10); // total time (s)
  const [xi, setXi] = useState(0); // initial position (m)
  const [vi, setVi] = useState(0); // initial velocity (m/s)

  // Three acceleration segments (piecewise constant)
  // Represent durations via percentages p1, p2, with p3 = 1 - p1 - p2
  const [p1, setP1] = useState(0.4);
  const [p2, setP2] = useState(0.3);
  const p3 = Math.max(0.05, 1 - p1 - p2);

  const [a1, setA1] = useState(2);   // m/s^2
  const [a2, setA2] = useState(0);   // m/s^2
  const [a3, setA3] = useState(-1);  // m/s^2

  // Cursor time for readouts/areas
  const [tc, setTc] = useState(4);

  // Tweak: ensure valid percentages
  const clamp01 = (v) => Math.min(0.9, Math.max(0.05, v));
  const handleP1 = (v) => {
    const np1 = clamp01(v);
    setP1(Math.min(np1, 0.95));
    // Keep p2 within remaining room
    setP2((old) => Math.min(clamp01(old), Math.max(0.05, 1 - np1 - 0.05)));
  };
  const handleP2 = (v) => {
    const maxP2 = Math.max(0.05, 1 - p1 - 0.05);
    setP2(Math.min(clamp01(v), maxP2));
  };

  /* -------------------- Derived time breakpoints -------------------- */
  const d1 = p1 * T;
  const d2 = p2 * T;
  const d3 = Math.max(0, T - d1 - d2);
  const tBreaks = [0, d1, d1 + d2, T];

  /* -------------------- Sampling & Integration -------------------- */
  const N = 360;
  const samples = useMemo(() => {
    const arr = [];
    let v = vi;
    let x = xi;
    let tPrev = 0;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * T;
      // piecewise-constant acceleration
      let a;
      if (t < tBreaks[1]) a = a1; else if (t < tBreaks[2]) a = a2; else a = a3;
      if (i > 0) {
        const dt = t - tPrev;
        const vNext = v + a * dt;
        // trapezoid for x
        x = x + 0.5 * (v + vNext) * dt;
        v = vNext;
      }
      tPrev = t;
      arr.push({ t, a, v, x });
    }
    return arr;
  }, [T, xi, vi, a1, a2, a3, tBreaks[1], tBreaks[2]]);

  const idxAtTc = Math.max(0, Math.min(N, Math.round((tc / T) * N)));
  const x_tc = samples[idxAtTc]?.x ?? xi;
  const v_tc = samples[idxAtTc]?.v ?? vi;
  const a_tc = samples[idxAtTc]?.a ?? a1;

  // Areas (by definition): Δv = ∫ a dt from 0→tc; Δx = ∫ v dt from 0→tc
  const deltaV = v_tc - vi;
  const deltaX = x_tc - xi;
  const avgAcc_0_tc = tc > 0 ? deltaV / tc : 0;
  const avgVel_0_tc = tc > 0 ? deltaX / tc : 0;

  /* -------------------- Chart scaffolding -------------------- */
  const W = 720, H = 220, L = 46, R = 16, Tpad = 14, B = 32;
  const tx = (t) => L + (t / T) * (W - L - R);

  // Get ranges for y axes from sampled data
  const minX = Math.min(...samples.map(s => s.x));
  const maxX = Math.max(...samples.map(s => s.x));
  const padX = (maxX - minX) * 0.08 + 1;
  const yX = (x) => Tpad + (1 - (x - (minX - padX)) / ((maxX + padX) - (minX - padX))) * (H - Tpad - B);

  const minV = Math.min(...samples.map(s => s.v));
  const maxV = Math.max(...samples.map(s => s.v));
  const padV = (maxV - minV) * 0.08 + 1;
  const yV = (v) => Tpad + (1 - (v - (minV - padV)) / ((maxV + padV) - (minV - padV))) * (H - Tpad - B);

  const minA = Math.min(a1, a2, a3, 0);
  const maxA = Math.max(a1, a2, a3, 0);
  const padA = (maxA - minA) * 0.2 + 0.5;
  const yA = (a) => Tpad + (1 - (a - (minA - padA)) / ((maxA + padA) - (minA - padA))) * (H - Tpad - B);

  const pathFrom = (arr, yMap, key) => arr.map((p, i) => `${i ? "L" : "M"}${tx(p.t)},${yMap(p[key])}`).join(" ");
  const xPath = useMemo(() => pathFrom(samples, yX, "x"), [samples, minX, maxX]);
  const vPath = useMemo(() => pathFrom(samples, yV, "v"), [samples, minV, maxV]);

  // a(t) as step path
  const aPath = useMemo(() => {
    const pts = [];
    const y0 = yA(a1);
    pts.push(`M${tx(0)},${y0}`);
    pts.push(`L${tx(tBreaks[1])},${yA(a1)}`);
    pts.push(`L${tx(tBreaks[1])},${yA(a2)}`);
    pts.push(`L${tx(tBreaks[2])},${yA(a2)}`);
    pts.push(`L${tx(tBreaks[2])},${yA(a3)}`);
    pts.push(`L${tx(T)},${yA(a3)}`);
    return pts.join(" ");
  }, [tBreaks, a1, a2, a3, minA, maxA]);

  // Area polygons under a–t (0→tc) and v–t (0→tc)
  const aAreaPath = useMemo(() => {
    const pts = [{ t: 0, y: yA(0) }];
    for (let i = 0; i <= idxAtTc; i++) pts.push({ t: samples[i].t, y: yA(samples[i].a) });
    pts.push({ t: tc, y: yA(0) });
    return pts.map((p, i) => `${i ? "L" : "M"}${tx(p.t)},${p.y}`).join(" ") + " Z";
  }, [samples, idxAtTc, tc, minA, maxA]);

  const vAreaPath = useMemo(() => {
    const pts = [{ t: 0, y: yV(0) }];
    for (let i = 0; i <= idxAtTc; i++) pts.push({ t: samples[i].t, y: yV(samples[i].v) });
    pts.push({ t: tc, y: yV(0) });
    return pts.map((p, i) => `${i ? "L" : "M"}${tx(p.t)},${p.y}`).join(" ") + " Z";
  }, [samples, idxAtTc, tc, minV, maxV]);

  const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : "—");

  /* -------------------- Presets -------------------- */
  const applyPreset = (key) => {
    if (key === "cruise") {
      setT(10); setXi(0); setVi(6); setP1(0.34); setP2(0.33); setA1(0); setA2(0); setA3(0); setTc(6);
    } else if (key === "speedUp") {
      setT(10); setXi(0); setVi(0); setP1(0.4); setP2(0.3); setA1(2.5); setA2(1.5); setA3(0); setTc(6);
    } else if (key === "brake") {
      setT(10); setXi(0); setVi(12); setP1(0.3); setP2(0.4); setA1(0); setA2(-2.0); setA3(-1.0); setTc(5);
    } else if (key === "reverse") {
      setT(10); setXi(0); setVi(4); setP1(0.35); setP2(0.35); setA1(1.5); setA2(-3.0); setA3(0.5); setTc(5);
    }
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center p-4">
      <div className="w-full max-w-6xl bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 p-6 md:p-8">
        {/* Header & Presets */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-indigo-400">MotionGraphLab — x–t, v–t, a–t</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("cruise")}>Preset: Cruise (a = 0)</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("speedUp")}>Preset: Speed Up (a &gt; 0)</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("brake")}>Preset: Brake (a &lt; 0)</button>
            <button className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800" onClick={() => applyPreset("reverse")}>Preset: Reverse/Change</button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-semibold text-lg text-emerald-400 mb-3">Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Total time Δt (s)</label>
                <input type="number" step="0.5" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={T} onChange={(e) => setT(Math.max(1, Number(e.target.value)))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Cursor tᶜ (s)</label>
                <input type="range" min={0} max={T} step={0.1} className="w-full" value={tc} onChange={(e) => setTc(Number(e.target.value))} />
                <div className="text-right text-sm text-zinc-300">{fmt(tc,1)} s</div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">x₀ (m)</label>
                <input type="number" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={xi} onChange={(e) => setXi(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">v₀ (m/s)</label>
                <input type="number" step="0.5" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={vi} onChange={(e) => setVi(Number(e.target.value))} />
              </div>
            </div>

            <div className="mt-4">
              <div className="font-semibold text-sm text-zinc-200 mb-2">Acceleration segments (a–t)</div>
              <div className="grid grid-cols-1 gap-3">
                <SegmentRow label="Seg 1" a={a1} setA={setA1} p={p1} setP={handleP1} color="#22c55e" />
                <SegmentRow label="Seg 2" a={a2} setA={setA2} p={p2} setP={handleP2} color="#60a5fa" />
                <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                  <span>Seg 3 duration auto (1 − p₁ − p₂)</span>
                  <span>p₃ = {fmt((p3*100),1)}%</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Seg 3 acceleration a₃ (m/s²)</label>
                  <input type="number" step="0.5" className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={a3} onChange={(e) => setA3(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          {/* Graphs */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 lg:col-span-2">
            {/* x–t */}
            <h3 className="font-semibold text-lg text-sky-400 mb-2">Position vs Time (x–t)</h3>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950 rounded-lg border border-zinc-800 mb-4">
              <Axes W={W} H={H} L={L} R={R} Tpad={Tpad} B={B} xLabel="t (s)" yLabel="x (m)" />
              <path d={xPath} fill="none" stroke="#38bdf8" strokeWidth={2} />
              {/* time cursor */}
              <TimeCursor x={tx(tc)} H={H} />
            </svg>

            {/* v–t */}
            <h3 className="font-semibold text-lg text-violet-400 mb-2">Velocity vs Time (v–t)</h3>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950 rounded-lg border border-zinc-800 mb-4">
              <Axes W={W} H={H} L={L} R={R} Tpad={Tpad} B={B} xLabel="t (s)" yLabel="v (m/s)" />
              {/* area under v–t from 0 to tᶜ → Δx */}
              <path d={vAreaPath} fill="#a78bfa33" stroke="none" />
              <path d={vPath} fill="none" stroke="#c084fc" strokeWidth={2} />
              <TimeCursor x={tx(tc)} H={H} />
            </svg>

            {/* a–t */}
            <h3 className="font-semibold text-lg text-amber-400 mb-2">Acceleration vs Time (a–t)</h3>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-zinc-950 rounded-lg border border-zinc-800">
              <Axes W={W} H={H} L={L} R={R} Tpad={Tpad} B={B} xLabel="t (s)" yLabel="a (m/s²)" />
              {/* area under a–t from 0 to tᶜ → Δv */}
              <path d={aAreaPath} fill="#f59e0b33" stroke="none" />
              <path d={aPath} fill="none" stroke="#f59e0b" strokeWidth={2} />
              {/* vertical break lines */}
              <line x1={tx(tBreaks[1])} y1={Tpad} x2={tx(tBreaks[1])} y2={H - B} stroke="#52525b" strokeDasharray="4 4" />
              <line x1={tx(tBreaks[2])} y1={Tpad} x2={tx(tBreaks[2])} y2={H - B} stroke="#52525b" strokeDasharray="4 4" />
              <TimeCursor x={tx(tc)} H={H} />
            </svg>

            {/* Legend */}
            <div className="mt-3 text-xs text-zinc-400">
              <p><span className="text-amber-400 font-semibold">a–t shaded area</span> = Δv (change in velocity) from 0→tᶜ; <span className="text-violet-400 font-semibold">v–t shaded area</span> = Δx (displacement) from 0→tᶜ.</p>
            </div>
          </div>
        </div>

        {/* Readouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2 text-sm md:text-base">
          <Panel title="At time tᶜ" color="text-zinc-200">
            <Row k="tᶜ" v={`${fmt(tc,2)} s`} />
            <Row k="a(tᶜ)" v={`${fmt(a_tc,3)} m/s²`} />
            <Row k="v(tᶜ)" v={`${fmt(v_tc,3)} m/s`} />
            <Row k="x(tᶜ)" v={`${fmt(x_tc,3)} m`} />
          </Panel>
          <Panel title="Averages from 0→tᶜ" color="text-emerald-400">
            <Row k="Δv = ∫ a dt" v={`${fmt(deltaV,3)} m/s`} />
            <Row k="Δx = ∫ v dt" v={`${fmt(deltaX,3)} m`} />
            <Row k="ā = Δv/Δt" v={`${fmt(avgAcc_0_tc,3)} m/s²`} />
            <Row k="v̄ = Δx/Δt" v={`${fmt(avgVel_0_tc,3)} m/s`} />
          </Panel>
          <Panel title="Segment timing" color="text-sky-400">
            <Row k="t₀" v={`0 s`} />
            <Row k="t₁" v={`${fmt(tBreaks[1],2)} s`} />
            <Row k="t₂" v={`${fmt(tBreaks[2],2)} s`} />
            <Row k="t₃" v={`${fmt(T,2)} s`} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Small Components -------------------- */
function Axes({ W, H, L, R, Tpad, B, xLabel, yLabel }) {
  return (
    <g>
      <line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#71717a" strokeWidth={1} />
      <line x1={L} y1={Tpad} x2={L} y2={H - B} stroke="#71717a" strokeWidth={1} />
      <text x={(W - L - R)/2 + L} y={H - 6} fill="#cbd5e1" fontSize={11} textAnchor="middle">{xLabel}</text>
      <text x={12} y={Tpad + 10} fill="#cbd5e1" fontSize={11} textAnchor="start">{yLabel}</text>
    </g>
  );
}

function TimeCursor({ x, H }) {
  return <line x1={x} y1={10} x2={x} y2={H - 32} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />;
}

function SegmentRow({ label, a, setA, p, setP, color = "#22c55e" }) {
  return (
    <div className="rounded-lg border border-zinc-800 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-300"><span className="font-semibold mr-2">{label}</span>duration p (fraction of Δt)</div>
        <div className="text-xs text-zinc-400">{(p*100).toFixed(1)}%</div>
      </div>
      <input type="range" min={0.05} max={0.9} step={0.01} className="w-full mt-1" value={p} onChange={(e) => setP(parseFloat(e.target.value))} />
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">a (m/s²)</label>
          <input type="number" step={0.5} className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-2 py-1.5" value={a} onChange={(e) => setA(Number(e.target.value))} />
        </div>
        <div className="flex items-end text-xs">
          <span className="px-2 py-1 rounded-md border" style={{ borderColor: "#374151", color }}>{label} color</span>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, color = "text-zinc-200", children }) {
  return (
    <div className={`rounded-lg border border-zinc-800 p-3 ${color.replace("text-", "border-")}`}>
      <div className={`font-semibold mb-2 ${color}`}>{title}</div>
      {children}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between border-b border-zinc-800 py-0.5">
      <span>{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
