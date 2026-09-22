# The Meat Tracker

A live tracking page for one USDA Prime whole ribeye on its way from a cryovac bag
to a Primo XL. Built to be shared with the team so they can follow their steak,
learn a little beef science, and claim a cut before somebody else does.

Static site, no build step, no dependencies. Deployed to GitHub Pages by the
workflow in `.github/workflows/deploy.yml` on every push to `main`.

## What is on the page

| Section | What it does |
|---|---|
| Live console | Current stage, countdown to Steak Day, progress meter, and an illustration of exactly what the beef looks like right now |
| Time Machine | A slider that fast-forwards the whole 40 day process so anyone can preview what happens next. Every stage gets an equal slice of the track, so the cook-day stages are actually reachable |
| Seven Stages of Beef | Clickable timeline with the real explanation behind each step |
| Pick a Steak | Unlocks on butchery day. Claim and name a steak (stored in the visitor's own browser) |
| Marbling Lab | Drag from Select to A5 Wagyu and watch the intramuscular fat appear |
| Anatomy of a Ribeye | Click the eye, the cap, the complexus, the seams |
| Doneness Dial | Cross-section, sous vide temperature, and an opinion |
| Cook Day Playbook | The hour by hour plan |
| The Beef Cam | A fake live feed. There is no camera |

## Changing the dates or the details

Everything is in **`assets/config.js`**. That is the only file you need to touch.

```js
dates: {
  packed: "2026-09-18",   // packer's pack date
  fridge: "2026-09-20",   // aging clock starts
  cut:    "2026-10-15",   // butchery day
  seal:   "2026-10-17",   // vacuum sealed after the dry-down
  cook:   "2026-10-29"    // STEAK DAY
}
```

Change a date, commit, push. The countdown, the stage logic, the timeline labels,
the steak grid unlock and the Time Machine all re-time themselves.

Other things worth editing in the same file: `meat.steakCount` (how many steaks
you actually got), `meat.weightLbs`, `cook.sousVideTempF`, and `cookDay` (the
hour by hour schedule on cook day).

`forcePhase` pins the site to one stage for testing. Set it back to `null` before
you push, or the site will be stuck there for everyone.

## Running it locally

```bash
python -m http.server 8751
```

Then open http://localhost:8751

## File map

```
index.html            page structure
assets/config.js      all the dates and numbers  <- edit this one
assets/content.js     all the copy: stages, grades, anatomy, FAQ, jokes
assets/svg.js         every illustration on the page, drawn in code
assets/app.js         timing engine, rendering, interactivity
assets/styles.css     styling
```
