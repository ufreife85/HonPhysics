import React, { useState } from 'react';

const statements = [
  { text: "The sky is blue.", type: "Observation" },
  { text: "An object in motion stays in motion unless acted upon by an external force.", type: "Law" },
  { text: "All matter is composed of tiny, indivisible particles called atoms.", type: "Theory" },
  { text: "If I drop a bowling ball and a feather, the bowling ball will hit the ground first.", type: "Hypothesis" },
  { text: "The universe is expanding.", type: "Theory" },
  { text: "The apple fell from the tree and landed on the ground.", type: "Observation" },
  { text: "The force between two objects is proportional to the product of their masses and inversely proportional to the square of the distance between them.", type: "Law" },
  { text: "If I add fertilizer to my tomato plants, they will grow taller than plants without fertilizer.", type: "Hypothesis" },
];

const types = ["Observation", "Hypothesis", "Theory", "Law"];

export default function StatementSorter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState({ message: '', color: '' });
  const [isAnswered, setIsAnswered] = useState(false);

  const checkAnswer = (selectedType) => {
    if (isAnswered) return;
    if (selectedType === statements[currentIndex].type) {
      setFeedback({ message: 'Correct!', color: 'text-emerald-400' });
    } else {
      setFeedback({ message: `Not quite. This is a(n) ${statements[currentIndex].type}.`, color: 'text-amber-400' });
    }
    setIsAnswered(true);
  };

  const nextStatement = () => {
    setIsAnswered(false);
    setFeedback({ message: '', color: '' });
    setCurrentIndex((prev) => (prev + 1) % statements.length);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6">
      <h2 className="text-xl font-semibold">Interactive: Scientific Statement Sorter</h2>
      <p className="mt-2 text-zinc-400">
        Read the statement below and classify it by clicking the correct button.
      </p>

      <div className="mt-4 p-6 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[100px] flex items-center justify-center">
        <p className="text-lg text-center text-zinc-100">"{statements[currentIndex].text}"</p>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {types.map(type => (
          <button key={type} onClick={() => checkAnswer(type)} disabled={isAnswered} className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-600 disabled:cursor-not-allowed">
            {type}
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-zinc-800 min-h-[50px] flex items-center justify-center">
        {isAnswered ? (
          <div className="flex items-center justify-between w-full">
            <p className={`font-semibold ${feedback.color}`}>{feedback.message}</p>
            <button onClick={nextStatement} className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600">Next →</button>
          </div>
        ) : (
          <p className="text-zinc-500">Choose a classification.</p>
        )}
      </div>
    </div>
  );
}
