import React, { useState, useEffect } from 'react';

export default function ComponentVectorAdder() {
  const [vecA, setVecA] = useState({ x: 10, y: 5 });
  const [vecB, setVecB] = useState({ x: -5, y: 8 });
  const [resultant, setResultant] = useState({ mag: 0, ang: 0 });

  useEffect(() => {
    const resX = vecA.x + vecB.x;
    const resY = vecA.y + vecB.y;
    const mag = Math.sqrt(resX * resX + resY * resY);
    const ang = Math.atan2(resY, resX) * (180 / Math.PI);
    setResultant({ mag, ang });
  }, [vecA, vecB]);

  const handleVecAChange = (e, component) => {
    setVecA({ ...vecA, [component]: Number(e.target.value) });
  };
  const handleVecBChange = (e, component) => {
    setVecB({ ...vecB, [component]: Number(e.target.value) });
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
      <h3 className="text-lg font-semibold text-white mb-2">Component Adder</h3>
      <p className="text-sm text-zinc-400 mb-4">Enter the X and Y components for two vectors to see the resultant.</p>
      
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Vector A Inputs */}
        <div className="space-y-2">
          <h4 className="font-semibold text-rose-400">Vector A</h4>
          <div className="flex items-center gap-2">
            <label htmlFor="ax" className="w-4 font-mono text-zinc-400">x:</label>
            <input type="number" id="ax" value={vecA.x} onChange={(e) => handleVecAChange(e, 'x')} className="w-full bg-zinc-800 border-zinc-600 rounded-md p-1.5" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="ay" className="w-4 font-mono text-zinc-400">y:</label>
            <input type="number" id="ay" value={vecA.y} onChange={(e) => handleVecAChange(e, 'y')} className="w-full bg-zinc-800 border-zinc-600 rounded-md p-1.5" />
          </div>
        </div>

        {/* Vector B Inputs */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-400">Vector B</h4>
          <div className="flex items-center gap-2">
            <label htmlFor="bx" className="w-4 font-mono text-zinc-400">x:</label>
            <input type="number" id="bx" value={vecB.x} onChange={(e) => handleVecBChange(e, 'x')} className="w-full bg-zinc-800 border-zinc-600 rounded-md p-1.5" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="by" className="w-4 font-mono text-zinc-400">y:</label>
            <input type="number" id="by" value={vecB.y} onChange={(e) => handleVecBChange(e, 'y')} className="w-full bg-zinc-800 border-zinc-600 rounded-md p-1.5" />
          </div>
        </div>
      </div>
      
      {/* Resultant Output */}
      <div className="mt-6 pt-4 border-t border-zinc-700">
        <h4 className="font-semibold text-teal-300">Resultant Vector</h4>
        <div className="mt-2 p-3 bg-zinc-800 rounded-lg text-sm">
            <p className="font-mono text-white">R = ({(vecA.x + vecB.x).toFixed(2)}, {(vecA.y + vecB.y).toFixed(2)})</p>
            <p className="font-mono text-cyan-300">Magnitude: {resultant.mag.toFixed(2)}</p>
            <p className="font-mono text-cyan-300">Angle: {resultant.ang.toFixed(2)}°</p>
        </div>
      </div>
    </div>
  );
}
