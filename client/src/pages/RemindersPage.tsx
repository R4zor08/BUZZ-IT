import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDebounced } from "../hooks/useDebounced";
import {
  deleteReminder,
  fetchReminders,
  markReminderDone,
  type ReminderDTO,
} from "../api/client";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../constants/enums";

export function RemindersPage() {
  const [items, setItems] = useState<ReminderDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 400);
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [completed, setCompleted] = useState<string>("");

  const queryParams = useMemo(() => {
    const p: Record<string, string | undefined> = {};
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (category !== "") p.category = category;
    if (priority !== "") p.priority = priority;
    if (completed !== "") p.isCompleted = completed;
    return p;
  }, [debouncedSearch, category, priority, completed]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await fetchReminders(queryParams));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this reminder?")) return;
    setError(null);
    try {
      await deleteReminder(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  async function onMarkDone(id: string) {
    setError(null);
    try {
      await markReminderDone(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update reminder.");
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Reminders</h1>
        <Link to="/reminders/new" className="btn btn-primary">
          New reminder
        </Link>
      </div>
      <p className="muted" style={{ marginTop: "-0.5rem" }}>
        Filter by search (title and description), category, priority, or completion.
      </p>

      <div className="card stack" style={{ marginBottom: "1rem" }}>
        <div className="row">
          <label className="field" style={{ flex: 2, minWidth: 200 }}>
            Search
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or description"
            />
          </label>
          <label className="field">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Any</option>
              <option value="0">General</option>
              <option value="1">Work</option>
              <option value="2">Personal</option>
              <option value="3">Ideas</option>
              <option value="4">Urgent</option>
            </select>
          </label>
          <label className="field">
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">Any</option>
              <option value="0">Low</option>
              <option value="1">Medium</option>
              <option value="2">High</option>
            </select>
          </label>
          <label className="field">
            Status
            <select value={completed} onChange={(e) => setCompleted(e.target.value)}>
              <option value="">Any</option>
              <option value="false">Open</option>
              <option value="true">Done</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="list">
          {items.length === 0 ? (
            <p className="muted">No reminders match your filters.</p>
          ) : (
            items.map((r) => (
              <article key={r.id} className="item">
                <div className="item-head">
                  <div>
                    <h2>{r.title}</h2>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {new Date(r.time).toLocaleString()} · {CATEGORY_LABELS[r.category] ?? r.category} ·{" "}
                      {PRIORITY_LABELS[r.priority] ?? r.priority}
                      {r.isCompleted ? " · Done" : ""}
                    </div>
                  </div>
                  <div className="actions">
                    {!r.isCompleted && (
                      <button type="button" className="btn" onClick={() => void onMarkDone(r.id)}>
                        Mark done
                      </button>
                    )}
                    <Link to={`/reminders/${r.id}/edit`} className="btn btn-ghost">
                      Edit
                    </Link>
                    <button type="button" className="btn btn-danger" onClick={() => void onDelete(r.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                {r.description ? (
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.description}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      )}
    </>
  );
}
