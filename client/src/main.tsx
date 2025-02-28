import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./providers/app-providers";
import App from "./App";
import "./index.css";

// Initialize analytics if available
import { initAnalytics } from "./lib/firebase";
if (typeof window !== "undefined") {
  initAnalytics();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
