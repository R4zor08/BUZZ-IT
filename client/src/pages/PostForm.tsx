import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createPost, fetchPost, updatePost } from "../api/client";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../constants/enums";

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNew = location.pathname.endsWith("/new") || !id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(0);
  const [priority, setPriority] = useState(0);
  const [dueLocal, setDueLocal] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await fetchPost(id);
        if (cancelled) return;
        setTitle(p.title);
        setContent(p.content);
        setCategory(p.category);
        setPriority(p.priority);
        setDueLocal(toLocalDatetimeValue(p.dueDate));
        setIsCompleted(p.isCompleted);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load post.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  function validate(): string | null {
    if (title.trim().length < 1 || title.length > 100) return "Title must be 1–100 characters.";
    if (content.length < 1 || content.length > 10000) return "Content must be 1–10,000 characters.";
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    setError(null);
    const body: Record<string, unknown> = {
      title: title.trim(),
      content,
      category,
      priority,
      isCompleted,
    };
    if (dueLocal) {
      body.dueDate = new Date(dueLocal).toISOString();
    } else if (!isNew) {
      body.dueDate = null;
    }

    try {
      if (isNew) {
        await createPost(body);
      } else if (id) {
        await updatePost(id, body);
      }
      navigate("/posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!isNew && loading) {
    return <p className="muted">Loading…</p>;
  }

  return (
    <div className="card stack">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <h1>{isNew ? "New post" : "Edit post"}</h1>
        <Link to="/posts" className="btn btn-ghost">
          Back
        </Link>
      </div>
      {error && <div className="error-banner">{error}</div>}
      <form className="stack" onSubmit={(e) => void onSubmit(e)}>
        <label className="field">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} required />
        </label>
        <label className="field">
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={10000} required />
        </label>
        <div className="row">
          <label className="field">
            Category
            <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Priority
            <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          Due date (optional)
          <input type="datetime-local" value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
        </label>
        <label className="field checkbox-field">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
          <span>Completed</span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
