/* ==========================================================================
   MISSION OF SUCCESS - THE TESTS

   Run them with:   node tests/run.js

   Nothing to install. Two kinds of check:

   1. PHYSICS (tests/physics.js) - runs the game's flight engine straight out of
      "Mission of Success.html" in Node. This is the one that keeps the panel
      honest: it flies thousands of rockets and checks every warning against
      what really happened.

   2. IN THE BROWSER (tests/browser/*.js) - opens the real page in headless
      Chrome or Edge, clicks through it, and reads back PASS / FAIL lines.
      Each test gets a brand-new browser profile, so saved scores and rockets
      never leak between tests. If no browser is found these are skipped
      (and the run says so). Point CHROME at one to choose:
          CHROME="/path/to/chrome" node tests/run.js

   Run it after every change. It has caught a real bug every single time.
   ========================================================================== */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, "..");
const GAME = path.join(ROOT, "Mission of Success.html");
const html = fs.readFileSync(GAME, "utf8");

let passed = 0, failed = 0;
function report(group, lines) {
  console.log("\n== " + group + " ==");
  for (const line of lines) {
    console.log("  " + line);
    if (line.startsWith("PASS")) passed++;
    else if (line.startsWith("FAIL") || line.startsWith("ERROR")) failed++;
  }
}

// ---- 1. physics ----
const t0 = Date.now();
report("physics", require("./physics.js").run(html));
console.log("  (" + ((Date.now() - t0) / 1000).toFixed(1) + " s)");

// ---- 2. in the browser ----
function findBrowser() {
  if (process.env.CHROME) return process.env.CHROME;
  const local = process.env.LOCALAPPDATA || "";
  const spots = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(local, "Google\\Chrome\\Application\\chrome.exe"),
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
  ];
  return spots.find(p => p && fs.existsSync(p)) || null;
}

const browser = findBrowser();
const dir = path.join(__dirname, "browser");
if (!browser) {
  console.log("\n== browser ==\n  SKIPPED - no Chrome or Edge found. Set CHROME=/path/to/browser to run these.");
} else {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "jupi-tests-"));
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js")).sort()) {
    const t1 = Date.now();
    // the game with the test glued on the end, in a page of its own
    const page = path.join(work, file.replace(/\.js$/, ".html"));
    fs.writeFileSync(page, html + "\n<script>\n" + fs.readFileSync(path.join(dir, file), "utf8") + "\n</script>\n");
    const profile = fs.mkdtempSync(path.join(work, "profile-"));
    let dom = "";
    try {
      dom = execFileSync(browser, [
        "--headless=new", "--disable-gpu", "--no-first-run", "--disable-background-networking",
        "--user-data-dir=" + profile, "--virtual-time-budget=180000", "--dump-dom",
        pathToFileURL(page).href + "#1",
      ], { encoding: "utf8", timeout: 300000, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 << 20 });
    } catch (e) { dom = String(e.stdout || ""); }
    const m = dom.match(/<pre id="res">([\s\S]*?)<\/pre>/);
    const text = m ? m[1].replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&").replace(/&quot;/g, '"') : "";
    const lines = text.split("\n").filter(l => /^(PASS|FAIL|ERROR|  )/.test(l));
    if (!lines.some(l => l.startsWith("PASS") || l.startsWith("FAIL")))
      lines.push("ERROR the test never finished - no results came back from the browser");
    report("browser: " + file, lines);
    console.log("  (" + ((Date.now() - t1) / 1000).toFixed(1) + " s)");
  }
  try { fs.rmSync(work, { recursive: true, force: true }); } catch (e) {}
}

console.log("\n" + (failed ? "FAILED" : "ALL GOOD") + ": " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
