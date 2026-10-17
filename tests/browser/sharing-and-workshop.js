// Share codes (round trips, typos, homemade boosters riding along), the
// Booster Workshop (make, rename, delete, name clashes), and the flight graph.
addEventListener("load", () => setTimeout(() => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? "PASS " : "FAIL ") + name + (extra != null ? " [" + extra + "]" : ""));
  const same = (a, b) => DESIGN_KEYS.every(k => a[k] === b[k]);
  try {
    for (const k in Sound) if (typeof Sound[k] === "function") Sound[k] = function () {};
    window.prompt = () => "Ava";
    const phase = location.hash.slice(1);
    const fly = () => { startFlight(); let g = 0; while (flight.alive && g++ < 120 * 4000) stepFlight(flight); finish(); };

    if (phase === "1") { localStorage.clear(); sessionStorage.clear(); location.hash = "#1b"; location.reload(); return; }

    if (phase === "1b") {
      // ---- share codes: round trip across many random designs ----
      const rnd = a => a[Math.floor(Math.random() * a.length)];
      let bad = 0, n = 0, example = "";
      for (let i = 0; i < 300; i++) {
        const tank = rnd(JUPI.tanks);
        const d = { boosters: rnd(JUPI.boosters).name, boosterSize: +(0.05 * (1 + Math.floor(Math.random() * 30))).toFixed(2),
          tank: tank.name, engine: rnd(JUPI.engines).name, fuel: 20 * Math.floor(Math.random() * (tank.maxFuel / 20 + 1)),
          capsuleEngine: rnd(JUPI.capsuleEngines).name, capsuleFuel: 10 * Math.floor(Math.random() * 41),
          capsule: rnd(JUPI.capsules).name, easeOff: 55 + 5 * Math.floor(Math.random() * 10), parachute: Math.random() < 0.5 };
        const code = designCode(d); if (!example) example = code;
        applyDesign({ boosters: JUPI.boosters[0].name, boosterSize: 1.0, fuel: 0 }); readPanel();
        loadCode(code); n++;
        const got = designOf(sel);
        if (!same(got, d)) { bad++; if (bad < 3) out.push("  mismatch " + code + " " + JSON.stringify(d) + " -> " + JSON.stringify(got)); }
      }
      ok("share code round trip, 300 random rockets", bad === 0, n + " tried, e.g. " + example);
      ok("panel shows the current code", $("myCode").textContent === designCode(sel), $("myCode").textContent);

      // typed sloppily: lowercase, spaces
      const c0 = designCode(sel);
      applyDesign({ boosterSize: 1.2 }); readPanel();
      loadCode("  " + c0.toLowerCase().replace(/-/g, " - ") + " ");
      ok("lowercase and spaces are fine", designCode(sel) === c0, $("codeMsg").textContent);
      // one wrong character is caught
      // every possible one-character typo, and every pair of neighbours swapped
      let missed = [], tried = 0;
      const caught = code => { loadCode(code); return /doesn't look right/.test($("codeMsg").textContent); };
      for (let i = 5; i < c0.length; i++) {
        if (c0[i] === "-") continue;
        for (const ch of B36) if (ch !== c0[i]) { tried++; const bad = c0.slice(0, i) + ch + c0.slice(i + 1); if (!caught(bad)) missed.push(bad); }
        const j = c0[i + 1] === "-" ? i + 2 : i + 1;
        if (j < c0.length && c0[j] !== c0[i]) {
          tried++; const sw = c0.split(""); [sw[i], sw[j]] = [sw[j], sw[i]];
          if (!caught(sw.join(""))) missed.push(sw.join(""));
        }
      }
      ok("every one-letter typo and swapped pair is caught", missed.length === 0, tried + " tried" + (missed.length ? ", missed " + missed.slice(0, 3).join(" ") : ""));
      loadCode("hello");
      ok("nonsense is caught", /doesn't look right/.test($("codeMsg").textContent));

      // ---- workshop ----
      $("selBoost").value = "Fire Crackers"; readPanel();
      ok("button says make", $("makeBoost").textContent === "MAKE YOUR OWN BOOSTER");
      $("makeBoost").click();
      ok("workshop opens from current booster", $("shop").classList.contains("on") && +$("bBurn").value === 4 && $("bName").value === "", $("shopMsg").textContent);
      ok("workshop shows warnings", /Air stress/.test($("shopStats").textContent), $("shopStats").textContent.slice(0, 80));
      // space in the name box must not launch
      $("bName").focus();
      const ev = new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true });
      $("bName").dispatchEvent(ev);
      ok("space while typing a name does not launch", mode === "build" && !ev.defaultPrevented, mode);
      $("bSave").click();
      ok("needs a name", $("shop").classList.contains("on") && /name first/.test($("shopMsg").textContent));
      $("bName").value = "fire crackers"; $("bSave").click();
      ok("name clash caught", /already a booster/.test($("shopMsg").textContent), $("shopMsg").textContent);
      $("bName").value = "Sneeze Boosters"; $("bThrust").value = 85; $("bBurn").value = 0.5; $("bProp").value = 60; $("bHeavy").value = 10;
      $("bColors").children[6].click();
      $("bName").dispatchEvent(new Event("input"));
      ok("code snippet matches", /name: "Sneeze Boosters"/.test($("shopCode").textContent) && /#ff7ac8/.test($("shopCode").textContent), $("shopCode").textContent.replace(/\n/g, " "));
      $("bSave").click();
      const sb = JUPI.boosters.find(b => b.name === "Sneeze Boosters");
      ok("saved, selected, in the list", sb && sb.custom && sel.boosters === "Sneeze Boosters" && !$("shop").classList.contains("on") &&
         [...$("selBoost").options].some(o => o.value === "Sneeze Boosters"), sb && JSON.stringify(sb));
      ok("button now says edit", $("makeBoost").textContent === "EDIT THIS BOOSTER");
      ok("homemade booster passes the parts checker", checkParts().length === 0, JSON.stringify(checkParts()));
      fly();
      ok("it flies", flight.outcome != null, flight.outcome + " apogee " + Math.round(flight.apogee));
      ok("graph drawn with a key", $("graphKey").textContent.length > 0, $("graphKey").textContent);
      const px = $("graph").getContext("2d").getImageData(0, 0, $("graph").width, $("graph").height).data;
      let lit = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 0) lit++;
      ok("graph has ink on it", lit > 500, lit + " px");
      mode = "build";
      // share a rocket with a homemade booster to a "friend" who does not have it
      const withBooster = designCode(sel);
      ok("code carries the booster", /-SNEEZE\.BOOSTERS-/.test(withBooster), withBooster);
      sessionStorage.setItem("code", withBooster);
      sessionStorage.setItem("sb", JSON.stringify({ heaviness: sb.heaviness, propellant: sb.propellant, thrust: sb.thrust, burnTime: sb.burnTime, color: sb.color }));
      // a breakup flight graph
      $("selBoost").value = "Kaboom Juice"; $("rBoost").value = "0.75"; readPanel(); fly(); mode = "build";
      ok("graph for a 2-second kaboom", /boosters/.test($("graphKey").textContent), flight.outcome + " " + $("graphKey").textContent);
      $("selBoost").value = "Sneeze Boosters"; readPanel();
      sessionStorage.setItem("out", out.join("\n"));
      location.hash = "#2"; location.reload(); return;
    }

    if (phase === "2") {
      out.push(sessionStorage.getItem("out"));
      ok("homemade booster still there after reload, and still selected",
         JUPI.boosters.some(b => b.custom && b.name === "Sneeze Boosters") && sel.boosters === "Sneeze Boosters", sel.boosters);
      // edit: rename it
      $("makeBoost").click();
      ok("edit opens with its values", $("bName").value === "Sneeze Boosters" && !$("bDelete").hidden);
      $("bName").value = "Mega Sneeze"; $("bSave").click();
      ok("rename keeps one copy", JUPI.boosters.filter(b => b.custom).length === 1 && sel.boosters === "Mega Sneeze", JUPI.boosters.filter(b => b.custom).map(b => b.name).join());
      // delete needs two taps
      $("makeBoost").click(); $("bDelete").click();
      ok("first tap asks", $("bDelete").textContent === "REALLY?" && JUPI.boosters.some(b => b.name === "Mega Sneeze"));
      $("bDelete").click();
      ok("second tap deletes and picks another booster", !JUPI.boosters.some(b => b.custom) && sel.boosters === JUPI.boosters[0].name, sel.boosters);
      // the friend's device: load the code with the booster in it
      loadCode(sessionStorage.getItem("code"));
      const want = JSON.parse(sessionStorage.getItem("sb"));
      const got = JUPI.boosters.find(b => b.custom);
      ok("friend gets the homemade booster with the same numbers", got && got.name === "Sneeze Boosters" &&
         ["heaviness", "propellant", "thrust", "burnTime", "color"].every(k => got[k] === want[k]) && sel.boosters === got.name,
         (got && JSON.stringify(got)) + " | " + $("codeMsg").textContent);
      loadCode(sessionStorage.getItem("code"));
      ok("loading it twice does not make a copy", JUPI.boosters.filter(b => b.custom).length === 1);
      ok("no error overlay", !$("oops").classList.contains("on"));
      document.title = "DONE";
      document.body.innerHTML = "<pre id=res>" + out.join("\n") + "</pre>";
    }
  } catch (e) { document.body.innerHTML = "<pre id=res>" + out.join("\n") + "\nERROR " + e.message + "\n" + e.stack + "</pre>"; }
}, 300));
