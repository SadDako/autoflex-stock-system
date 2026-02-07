import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export default function ProductMaterialsManager({ product, onChanged }) {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [rawMaterialId, setRawMaterialId] = useState("");
  const [quantityRequired, setQuantityRequired] = useState(1);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function loadRawMaterials() {
    const res = await api.get("/RawMaterials");
    const sorted = [...res.data].sort((a, b) => (a.code ?? "").localeCompare(b.code ?? ""));
    setRawMaterials(sorted);
    if (sorted.length > 0 && !rawMaterialId) setRawMaterialId(sorted[0].id);
  }

  useEffect(() => {
    loadRawMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const materials = product.materials || [];

  const usedRawMaterialIds = useMemo(() => new Set(materials.map((m) => m.rawMaterialId)), [materials]);

  const availableForAdd = useMemo(
    () => rawMaterials.filter((rm) => !usedRawMaterialIds.has(rm.id)),
    [rawMaterials, usedRawMaterialIds]
  );

  useEffect(() => {
    if (!rawMaterialId && availableForAdd.length > 0) setRawMaterialId(availableForAdd[0].id);
  }, [availableForAdd, rawMaterialId]);

  async function addMaterial(e) {
    e.preventDefault();
    if (!rawMaterialId) return;

    setLoading(true);
    try {
      await api.post(`/Products/${product.id}/materials`, {
        rawMaterialId,
        quantityRequired: Number(quantityRequired),
      });

      setMessage("Material added.");
      setTimeout(() => setMessage(null), 2000);

      await onChanged();
      await loadRawMaterials();
    } finally {
      setLoading(false);
    }
  }

  async function removeMaterial(rmId) {
    if (!confirm("Remove this material from the product?")) return;

    setLoading(true);
    try {
      await api.delete(`/Products/${product.id}/materials/${rmId}`);

      setMessage("Material removed.");
      setTimeout(() => setMessage(null), 2000);

      await onChanged();
      await loadRawMaterials();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 12, background: "var(--panel-2)" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Materials</h3>
        <div className="muted">
          Product: <strong>{product.name}</strong>
        </div>
      </div>

      <div className="hr" />

      {message && (
        <div className="card" style={{ padding: 10, marginBottom: 12 }}>
          {message}
        </div>
      )}

      <form onSubmit={addMaterial} className="row">
        <select
          value={rawMaterialId}
          onChange={(e) => setRawMaterialId(e.target.value)}
          disabled={loading || availableForAdd.length === 0}
        >
          {availableForAdd.map((rm) => (
            <option key={rm.id} value={rm.id}>
              {rm.code} - {rm.name} (stock: {rm.stockQuantity})
            </option>
          ))}
        </select>

        <input
          className="input"
          type="number"
          min="1"
          value={quantityRequired}
          onChange={(e) => setQuantityRequired(e.target.value)}
          style={{ width: 160 }}
          disabled={loading || availableForAdd.length === 0}
        />

        <button className="btn" type="submit" disabled={loading || availableForAdd.length === 0}>
          {loading ? "Saving..." : "Add material"}
        </button>

        {availableForAdd.length === 0 && (
          <span className="muted">All raw materials are already linked.</span>
        )}
      </form>

      <div className="hr" />

      <div className="muted" style={{ marginBottom: 8 }}>
        Current associations
      </div>

      {materials.length === 0 ? (
        <div className="muted">No materials linked yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Raw material</th>
              <th>Qty required</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.rawMaterialId}>
                <td>
                  {m.rawMaterial?.code} - {m.rawMaterial?.name}
                </td>
                <td>{m.quantityRequired}</td>
                <td align="right">
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => removeMaterial(m.rawMaterialId)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
