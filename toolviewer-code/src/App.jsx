import React, { useState, useEffect } from 'react';

// Import the password modal and all the tool components
import PasswordModal from './Password.jsx';
import ComponentVectorAdder from './tools/ComponentVectorAdder.jsx';
import GraphicalVectorAdder from './tools/GraphicalVectorAdder.jsx';
import SigFigCalculator from './tools/SigFigCalculator.jsx';
import StatementSorter from './tools/StatementSorter.jsx';
import UnitConverter from './tools/UnitConverter.jsx';
import VectorResolver from './tools/VectorResolver.jsx';
import VectorScalarSorter from './tools/VectorScalarSorter.jsx';
import PositionVelocityExplorer from './tools/PositionVelocityExplorer.jsx';
import InstantaneousVelocityExplorer from './tools/InstantaneousVelocityExplorer.jsx';
import AverageAccelerationExplorer from './tools/AverageAccelerationExplorer.jsx';

// --- Tool Configuration ---
// IMPORTANT: Set the passwords for each tool here.
const tools = [
  { id: 'component-vector-adder', name: 'Component Vector Adder', component: ComponentVectorAdder, password: '' },
  { id: 'graphical-vector-adder', name: 'Graphical Vector Adder', component: GraphicalVectorAdder, password: '' },
  { id: 'sig-fig-calculator', name: 'Sig Fig Calculator', component: SigFigCalculator, password: '' },
  { id: 'statement-sorter', name: 'Statement Sorter', component: StatementSorter, password: '' },
  { id: 'unit-converter', name: 'Unit Converter', component: UnitConverter, password: '' },
  { id: 'vector-resolver', name: 'Vector Resolver', component: VectorResolver, password: '' },
  { id: 'vector-scalar-sorter', name: 'Vector Scalar Sorter', component: VectorScalarSorter, password: '' },
  { id: 'position-velocity-explorer', name: 'Position Velocity Explorer', component: PositionVelocityExplorer, password: 'toolPVE' },
  { id: 'instantaneous-velocity-explorer', name: 'Instantaneous Velocity Explorer', component: InstantaneousVelocityExplorer, password: 'toolIVE' },
  { id: 'average-acceleration-explorer', name: 'Average Acceleration Explorer', component: AverageAccelerationExplorer, password: 'toolAAE' },

];

// Sort the tools array alphabetically by name
tools.sort((a, b) => a.name.localeCompare(b.name));

// --- Hash router helpers ---
const IDS = new Set(tools.map(t => t.id));

function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '').trim();
  return IDS.has(h) ? h : null;
}

function setHash(id) {
  window.location.hash = id ? `/${id}` : '';
}

export default function App() {
  const [activeToolId, setActiveToolId] = useState(() => parseHash());
  const [unlockedTools, setUnlockedTools] = useState(new Set());
  const [promptingForTool, setPromptingForTool] = useState(null);

  // Keep state in sync with hash changes (back/forward buttons)
  useEffect(() => {
    const onHash = () => {
      const id = parseHash();
      if (id && id !== activeToolId) setActiveToolId(id);
    };
    window.addEventListener('hashchange', onHash);
    // run once on mount in case there’s a hash
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, [activeToolId]);

  const handleToolClick = (tool) => {
    if (tool.password && !unlockedTools.has(tool.id)) {
      setPromptingForTool(tool);
    } else {
      setActiveToolId(tool.id);
      setHash(tool.id);
    }
  };

  const handleCorrectPassword = () => {
    if (promptingForTool) {
      setUnlockedTools(prev => new Set(prev).add(promptingForTool.id));
      setActiveToolId(promptingForTool.id);
      setHash(promptingForTool.id);
      setPromptingForTool(null);
    }
  };

  const ActiveToolComponent = tools.find(t => t.id === activeToolId)?.component;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans flex flex-col">
      {promptingForTool && (
        <PasswordModal
          item={promptingForTool}
          onCorrect={handleCorrectPassword}
          onCancel={() => setPromptingForTool(null)}
        />
      )}

      <header className="bg-zinc-950 border-b border-zinc-800 p-4 shadow-md z-10 flex items-center justify-center relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {/* This link assumes the portal's index.html is one level up */}
          <a
            href="../index.html"
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm inline-flex items-center gap-2 transition-colors"
          >
            &larr; Back to Portal
          </a>
        </div>
        <h1 className="text-xl font-bold text-white">Physics Honors Toolkit</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-zinc-950 p-4 border-r border-zinc-800 overflow-y-auto">
          <h2 className="font-semibold text-zinc-300 mb-4 text-sm tracking-wider uppercase">Tools</h2>
          <nav>
            <ul>
              {tools.map(tool => {
                const isLocked = tool.password && !unlockedTools.has(tool.id);
                const isActive = activeToolId === tool.id;
                return (
                  <li key={tool.id}>
                    <button 
                      onClick={() => handleToolClick(tool)}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm mb-2 transition-colors ${
                        isActive 
                          ? 'bg-indigo-600 text-white font-semibold' 
                          : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{tool.name}</span>
                      {isLocked && <span className="text-amber-400 text-xs" role="img" aria-label="locked">🔒</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {ActiveToolComponent ? (
            <div className="max-w-4xl mx-auto">
              <ActiveToolComponent />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <h2 className="text-2xl font-bold text-zinc-300">Welcome to the Physics Toolkit</h2>
                <p className="text-zinc-400 mt-2">
                  Select a tool from the sidebar to begin. <br/> Locked tools require a password.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
