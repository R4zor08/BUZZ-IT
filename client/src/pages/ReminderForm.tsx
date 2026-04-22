import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { createReminder, fetchReminder, updateReminder } from "../api/client";
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../constants/enums";

function toLocalDatetimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ReminderForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNew = location.pathname.endsWith("/new") || !id;

  const [title, setTitle] = useState("");
  const [timeLocal, setTimeLocal] = useState("");
  const [description, setDescription] = useState("");
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
        const r = await fetchReminder(id);
        if (cancelled) return;
        setTitle(r.title);
        setTimeLocal(toLocalDatetimeValue(r.time));
        setDescription(r.description);
        setCategory(r.category);
        setPriority(r.priority);
        setDueLocal(toLocalDatetimeValue(r.dueDate));
        setIsCompleted(r.isCompleted);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load reminder.");
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
    if (!timeLocal) return "Schedule time is required.";
    if (description.length > 2000) return "Description must be at most 2,000 characters.";
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
      time: new Date(timeLocal).toISOString(),
      description,
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
        await createReminder(body);
      } else if (id) {
        await updateReminder(id, body);
      }
      navigate("/reminders");
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
        <h1>{isNew ? "New reminder" : "Edit reminder"}</h1>
        <Link to="/reminders" className="btn btn-ghost">
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
          Time
          <input
            type="datetime-local"
            value={timeLocal}
            onChange={(e) => setTimeLocal(e.target.value)}
            required
          />
        </label>
        <label className="field">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
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
        <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
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
