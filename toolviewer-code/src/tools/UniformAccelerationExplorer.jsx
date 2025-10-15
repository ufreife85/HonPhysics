import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";

/**
 * UniformAccelerationExplorer
 * Single-file, drop-in React component for your toolViewer route
 * Route suggestion:  ./toolviewer/index.html#/uniform-acceleration-explorer
 *
 * No external state, no server calls. Uses recharts for graphs and Tailwind for styling.
 */
export default function UniformAccelerationExplorer() {
  // Simulation parameters
  const [vi, setVi] = useState(2);           // m/s
  const [a, setA] = useState(1);             // m/s^2
  const [tMax, setTMax] = useState(10);      // s (display window)
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);             // s (current time)
  const [dt, setDt] = useState(0.02);        // s per frame when playing

  // UI toggles
  const [showVTarea, setShowVTarea] = useState(true);
  const [showXTtangent, setShowXTtangent] = useState(false);

  // Animation loop
  const rafRef = useRef(0);
  useEffect(() => {
    if (!playing) return () => cancelAnimationFrame(rafRef.current);
    let last = performance.now();
    const step = (now) => {
      const elapsed = (now - last) / 1000; // seconds wall-time
      last = now;
      setT((prev) => {
        let next = prev + dt; // time step in sim-time (fixed for clarity)
        if (next > tMax) next = tMax;
        return next;
      });
      if (t >= tMax) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, dt, tMax, t]);

  const reset = () => { setT(0); setPlaying(false); };
  const stepSmall = () => setT((s) => Math.min(tMax, +(s + 0.1).toFixed(3)));
  const stepBig = () => setT((s) => Math.min(tMax, +(s + 0.5).toFixed(3)));

  // Kinematics helpers
  const vAt = (time) => vi + a * time; // m/s
  const xAt = (time) => vi * time + 0.5 * a * time * time; // m

  // Generate data from 0..tMax at decent resolution
  const N = 200;
  const dataAll = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= N; i++) {
      const tt = (i / N) * tMax;
      arr.push({
        t: +tt.toFixed(3),
        x: xAt(tt),
        v: vAt(tt),
        a: a,
      });
    }
    return arr;
  }, [vi, a, tMax]);

  // Data up to current t (for shaded region and pointer)
  const dataUpToT = useMemo(() => dataAll.filter((d) => d.t <= t), [dataAll, t]);

  // Axis ranges: choose symmetric-ish for visibility
  const xMin = useMemo(() => Math.min(0, ...dataAll.map((d) => d.x)), [dataAll]);
  const xMax = useMemo(() => Math.max(0, ...dataAll.map((d) => d.x)), [dataAll]);
  const vMin = useMemo(() => Math.min(vi, ...dataAll.map((d) => d.v)), [dataAll, vi]);
  const vMax = useMemo(() => Math.max(vi, ...dataAll.map((d) => d.v)), [dataAll, vi]);

  // Current values
  const vNow = vAt(t);
  const xNow = xAt(t);

  // Tangent line at time t on x–t: slope = v(t)
  const tangentData = useMemo(() => {
    if (!showXTtangent) return [];
    const t0 = t;
    const x0 = xNow;
    const span = tMax * 0.25; // show around the point
    const t1 = Math.max(0, t0 - span);
    const t2 = Math.min(tMax, t0 + span);
    return [
      { t: t1, x: x0 + vAt(t0) * (t1 - t0) },
      { t: t2, x: x0 + vAt(t0) * (t2 - t0) },
    ];
  }, [showXTtangent, t, tMax, xNow]);

  // Mini motion bar scaling
  const spanX = Math.max(1, Math.abs(xMax - xMin));
  const progress = spanX === 0 ? 0 : (xNow - xMin) / spanX; // 0..1

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl p-4 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Uniform Acceleration Explorer</h1>
            <p className="text-sm opacity-70">Adjust v<sub>i</sub>, a, and time; connect x–t curvature, v–t slope, and area under v–t.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="opacity-70">t</div>
              <div className="text-lg font-semibold">{t.toFixed(2)} s</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="opacity-70">v(t)</div>
              <div className="text-lg font-semibold">{vNow.toFixed(2)} m/s</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="opacity-70">x(t)</div>
              <div className="text-lg font-semibold">{xNow.toFixed(2)} m</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3">
              <div className="opacity-70">a</div>
              <div className="text-lg font-semibold">{a.toFixed(2)} m/s<sup>2</sup></div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-4">
            <h2 className="text-lg font-semibold mb-2">Controls</h2>
            <ControlRow label={<span>Initial velocity v<sub>i</sub> (m/s)</span>}>
              <Range value={vi} setValue={setVi} min={-20} max={20} step={0.1} />
            </ControlRow>
            <ControlRow label={<span>Acceleration a (m/s<sup>2</sup>)</span>}>
              <Range value={a} setValue={setA} min={-20} max={20} step={0.1} />
            </ControlRow>
            <ControlRow label={<span>Window t<sub>max</sub> (s)</span>}>
              <Range value={tMax} setValue={setTMax} min={2} max={30} step={1} />
            </ControlRow>
            <ControlRow label={<span>Play dt (s/frame)</span>}>
              <Range value={dt} setValue={setDt} min={0.005} max={0.1} step={0.005} />
            </ControlRow>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => setPlaying((p) => !p)} className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500">
                {playing ? "Pause" : "Play"}
              </button>
              <button onClick={reset} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Reset</button>
              <button onClick={stepSmall} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">+0.1 s</button>
              <button onClick={stepBig} className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">+0.5 s</button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showVTarea} onChange={(e) => setShowVTarea(e.target.checked)} />
                <span>Show area under v–t (Δx)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={showXTtangent} onChange={(e) => setShowXTtangent(e.target.checked)} />
                <span>Show tangent on x–t (slope = v)</span>
              </label>
            </div>
          </div>

          {/* Motion preview */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Motion Preview</h2>
            <div className="text-sm opacity-70">Bar shows position x(t) across the current range [{xMin.toFixed(1)}, {xMax.toFixed(1)}] m</div>
            <div className="relative h-8 w-full rounded-xl bg-neutral-800 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 w-2 rounded-md bg-indigo-500 shadow"
                style={{ left: `calc(${(progress * 100).toFixed(3)}% - 4px)` }}
                title={`x=${xNow.toFixed(2)} m`}
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <InfoChip label={<span>v<sub>f</sub> = v<sub>i</sub> + a t</span>} value={`${(vi + a * t).toFixed(2)} m/s`} />
              <InfoChip label={<span>x = v<sub>i</sub> t + ½ a t<sup>2</sup></span>} value={`${xNow.toFixed(2)} m`} />
              <InfoChip label={<span>v<sup>2</sup> = v<sub>i</sub><sup>2</sup> + 2 a Δx</span>} value={`${(vi*vi + 2*a*xNow).toFixed(2)} (m/s)<sup>2</sup>`} rawHTML />
            </div>
          </div>
        </section>

        {/* Graphs */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* x–t graph */}
          <GraphCard title={<span>Position x(t)</span>} subtitle={<span>x = v<sub>i</sub> t + ½ a t<sup>2</sup></span>}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataAll} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="t" type="number" domain={[0, tMax]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="x" domain={[Math.min(xMin, xNow), Math.max(xMax, xNow)]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val, name) => [Number(val).toFixed(2), name]} />
                <Line type="monotone" dataKey="x" dot={false} strokeWidth={2} />
                {/* moving point */}
                {dataUpToT.length > 0 && (
                  <Line type="linear" dataKey="x" data={dataUpToT} dot={{ r: 4 }} stroke="none" />
                )}
                {/* tangent */}
                {showXTtangent && tangentData.length === 2 && (
                  <Line type="linear" data={tangentData} dataKey="x" strokeDasharray="4 4" dot={false} />
                )}
                <ReferenceLine x={t} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>

          {/* v–t graph */}
          <GraphCard title={<span>Velocity v(t)</span>} subtitle={<span>v = v<sub>i</sub> + a t</span>}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataAll} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="t" type="number" domain={[0, tMax]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="v" domain={[Math.min(vMin, vNow), Math.max(vMax, vNow)]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val, name) => [Number(val).toFixed(2), name]} />
                {showVTarea && (
                  <Area dataKey="v" strokeOpacity={0} fillOpacity={0.2} />
                )}
                <Line type="linear" dataKey="v" dot={false} strokeWidth={2} />
                {dataUpToT.length > 0 && (
                  <Line type="linear" dataKey="v" data={dataUpToT} dot={{ r: 4 }} stroke="none" />
                )}
                <ReferenceLine x={t} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>

          {/* a–t graph */}
          <GraphCard title={<span>Acceleration a(t)</span>} subtitle={<span>constant a</span>}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dataAll} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="t" type="number" domain={[0, tMax]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="a" domain={[a, a]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val, name) => [Number(val).toFixed(2), name]} />
                <Line type="linear" dataKey="a" dot={false} strokeWidth={2} />
                {dataUpToT.length > 0 && (
                  <Line type="linear" dataKey="a" data={dataUpToT} dot={{ r: 4 }} stroke="none" />
                )}
                <ReferenceLine x={t} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </section>

        {/* Footer formulas */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm leading-relaxed">
          <h3 className="text-base font-semibold mb-2">Kinematic Relations (constant a)</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>v<sub>f</sub> = v<sub>i</sub> + a t</li>
            <li>x = v<sub>i</sub> t + ½ a t<sup>2</sup></li>
            <li>v<sup>2</sup> = v<sub>i</sub><sup>2</sup> + 2 a Δx</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ControlRow({ label, children }) {
  return (
    <div>
      <div className="mb-1 text-sm text-zinc-300">{label}</div>
      {children}
    </div>
  );
}

function Range({ value, setValue, min, max, step }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full accent-indigo-500"
      />
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-24 rounded-lg bg-neutral-800 border border-zinc-700 px-2 py-1 text-sm"
      />
    </div>
  );
}

function GraphCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-3">
        <div className="text-base font-semibold">{title}</div>
        <div className="text-xs opacity-70">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function InfoChip({ label, value, rawHTML = false }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-neutral-900 px-3 py-2">
      <div className="text-xs opacity-70">{label}</div>
      {rawHTML ? (
        <div className="text-sm font-semibold" dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <div className="text-sm font-semibold">{value}</div>
      )}
    </div>
  );
}
