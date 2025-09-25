import React, { useState, useRef } from 'react';

// Helper to calculate vector properties
const getVectorProps = (vec) => {
    const magnitude = Math.sqrt(vec.x2**2 + vec.y2**2);
    const angle = Math.atan2(vec.y2, vec.x2) * (180 / Math.PI);
    return { magnitude, angle };
};

export default function GraphicalVectorAdder() {
  const [vectors, setVectors] = useState([
    { x1: 0, y1: 0, x2: 100, y2: -50 },
    { x1: 0, y1: 0, x2: -60, y2: -80 },
  ]);
  const [resultant, setResultant] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const grid_size = 20;
  const width = 500;
  const height = 300;
  const origin = { x: width / 2, y: height / 2 };

  const handleAddVectors = () => {
    if (isAnimating || resultant) return;
    setIsAnimating(true);
    setTimeout(() => {
      const v1 = { x: vectors[0].x2, y: vectors[0].y2 };
      const v2 = { x: vectors[1].x2, y: vectors[1].y2 };
      const resVec = { x2: v1.x + v2.x, y2: v1.y + v2.y };
      const resProps = getVectorProps(resVec);
      setResultant({ ...resVec, ...resProps });
      setIsAnimating(false);
    }, 500);
  };

  const reset = () => {
    setIsAnimating(false);
    setResultant(null);
  };

  const v1Props = getVectorProps(vectors[0]);
  const v2Props = getVectorProps(vectors[1]);

  return (
    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
      <h3 className="text-lg font-semibold text-white mb-2">Graphical Vector Adder</h3>
      <p className="text-sm text-zinc-400 mb-4">Drag arrow heads to define vectors. Click 'Add' for head-to-tail addition.</p>
      
      <VectorCanvas
        vectors={vectors}
        setVectors={setVectors}
        resultant={resultant}
        isAnimating={isAnimating}
        origin={origin} width={width} height={height} grid_size={grid_size}
        v1Props={v1Props} v2Props={v2Props}
      />

      <div className="flex gap-4 mt-4">
        <button onClick={handleAddVectors} disabled={isAnimating || !!resultant} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800">
          {isAnimating ? 'Adding...' : 'Add Vectors'}
        </button>
        <button onClick={reset} className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600">Reset</button>
      </div>

       <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <div className="p-2 bg-zinc-800 rounded-md"><span className="font-bold text-rose-400">V1:</span> Mag: {v1Props.magnitude.toFixed(1)}, θ: {(-v1Props.angle).toFixed(1)}°</div>
          <div className="p-2 bg-zinc-800 rounded-md"><span className="font-bold text-blue-400">V2:</span> Mag: {v2Props.magnitude.toFixed(1)}, θ: {(-v2Props.angle).toFixed(1)}°</div>
          {resultant && <div className="p-2 bg-zinc-800 rounded-md animate-fade-in"><span className="font-bold text-teal-300">Res:</span> Mag: {resultant.magnitude.toFixed(1)}, θ: {(-resultant.angle).toFixed(1)}°</div>}
      </div>
    </div>
  );
}

function VectorCanvas({ vectors, setVectors, resultant, isAnimating, origin, width, height, grid_size, v1Props, v2Props }) {
    const draggingVectorIndex = useRef(null);

    const handleMouseDown = (e, index) => {
        if (isAnimating || resultant) return;
        draggingVectorIndex.current = index;
    };

    const handleMouseMove = (e) => {
        if (draggingVectorIndex.current === null) return;
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const cursorPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
        setVectors(prev => prev.map((v, i) => (i === draggingVectorIndex.current ? { ...v, x2: cursorPoint.x - origin.x, y2: cursorPoint.y - origin.y } : v)));
    };
    
    const handleMouseUp = () => { draggingVectorIndex.current = null; };

    const v1 = vectors[0];
    const v2 = vectors[1];
    
    return (
        <svg width={width} height={height} className="bg-zinc-800 rounded-md cursor-grab" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <defs>
                <pattern id="grid" width={grid_size} height={grid_size} patternUnits="userSpaceOnUse"><path d={`M ${grid_size} 0 L 0 0 0 ${grid_size}`} fill="none" stroke="rgba(161, 161, 170, 0.2)" strokeWidth="0.5"/></pattern>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" /></marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker>
                <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#14b8a6" /></marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <line x1="0" y1={origin.y} x2={width} y2={origin.y} stroke="#a1a1aa" strokeWidth="1"/>
            <line x1={origin.x} y1="0" x2={origin.x} y2={height} stroke="#a1a1aa" strokeWidth="1"/>

            <line x1={origin.x} y1={origin.y} x2={origin.x + v1.x2} y2={origin.y + v1.y2} stroke="#f43f5e" strokeWidth="2" markerEnd="url(#arrow-red)" />
            <circle cx={origin.x + v1.x2} cy={origin.y + v1.y2} r="8" fill="rgba(244, 63, 94, 0.5)" className={isAnimating || resultant ? "cursor-not-allowed" : "cursor-grabbing"} onMouseDown={(e) => handleMouseDown(e, 0)} />

            <g style={{ transition: 'transform 0.5s ease-in-out', transform: isAnimating ? `translate(${v1.x2}px, ${v1.y2}px)` : 'translate(0, 0)' }}>
                <line x1={origin.x} y1={origin.y} x2={origin.x + v2.x2} y2={origin.y + v2.y2} stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                <circle cx={origin.x + v2.x2} cy={origin.y + v2.y2} r="8" fill="rgba(59, 130, 246, 0.5)" className={isAnimating || resultant ? "cursor-not-allowed" : "cursor-grabbing"} onMouseDown={(e) => handleMouseDown(e, 1)} />
            </g>

            {resultant && (
                <line x1={origin.x} y1={origin.y} x2={origin.x + resultant.x2} y2={origin.y + resultant.y2} stroke="#14b8a6" strokeWidth="3" markerEnd="url(#arrow-green)" className="animate-fade-in" />
            )}
        </svg>
    );
}
