import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function RawMaterials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", stockQuantity: "" });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/RawMaterials");
      // Classificar por código para uma visualização estável
      const sorted = [...res.data].sort((a, b) => (a.code ?? "").localeCompare(b.code ?? ""));
      setItems(sorted);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/RawMaterials", {
        code: form.code.trim(),
        name: form.name.trim(),
        stockQuantity: Number(form.stockQuantity || 0),
      });

      setForm({ code: "", name: "", stockQuantity: "" });

      setMessage("Raw material created successfully.");
      setTimeout(() => setMessage(null), 3000);

      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this raw material?")) return;

    await api.delete(`/RawMaterials/${id}`);

    setMessage("Raw material deleted.");
    setTimeout(() => setMessage(null), 3000);

    load();
  }

  const isValid = form.code.trim() && form.name.trim();

  const totalStock = items.reduce((acc, r) => acc + (r.stockQuantity ?? 0), 0);

  return (
    <div>
      <h1 className="h1">Raw Materials</h1>
      <p className="sub">Manage raw materials and available stock.</p>

      {message && (
        <div className="card" style={{ marginBottom: 14 }}>
          {message}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Create raw material</h3>

            <div className="kpi" style={{ padding: 10, minWidth: 220 }}>
              <div className="label">Total stock units</div>
              <div className="value">{totalStock}</div>
            </div>
          </div>

          <div className="hr" />

          <form onSubmit={create} className="row">
            <input
              className="input"
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              className="input"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input"
              placeholder="Stock quantity"
              type="number"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              style={{ width: 180 }}
              min="0"
            />
            <button className="btn" type="submit" disabled={!isValid || submitting}>
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>

          <div className="hr" />

          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="muted">
                    Loading raw materials...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="muted">
                    No raw materials yet.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.code}</td>
                    <td>{r.name}</td>
                    <td>{r.stockQuantity}</td>
                    <td align="right">
                      <button className="btn btn-danger" type="button" onClick={() => remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="kpi">
            <div className="label">How stock is used</div>
            <div className="value">Based on BOM</div>
            <div className="muted">
              Production suggestion consumes a virtual stock based on each product&apos;s bill of materials.
            </div>
          </div>

          <div className="hr" />

          <div className="muted">
            Tip: After creating raw materials, go to <strong>Products</strong> and link them using{" "}
            <strong>Manage materials</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
