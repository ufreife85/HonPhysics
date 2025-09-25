import React, { useState, useMemo, useRef, useEffect } from 'react';

export default function VectorResolver() {
  const [magnitude, setMagnitude] = useState(50);
  const [angle, setAngle] = useState(30);
  const canvasRef = useRef(null);

  const components = useMemo(() => {
    const angleRad = angle * (Math.PI / 180);
    const x = magnitude * Math.cos(angleRad);
    const y = magnitude * Math.sin(angleRad);
    return { x: x.toFixed(2), y: y.toFixed(2) };
  }, [magnitude, angle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 2; // pixels per unit

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    const angleRad = angle * (Math.PI / 180);
    const endX = originX + magnitude * Math.cos(angleRad) * scale;
    const endY = originY - magnitude * Math.sin(angleRad) * scale; // Y is inverted in canvas

    // Draw components
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // Red
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(originX, endY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)'; // Blue
    ctx.beginPath();
    ctx.moveTo(endX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw main vector
    ctx.strokeStyle = '#34d399'; // Emerald
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
  }, [magnitude, angle]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6">
      <h2 className="text-xl font-semibold">Interactive: Vector Resolution Visualizer</h2>
      <p className="mt-2 text-zinc-400">
        Adjust the magnitude and angle of the vector to see how its x and y components change.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Magnitude: {magnitude}</label>
          <input type="range" min="0" max="100" value={magnitude} onChange={e => setMagnitude(e.target.value)} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Angle: {angle}°</label>
          <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(e.target.value)} className="w-full" />
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <canvas ref={canvasRef} width="300" height="300" className="rounded-lg bg-zinc-900"></canvas>
        <div className="flex-1 p-4 bg-zinc-900 rounded-lg">
            <h3 className="font-semibold text-zinc-200">Components:</h3>
            <p className="mt-2 text-lg font-mono text-blue-400">X-Component (vₓ): {components.x}</p>
            <p className="text-sm text-zinc-400">vₓ = v * cos(θ) = {magnitude} * cos({angle}°)</p>
            <p className="mt-4 text-lg font-mono text-red-400">Y-Component (vᵧ): {components.y}</p>
            <p className="text-sm text-zinc-400">vᵧ = v * sin(θ) = {magnitude} * sin({angle}°)</p>
        </div>
      </div>
    </div>
  );
}
