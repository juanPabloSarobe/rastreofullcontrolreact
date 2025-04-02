import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ContextProvider } from "./context/Context.jsx";
import { CssBaseline } from "@mui/material";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ContextProvider>
      <CssBaseline />
      <App />
    </ContextProvider>
  </StrictMode>
);
