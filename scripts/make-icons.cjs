// Renders the PWA PNG icons from public/favicon.svg. Run: node scripts/make-icons.cjs
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
let pw;
try { pw = require("playwright"); } catch { pw = require(execSync("npm root -g").toString().trim() + "/playwright"); }
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "../public/favicon.svg"), "utf8");
  const b = await pw.chromium.launch();
  const p = await b.newPage();
  const render = async (file, size, pad, bg) => {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<body style="margin:0;background:${bg};display:grid;place-items:center;height:100vh">
      <div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace("<svg ", '<svg width="100%" height="100%" ')}</div></body>`);
    await p.screenshot({ path: path.join(__dirname, "../public", file), omitBackground: bg === "transparent" });
  };
  await render("pwa-192.png", 192, 0, "transparent");
  await render("pwa-512.png", 512, 0, "transparent");
  await render("pwa-maskable-512.png", 512, 72, "#0E1726");
  await render("apple-touch-icon.png", 180, 0, "#0E1726");
  await b.close();
})();
