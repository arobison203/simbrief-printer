import React from "react";
import ReactDOM from "react-dom/client";
import { AppDaisy } from "./AppDaisy.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppDaisy />
  </React.StrictMode>,
);
