import React, {useState} from "react";

export default function PasswordModal({ item, onCorrect, onCancel }) {
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (input === item.password) {
        setError(false);
        onCorrect();
      } else {
        setError(true);
        setInput("");
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 shadow-xl max-w-sm w-full">
          <h3 className="text-lg font-semibold text-white">Password Required</h3>
          <p className="text-sm text-zinc-400 mt-1">This lesson is locked. Please enter the password to continue.</p>
          <form onSubmit={handleSubmit} className="mt-4">
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`w-full bg-zinc-900 border rounded-xl p-2 text-white ${error ? 'border-red-500 ring-2 ring-red-500/50' : 'border-zinc-600'}`}
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1">Incorrect password. Please try again.</p>}
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">Unlock</button>
            </div>
          </form>
        </div>
      </div>
    );
  }