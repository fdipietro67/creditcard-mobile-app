// Entry for the single-file offline build (standalone.html): the demo app only, no Builder,
// no service worker. The Builder injects window.__DEMO_CONFIG__ before download.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { DemoConfigProvider } from "./config/DemoConfigProvider";
import PhoneApp from "./app/PhoneApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoConfigProvider>
      <PhoneApp />
    </DemoConfigProvider>
  </StrictMode>,
);
