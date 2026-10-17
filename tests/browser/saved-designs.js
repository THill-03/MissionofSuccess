// Hall of Fame records keep the whole rocket, the design survives a reload,
// pilots can switch, the result card compares flights, the countdown can be skipped.
addEventListener("load", () => setTimeout(() => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? "PASS " : "FAIL ") + name + (extra ? " [" + extra + "]" : ""));
  try {
    for (const k in Sound) if (typeof Sound[k] === "function") Sound[k] = function () {};
    const phase = location.hash.slice(1);
    const fly = () => { startFlight(); let g = 0; while (flight.alive && g++ < 120 * 4000) stepFlight(flight); finish(); };
    const setv = (id, v) => { $(id).value = v; readPanel(); };

    if (phase === "1") {
      localStorage.clear(); location.hash = "#1b"; location.reload(); return;
    }
    if (phase === "1b") {
      ok("fresh start uses the starting rocket", sel.boosters === JUPI.startingRocket.boosters && sel.boosterSize === 0.75);
      window.prompt = () => "Ava";
      // 1st flight
      setv("selBoost", "Kaboom Juice"); setv("rBoost", "0.55");
      fly();
      ok("first flight shows no comparison", $("delta").textContent === "", $("delta").textContent);
      const b1 = loadBoard()[0];
      ok("hall of fame saves the whole rocket", b1 && b1.design && b1.design.boosters === "Kaboom Juice" && b1.design.boosterSize === 0.55, JSON.stringify(b1 && b1.design));
      ok("hall of fame row shows boosters and size", /Kaboom 0.55/.test($("boardList").textContent), $("boardList").textContent);
      ok("pilot name shown after the first flight", $("pilotName").textContent === "Ava", $("pilotName").textContent);
      // 2nd flight, one change
      setv("rBoost", "0.75");
      fly();
      ok("lower flight says lower + what changed", /lower/.test($("delta").textContent) && /booster size 0.55 → 0.75/.test($("delta").textContent), $("delta").textContent);
      // 3rd flight, back again
      setv("rBoost", "0.55");
      fly();
      ok("higher flight says higher", /higher/.test($("delta").textContent), $("delta").textContent);
      // same rocket again
      fly();
      ok("same rocket says so", /same rocket/.test($("delta").textContent), $("delta").textContent);
      // load a record from the board
      mode = "build";
      setv("selBoost", "Standard Boosters"); setv("rBoost", "1.20");
      const rows = document.querySelectorAll("#boardList .pick");
      const best = loadBoard()[0];
      rows[0].click();
      ok("tapping a record loads its rocket", sel.boosters === best.design.boosters && sel.boosterSize === best.design.boosterSize, sel.boosters + " " + sel.boosterSize);
      ok("load message", /Loaded/.test($("boardTip").textContent), $("boardTip").textContent);
      // a record whose booster no longer exists
      const b = loadBoard(); b[0].design = Object.assign({}, b[0].design, { boosters: "Gone Boosters", boosterSize: 0.3 }); saveBoard(b); drawBoard(-1);
      document.querySelectorAll("#boardList .pick")[0].click();
      ok("missing part is named, rest still loads", /Gone Boosters/.test($("boardTip").textContent) && sel.boosterSize === 0.3 && sel.boosters !== "Gone Boosters", $("boardTip").textContent);
      // change pilot
      window.prompt = () => "Ben";
      $("pilotChange").click();
      ok("change pilot", $("pilotName").textContent === "Ben" && localStorage.getItem(WHO_KEY) === "Ben");
      // skip the countdown
      mode = "build"; launch();
      const during = mode + "/" + $("launch").textContent + "/" + $("launch").disabled;
      launch();
      ok("pressing launch again skips countdown", during === "countdown/GO NOW!/false" && mode === "flying" && $("launch").textContent === "LAUNCH" && $("launch").disabled, during + " -> " + mode + "/" + $("launch").textContent);
      // fuel bug: starting fuel other than 220 is honoured
      sel.tank = JUPI.tanks[0].name; sel.fuel = 400; setControls();
      ok("core fuel value sticks (old bug)", +$("rFuel").value === 400 && sel.fuel === 400, $("rFuel").value);
      // leave a design to survive reload
      mode = "build"; setControls(); setv("selBoost", "Long Burners"); setv("rBoost", "0.40"); setv("rFuel", "300");
      sessionStorage.setItem("out", out.join("\n"));
      location.hash = "#2"; location.reload(); return;
    }
    if (phase === "2") {
      out.push(sessionStorage.getItem("out"));
      ok("rocket remembered after reload", sel.boosters === "Long Burners" && sel.boosterSize === 0.4 && sel.fuel === 300, sel.boosters + " " + sel.boosterSize + " " + sel.fuel);
      ok("pilot remembered after reload", $("pilotName").textContent === "Ben");
      // editing startingRocket in the file wins over the saved design
      const saved = JSON.parse(localStorage.getItem(DESIGN_KEY)); saved.start = "something else"; localStorage.setItem(DESIGN_KEY, JSON.stringify(saved));
      ok("changed startingRocket ignores old save", loadDesign() === null);
      ok("no error overlay", !$("oops").classList.contains("on"));
      document.title = "DONE";
      document.body.innerHTML = "<pre id=res>" + out.join("\n") + "</pre>";
    }
  } catch (e) { document.title = "DONE"; document.body.innerHTML = "<pre id=res>" + out.join("\n") + "\nERROR " + e.message + "\n" + e.stack + "</pre>"; }
}, 300));
