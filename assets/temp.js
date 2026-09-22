/* =============================================================
   MEAT TRACKER - temperature units

   Every temperature on this site is written once, in Fahrenheit,
   as a token inside the copy. This module swaps the tokens for
   whichever unit the reader picked.

     {{129}}     ->  129 degrees F   /  54 degrees C
     {{129|w}}   ->  129 degrees     /  54 degrees     (prose)
     {{129|n}}   ->  129             /  54             (bare number)

   Add a temperature to any string in content.js or index.html by
   writing it as a token. Nothing else needs to change.
   ============================================================= */
(function (global) {
  'use strict';

  const KEY = 'meat-tracker-unit-v1';
  let unit = 'F';

  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'C' || saved === 'F') unit = saved;
  } catch (e) { /* private mode, stick with F */ }

  function f2c(f) { return Math.round((f - 32) * 5 / 9); }
  function val(f) { return unit === 'C' ? f2c(f) : Math.round(f); }
  function deg(f) { return val(f) + '°' + unit; }
  function degWord(f) { return val(f) + ' degrees'; }

  const TOKEN = /\{\{(-?\d+(?:\.\d+)?)(?:\|([wn]))?\}\}/g;

  function fill(str) {
    if (str == null) return str;
    return String(str).replace(TOKEN, function (m, n, mode) {
      const f = parseFloat(n);
      return mode === 'w' ? degWord(f) : mode === 'n' ? String(val(f)) : deg(f);
    });
  }

  /* Elements that carry tokens directly in their markup. The first
     pass stashes the original so later unit switches still have it. */
  function fillDom(root) {
    const scope = root || document;
    Array.prototype.forEach.call(scope.querySelectorAll('[data-temps]'), function (el) {
      if (el._tpl == null) el._tpl = el.innerHTML;
      el.innerHTML = fill(el._tpl);
    });
  }

  global.MeatTemp = {
    get: function () { return unit; },
    set: function (u) {
      unit = (u === 'C') ? 'C' : 'F';
      try { localStorage.setItem(KEY, unit); } catch (e) { /* fine */ }
      return unit;
    },
    f2c: f2c,
    val: val,
    deg: deg,
    degWord: degWord,
    fill: fill,
    fillDom: fillDom
  };

})(window);
