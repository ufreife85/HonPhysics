// APChem/lessonViewer/src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Tabs, PromptBlock, Stepper, ToolLauncher } from "./UI.js";

// --- Tiny hash router: #/lessonId?view=overview
function parseHash() {
  const raw = window.location.hash || "";
  const noHash = raw.startsWith("#") ? raw.slice(1) : raw; // "/1_1moles?view=..."
  const [path, search = ""] = noHash.split("?");
  const lessonId = decodeURIComponent((path || "/").replace(/^\//, ""));
  const params = new URLSearchParams(search);
  const view = params.get("view") || "overview";
  return { lessonId, view };
}

function setHash({ lessonId, view }) {
  const qs = new URLSearchParams();
  if (view) qs.set("view", view);
  const next = `#/${encodeURIComponent(lessonId)}?${qs.toString()}`;
  if (window.location.hash !== next) window.location.hash = next;
}

function getBasePath() {
  // e.g. /lessonViewer/index.html  ->  /lessonViewer/
  return window.location.pathname.replace(/[^/]*$/, "");
}

export default function App() {
  const [route, setRoute] = useState(parseHash());
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep route in sync with hash
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Default to your pilot if no hash
  useEffect(() => {
    if (!route.lessonId) {
      setHash({ lessonId: "1_1moles", view: "overview" }); // pilot
    }
  }, [route.lessonId]);

  const basePath = useMemo(() => getBasePath(), []);
  const lessonUrl = useMemo(
    () => `${basePath}lessons/${route.lessonId}/lesson.json`, // public/lessons/<id>/lesson.json
    [basePath, route.lessonId]
  );

  // Fetch lesson.json
  useEffect(() => {
    if (!route.lessonId) return;
    setLoading(true);
    setError("");
    setLesson(null);
    const ctrl = new AbortController();
    fetch(lessonUrl, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${lessonUrl}`);
        return r.json();
      })
      .then((data) => setLesson(data))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || String(e));
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [lessonUrl]);

  // Tabs: use lesson.nav if present; else infer from views
  const nav = useMemo(() => {
    if (!lesson) return [];
    const defaultOrder = ["overview", "notes", "interactive", "examples", "practice", "images"];

    return Array.isArray(lesson.nav) && lesson.nav.length
      ? lesson.nav
      : defaultOrder.filter((k) => lesson.views?.[k] != null);
  }, [lesson]);

  // If current view isn't valid, redirect to first tab
  useEffect(() => {
    if (!lesson || !nav.length) return;
    if (!nav.includes(route.view)) {
      setHash({ lessonId: route.lessonId, view: nav[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, nav]);

  // Render a single tab
  const renderView = () => {
    if (!lesson) return null;
// fallback: if route is “interactive” but JSON still uses “tool”, use it
const v = lesson.views?.[route.view] ?? (route.view === "interactive" ? lesson.views?.tool : undefined);

    const imagesBase = `${basePath}lessons/${route.lessonId}/images/`;

    // Notes: support stepper or prompt lines
    if (route.view === "notes") {
      if (v && typeof v === "object" && Array.isArray(v.steps)) {
        return (
          <Stepper
            key={`${route.lessonId}-notes`}
            steps={v.steps}
            imagesBase={imagesBase}
          />
        );
      }
      if (Array.isArray(v)) {
        return <PromptBlock items={v} imagesBase={imagesBase} />;
      }
    }

    // Overview = prompt lines
    if (route.view === "overview" && Array.isArray(v)) {
      return <PromptBlock items={v} imagesBase={imagesBase} />;
    }

    // Examples/Practice = stepper
    if ((route.view === "examples" || route.view === "practice") && v && typeof v === "object") {
      const steps = Array.isArray(v.steps) ? v.steps : [];
      return (
        <Stepper
          key={`${route.lessonId}-${route.view}`}
          steps={steps}
          imagesBase={imagesBase}
        />
      );
    }

    // Images grid
    if (route.view === "images" && Array.isArray(v)) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {v.map((file, i) => (
            <img
              key={i}
              src={`${imagesBase}${file}`}
              alt={file}
              className="w-full h-auto rounded-xl shadow"
            />
          ))}
        </div>
      );
    }

    // Tool launcher
// Interactive / Tool launcher (supports both keys)
if ((route.view === "interactive" || route.view === "tool") && v && typeof v === "object") {
  return <ToolLauncher tool={v} />;
}


    return <div className="text-sm opacity-70">Nothing to show for this tab.</div>;
  }; // <-- closes renderView()

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 pb-24">
        {/* Sticky page header */}
        <header className="sticky top-0 z-40 -mx-4 mb-0 border-b border-white/10 bg-neutral-950/90 backdrop-blur px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {lesson?.title || "Lesson Viewer"}
          </h1>
          <p className="text-xs opacity-70">
            {route.lessonId ? `ID: ${route.lessonId}` : "Choose a lesson"}
          </p>
        </header>

        {/* NEW: Sticky Tabs bar under header */}
        {lesson && (
          <div className="sticky top-14 z-30 -mx-4 border-b border-white/10 bg-neutral-950/85 backdrop-blur px-4 py-2">
            <Tabs
              items={nav}
              active={route.view}
              onChange={(next) => setHash({ lessonId: route.lessonId, view: next })}
            />
          </div>
        )}

        {/* Content */}
        <main className="mt-6">{renderView()}</main>
        {/* extra bottom padding is in container pb-24 so floating controls won't overlap content */}
      </div>
    </div>
  );
}
