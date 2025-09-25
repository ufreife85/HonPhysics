import React, { useState } from "react";
import PasswordModal from './Password.jsx';

/**
 * All lessons now route through the Lesson Viewer (hash routes).
 * Keep each lesson object on ONE line for easy indexing diffs.
 */
const units = [
  {
    id: 1,
    title: "Unit 1 — The Science of Physics",
    items: [
      { name: "1.1 & 1.2 Intro to Physics", href: "./unitLessons/index.html#/P1_1_2Intro?view=overview", notes: { name: "1.1 & 1.2 Guided Notes", href: "./documents/GuidedNotes/1_1_1_2GuidedNotes.pdf" } },
      { name: "1.3 Measurement", href: "./unitLessons/index.html#/P1_3measurement?view=overview", notes: { name: "1.3 Guided Notes", href: "./documents/GuidedNotes/1_3GuidedNotes.pdf" } },
      { name: "1.4 Math Tools", href: "./unitLessons/index.html#/P1_4mathTools?view=overview", notes: { name: "1.4 Guided Notes", href: "./documents/GuidedNotes/1_4GuidedNotes.pdf" } },
      { name: "1.5 Vectors", href: "./unitLessons/index.html#/P1_5vectors?view=overview", notes: { name: "1.5 Guided Notes", href: "./documents/GuidedNotes/1_5GuidedNotes.pdf" } },
      { name: "1.6 & 1.7 Vector Addition", href: "./unitLessons/index.html#/P1_6_7vectorAddition?view=overview", password: "phys1617", notes: { name: "1.6 & 1.7 Guided Notes", href: "./documents/GuidedNotes/1_6_1_7GuidedNotes.pdf", password: "notes1617" } }
    ]
  },

  {
    id: 2,
    title: "Unit 2 — Motion in One Dimension",
    items: [
      { name: "2.1–2.2 Position, Distance, Displacement & Avg Velocity", href: "./unitLessons/index.html#/P2_1_2positionVelocity?view=overview", password: "phys2122", notes: { name: "2.1 & 2.2 Guided Notes", href: "./documents/GuidedNotes/2.1GuidedNotes.pdf", password: "notes2122" } },
      { name: "2.3 Instantaneous Velocity", href: "./unitLessons/index.html#/P2_3instantaneousVelocity?view=overview", password: "phys2123", notes: { name: "2.3 Guided Notes", href: "./documents/GuidedNotes/2.3GuidedNotes.pdf", password: "notes2123" } },
      { name: "2.4 Average Acceleration", href: "./unitLessons/index.html#/P2_4averageAcceleration?view=overview", password: "phys2124", notes: { name: "2.4 Guided Notes", href: "./documents/GuidedNotes/2.4GuidedNotes.pdf", password: "notes2124" } }
    ]
  },

  { id: 3, title: "Unit 3 — Forces & Newton's Laws of Motion", items: [] },
  { id: 4, title: "Unit 4 — Motion in Two Dimensions", items: [] },
  { id: 5, title: "Unit 5 — Circular Motion & Gravitation", items: [] },
  { id: 6, title: "Unit 6 — Conservation Laws", items: [] },
  { id: 7, title: "Unit 7 — Simple Machines", items: [] },
  { id: 8, title: "Unit 8 — Rotational Motion", items: [] }
];

