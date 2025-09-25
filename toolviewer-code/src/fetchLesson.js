export async function fetchLesson(id) {
    const ROOT = import.meta.env.BASE_URL || '/';
    const base = `${ROOT}lessons/${id}/lesson.json`;

    const res = await fetch(base);
    if (!res.ok) throw new Error(`Lesson not found: ${id}`);
    const lesson = await res.json();
  
    async function load(view) {
      const v = lesson.views[view];
      if (!v) return null;
      if (v.type === "md" && v.text) return v;
      if (v.src) {
        const r = await fetch(new URL(v.src, new URL(base, window.location.href)));
        const data = await r.json();
        return { ...v, data };
      }
      return v;
    }
  
    return { lesson, load };
  }
  