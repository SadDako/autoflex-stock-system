import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export default function Production() {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/Production");
      setData(res.data);
      setMessage("Production suggestion updated.");
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalQty = useMemo(() => {
    if (!data?.items) return 0;
    return data.items.reduce((acc, i) => acc + (i.quantityToProduce ?? 0), 0);
  }, [data]);

  return (
    <div>
      <h1 className="h1">Production</h1>
      <p className="sub">
        Suggested production plan based on current stock, prioritizing higher value products.
      </p>

      {message && (
        <div className="card" style={{ marginBottom: 14 }}>
          {message}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h3 style={{ marginTop: 0, marginBottom: 0 }}>Suggestion</h3>
            <button className="btn btn-ghost" type="button" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="hr" />

          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="muted">
                    Calculating suggestion...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="muted">
                    No production possible with current stock.
                  </td>
                </tr>
              ) : (
                data.items.map((i) => (
                  <tr key={i.productId}>
                    <td>{i.productName}</td>
                    <td>{i.productCode}</td>
                    <td>{i.quantityToProduce}</td>
                    <td>
                      {(i.unitPrice ?? 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </td>
                    <td>
                      {(i.totalValue ?? 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && data && data.items.length > 0 && (
            <>
              <div className="hr" />
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="muted">Total items to produce</div>
                <strong>{totalQty}</strong>
              </div>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                <div className="muted">Grand total value</div>
                <strong>
                  {(data.grandTotalValue ?? 0).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </strong>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <div className="kpi">
            <div className="label">Rule</div>
            <div className="value">Greedy by value</div>
            <div className="muted">
              Products are evaluated in descending unit price order. When raw materials are shared,
              higher price products consume stock first.
            </div>
          </div>

          <div className="hr" />

          <div className="muted">
            Tip: If production is empty, verify stock on <strong>Raw Materials</strong> and product
            composition on <strong>Products</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
