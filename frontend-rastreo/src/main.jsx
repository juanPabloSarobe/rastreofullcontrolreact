import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ContextProvider } from "./context/Context.jsx";
import { CssBaseline } from "@mui/material";

// Añadir esto justo antes de renderizar tu aplicación
function updateHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", updateHeight);
window.addEventListener("orientationchange", updateHeight);
updateHeight();

createRoot(document.getElementById("root")).render(
  <ContextProvider>
    <CssBaseline />
    <App />
  </ContextProvider> 
);