export default function Portal() {
  // Expand Units 1 & 2 by default
  const [open, setOpen] = useState({ 1: true, 2: true });

  const [promptingForItem, setPromptingForItem] = useState(null);

  const handleLinkClick = (e, item) => {
    if (item.password) {
      e.preventDefault();
      setPromptingForItem(item);
    }
  };

  const handleCorrectPassword = () => {
    if (promptingForItem) {
      window.open(promptingForItem.href, "_blank");
      setPromptingForItem(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {promptingForItem && (
        <PasswordModal
          item={promptingForItem}
          onCorrect={handleCorrectPassword}
          onCancel={() => setPromptingForItem(null)}
        />
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm sm:text-base font-semibold">Mr. Reife’s Honors Physics</div>
          <nav className="flex gap-2 text-xs sm:text-sm">
            <a href="#syllabus" className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Syllabus</a>
            <a href="#lab" className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Lab Safety</a>
            <a href="#equations" className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Equation Sheet</a>
            <a href="#units" className="px-2.5 py-1.5 rounded-xl bg-indigo-600">Units</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6">
        {/* Hero */}
        <section className="grid md:grid-cols-5 gap-4 items-center">
          <div className="md:col-span-3 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome to Mr. Reife’s Honors Physics</h1>
            <p className="mt-2 text-zinc-300 max-w-prose">
              This portal is your launchpad for course info, labs, equation sheets, and a foldered set of Units.
              Each unit links to the <span className="font-semibold">Lesson Viewer</span> JSON lessons and the Physics Toolkit.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="#syllabus" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">View syllabus</a>
              <a href="#units" className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">Browse units</a>
            </div>
          </div>
          <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="font-semibold mb-2">Quick links</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#lab" className="underline underline-offset-4 hover:no-underline">Lab Safety Rules</a></li>
              <li><a href="#equations" className="underline underline-offset-4 hover:no-underline">Equation Sheet</a></li>
              <li><a href="#units" className="underline underline-offset-4 hover:no-underline">Course Units</a></li>
              <li><a href="../toolviewer/index.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:no-underline">Physics Toolkit ↗</a></li>
            </ul>
          </div>
        </section>

        {/* Syllabus */}
        <section id="syllabus" className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Files & Links</h2>
          </div>
          <div className="space-x-2 mt-3 pb-4 text-zinc-300 text-sm max-w-prose">
            <a href="./documents/PhysicsHonors_Syllabus2025-2026.pdf" target="_blank" className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Syllabus</a>
            <a href="https://flexbooks.ck12.org/cbook/ck-12-physics-flexbook-2.0/" target="_blank" className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">CK-12</a>
            <a href="../toolviewer/index.html" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white">Physics Toolkit ↗</a>
          </div>

          {/* Equation Sheet */}
          <section id="equations" className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <h2 className="text-xl font-semibold">Equation Sheet</h2>
            <p className="mt-2 text-sm text-zinc-300 max-w-prose">
              <a href="./documents/EquationSheet.pdf" target="_blank" className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700">Equation Sheet</a>
            </p>
          </section>
          <div><br /></div>
        </section>

        {/* Lab Safety */}
        <section id="lab" className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <h2 className="text-xl font-semibold">Lab Safety Rules</h2>
          <ul className="list-disc ml-6 mt-3 space-y-1 text-sm text-zinc-300">
            <li>Follow all instructions carefully. Never perform unauthorized experiments.</li>
            <li>Wear safety goggles at all times in the lab area.</li>
            <li>Report all accidents, injuries, and spills to the instructor immediately.</li>
            <li>Do not eat or drink in the laboratory.</li>
          </ul>
        </section>

        {/* Units */}
        <section id="units" className="grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Course Units</h2>
            <div className="text-xs text-zinc-400">Click a unit to expand; links open Lesson Viewer JSON lessons (↗) and notes (📝).</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => (
              <div key={u.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                <button
                  onClick={() => setOpen((s) => ({ ...s, [u.id]: !s[u.id] }))}
                  className="w-full text-left flex items-center justify-between"
                >
                  <div className="font-semibold">{u.title}</div>
                  <span className="text-xs text-zinc-400">{open[u.id] ? "Hide" : "Show"}</span>
                </button>
                {open[u.id] && (
                  <ul className="mt-3 space-y-2 text-sm">
                    {u.items.length === 0 && <li className="text-zinc-400">(No lessons linked yet)</li>}
                    {u.items.map((it, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <a
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
                          href={it.href}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => handleLinkClick(e, it)}
                        >
                          {it.password && <span className="text-amber-400 mr-1">🔒</span>}
                          <span>↗</span>
                          <span>{it.name}</span>
                        </a>
                        {it.notes && (
                          <a
                            className="ml-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-600 hover:bg-gray-500 text-sm"
                            href={it.notes.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => handleLinkClick(e, it.notes)}
                          >
                            <span>{it.notes.password && <span className="text-amber-400 mr-1">🔒</span>}<span>📝</span></span>
                            <span>{it.notes.name}</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 pb-8 text-xs text-zinc-500">
        © {new Date().getFullYear()} Mr. Reife — Honors Physics Portal.
      </footer>
    </div>
  );
}
