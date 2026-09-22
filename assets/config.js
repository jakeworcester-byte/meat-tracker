/* =============================================================
   MEAT TRACKER - CONTROL PANEL
   Jake: this is the only file you ever need to edit.
   Change a date, save, commit, push. The whole site re-times itself.
   All dates are YYYY-MM-DD. All times are 24-hour, local to whoever
   is looking at the page (close enough for steak).
   ============================================================= */

window.MEAT_CONFIG = {

  /* ---- The meat itself ---------------------------------- */
  meat: {
    cut: "Whole Ribeye (Export Rib, Boneless)",
    grade: "USDA Prime",
    weightLbs: 16.4,
    steakCount: 14,          // how many steaks you expect to get
    steakThickness: '1.5"',
    sourceNote: "Cryovac'd by the packer a few days before purchase.",
    fridgeTempF: 36
  },

  /* ---- The schedule ------------------------------------- */
  /* Edit these and everything else follows automatically.   */
  dates: {
    packed: "2026-09-18",    // packer's pack date (start of the cryovac clock)
    fridge: "2026-09-20",    // day it went into Jake's fridge (aging clock starts)
    cut:    "2026-10-15",    // butchery day
    seal:   "2026-10-17",    // after ~24-36h uncovered dry-down, vacuum sealed
    cook:   "2026-10-29"     // STEAK DAY
  },

  /* Hours on cook day (24h clock) */
  cookDay: {
    sousVideIn:  14,   // steaks go in the bath
    sousVideOut: 17,   // out of the bath, pat dry, rest
    searTime:    17.5, // Primo XL gets ripping hot
    serveTime:   18    // forks up
  },

  /* ---- Cooking spec ------------------------------------- */
  cook: {
    sousVideTempF: 129,
    sousVideHours: 3,
    restBeforeSearMin: 10,
    searSecondsPerSide: 60,
    grill: "Primo XL",
    grillTempF: 700,
    finalTempF: 132
  },

  /* ---- Fun stuff ---------------------------------------- */
  crew: {
    chef: "Jake",
    location: "Kansas City",
    occasion: "The team is in town"
  },

  /* Set to a phase id to force it (aging | butchery | drydown |
     sealed | sousvide | sear | served). Leave null for live mode. */
  forcePhase: null
};
