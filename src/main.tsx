import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/inter";
import "./styles/index.css";
import { DemoConfigProvider, useDemoConfig } from "./config/DemoConfigProvider";
import PhoneApp from "./app/PhoneApp";

function Root() {
  const { ready } = useDemoConfig();
  // While a ?c= short link resolves, show nothing rather than flashing the default brand.
  return ready ? <PhoneApp /> : null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoConfigProvider>
      <Root />
    </DemoConfigProvider>
  </StrictMode>,
);
