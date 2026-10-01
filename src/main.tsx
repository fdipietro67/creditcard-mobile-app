import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { DemoConfigProvider, useDemoConfig } from "./config/DemoConfigProvider";
import PhoneApp from "./app/PhoneApp";
import { registerServiceWorker } from "./pwa";

const Builder = lazy(() => import("./builder/Builder"));
const Deck = lazy(() => import("./deck/Deck"));

function DemoRoot() {
  const { ready } = useDemoConfig();
  // While a ?c= short link resolves, show nothing rather than flashing the default brand.
  return ready ? <PhoneApp /> : null;
}

const isBuilder = /^\/builder\/?$/.test(window.location.pathname);
const isDeck = /^\/deck\/?$/.test(window.location.pathname);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isBuilder || isDeck ? (
      <Suspense fallback={null}>{isDeck ? <Deck /> : <Builder />}</Suspense>
    ) : (
      <DemoConfigProvider>
        <DemoRoot />
      </DemoConfigProvider>
    )}
  </StrictMode>,
);

registerServiceWorker();
