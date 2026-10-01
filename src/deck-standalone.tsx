// Entry for the offline single-file deck (euronet-deck.html): the deck plus a packed copy of the
// single-file card app for the live demo slides. Opens from disk with no network.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import offlineAppB64 from "virtual:offline-app";
import { setOfflineApp } from "./deck/appSource";
import Deck from "./deck/Deck";

if (offlineAppB64) {
  const bytes = Uint8Array.from(atob(offlineAppB64), (c) => c.charCodeAt(0));
  setOfflineApp(new TextDecoder().decode(bytes));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Deck />
  </StrictMode>,
);
