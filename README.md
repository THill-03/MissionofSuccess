# Mission of Success

A rocket simulator built with kids, for kids. Design a rocket called **Jupi**, launch it,
watch what happens, then go back and tweak it.

**[Play it in your browser](https://thill-03.github.io/MissionofSuccess/)** &mdash; nothing to install.
Works on a phone or tablet too: the builder becomes a slide-up drawer so the flight gets the whole screen.

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

Jupi launches from a Kennedy Space Center pad: the Vehicle Assembly Building and the
crawler-transporter on the horizon, lightning towers, the water tower, palm trees, the ocean,
an alligator sunning itself on the grass, and a crowd behind the fence. Press LAUNCH and the
countdown clock runs down from five: the crowd cheers, then covers its ears, and the deluge
water turns to steam under the pad at liftoff. Press LAUNCH again to skip the countdown.
On the way up Jupi passes pelicans, a plane towing a *GO JUPI GO!* banner, a weather balloon,
and the Moon coming out as the sky goes dark.

After every flight the result card shows **how much higher or lower than last time, and what
you changed**, plus a graph of the climb coloured by which stage was burning.

## The physics is real

That is the point of the whole thing. Nothing is faked to feel good:

- **Thrust, mass and fuel.** Fuel is heavy, so Jupi gets lighter and accelerates harder as it burns.
- **Gravity falls off** with altitude, and **the air thins** exponentially as you climb.
- **Drag** depends on how fast you are going and how thick the air is.
- **Stability** comes from where the rocket balances versus where the air pushes on it. Too little
  booster and Jupi tumbles like a thrown stick — and the panel tells you *before* you launch, using
  thresholds that were measured by flying it, not guessed.
- **Wind** pushes slow rockets around far more than fast ones.
- **The sound barrier.** Air gets out of a slow rocket's way. Near the speed of sound it cannot get
  out of the way fast enough, so it piles up in front and drag climbs steeply — worst just past
  Mach 1, then easing off again. Mach 1 is about 340 m/s at the ground and *slower* higher up,
  because the air up there is colder, so the barrier creeps down to meet a climbing rocket. A
  default Jupi tops out around Mach 0.88, right up against the wall without ever getting through it.
- **Bending.** Speed alone rarely breaks a real rocket. What breaks one is the squeeze multiplied by
  how *sideways* it is flying, which bends it like a drinking straw — engineers call it *q-alpha*,
  and it is why real launches get called off for high wind. Jupi snaps the same way. The
  counter-intuitive part is real and worth finding: **big boosters make this worse**, because a very
  stable rocket turns to face the wind and so catches it harder. Crank the wind past about 16 m/s
  and the big-booster rocket snaps while the twitchy one rides it out.
- **Engines get stronger as the air thins**, because there is less air pushing back against the
  exhaust. Real engines gain 10–15% between the pad and space; Jupi gains up to 14%.
- **Max-Q.** Dynamic pressure - the squeeze the air puts on the rocket - peaks partway up,
  because speed drives it up while the thinning air drags it down. Push too fast while the air
  is still thick and Jupi is torn apart. A normal flight peaks near 36 kPa, which is about where
  real rockets sit. The panel predicts it before you launch by flying the climb in the background,
  and it only suggests a fix (easing off, or less core fuel) after flying that fix and seeing it
  work. When the boosters alone are doing the damage, it says so, because nothing else will help.
- **The throttle bucket.** Set *Ease off at Max-Q* and the liquid engines turn themselves down
  while the air is squeezing hardest, then push back to full once it thins out. That is what real
  rockets do on every launch, and it is where the call *Go at throttle up* comes from - mission
  control saying the worst is over. It costs almost nothing and it saves rockets that would
  otherwise be torn apart. The solid boosters ignore it: once they are lit, they cannot be turned down.
- **The exhaust plume** shows shock diamonds down in thick air and blooms outward as the air thins,
  driven by the same air-density value the drag model uses.
- **Solid boosters cannot be throttled.** Once they are lit, they are lit.

Three ways to lose, and the panel predicts all three before you launch by flying the climb in the
background: **tumbling** (not enough booster to stay pointed), **torn apart** (too fast while the air
is still thick), and **snapped** (shoved sideways while going fast). Every one of those thresholds
was set by flying the rocket across the whole range of settings and checking the warning against
what actually happened — not guessed.

Because it is honest, the interesting lessons are *discoverable* rather than written down.
Every tank has a sweet spot: pour in more fuel and Jupi climbs higher, right up until the
rocket is too heavy to get off the pad properly, and then it falls off a cliff. The default
rocket reaches about 8.5 km. Around 30 km is reachable if you work out how.

The engines are deliberately *less* efficient than real hardware — about a fifth to a third of the
exhaust speed of the real thing. That is the one number that is scaled rather than honest, and it is
load-bearing: it keeps flights short enough to watch and keeps Jupi at amateur-rocket altitudes
rather than orbit. Everything built on top of it is the real physics.

Every launch is deterministic: the same rocket always flies exactly the same way, so every
change you make is a fair test.

## Making it your own

**The Booster Workshop** is the easy way. Press *Make your own booster* under the booster size
slider: name it, set how hard it pushes (from a puff to a ridiculous two million), how long it
burns, how much fuel and how heavy, and pick a colour. It shows the same warnings as the panel
for the rocket you have now — but never how high it will go. To find that out, you launch it.
Homemade boosters are saved in this browser. *See your booster as code* gives you the lines to
paste into the file to make one permanent.

Try **Kaboom Juice**. At normal size the air tears Jupi apart a couple of seconds after launch.
Is there a size where it doesn't?

The other way is the real code. Open the file in Notepad (or any text editor). The first thing you see is a big banner that
says **KIDS EDIT THIS**, and everything above the STOP sign is fair game — engines, fuel tanks,
boosters, gravity, wind. Every number has a plain-English comment next to it.

```js
{ name: "Starter Engine",
  thrust:  14000,     // how hard it pushes (newtons). BIGGER = more powerful
  burnRate:   22,     // how much fuel it eats each second (kg). BIGGER = runs out sooner
  mass:       55,     // how heavy the engine is (kg)
  color:   "#ff7a2f" },
```

Set `gravity: 1.62` and `airThickness: 0` for the Moon (the birds, plane and balloon stay home —
there is no air for them). Set `countdown: 0` to launch the instant you press the button.

If you mistype something, Jupi tells you exactly what to fix in plain English instead of showing
a blank white page. Nothing you type in there can break your computer.

## Sharing rockets

Every rocket has a code, shown under *Share your rocket*, like `JUPI-0F00-0M00-909Y-L9`. Type a
friend's code into the box and press LOAD to fly their exact rocket. If it uses a homemade
booster, the code carries the booster too, so it arrives with them. A mistyped code is caught
rather than quietly loading the wrong rocket.

## What gets saved

Everything is saved in your own browser and never leaves your machine: the Hall of Fame, the
pilot's name, the rocket you are building, and homemade boosters. There is no server, no account
and nothing to sign up for. That also means a different computer or browser starts fresh, and
**share codes are how a rocket travels**.

- Tap a Hall of Fame entry to load that rocket and fly it again.
- Taking turns on one tablet? Press *change* next to the pilot's name.
- If you edit `startingRocket` in the file, your edit wins over the rocket saved in the browser.

## Tests

For grown-ups changing the code:

```
node tests/run.js
```

Nothing to install. The physics checks run the flight engine straight out of the HTML file in
Node — including flying thousands of rockets to prove every *will break up* and *will snap*
warning matches what really happens. The browser checks open the real page in headless Chrome or
Edge and click through the countdown, the scenery, saved designs, share codes and the Booster
Workshop. Run it after every change.
