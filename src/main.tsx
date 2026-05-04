// ─────────────────────────────────────────────────────────────
// src/main.tsx
// GreenBuild v3.0 — Point d'entrée React 19
// ─────────────────────────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot }  from "react-dom/client";
import App             from "./App";
import "./index.css";

// Initialiser  le thème avant le premier rendu (évite le flash)
const saved    = localStorage.getItem("greenbuild-theme");
const prefers  = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (saved === "dark" || (!saved && prefers)) {
  document.documentElement.classList.add("dark");
}

const root = document.getElementById("root");
if (!root) throw new Error("Élément #root introuvable dans index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);