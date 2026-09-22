/* =============================================================
   MEAT TRACKER — SVG factory
   Everything you see is drawn here. No images, no dependencies.
   ============================================================= */
(function (global) {
  'use strict';

  /* ---------- deterministic pseudo-random ---------- */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a += 0x6D2B79F5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function CFG() { return window.MEAT_CONFIG; }

  const PATHS = {
    outer: 'M16,94 C18,58 46,34 98,27 C146,21 196,33 218,60 C232,78 228,104 206,120 C182,138 128,146 84,140 C42,134 14,120 16,94 Z',
    eye:   'M30,95 C32,64 58,46 100,42 C140,38 168,54 174,82 C180,108 158,126 118,130 C76,134 42,124 30,95 Z',
    cap:   'M112,36 C150,24 194,34 210,58 C219,72 212,88 194,96 C176,104 152,99 142,86 C132,73 122,52 112,36 Z',
    comp:  'M28,112 C34,124 52,132 70,134 C58,138 36,134 26,124 C22,120 24,114 28,112 Z',
    seam:  'M110,38 C122,60 134,78 150,88 C166,98 188,100 202,94',
    seam2: 'M30,95 C60,90 92,92 120,104'
  };

  /* how much marbling shows at each grade index 0..4 */
  const MARBLE_N = [26, 62, 105, 185, 380];

  function marbleStrokes(count, seed, opacity) {
    const r = rng(seed);
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = 26 + r() * 182;
      const y = 36 + r() * 98;
      const len = 2.6 + r() * 11;
      const lift = (r() - 0.5) * 9;
      const w = 0.8 + r() * 1.7;
      const o = (opacity || 0.85) * (0.45 + r() * 0.55);
      out += '<path d="M' + x.toFixed(1) + ',' + y.toFixed(1) +
             ' q' + (len / 2).toFixed(1) + ',' + lift.toFixed(1) +
             ' ' + len.toFixed(1) + ',' + (lift * 0.3).toFixed(1) +
             '" stroke="#f7ecd6" stroke-width="' + w.toFixed(2) +
             '" stroke-linecap="round" fill="none" opacity="' + o.toFixed(2) + '"/>';
    }
    return out;
  }

  /* ---------------------------------------------------------
     ribeyeFace — the money shot, in a 240 x 170 box
     opts: meat, cap, fat, marble (0..4), seed, id, parts(bool),
           crust(bool), cooked(hex), dull(bool)
     --------------------------------------------------------- */
  function ribeyeFace(opts) {
    const o = opts || {};
    const id = o.id || ('rf' + Math.floor(Math.random() * 1e6));
    const meat = o.meat || '#b8323c';
    const capc = o.cap || '#a62c36';
    const fat = o.fat || '#f4e6c8';
    const seed = o.seed || 7;
    const n = MARBLE_N[o.marble == null ? 3 : o.marble];
    const partAttr = function (name, extra) {
      return o.parts ? ' class="part" data-part="' + name + '"' + (extra || '') : '';
    };

    return '' +
      '<defs>' +
        '<clipPath id="' + id + '-clip"><path d="' + PATHS.eye + '"/><path d="' + PATHS.cap + '"/></clipPath>' +
        '<radialGradient id="' + id + '-g" cx="42%" cy="38%" r="72%">' +
          '<stop offset="0%" stop-color="' + lighten(meat, 0.16) + '"/>' +
          '<stop offset="100%" stop-color="' + meat + '"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<g>' +
        /* fat rim */
        '<path d="' + PATHS.outer + '" fill="' + fat + '"' + partAttr('fat') + '/>' +
        /* eye */
        '<path d="' + PATHS.eye + '" fill="url(#' + id + '-g)"' + partAttr('eye') + '/>' +
        /* cap */
        '<path d="' + PATHS.cap + '" fill="' + capc + '"' + partAttr('cap') + '/>' +
        /* complexus */
        '<path d="' + PATHS.comp + '" fill="' + darken(meat, 0.12) + '"' + partAttr('comp') + '/>' +
        /* marbling */
        '<g clip-path="url(#' + id + '-clip)">' + marbleStrokes(n, seed, o.dull ? 0.55 : 0.9) + '</g>' +
        /* fat seams */
        '<path d="' + PATHS.seam + '" stroke="' + fat + '" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"' + partAttr('seam') + '/>' +
        '<path d="' + PATHS.seam2 + '" stroke="' + fat + '" stroke-width="2" fill="none" stroke-linecap="round" opacity=".28"/>' +
        /* outline */
        '<path d="' + PATHS.outer + '" fill="none" stroke="rgba(0,0,0,.32)" stroke-width="2"/>' +
        (o.crust ? crustOverlay(id) : '') +
      '</g>';
  }

  function crustOverlay(id) {
    return '<path d="' + PATHS.outer + '" fill="none" stroke="#4a2415" stroke-width="9" opacity=".9"/>' +
           '<path d="' + PATHS.outer + '" fill="none" stroke="#2b1309" stroke-width="3" opacity=".8"/>';
  }

  /* ---------- tiny colour helpers ---------- */
  function hex2rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2hex(c) {
    return '#' + c.map(function (v) {
      return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    }).join('');
  }
  function lighten(h, amt) { return rgb2hex(hex2rgb(h).map(function (v) { return v + (255 - v) * amt; })); }
  function darken(h, amt) { return rgb2hex(hex2rgb(h).map(function (v) { return v * (1 - amt); })); }
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return rgb2hex([0, 1, 2].map(function (i) { return A[i] + (B[i] - A[i]) * t; }));
  }

  /* ---------------------------------------------------------
     WHOLE ROLL — subprimal, face to the right
     --------------------------------------------------------- */
  function wholeRoll(opts) {
    const o = opts || {};
    const meat = o.meat || '#7d2a36';
    const fat = o.fat || '#efe0bd';
    const id = 'roll' + (o.seed || 1);
    const body =
      '<path d="M40,70 C60,42 120,32 200,36 C260,39 300,50 316,72 C330,92 326,120 308,138 C288,158 220,168 150,162 C86,157 40,140 34,112 C30,96 32,82 40,70 Z" fill="' + meat + '"/>' +
      /* fat cap along the top */
      '<path d="M44,66 C70,42 126,33 200,36 C258,39 298,50 314,70 C300,62 258,53 198,50 C128,47 74,55 44,66 Z" fill="' + fat + '"/>' +
      /* surface texture */
      '<g opacity=".28">' + marbleStrokes(40, (o.seed || 1) * 31, 0.6) +
      '<path d="M70,110 C130,98 210,100 290,116" stroke="' + fat + '" stroke-width="5" fill="none" opacity=".5"/></g>';

    const face =
      '<g transform="translate(232,20) scale(0.62)">' + ribeyeFace({
        id: id + '-face', meat: lighten(meat, 0.06), cap: meat, fat: fat, marble: o.marble == null ? 3 : o.marble, seed: (o.seed || 1) * 7
      }) + '</g>';

    return '<g>' + body + face +
      '<path d="M40,70 C60,42 120,32 200,36 C260,39 300,50 316,72 C330,92 326,120 308,138 C288,158 220,168 150,162 C86,157 40,140 34,112 C30,96 32,82 40,70 Z" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="2"/>' +
      '</g>';
  }

  /* ---------------------------------------------------------
     SCENES — each returns a full <svg> string for the stage
     p = 0..1 progress within that phase
     --------------------------------------------------------- */
  const VB = 'viewBox="0 0 440 320" xmlns="http://www.w3.org/2000/svg"';

  function fridgeBack() {
    return '<rect x="0" y="0" width="440" height="320" rx="18" fill="#141a1c"/>' +
      '<rect x="0" y="0" width="440" height="320" rx="18" fill="url(#fridgeGlow)"/>' +
      '<defs><linearGradient id="fridgeGlow" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#2b3a40" stop-opacity=".55"/><stop offset="100%" stop-color="#0d1214" stop-opacity=".2"/></linearGradient></defs>' +
      '<g stroke="#3a4a50" stroke-width="3" opacity=".5">' +
      '<line x1="22" y1="252" x2="418" y2="252"/>' +
      '<line x1="22" y1="262" x2="418" y2="262"/>' +
      '<line x1="22" y1="272" x2="418" y2="272"/></g>' +
      '<rect x="22" y="246" width="396" height="4" rx="2" fill="#51656d" opacity=".5"/>';
  }

  function enzyme(x, y, delay, label) {
    return '<g class="wob" style="animation-delay:' + delay + 's" transform="translate(' + x + ',' + y + ')">' +
      '<circle r="15" fill="#ffd66b" opacity=".95"/>' +
      '<path d="M0,0 L14,-7 A15,15 0 0,0 14,7 Z" fill="#141a1c" opacity=".85"/>' +
      '<circle cx="-3" cy="-6" r="2.6" fill="#141a1c"/>' +
      (label ? '<text x="0" y="30" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8.5" fill="#ffd66b" opacity=".8">' + label + '</text>' : '') +
      '</g>';
  }

  function sceneAging(p) {
    /* colour drifts from fresh purple-red toward a deeper aged tone */
    const meat = mix('#8a2f3d', '#5e2030', Math.min(1, p));
    const purge = 8 + p * 16;
    return '<svg ' + VB + '>' + fridgeBack() +
      '<g transform="translate(18,52)">' +
        /* bag */
        '<rect x="0" y="0" width="404" height="196" rx="26" fill="#cfe3ea" opacity=".16"/>' +
        '<g transform="translate(12,4) scale(1.06)">' + wholeRoll({ meat: meat, seed: 3 }) + '</g>' +
        /* purge liquid */
        '<path d="M8,' + (190 - purge) + ' C120,' + (184 - purge) + ' 300,' + (196 - purge) + ' 396,' + (188 - purge) + ' L396,188 Q396,196 386,196 L18,196 Q8,196 8,188 Z" fill="#6d1f2a" opacity=".55"/>' +
        /* bag shine */
        '<path d="M28,14 C120,4 300,6 380,18" stroke="#eaf6fa" stroke-width="5" fill="none" opacity=".22" stroke-linecap="round"/>' +
        '<path d="M16,60 C16,120 20,160 30,182" stroke="#eaf6fa" stroke-width="3" fill="none" opacity=".14"/>' +
        '<rect x="0" y="0" width="404" height="196" rx="26" fill="none" stroke="#cfe3ea" stroke-width="2" opacity=".3"/>' +
      '</g>' +
      enzyme(62, 94, 0, 'calpain') +
      enzyme(220, 62, 1.4, 'cathepsin') +
      enzyme(348, 212, 2.6, 'calpain') +
      '<text x="220" y="300" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#7d8f96">' + CFG().meat.fridgeTempF + '&#176;F  &#183;  do not open  &#183;  do not peek</text>' +
      '</svg>';
  }

  function sceneButchery(p) {
    const knifeY = -70 + Math.min(1, p * 2) * 102;
    let cuts = '';
    for (let i = 1; i <= 5; i++) {
      cuts += '<line x1="' + (60 + i * 46) + '" y1="40" x2="' + (54 + i * 46) + '" y2="200" stroke="#ffb347" stroke-width="2" stroke-dasharray="7 6" opacity=".8"/>';
    }
    return '<svg ' + VB + '>' +
      '<rect x="0" y="0" width="440" height="320" rx="18" fill="#1a1512"/>' +
      /* board */
      '<rect x="14" y="70" width="412" height="200" rx="14" fill="#8a6a45"/>' +
      '<rect x="14" y="70" width="412" height="200" rx="14" fill="url(#bg2)" opacity=".5"/>' +
      '<defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b08a5c"/><stop offset="100%" stop-color="#6b5136"/></linearGradient></defs>' +
      '<g opacity=".25" stroke="#4a3722" stroke-width="2">' +
      '<line x1="14" y1="112" x2="426" y2="112"/><line x1="14" y1="168" x2="426" y2="168"/><line x1="14" y1="224" x2="426" y2="224"/></g>' +
      '<g transform="translate(24,54) scale(0.92)">' + wholeRoll({ meat: '#bb3742', seed: 9 }) + '</g>' +
      cuts +
      /* knife */
      '<g transform="translate(150,' + knifeY.toFixed(1) + ')">' +
        '<path d="M0,0 L130,0 L150,16 L0,22 Z" fill="#cfd6db"/>' +
        '<path d="M0,0 L130,0 L150,16 L0,22 Z" fill="url(#steel)" opacity=".6"/>' +
        '<defs><linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#7d8991"/></linearGradient></defs>' +
        '<rect x="-72" y="1" width="74" height="18" rx="6" fill="#2b2320"/>' +
        '<circle cx="-56" cy="10" r="2.4" fill="#8a7d74"/><circle cx="-34" cy="10" r="2.4" fill="#8a7d74"/>' +
      '</g>' +
      '<text x="220" y="298" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#b08a5c">measure twice, cut fourteen times</text>' +
      '</svg>';
  }

  function sceneDry(p) {
    let racks = '';
    for (let i = 0; i < 6; i++) {
      const x = 26 + (i % 3) * 136;
      const y = 62 + Math.floor(i / 3) * 112;
      racks += '<g transform="translate(' + x + ',' + y + ') scale(0.44)">' +
        ribeyeFace({ id: 'dry' + i, meat: mix('#c23b42', '#9c3038', p), fat: '#f2e4c6', marble: 3, seed: 11 + i * 5, dull: p > 0.5 }) + '</g>';
    }
    let drops = '';
    for (let i = 0; i < 9; i++) {
      drops += '<circle class="bubble" style="animation-delay:' + (i * 0.34).toFixed(2) + 's" cx="' + (40 + i * 44) + '" cy="250" r="' + (2 + (i % 3)) + '" fill="#9fd8ea" opacity=".6"/>';
    }
    return '<svg ' + VB + '>' + fridgeBack() +
      '<g stroke="#6e828a" stroke-width="3" opacity=".8">' +
      '<line x1="14" y1="146" x2="426" y2="146"/><line x1="14" y1="258" x2="426" y2="258"/></g>' +
      '<g stroke="#54666d" stroke-width="2" opacity=".55">' +
      (function () { let s = ''; for (let i = 0; i < 22; i++) { s += '<line x1="' + (16 + i * 19) + '" y1="132" x2="' + (16 + i * 19) + '" y2="150"/><line x1="' + (16 + i * 19) + '" y1="244" x2="' + (16 + i * 19) + '" y2="262"/>'; } return s; })() +
      '</g>' + racks + drops +
      '<text x="220" y="302" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#7d8f96">uncovered &#183; 24 hours &#183; forming a pellicle</text>' +
      '</svg>';
  }

  function sceneSealed() {
    let stack = '';
    for (let i = 0; i < 4; i++) {
      const y = 44 + i * 58;
      const sk = 6 - i * 3;
      stack += '<g transform="translate(' + (58 + sk) + ',' + y + ')">' +
        '<rect x="0" y="0" width="324" height="50" rx="12" fill="#d9e9ef" opacity=".14"/>' +
        '<g transform="translate(96,-16) scale(0.36)">' + ribeyeFace({ id: 'sl' + i, meat: '#a13039', fat: '#f0e2c4', marble: 3, seed: 21 + i * 9 }) + '</g>' +
        '<g stroke="#eaf6fa" stroke-width="2" opacity=".2">' +
        '<path d="M14,10 C60,6 120,14 170,8 C220,2 280,12 312,8"/>' +
        '<path d="M14,42 C70,46 140,38 200,44 C250,48 290,40 312,44"/></g>' +
        '<rect x="0" y="0" width="324" height="50" rx="12" fill="none" stroke="#cfe3ea" stroke-width="1.6" opacity=".35"/>' +
        '<rect x="288" y="14" width="26" height="22" rx="4" fill="#0f1416" opacity=".6"/>' +
        '<text x="301" y="29" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" fill="#7fc26a">#' + (i + 1) + '</text>' +
        '</g>';
    }
    return '<svg ' + VB + '>' + fridgeBack() + stack +
      '<text x="220" y="302" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#7d8f96">vacuum sealed &#183; oxygen: none &#183; vibes: immaculate</text>' +
      '</svg>';
  }

  function sceneSousVide(p) {
    let bubbles = '';
    for (let i = 0; i < 14; i++) {
      bubbles += '<circle class="bubble" style="animation-delay:' + (i * 0.22).toFixed(2) + 's" cx="' + (44 + i * 26) + '" cy="242" r="' + (2 + (i % 4)) + '" fill="#bfe6f5" opacity=".75"/>';
    }
    const doneCol = mix('#a4303a', '#d86a72', Math.min(1, p));
    let bags = '';
    for (let i = 0; i < 3; i++) {
      bags += '<g transform="translate(' + (44 + i * 118) + ',108) rotate(' + (i * 4 - 4) + ')">' +
        '<rect x="0" y="0" width="104" height="112" rx="12" fill="#e6f5fb" opacity=".16"/>' +
        '<g transform="translate(2,10) scale(0.41)">' + ribeyeFace({ id: 'sv' + i, meat: doneCol, cap: doneCol, fat: '#f6ead2', marble: 3, seed: 41 + i * 13 }) + '</g>' +
        '<rect x="0" y="0" width="104" height="112" rx="12" fill="none" stroke="#cfe9f4" stroke-width="1.6" opacity=".4"/>' +
        '</g>';
    }
    return '<svg ' + VB + '>' +
      '<rect x="0" y="0" width="440" height="320" rx="18" fill="#101a1f"/>' +
      /* tub */
      '<rect x="16" y="62" width="408" height="210" rx="16" fill="#1a2b33" stroke="#33525f" stroke-width="3"/>' +
      '<rect x="24" y="86" width="392" height="178" rx="12" fill="#1b4a5e" opacity=".75"/>' +
      bags + bubbles +
      /* water surface */
      '<path d="M24,92 C80,84 130,100 190,94 C250,88 300,102 416,92" stroke="#8fd6ee" stroke-width="3" fill="none" opacity=".55"/>' +
      /* circulator */
      '<g transform="translate(352,18)">' +
        '<rect x="0" y="0" width="52" height="118" rx="12" fill="#22303a" stroke="#41616f" stroke-width="2"/>' +
        '<rect x="8" y="10" width="36" height="26" rx="5" fill="#04110f"/>' +
        '<text x="26" y="28" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="13" fill="#7fc26a" id="svTemp">' + CFG().cook.sousVideTempF + '</text>' +
        '<circle cx="26" cy="56" r="8" fill="#0f1a1f" stroke="#4d707f" stroke-width="2"/>' +
        '<rect x="14" y="96" width="24" height="42" rx="6" fill="#2b3d47"/>' +
      '</g>' +
      '<text x="200" y="302" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#6f9aab">' + CFG().cook.sousVideTempF + '&#176;F &#183; edge to edge &#183; nothing can go wrong in here</text>' +
      '</svg>';
  }

  function sceneSear(p) {
    let flames = '';
    for (let i = 0; i < 9; i++) {
      const x = 62 + i * 38;
      flames += '<path class="flicker" style="animation-delay:' + (i * 0.17).toFixed(2) + 's" d="M' + x + ',236 C' + (x - 11) + ',216 ' + (x + 9) + ',210 ' + x + ',186 C' + (x + 14) + ',208 ' + (x + 13) + ',224 ' + x + ',236 Z" fill="' + (i % 2 ? '#ff8a2b' : '#ffc247') + '" opacity=".9"/>';
    }
    let smoke = '';
    for (let i = 0; i < 5; i++) {
      smoke += '<circle class="bubble" style="animation-delay:' + (i * 0.6).toFixed(2) + 's" cx="' + (130 + i * 48) + '" cy="150" r="' + (9 + i * 2) + '" fill="#cbbdb2" opacity=".14"/>';
    }
    let grate = '';
    for (let i = 0; i < 9; i++) grate += '<rect x="' + (34 + i * 43) + '" y="150" width="14" height="92" rx="7" fill="#2a2320" stroke="#4a3d36" stroke-width="1.5"/>';
    return '<svg ' + VB + '>' +
      '<rect x="0" y="0" width="440" height="320" rx="18" fill="#150d09"/>' +
      '<ellipse cx="220" cy="214" rx="216" ry="112" fill="#521f06"/>' +
      '<ellipse cx="220" cy="222" rx="176" ry="86" fill="#a13a07" opacity=".8"/>' +
      '<ellipse cx="220" cy="230" rx="124" ry="58" fill="#e06a12" opacity=".7"/>' +
      '<rect x="20" y="146" width="400" height="100" rx="14" fill="#1d1613" opacity=".55"/>' + grate +
      flames +
      '<g transform="translate(112,102) scale(0.78)" class="sizzle">' +
        ribeyeFace({ id: 'sear1', meat: mix('#c2535a', '#6b3520', Math.min(1, p)), cap: '#8a4226', fat: '#e8cfa4', marble: 3, seed: 77, crust: p > 0.35 }) +
      '</g>' +
      smoke +
      '<g transform="translate(340,42)">' +
        '<rect x="0" y="0" width="76" height="30" rx="8" fill="#0d0907" stroke="#5a3a22" stroke-width="2"/>' +
        '<text x="38" y="21" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="14" fill="#ff8a2b">' + CFG().cook.grillTempF + '&#176;F</text>' +
      '</g>' +
      '<text x="220" y="300" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#c08a52">' + CFG().cook.grill + ' &#183; ' + CFG().cook.searSecondsPerSide + ' seconds a side &#183; do not walk away</text>' +
      '</svg>';
  }

  function sceneServed() {
    let slices = '';
    for (let i = 0; i < 7; i++) {
      const x = 92 + i * 36, y = 120 + Math.sin(i * 0.8) * 4;
      slices += '<g transform="translate(' + x + ',' + y + ') rotate(' + (i * 2.6 - 8) + ')">' +
        '<rect x="0" y="0" width="44" height="82" rx="10" fill="#e07f86"/>' +
        '<rect x="0" y="0" width="44" height="12" rx="6" fill="#4a2716"/>' +
        '<rect x="0" y="70" width="44" height="12" rx="6" fill="#4a2716"/>' +
        '<path d="M8,30 q7,-3 13,1" stroke="#f6e4d2" stroke-width="2" fill="none" opacity=".6"/>' +
        '<path d="M22,52 q8,-3 14,2" stroke="#f6e4d2" stroke-width="2" fill="none" opacity=".5"/>' +
        '<rect x="0" y="0" width="44" height="82" rx="10" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>' +
        '</g>';
    }
    let steam = '';
    for (let i = 0; i < 4; i++) steam += '<circle class="bubble" style="animation-delay:' + (i * 0.7) + 's" cx="' + (140 + i * 56) + '" cy="120" r="' + (7 + i) + '" fill="#fff" opacity=".1"/>';
    return '<svg ' + VB + '>' +
      '<rect x="0" y="0" width="440" height="320" rx="18" fill="#171210"/>' +
      '<ellipse cx="220" cy="176" rx="196" ry="104" fill="#e9e2d6"/>' +
      '<ellipse cx="220" cy="176" rx="170" ry="86" fill="#f6f1e8"/>' +
      slices + steam +
      '<g transform="translate(300,196)"><path d="M0,0 q10,-14 22,-4 q-6,12 -22,4 Z" fill="#6f8f4a"/><path d="M6,2 q14,-8 26,2 q-12,10 -26,-2 Z" fill="#82a457"/></g>' +
      '<circle cx="122" cy="212" r="3.4" fill="#e9e0c9"/><circle cx="136" cy="220" r="2.6" fill="#e9e0c9"/><circle cx="150" cy="210" r="3" fill="#e9e0c9"/>' +
      '<text x="220" y="296" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="12" fill="#c9b79f">mission accomplished</text>' +
      '</svg>';
  }

  /* ---------- small steak tile for the grid ---------- */
  function steakTile(i, state, claimed) {
    const seed = 101 + i * 37;
    const cols = {
      fresh:  { meat: '#c23b42', fat: '#f4e6c8' },
      dry:    { meat: '#a8303a', fat: '#efdfbe' },
      sealed: { meat: '#9c2f38', fat: '#eddcb8' },
      bath:   { meat: '#d1666e', fat: '#f6ead2' },
      seared: { meat: '#cf6f72', fat: '#e8cfa4' }
    }[state] || { meat: '#c23b42', fat: '#f4e6c8' };
    let extra = '';
    if (state === 'sealed') extra = '<rect x="4" y="10" width="232" height="152" rx="14" fill="#dff0f6" opacity=".16"/><rect x="4" y="10" width="232" height="152" rx="14" fill="none" stroke="#cfe3ea" stroke-width="2" opacity=".35"/>';
    if (state === 'seared') extra = '<g opacity=".55" stroke="#3a1a0d" stroke-width="9" stroke-linecap="round"><line x1="44" y1="52" x2="182" y2="104"/><line x1="36" y1="92" x2="172" y2="138"/></g>';
    return '<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg">' +
      ribeyeFace({ id: 'tile' + i, meat: cols.meat, cap: darken(cols.meat, 0.1), fat: cols.fat, marble: 3, seed: seed, crust: state === 'seared' }) +
      extra +
      (claimed ? '<circle cx="212" cy="30" r="15" fill="#e9b93f"/><text x="212" y="36" text-anchor="middle" font-size="17">&#9733;</text>' : '') +
      '</svg>';
  }

  /* ---------- marbling lab ---------- */
  function marbleCard(idx) {
    return '<svg viewBox="0 0 240 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">' +
      ribeyeFace({ id: 'mrb' + idx, meat: '#b8323c', fat: '#f4e6c8', marble: idx, seed: 555 }) +
      '</svg>';
  }

  /* ---------- anatomy diagram ---------- */
  function anatomy() {
    return '<svg viewBox="-10 0 280 190" xmlns="http://www.w3.org/2000/svg">' +
      ribeyeFace({ id: 'anat', meat: '#b8323c', fat: '#f4e6c8', marble: 3, seed: 909, parts: true }) +
      '<g font-family="JetBrains Mono,monospace" font-size="9" fill="#f6ece0" opacity=".75">' +
      '<text x="96" y="92">EYE</text>' +
      '<text x="162" y="62">CAP</text>' +
      '<text x="34" y="150">COMPLEXUS</text>' +
      '</g></svg>';
  }

  /* ---------- doneness cross-section ---------- */
  function donenessSlab(d) {
    /* d.core = interior colour, d.grey = how far the overcooked band reaches (0..1) */
    const grey = mix(d.core, '#b6a99e', Math.min(1, d.grey * 0.95 + 0.05));
    const inner = (12 + d.grey * 24).toFixed(1);
    /* marbling, clipped to the interior so it reads as fat and not as noise */
    let fat = '';
    const r = rng(8123);
    for (let i = 0; i < 34; i++) {
      const x = 34 + r() * 252, y = 50 + r() * 82, len = 5 + r() * 16, lift = (r() - 0.5) * 7;
      fat += '<path d="M' + x.toFixed(1) + ',' + y.toFixed(1) + ' q' + (len / 2).toFixed(1) + ',' +
        lift.toFixed(1) + ' ' + len.toFixed(1) + ',' + (lift * 0.3).toFixed(1) +
        '" stroke="#f7ecd6" stroke-width="' + (1 + r() * 1.6).toFixed(2) +
        '" fill="none" stroke-linecap="round" opacity="' + (0.3 + r() * 0.4).toFixed(2) + '"/>';
    }
    /* char marks sitting on the crust */
    let marks = '';
    for (let i = 0; i < 5; i++) {
      const x = 44 + i * 52;
      marks += '<rect x="' + x + '" y="30" width="15" height="12" rx="4" fill="#1d0c05" opacity=".75"/>' +
               '<rect x="' + (x + 12) + '" y="138" width="15" height="12" rx="4" fill="#1d0c05" opacity=".7"/>';
    }
    return '<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">' +
      '<defs>' +
        '<linearGradient id="dnG" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + grey + '"/>' +
          '<stop offset="' + inner + '%" stop-color="' + d.core + '"/>' +
          '<stop offset="' + (100 - inner).toFixed(1) + '%" stop-color="' + d.core + '"/>' +
          '<stop offset="100%" stop-color="' + grey + '"/>' +
        '</linearGradient>' +
        '<clipPath id="dnClip"><rect x="24" y="42" width="272" height="96" rx="16"/></clipPath>' +
      '</defs>' +
      /* crust */
      '<rect x="14" y="32" width="292" height="116" rx="26" fill="#3d1c0b"/>' +
      '<rect x="19" y="37" width="282" height="106" rx="21" fill="#59300f" opacity=".85"/>' +
      /* interior */
      '<rect x="24" y="42" width="272" height="96" rx="16" fill="url(#dnG)"/>' +
      '<g clip-path="url(#dnClip)">' + fat + '</g>' +
      marks +
      '<text x="160" y="176" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="#b19d8c">cross section &#183; ' + d.f + '&#176;F</text>' +
      '</svg>';
  }

  global.MeatSVG = {
    ribeyeFace: ribeyeFace,
    wholeRoll: wholeRoll,
    steakTile: steakTile,
    marbleCard: marbleCard,
    anatomy: anatomy,
    donenessSlab: donenessSlab,
    scenes: {
      aging: sceneAging,
      butchery: sceneButchery,
      drydown: sceneDry,
      sealed: sceneSealed,
      sousvide: sceneSousVide,
      sear: sceneSear,
      served: sceneServed
    },
    mix: mix, lighten: lighten, darken: darken
  };

})(window);
