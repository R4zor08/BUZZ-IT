import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deletePost,
  fetchPosts,
  markPostComplete,
  type PostDTO,
} from "../api/client";
import { CATEGORY_LABELS, PRIORITY_LABELS } from "../constants/enums";

export function PostsPage() {
  const [items, setItems] = useState<PostDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await fetchPosts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete(id: string) {
    if (!window.confirm("Delete this post?")) return;
    setError(null);
    try {
      await deletePost(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  async function onMarkComplete(id: string) {
    setError(null);
    try {
      await markPostComplete(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update post.");
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Posts</h1>
        <Link to="/posts/new" className="btn btn-primary">
          New post
        </Link>
      </div>
      <p className="muted" style={{ marginTop: "-0.5rem" }}>
        Sorted by newest first (<code>createdAt</code> descending).
      </p>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="list">
          {items.length === 0 ? (
            <p className="muted">No posts yet. Create one to get started.</p>
          ) : (
            items.map((p) => (
              <article key={p.id} className="item">
                <div className="item-head">
                  <div>
                    <h2>{p.title}</h2>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {CATEGORY_LABELS[p.category] ?? p.category} · {PRIORITY_LABELS[p.priority] ?? p.priority}
                      {p.isCompleted ? " · Done" : ""}
                    </div>
                  </div>
                  <div className="actions">
                    {!p.isCompleted && (
                      <button type="button" className="btn" onClick={() => void onMarkComplete(p.id)}>
                        Mark complete
                      </button>
                    )}
                    <Link to={`/posts/${p.id}/edit`} className="btn btn-ghost">
                      Edit
                    </Link>
                    <button type="button" className="btn btn-danger" onClick={() => void onDelete(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{p.content}</p>
              </article>
            ))
          )}
        </div>
      )}
    </>
  );
}
