# Mission of Success

A rocket simulator built with kids, for kids. Design a rocket called **Jupi**, launch it,
watch what happens, then go back and tweak it.

**[Play it in your browser](https://thill-03.github.io/MissionofSuccess/)** &mdash; nothing to install.

**It is one self-contained HTML file.** Download `Mission of Success.html`, double-click it,
and it runs. No install, no build step, no internet connection, no dependencies. It works on
any laptop or Chromebook you can put it on, which was the whole point — a friend can take it
home on a USB stick.

Jupi was designed by an eight-year-old, and the shape you see is their drawing: antenna mast,
flared nose cone, a module, the tall core body, twin nozzles, and a pointed booster on each side.

## The flight

Jupi is four pieces, and it throws three of them away on the way up:

| Stage | What it is | What happens |
|---|---|---|
| 1 | Two solid boosters | Light on the pad, burn hard for a few seconds, then let go |
| 2 | The core | Lights on the pad too, keeps going after the boosters drop |
| 3 | The service module | Lights once the core falls away, then is dropped itself |
| — | **The Jupi module** | Rides all the way up and parachutes home. The only piece that survives |

## The physics is real

That is the point of the whole thing. Nothing is faked to feel good:

- **Thrust, mass and fuel.** Fuel is heavy, so Jupi gets lighter and accelerates harder as it burns.
- **Gravity falls off** with altitude, and **the air thins** exponentially as you climb.
- **Drag** depends on how fast you are going and how thick the air is.
- **Stability** comes from where the rocket balances versus where the air pushes on it. Too little
  booster and Jupi tumbles like a thrown stick — and the panel tells you *before* you launch, using
  thresholds that were measured by flying it, not guessed.
- **Wind** pushes slow rockets around far more than fast ones.
- **The exhaust plume** shows shock diamonds down in thick air and blooms outward as the air thins,
  driven by the same air-density value the drag model uses.
- **Solid boosters cannot be throttled.** Once they are lit, they are lit.

Because it is honest, the interesting lessons are *discoverable* rather than written down.
Every tank has a sweet spot: pour in more fuel and Jupi climbs higher, right up until the
rocket is too heavy to get off the pad properly, and then it falls off a cliff. The default
rocket reaches about 8.5 km. Around 30 km is reachable if you work out how.

Every launch is deterministic: the same rocket always flies exactly the same way, so every
change you make is a fair test.

## Making it your own

Open the file in Notepad (or any text editor). The first thing you see is a big banner that
says **KIDS EDIT THIS**, and everything above the STOP sign is fair game — engines, fuel tanks,
boosters, gravity, wind. Every number has a plain-English comment next to it.

```js
{ name: "Starter Engine",
  thrust:  14000,     // how hard it pushes (newtons). BIGGER = more powerful
  burnRate:   22,     // how much fuel it eats each second (kg). BIGGER = runs out sooner
  mass:       55,     // how heavy the engine is (kg)
  color:   "#ff7a2f" },
```

Set `gravity: 1.62` and `airThickness: 0` for the Moon.

If you mistype something, Jupi tells you exactly what to fix in plain English instead of showing
a blank white page. Nothing you type in there can break your computer.

## Scores

High scores are saved in your own browser and never leave your machine. There is no server,
no account and nothing to sign up for.
