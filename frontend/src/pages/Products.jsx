import { Fragment, useEffect, useState } from "react";
import { api } from "../api/client";
import ProductMaterialsManager from "./ProductMaterialsManager";

export default function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", price: "" });
  const [openProductId, setOpenProductId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/Products");
      const sorted = [...res.data].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
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
      await api.post("/Products", {
        code: form.code.trim(),
        name: form.name.trim(),
        price: Number(form.price || 0),
      });

      setForm({ code: "", name: "", price: "" });

      setMessage("Product created successfully.");
      setTimeout(() => setMessage(null), 3000);

      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;

    await api.delete(`/Products/${id}`);
    if (openProductId === id) setOpenProductId(null);

    setMessage("Product deleted.");
    setTimeout(() => setMessage(null), 3000);

    load();
  }

  const isValid = form.code.trim() && form.name.trim();

  return (
    <div>
      <h1 className="h1">Products</h1>
      <p className="sub">Manage products and link required raw materials.</p>

      {message && (
        <div className="card" style={{ marginBottom: 14 }}>
          {message}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Create product</h3>
            <div className="kpi" style={{ padding: 10, minWidth: 180 }}>
              <div className="label">Total products</div>
              <div className="value">{items.length}</div>
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
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={{ width: 140 }}
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
                <th>Price</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="muted">
                    Loading products...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="muted">
                    No products yet.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <Fragment key={p.id}>
                    <tr>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>
                        {(p.price ?? 0).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </td>
                      <td align="right">
                        <div className="row" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() =>
                              setOpenProductId(openProductId === p.id ? null : p.id)
                            }
                          >
                            {openProductId === p.id ? "Close" : "Manage materials"}
                          </button>

                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => remove(p.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {openProductId === p.id && (
                      <tr>
                        <td colSpan="4">
                          <ProductMaterialsManager product={p} onChanged={load} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="kpi">
            <div className="label">Production priority</div>
            <div className="value">Higher price wins</div>
            <div className="muted">
              The suggestion endpoint prioritizes products with higher unit price when raw
              materials are shared.
            </div>
          </div>

          <div className="hr" />

          <div className="muted">
            Tip: create raw materials first, then link them to a product using{" "}
            <strong>Manage materials</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
