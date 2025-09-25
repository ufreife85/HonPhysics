import React, { useMemo, useState } from "react";

export default function ToolLauncher({ href, label = "Open Tool", launch = "embed" }) {
  // Normalize the href to an absolute URL (so iframes don't resolve to the current app)
  const absHref = useMemo(() => {
    try {
      // If href starts with '/', resolve from origin; else resolve relative to current URL
      if (href?.startsWith("/")) return new URL(href, window.location.origin).toString();
      return new URL(href, window.location.href).toString();
    } catch {
      return href || "";
    }
  }, [href]);

  // Prevent recursive embed: if the resolved URL (without hash) equals this page (without hash), disable embed
  const isSelf = useMemo(() => {
    const here = window.location.href.split("#")[0];
    const there = (absHref || "").split("#")[0];
    return here === there;
  }, [absHref]);

  const [embed, setEmbed] = useState(launch === "embed" && !isSelf);
  if (!href) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <a
          className="px-3 py-2 rounded-lg bg-indigo-600 text-white"
          href={absHref}
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>
        <button
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 disabled:opacity-50"
          onClick={() => setEmbed((v) => !v)}
          disabled={isSelf}
          title={isSelf ? "Cannot embed the current page" : ""}
        >
          {embed ? "Close Embed" : "Embed Here"}
        </button>
      </div>

      {embed && (
        <div className="w-full h-[70vh] rounded-xl overflow-hidden border border-zinc-800">
          <iframe title="Tool" src={absHref} className="w-full h-full" />
        </div>
      )}

      {isSelf && (
        <p className="text-sm text-zinc-400">
          (Embedding disabled because the link resolves to this same page. The “Open Tool” button works.)
        </p>
      )}
    </div>
  );
}
