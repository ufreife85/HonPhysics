import React, { useState, useRef, useEffect, useCallback } from 'react';

// Main component for the interactive simulation
export default function PositionVelocityInteractive() {
  const [initialPos, setInitialPos] = useState(-5);
  const [finalPos, setFinalPos] = useState(10);
  const [time, setTime] = useState(4);
  
  const numberLineRef = useRef(null);

  // --- Calculations ---
  const displacement = finalPos - initialPos;
  const distance = Math.abs(displacement);
  const averageVelocity = time > 0 ? displacement / time : 0;

  // --- Draggable Handle Logic ---
  const DraggableHandle = ({ position, setPosition, color }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleRef = useRef(null);

    const getPositionFromEvent = useCallback((e) => {
      if (!numberLineRef.current) return 0;
      const bounds = numberLineRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pixelPos = clientX - bounds.left;
      const percentage = pixelPos / bounds.width;
      // Our number line goes from -20 to 20, a range of 40
      return Math.round(percentage * 40 - 20);
    }, []);

    const handleMove = useCallback((e) => {
      const newPos = getPositionFromEvent(e);
      setPosition(newPos);
    }, [getPositionFromEvent, setPosition]);

    const handleUp = useCallback(() => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    }, [handleMove]);

    const handleDown = (e) => {
      e.preventDefault();
      setIsDragging(true);
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    };

    const percentage = (position + 20) / 40 * 100;

    return (
      <div
        ref={handleRef}
        onMouseDown={handleDown}
        onTouchStart={handleDown}
        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 cursor-grab active:cursor-grabbing z-10"
        style={{
          left: `calc(${percentage}% - 16px)`,
          borderColor: color,
          backgroundColor: `${color}80`,
          boxShadow: isDragging ? `0 0 20px ${color}` : 'none',
        }}
      >
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold" style={{color}}>
          {position.toFixed(0)}m
        </div>
      </div>
    );
  };
  
  // --- Number Line Ticks ---
  const renderTicks = () => {
    const ticks = [];
    for (let i = -20; i <= 20; i += 5) {
      ticks.push(
        <div key={i} className="absolute h-full flex flex-col items-center" style={{ left: `${((i + 20) / 40) * 100}%` }}>
          <div className="w-px h-4 bg-zinc-600"></div>
          <span className="text-xs mt-1 text-zinc-400">{i}</span>
        </div>
      );
    }
    return ticks;
  };

  // --- Displacement Arrow ---
  const renderArrow = () => {
      const startPercent = (Math.min(initialPos, finalPos) + 20) / 40 * 100;
      const endPercent = (Math.max(initialPos, finalPos) + 20) / 40 * 100;
      const widthPercent = endPercent - startPercent;
      const isNegative = displacement < 0;

      return (
        <div className="absolute top-1/4 h-8" style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}>
            <div className="relative w-full h-full">
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-amber-400"></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 border-t-4 border-r-4 border-amber-400"
                  style={{
                    transform: isNegative ? 'translateY(-50%) rotate(-135deg)' : 'translateY(-50%) rotate(45deg)',
                    right: isNegative ? 'auto' : '-8px',
                    left: isNegative ? '-8px' : 'auto',
                  }}
                ></div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 p-8">
        <h2 className="text-2xl font-bold text-indigo-400 mb-2 text-center">Interactive Motion Simulator</h2>
        <p className="text-center text-zinc-400 mb-8">Drag the handles to change the initial and final positions. Observe the results.</p>
        
        {/* The Number Line */}
        <div className="relative w-full h-20 mb-8">
          <div ref={numberLineRef} className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-700 rounded-full">
            {renderTicks()}
          </div>
          {renderArrow()}
          <DraggableHandle position={initialPos} setPosition={setInitialPos} color="#34d399" />
          <DraggableHandle position={finalPos} setPosition={setFinalPos} color="#f87171" />
        </div>

        {/* Controls and Data Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <h3 className="font-semibold text-lg mb-4 text-emerald-400">Controls</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-zinc-300 mb-1">Time Interval (Δt)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                id="time"
                                min="0.1"
                                max="20"
                                step="0.1"
                                value={time}
                                onChange={(e) => setTime(parseFloat(e.target.value))}
                                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="font-mono text-emerald-400 w-20 text-center">{time.toFixed(1)} s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Display */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                <h3 className="font-semibold text-lg mb-4 text-rose-400">Calculated Results</h3>
                <div className="space-y-3 text-lg">
                    <p><strong>Distance:</strong> <span className="font-mono text-rose-400">{distance.toFixed(1)} m</span></p>
                    <p><strong>Displacement (Δx):</strong> <span className="font-mono text-rose-400">{displacement.toFixed(1)} m</span></p>
                    <p><strong>Average Velocity (v_avg):</strong> <span className="font-mono text-rose-400">{averageVelocity.toFixed(2)} m/s</span></p>
                </div>
            </div>
        </div>
         <div className="mt-6 text-xs text-zinc-500 text-center">
            <p><span className="font-bold text-emerald-400">Green handle</span> = Initial Position (x_i)</p>
            <p><span className="font-bold text-rose-400">Red handle</span> = Final Position (x_f)</p>
            <p><span className="font-bold text-amber-400">Yellow arrow</span> = Displacement vector</p>
        </div>
      </div>
    </div>
  );
}
