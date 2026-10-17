/* ==========================================================================
   PHYSICS CHECKS - the flight engine on its own, no browser.

   The engine is everything in the game's <script> above the DRAWING JUPI
   banner. It never touches the page, so it runs in Node exactly as it runs
   in the game.
   ========================================================================== */

function loadEngine(html) {
  const start = html.indexOf("<script>") + "<script>".length;
  const end = html.lastIndexOf("/* ---", html.indexOf("DRAWING JUPI"));
  if (start < 8 || end < start) throw new Error("could not find the engine between <script> and DRAWING JUPI");
  return new Function(html.slice(start, end) +
    "\nreturn { JUPI, buildRocket, newFlight, stepFlight, predictLoads, checkParts, Q_LIMIT, QA_LIMIT };")();
}

exports.run = function (html) {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? "PASS " : "FAIL ") + name + (extra != null ? " [" + extra + "]" : ""));
  let E;
  try { E = loadEngine(html); } catch (e) { return ["ERROR " + e.message]; }
  const { JUPI, buildRocket, newFlight, stepFlight, predictLoads, checkParts, Q_LIMIT, QA_LIMIT } = E;
  const base = JUPI.startingRocket;
  const build = change => buildRocket(Object.assign({}, base, change));
  const flyAll = r => { const f = newFlight(r); let g = 0; while (f.alive && g++ < 120 * 4000) stepFlight(f); return f; };

  ok("the parts list passes its own checker", checkParts().length === 0, JSON.stringify(checkParts()));

  // If you change the physics on purpose, this number changes too - update it.
  const DEFAULT_HEIGHT = 8527;
  const d = flyAll(build({}));
  ok("the starting rocket lands safely at about " + DEFAULT_HEIGHT + " m",
     d.outcome === "landed" && Math.abs(d.apogee - DEFAULT_HEIGHT) < DEFAULT_HEIGHT * 0.01,
     d.outcome + ", " + Math.round(d.apogee) + " m");
  ok("the same rocket always flies the same way", flyAll(build({})).apogee === d.apogee);

  // The panel's warnings are only worth anything if they are TRUE. Fly every
  // booster, engine and body, at a spread of sizes and throttle settings, and
  // check "WILL BREAK UP" / "WILL SNAP" against what actually happened.
  let n = 0;
  const wrong = [];
  for (const b of JUPI.boosters) for (const e of JUPI.engines) for (const t of JUPI.tanks)
  for (const easeOff of [100, 70, 55]) for (let i = 0; i < 15; i++) {
    const size = +(0.05 + i * 0.1).toFixed(2);
    const r = build({ boosters: b.name, engine: e.name, tank: t.name, easeOff, boosterSize: size });
    const L = predictLoads(r);
    const warned = L.q >= Q_LIMIT ? "brokeup" : L.qa >= QA_LIMIT ? "snapped" : "ok";
    const f = newFlight(r);
    let g = 0;
    // once the parachute is out nothing can break any more, so stop there
    while (f.alive && !f.chuteOut && g++ < 120 * 4000) stepFlight(f);
    const got = f.outcome === "brokeup" || f.outcome === "snapped" ? f.outcome : "ok";
    n++;
    if (warned !== got) wrong.push(b.name + "/" + e.name + "/" + t.name + "/ease " + easeOff + "/size " + size + ": warned " + warned + ", got " + got);
  }
  ok("every breakup and snap warning matches the real flight", wrong.length === 0,
     n + " rockets flown" + (wrong.length ? "; " + wrong.length + " wrong, e.g. " + wrong.slice(0, 3).join(" | ") : ""));

  // Kaboom Juice was designed with a secret: too much and it blows up, but a
  // small set of it is the best booster in the game. Keep that true.
  if (JUPI.boosters.some(b => b.name === "Kaboom Juice")) {
    const big = flyAll(build({ boosters: "Kaboom Juice", boosterSize: 0.75 }));
    const small = flyAll(build({ boosters: "Kaboom Juice", boosterSize: 0.55 }));
    ok("Kaboom Juice at normal size is torn apart", big.outcome === "brokeup", big.outcome);
    const others = JUPI.boosters.filter(b => b.name !== "Kaboom Juice")
      .map(b => flyAll(build({ boosters: b.name })).apogee);
    ok("...but a small set of it beats every other booster", small.outcome === "landed" && small.apogee > Math.max(...others),
       Math.round(small.apogee) + " m vs best other " + Math.round(Math.max(...others)) + " m");
  }
  return out;
};
