import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  Package,
  Users as UsersIcon,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { resetDemo } from "./api";
import { useCreateUser, useDeleteUser, useProducts, useUsers } from "./hooks";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "INR" }).format(
    amount,
  );

function StatusBadge({ tone = "neutral", children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function ErrorNotice({ message, onRetry }) {
  return (
    <div className="error-alert">
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
      <div className="error-content">
        <h4>Request failed</h4>
        <p>{message}</p>
        {onRetry && (
          <button type="button" className="btn-link" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

function Products() {
  const [search, setSearch] = useState("");
  const [fail, setFail] = useState(
    () => localStorage.getItem("ql-fail-products") === "true",
  );
  const q = useProducts(search);

  const toggleFail = (checked) => {
    setFail(checked);
    localStorage.setItem("ql-fail-products", JSON.stringify(checked));
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Product Inventory</h2>
          <p>Browse catalogue items and monitor real-time stock levels</p>
        </div>
        <div className="card-actions">
          <label
            className="toggle-label"
            title="Simulates a service error when fetching products"
          >
            <input
              type="checkbox"
              checked={fail}
              onChange={(e) => toggleFail(e.target.checked)}
            />
            <span>Simulate API Error</span>
          </label>
        </div>
      </div>

      <div className="card-body">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
            />
            {search && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            <RefreshCw size={14} className={q.isFetching ? "spin" : ""} />
            {q.isFetching ? "Syncing..." : "Refresh"}
          </button>
        </div>

        <div className="results-meta">
          <span>
            {q.data?.length ?? 0} {q.data?.length === 1 ? "item" : "items"}{" "}
            found
          </span>
          {q.isFetching && (
            <span className="syncing-badge">
              <LoaderCircle size={12} className="spin" />
              Background sync
            </span>
          )}
        </div>

        {q.isPending ? (
          <div className="loading-state">
            <LoaderCircle size={24} className="spin text-primary" />
            <p>Loading catalogue items...</p>
          </div>
        ) : q.isError ? (
          <ErrorNotice message={q.error.message} onRetry={() => q.refetch()} />
        ) : (
          <>
            <div className="product-grid">
              {q.data.map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="product-header">
                    <span className="product-icon-wrap">{p.icon}</span>
                    <span className="category-tag">{p.category}</span>
                  </div>
                  <div className="product-info">
                    <div className="product-title-row">
                      <h3>{p.name}</h3>
                      <span className="price">{formatCurrency(p.price)}</span>
                    </div>
                    <p className="description">{p.description}</p>
                  </div>
                  <div className="product-footer">
                    <span className="stock-count">{p.stock} in stock</span>
                    <StatusBadge tone="success">In Stock</StatusBadge>
                  </div>
                </article>
              ))}
            </div>

            {q.data.length === 0 && (
              <div className="empty-state">
                <Package size={32} className="empty-icon" />
                <h3>No matching products</h3>
                <p>Try searching for a different keyword or category.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Users() {
  const qc = useQueryClient();
  const q = useUsers();
  const create = useCreateUser();
  const del = useDeleteUser();
  const [form, setForm] = useState({ name: "", email: "", role: "Viewer" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [failCreate, setFailCreate] = useState(
    () => localStorage.getItem("ql-fail-create") === "true",
  );
  const [failDelete, setFailDelete] = useState(
    () => localStorage.getItem("ql-fail-delete") === "true",
  );
  const [deletingId, setDeletingId] = useState(null);

  const toggleFail = (key, setter, value) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const name = form.name.trim();
    const email = form.email.trim();

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await create.mutateAsync({ name, email, role: form.role });
      setForm({ name: "", email: "", role: "Viewer" });
      setSuccess(`${name} has been added to the team.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(user) {
    if (!window.confirm(`Are you sure you want to remove ${user.name}?`))
      return;
    setDeletingId(user.id);
    setError("");
    setSuccess("");
    try {
      await del.mutateAsync(user.id);
      setSuccess(`${user.name} was removed from the team.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Team Members</h2>
          <p>Manage workspace access, team roles, and permissions</p>
        </div>
        <div className="card-actions">
          <label
            className="toggle-label"
            title="Simulates a failure when adding a new user"
          >
            <input
              type="checkbox"
              checked={failCreate}
              onChange={(e) =>
                toggleFail("ql-fail-create", setFailCreate, e.target.checked)
              }
            />
            <span>Simulate Create Error</span>
          </label>
          <label
            className="toggle-label"
            title="Simulates a failure when deleting a user to demonstrate optimistic rollback"
          >
            <input
              type="checkbox"
              checked={failDelete}
              onChange={(e) =>
                toggleFail("ql-fail-delete", setFailDelete, e.target.checked)
              }
            />
            <span>Simulate Delete Error (Rollback)</span>
          </label>
        </div>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={16} />
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <div className="team-layout">
          <div className="team-list-section">
            <div className="sub-header">
              <h3>Directory ({q.data?.length ?? 0})</h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => q.refetch()}
                disabled={q.isFetching}
                title="Refresh team directory"
                aria-label="Refresh team directory"
              >
                <RefreshCw size={14} className={q.isFetching ? "spin" : ""} />
              </button>
            </div>

            {q.isPending ? (
              <div className="loading-state">
                <LoaderCircle size={20} className="spin text-primary" />
                <p>Loading directory...</p>
              </div>
            ) : q.isError ? (
              <ErrorNotice
                message={q.error.message}
                onRetry={() => q.refetch()}
              />
            ) : (
              <div className="member-list">
                {(q.data ?? []).map((u) => (
                  <div
                    key={u.id}
                    className={`member-row ${deletingId === u.id ? "is-deleting" : ""}`}
                  >
                    <div className="avatar">
                      {u.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="member-details">
                      <span className="member-name">{u.name}</span>
                      <span className="member-email">{u.email}</span>
                    </div>
                    <StatusBadge
                      tone={u.role === "Admin" ? "primary" : "neutral"}
                    >
                      {u.role}
                    </StatusBadge>
                    <button
                      type="button"
                      className="btn-trash"
                      onClick={() => remove(u)}
                      disabled={del.isPending}
                      aria-label={`Remove ${u.name}`}
                      title={`Remove ${u.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {q.data?.length === 0 && (
                  <div className="empty-state">
                    <p>No members in this workspace yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="team-form-section">
            <div className="sub-header">
              <h3>Add Team Member</h3>
            </div>
            <form onSubmit={submit} className="member-form">
              <div className="form-group">
                <label htmlFor="member-name">Full Name</label>
                <input
                  id="member-name"
                  type="text"
                  required
                  minLength={2}
                  placeholder="e.g. Jordan Lee"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="member-email">Email Address</label>
                <input
                  id="member-email"
                  type="email"
                  required
                  placeholder="jordan@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="member-role">Assigned Role</label>
                <select
                  id="member-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={create.isPending}
              >
                {create.isPending ? (
                  <>
                    <LoaderCircle size={14} className="spin" />
                    Adding Member...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Add Member
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const qc = useQueryClient();
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");

  async function reset() {
    if (!confirm("Reset demo data and clear simulated failure switches?"))
      return;
    setResetting(true);
    await resetDemo();
    await qc.clear();
    setMessage("Demo data has been reset to defaults.");
    setResetting(false);
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand">
            <div className="brand-badge">
              <Package size={18} />
            </div>
            <span className="brand-name">Storefront Console</span>
            <span className="env-badge">Production Demo</span>
          </div>
          <div className="navbar-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={reset}
              disabled={resetting}
            >
              <RotateCcw size={14} className={resetting ? "spin" : ""} />
              {resetting ? "Resetting..." : "Reset Demo Data"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Operations Dashboard</h1>
            <p>
              Manage product catalogue inventory and team member permissions.
            </p>
          </div>
        </div>

        {message && (
          <div className="banner banner-info" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <Products />
          <Users />
        </div>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <span>Storefront Console · Real-Time Operations</span>
          <span>React + Vite</span>
        </div>
      </footer>
    </div>
  );
}
