// "Too fast, too low!" only suggests a fix if that fix really saves Jupi.
// For every rocket that would be torn apart, read the advice, then fly each
// suggested fix and check it works - and that a fix it left out really doesn't.
addEventListener("load", () => setTimeout(() => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? "PASS " : "FAIL ") + name + (extra != null ? " [" + extra + "]" : ""));
  try {
    for (const k in Sound) if (typeof Sound[k] === "function") Sound[k] = function () {};
    const breaks = s => { const f = newFlight(buildRocket(s)); let g = 0; while (f.alive && g++ < 120 * 4000) stepFlight(f);
                          return f.outcome === "brokeup" || f.outcome === "snapped"; };
    const bad = [], kinds = {};
    let n = 0;
    for (const b of JUPI.boosters) for (const e of JUPI.engines) for (const t of JUPI.tanks)
    for (const size of [0.5, 0.75, 1.0, 1.5]) for (const fuel of [220, 600, 1200]) {
      sel = Object.assign({}, JUPI.startingRocket, { boosters: b.name, engine: e.name, tank: t.name,
                                                     boosterSize: size, fuel: Math.min(fuel, t.maxFuel), easeOff: 100 });
      if (predictLoads(buildRocket(sel)).q < Q_LIMIT) continue;
      refresh();
      const m = ($("advice").textContent.match(/Too fast, too low![^\n]*/) || [""])[0];
      if (!m) continue;
      n++;
      const kind = /cannot be turned down/.test(m) ? "boosters" : /easing off/.test(m) && /less core fuel/.test(m) ? "both"
                 : /easing off/.test(m) ? "ease" : "fuel";
      kinds[kind] = (kinds[kind] || 0) + 1;
      const easeWorks = !breaks(Object.assign({}, sel, { easeOff: 55 }));
      const fuelWorks = [0.75, 0.5, 0.25, 0].some(k => !breaks(Object.assign({}, sel, { fuel: Math.floor(sel.fuel * k) })));
      const saysEase = kind === "both" || kind === "ease", saysFuel = kind === "both" || kind === "fuel";
      if (saysEase !== easeWorks || saysFuel !== fuelWorks)
        bad.push(b.name + "/" + e.name + "/" + t.name + "/" + size + "/" + fuel + ": said " + kind);
    }
    ok("found rockets that break up to test", n > 50, n);
    ok("every suggested fix works, and no working fix is left out", bad.length === 0,
       JSON.stringify(kinds) + (bad.length ? " wrong: " + bad.slice(0, 3).join(" | ") : ""));
  } catch (e) { out.push("ERROR " + e.message); }
  document.body.innerHTML = "<pre id=res>" + out.join("\n") + "</pre>";
}, 300));
