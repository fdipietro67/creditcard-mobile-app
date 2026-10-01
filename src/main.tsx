import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { DemoConfigProvider, useDemoConfig } from "./config/DemoConfigProvider";
import PhoneApp from "./app/PhoneApp";
import { registerServiceWorker } from "./pwa";

const Builder = lazy(() => import("./builder/Builder"));

function DemoRoot() {
  const { ready } = useDemoConfig();
  // While a ?c= short link resolves, show nothing rather than flashing the default brand.
  return ready ? <PhoneApp /> : null;
}

const isBuilder = /^\/builder\/?$/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isBuilder ? (
      <Suspense fallback={null}>
        <Builder />
      </Suspense>
    ) : (
      <DemoConfigProvider>
        <DemoRoot />
      </DemoConfigProvider>
    )}
  </StrictMode>,
);

registerServiceWorker();
