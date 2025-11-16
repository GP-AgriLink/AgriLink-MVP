import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import App from "./App.jsx";
// --- 1. REMOVE CartProvider from here ---
// import { CartProvider } from "./context/CartContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* --- 2. REMOVE Wrapper from here --- */}
      <App />
    </BrowserRouter>
  </StrictMode>
);