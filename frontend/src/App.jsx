import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Products from "./pages/Products";
import RawMaterials from "./pages/RawMaterials";
import Production from "./pages/Production";

export default function App() {
  return (
    <BrowserRouter>
      <div className="topbar">
        <div className="container row" style={{ justifyContent: "space-between" }}>
          <div className="brand">
            <span>Autoflex Stock</span>
            <span className="badge">Demo</span>
          </div>

          <div className="nav">
            <Link to="/products">Products</Link>
            <Link to="/raw-materials">Raw Materials</Link>
            <Link to="/production">Production</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/production" element={<Production />} />
          <Route path="*" element={<Products />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
