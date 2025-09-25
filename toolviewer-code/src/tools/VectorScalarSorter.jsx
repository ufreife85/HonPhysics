import React, { useState } from 'react';

const quantities = [
  { name: 'Speed (5 m/s)', type: 'Scalar' },
  { name: 'Velocity (5 m/s North)', type: 'Vector' },
  { name: 'Distance (10 km)', type: 'Scalar' },
  { name: 'Displacement (10 km East)', type: 'Vector' },
  { name: 'Temperature (25°C)', type: 'Scalar' },
  { name: 'Force (9.8 N downward)', type: 'Vector' },
  { name: 'Mass (70 kg)', type: 'Scalar' },
  { name: 'Acceleration (-9.8 m/s²)', type: 'Vector' },
];

export default function VectorScalarSorter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState({ message: '', color: '' });
  const [isAnswered, setIsAnswered] = useState(false);

  const checkAnswer = (selectedType) => {
    if (isAnswered) return;
    if (selectedType === quantities[currentIndex].type) {
      setFeedback({ message: 'Correct!', color: 'text-emerald-400' });
    } else {
      setFeedback({ message: `Not quite. This is a ${quantities[currentIndex].type}.`, color: 'text-amber-400' });
    }
    setIsAnswered(true);
  };

  const nextQuantity = () => {
    setIsAnswered(false);
    setFeedback({ message: '', color: '' });
    setCurrentIndex((prev) => (prev + 1) % quantities.length);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6 mb-4">
      <h2 className="text-xl font-semibold">Interactive: Vector vs. Scalar Sorter</h2>
      <p className="mt-2 text-zinc-400">
        Is the following quantity a vector (magnitude and direction) or a scalar (magnitude only)?
      </p>

      <div className="mt-4 p-6 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[100px] flex items-center justify-center">
        <p className="text-lg text-center text-zinc-100">"{quantities[currentIndex].name}"</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => checkAnswer('Vector')} disabled={isAnswered} className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-600 disabled:cursor-not-allowed">Vector</button>
        <button onClick={() => checkAnswer('Scalar')} disabled={isAnswered} className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-600 disabled:cursor-not-allowed">Scalar</button>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-zinc-800 min-h-[50px] flex items-center justify-center">
        {isAnswered ? (
          <div className="flex items-center justify-between w-full">
            <p className={`font-semibold ${feedback.color}`}>{feedback.message}</p>
            <button onClick={nextQuantity} className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600">Next →</button>
          </div>
        ) : (
          <p className="text-zinc-500">Choose a classification.</p>
        )}
      </div>
    </div>
  );
}
