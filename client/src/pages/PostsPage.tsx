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
        <div className="stack title-block">
          <h1>Posts</h1>
          <p className="muted page-subtitle">
            Sorted by newest first (<code>createdAt</code> descending).
          </p>
        </div>
        <Link to="/posts/new" className="btn btn-primary">
          New post
        </Link>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="list">
          {items.length === 0 ? (
            <p className="empty-state">No posts yet. Create one to get started.</p>
          ) : (
            items.map((p) => (
              <article key={p.id} className="item">
                <div className="item-head">
                  <div>
                    <h2>{p.title}</h2>
                    <div className="meta-line">
                      <span className="badge">{CATEGORY_LABELS[p.category] ?? p.category}</span>
                      <span className="badge badge-accent">{PRIORITY_LABELS[p.priority] ?? p.priority}</span>
                      {p.isCompleted && <span className="badge badge-success">Done</span>}
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
                <p className="item-content">{p.content}</p>
              </article>
            ))
          )}
        </div>
      )}
    </>
  );
}
