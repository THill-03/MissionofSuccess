// The countdown, stepped frame by frame on a pretend clock, and every piece
// of scenery drawn once at the height where it appears.
addEventListener("load", () => setTimeout(() => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? "PASS " : "FAIL ") + name + (extra != null ? " [" + extra + "]" : ""));
  try {
    const beeps = [];
    for (const k in Sound) if (typeof Sound[k] === "function") Sound[k] = function () {};
    Sound.beep = high => beeps.push(high ? "H" : "l");
    window.requestAnimationFrame = () => 0;           // we drive the frames ourselves
    const T = 1000000;

    launch();
    const seen = [];
    for (let ms = 0; ms <= 7000; ms += 50) {
      frame(T + ms);
      if (ms % 1000 === 0) seen.push(mode === "countdown" ? Math.ceil(countEnd - (T + ms) / 1000) : mode);
    }
    ok("counts 5, 4, 3, 2, 1 then lifts off", seen.slice(0, 6).join(",") === "5,4,3,2,1,flying", seen.join(","));
    ok("beeps once a second, higher for the last three", beeps.join("") === "llHHH", beeps.join(""));
    ok("liftoff happens at 5 seconds", flight && Math.abs(flight.t - 2) < 0.1, flight && flight.t.toFixed(2));

    mode = "done"; JUPI.world.countdown = 0; launch();
    ok("countdown: 0 launches straight away", mode === "flying");
    JUPI.world.countdown = 5;

    // every piece of scenery, drawn at the height where it shows up
    let threw = "";
    for (const alt of [0, 90, 170, 260, 380, 520, 2300, 4600, 7000]) {
      try {
        const f = newFlight(rocket); f.y = alt; f.t = 10;
        render(rocket, f, 3);
      } catch (e) { threw += alt + "m: " + e.message + " "; }
    }
    try { mode = "build"; render(rocket, null, 3); } catch (e) { threw += "pad: " + e.message; }
    ok("all the scenery draws without an error", threw === "", threw);
    ok("no error screen", !$("oops").classList.contains("on"));
  } catch (e) { out.push("ERROR " + e.message); }
  document.body.innerHTML = "<pre id=res>" + out.join("\n") + "</pre>";
}, 300));
