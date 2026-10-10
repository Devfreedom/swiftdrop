import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./auth.css";
import App from "./App.jsx";
import WakeBanner from "./components/WakeBanner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WakeBanner />
    <App />
  </StrictMode>
);
