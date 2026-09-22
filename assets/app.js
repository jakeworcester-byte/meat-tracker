/* =============================================================
   MEAT TRACKER — engine
   ============================================================= */
(function () {
  'use strict';

  const CFG = window.MEAT_CONFIG;
  const C = window.MeatContent;
  const S = window.MeatSVG;

  const $ = function (id) { return document.getElementById(id); };
  const DAY = 86400000;

  /* ---------- dates ---------- */
  function d(str, hour) {
    const p = str.split('-').map(Number);
    const h = hour || 0;
    return new Date(p[0], p[1] - 1, p[2], Math.floor(h), Math.round((h % 1) * 60), 0, 0);
  }

  const D = {
    packed: d(CFG.dates.packed),
    fridge: d(CFG.dates.fridge),
    cut: d(CFG.dates.cut, 9),
    dryStart: d(CFG.dates.cut, 13),
    seal: d(CFG.dates.seal, 12),
    bathIn: d(CFG.dates.cook, CFG.cookDay.sousVideIn),
    searAt: d(CFG.dates.cook, CFG.cookDay.searTime),
    serveAt: d(CFG.dates.cook, CFG.cookDay.serveTime)
  };

  /* phase boundaries, in order */
  const BOUNDS = [
    ['aging', D.fridge, D.cut],
    ['butchery', D.cut, D.dryStart],
    ['drydown', D.dryStart, D.seal],
    ['sealed', D.seal, D.bathIn],
    ['sousvide', D.bathIn, D.searAt],
    ['sear', D.searAt, D.serveAt],
    ['served', D.serveAt, new Date(D.serveAt.getTime() + 2 * DAY)]
  ];

  const T0 = D.fridge.getTime();
  const T1 = D.serveAt.getTime() + 0.5 * DAY;
  const TOTAL_DAYS = Math.round((D.serveAt - D.fridge) / DAY);

  /* ---------- state ---------- */
  let virtualNow = null;          // null = live
  let lastPhaseId = null;
  let lastStageP = -1;
  let lastSteakState = '__init';

  function now() { return virtualNow ? new Date(virtualNow) : new Date(); }

  function getState() {
    const t = now().getTime();
    if (CFG.forcePhase) {
      const i = BOUNDS.findIndex(function (b) { return b[0] === CFG.forcePhase; });
      if (i >= 0) return { i: i, id: BOUNDS[i][0], p: 0.5, overall: i / 6 };
    }
    if (t < BOUNDS[0][1].getTime()) return { i: 0, id: 'aging', p: 0, overall: 0, pre: true };
    for (let i = 0; i < BOUNDS.length; i++) {
      const b = BOUNDS[i];
      if (t < b[2].getTime() || i === BOUNDS.length - 1) {
        const span = b[2].getTime() - b[1].getTime();
        const p = Math.max(0, Math.min(1, (t - b[1].getTime()) / span));
        return {
          i: i, id: b[0], p: p,
          overall: Math.max(0, Math.min(1, (t - T0) / (D.serveAt.getTime() - T0)))
        };
      }
    }
    return { i: 6, id: 'served', p: 1, overall: 1 };
  }

  function fmtDate(dt) {
    return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function fmtShort(dt) {
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /* =========================================================
     LIVE CONSOLE
     ========================================================= */
  function renderConsole() {
    const st = getState();
    const ph = C.PHASES[st.i];

    /* stage art */
    if (lastPhaseId !== st.id || Math.abs(st.p - lastStageP) > 0.05) {
      $('stage').innerHTML = S.scenes[st.id](st.p);
      lastPhaseId = st.id;
      lastStageP = st.p;
    }

    $('phaseTag').textContent = 'Stage ' + (st.i + 1) + ' of 7 · ' + ph.tag;
    $('phaseName').textContent = ph.name;
    $('phaseBlurb').textContent = ph.blurb;
    $('consoleDate').textContent = fmtDate(now()) + ' · ' + now().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    $('consoleWeight').textContent = CFG.meat.grade + ' · ' + CFG.meat.weightLbs + ' lb · ' + CFG.meat.cut;

    /* meter */
    const pct = Math.round(st.overall * 100);
    $('meterFill').style.width = pct + '%';
    $('meterPct').textContent = pct + '%';
    $('meterLabel').textContent = 'Journey to Steak Day · ' + TOTAL_DAYS + ' days total';

    renderCountdown();
    renderVitals(st);
    paintTimeline(st);
  }

  function renderCountdown() {
    const target = D.serveAt.getTime();
    const diff = target - now().getTime();
    const el = $('countdown');
    if (diff <= 0) {
      el.innerHTML = cell('✓', 'Served') + cell(TOTAL_DAYS, 'Days taken') +
        cell(CFG.meat.steakCount, 'Steaks') + cell('0', 'Regrets');
      return;
    }
    const s = Math.floor(diff / 1000);
    el.innerHTML =
      cell(Math.floor(s / 86400), 'Days') +
      cell(pad(Math.floor(s / 3600) % 24), 'Hours') +
      cell(pad(Math.floor(s / 60) % 60), 'Min') +
      cell(pad(s % 60), 'Sec');
  }
  function cell(v, l) { return '<div class="cd-cell"><b>' + v + '</b><span>' + l + '</span></div>'; }
  function pad(n) { return String(n).padStart(2, '0'); }

  function renderVitals(st) {
    const agingDays = Math.max(0, Math.floor((now() - D.fridge) / DAY));
    const targetDays = Math.round((D.cut - D.fridge) / DAY);
    const toCook = Math.max(0, Math.ceil((D.bathIn - now()) / DAY));
    const sets = {
      aging: [[agingDays, 'Days aged'], [targetDays, 'Day target'], [CFG.meat.fridgeTempF + '°', 'Fridge temp']],
      butchery: [[CFG.meat.steakCount, 'Steaks out'], [CFG.meat.steakThickness, 'Thickness'], [CFG.meat.weightLbs, 'Lb of beef']],
      drydown: [['24', 'Hours open'], ['0', 'Times covered'], ['Matte', 'Surface']],
      sealed: [[CFG.meat.steakCount, 'Sealed'], ['0%', 'Oxygen'], [toCook, 'Days to go']],
      sousvide: [[CFG.cook.sousVideTempF + '°', 'Bath temp'], [CFG.cook.sousVideHours + ' hr', 'In the bath'], ['0', 'Grey band']],
      sear: [[CFG.cook.grillTempF + '°', 'Grill temp'], [CFG.cook.searSecondsPerSide + 's', 'Per side'], ['1', 'Flip only']],
      served: [[TOTAL_DAYS, 'Days taken'], [CFG.meat.steakCount, 'Steaks served'], ['0', 'Leftovers']]
    };
    $('vitals').innerHTML = (sets[st.id] || sets.aging).map(function (v) {
      return '<div class="vital"><b>' + v[0] + '</b><span>' + v[1] + '</span></div>';
    }).join('');
  }

  /* =========================================================
     TIMELINE
     ========================================================= */
  let selectedPhase = null;

  function buildTimeline() {
    $('timeline').innerHTML = C.PHASES.map(function (p, i) {
      return '<button class="tl-card" data-i="' + i + '">' +
        '<span class="ico">' + p.icon + '</span>' +
        '<h4>' + p.short + '</h4>' +
        '<div class="when">' + fmtShort(BOUNDS[i][1]) + '</div>' +
        '</button>';
    }).join('');
    Array.prototype.forEach.call($('timeline').children, function (btn) {
      btn.addEventListener('click', function () {
        selectedPhase = +btn.dataset.i;
        renderDetail(selectedPhase);
        paintTimeline(getState());
      });
    });
  }

  function paintTimeline(st) {
    Array.prototype.forEach.call($('timeline').children, function (btn, i) {
      btn.classList.toggle('done', i < st.i);
      btn.classList.toggle('now', i === st.i);
      btn.classList.toggle('sel', selectedPhase === i);
    });
  }

  function renderDetail(i) {
    const p = C.PHASES[i];
    const start = BOUNDS[i][1], end = BOUNDS[i][2];
    const when = (i >= 4)
      ? fmtDate(start) + ', ' + start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      : fmtDate(start) + '  →  ' + fmtDate(end);
    $('tlDetail').innerHTML =
      '<div class="when">' + when + '</div>' +
      '<h3>' + p.icon + ' ' + p.name + '</h3>' +
      '<p>' + p.detail + '</p>' +
      '<div class="sci"><b>' + p.sciTitle + '</b>' + p.sci + '</div>';
  }

  /* =========================================================
     STEAKS
     ========================================================= */
  const LS_KEY = 'meat-tracker-claims-v1';
  function loadClaims() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveClaims(c) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(c)); } catch (e) { /* private mode, fine */ }
  }

  function steakState() {
    const id = getState().id;
    if (id === 'butchery') return 'fresh';
    if (id === 'drydown') return 'dry';
    if (id === 'sealed') return 'sealed';
    if (id === 'sousvide') return 'bath';
    if (id === 'sear' || id === 'served') return 'seared';
    return null;
  }

  function renderSteaks(force) {
    const state = steakState();
    const bar = $('steakBar');
    const area = $('steakArea');
    const days = Math.max(0, Math.ceil((D.cut - now()) / DAY));
    const key = state + '|' + (state ? '' : days);
    if (!force && key === lastSteakState) return;
    lastSteakState = key;

    if (!state) {
      bar.innerHTML = '';
      area.innerHTML = '<div class="locked">' +
        '<div class="big">🔒</div>' +
        '<h3 style="font-size:24px">Still One Big Piece Of Beef</h3>' +
        '<p>The roll has not been cut yet. In <b style="color:var(--ember2)">' + days + ' day' + (days === 1 ? '' : 's') +
        '</b> it becomes ' + CFG.meat.steakCount + ' individual steaks and this grid unlocks. ' +
        'Use the Time Machine above if you cannot wait, which, honestly, fair.</p>' +
        '<div style="max-width:420px;margin:22px auto 0"><svg viewBox="0 0 360 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">' +
        S.wholeRoll({ meat: '#6e2433', seed: 5 }) + '</svg></div>' +
        '</div>';
      return;
    }

    const claims = loadClaims();
    const mine = Object.keys(claims).length;
    bar.innerHTML =
      '<button class="btn primary" id="randomClaim">Claim one at random</button>' +
      '<button class="btn" id="clearClaims">Clear my claims</button>' +
      '<span class="note">You have claimed <b style="color:var(--gold)">' + mine + '</b> of ' + CFG.meat.steakCount +
      '. Saved in this browser only.</span>';

    let html = '<div class="steakgrid">';
    for (let i = 0; i < CFG.meat.steakCount; i++) {
      const nm = claims[i];
      html += '<div class="steak' + (nm ? ' mine' : '') + '" data-i="' + i + '" tabindex="0" role="button" aria-label="Steak ' + (i + 1) + '">' +
        S.steakTile(i, state, !!nm) +
        '<div class="lab">STEAK ' + String(i + 1).padStart(2, '0') + '</div>' +
        '<div class="nm">' + (nm ? escapeHtml(nm) : 'unclaimed') + '</div>' +
        '</div>';
    }
    html += '</div>';
    area.innerHTML = html;

    Array.prototype.forEach.call(area.querySelectorAll('.steak'), function (el) {
      const go = function () { toggleClaim(+el.dataset.i); };
      el.addEventListener('click', go);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('randomClaim').addEventListener('click', function () {
      const claims = loadClaims();
      const free = [];
      for (let i = 0; i < CFG.meat.steakCount; i++) if (!claims[i]) free.push(i);
      if (!free.length) { toast('Every steak on this page is spoken for. Impressive.'); return; }
      const pick = free[Math.floor(Math.random() * free.length)];
      claims[pick] = randomName(claims);
      saveClaims(claims);
      renderSteaks(true);
      toast('Steak ' + String(pick + 1).padStart(2, '0') + ' is yours. Its name is ' + claims[pick] + '.');
    });
    $('clearClaims').addEventListener('click', function () {
      saveClaims({});
      renderSteaks(true);
      toast('Claims released. The steaks are free again.');
    });
  }

  function randomName(claims) {
    const used = Object.keys(claims).map(function (k) { return claims[k]; });
    const pool = C.STEAK_NAMES.filter(function (n) { return used.indexOf(n) < 0; });
    return (pool.length ? pool : C.STEAK_NAMES)[Math.floor(Math.random() * (pool.length || C.STEAK_NAMES.length))];
  }

  function toggleClaim(i) {
    const claims = loadClaims();
    if (claims[i]) {
      const next = window.prompt('Rename your steak, or clear the box to release it.', claims[i]);
      if (next === null) return;
      if (!next.trim()) { delete claims[i]; toast('Steak ' + String(i + 1).padStart(2, '0') + ' released back into the wild.'); }
      else claims[i] = next.trim().slice(0, 28);
    } else {
      const suggest = randomName(claims);
      const next = window.prompt('Claim steak ' + String(i + 1).padStart(2, '0') + '. Give it a name:', suggest);
      if (next === null) return;
      claims[i] = (next.trim() || suggest).slice(0, 28);
      toast('Claimed. Say hello to ' + claims[i] + '.');
    }
    saveClaims(claims);
    renderSteaks(true);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* =========================================================
     MARBLING LAB
     ========================================================= */
  function renderMarble(idx) {
    const g = C.GRADES[idx];
    $('marbleSvg').innerHTML = S.marbleCard(idx);
    $('gradeName').textContent = g.name;
    $('gradeSub').textContent = g.sub;
    $('gradeBlurb').textContent = g.blurb;
    $('gradeStats').innerHTML = g.stats.map(function (s) {
      return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>';
    }).join('');
    Array.prototype.forEach.call($('marbleTicks').children, function (t, i) {
      t.classList.toggle('on', i === idx);
    });
  }

  /* =========================================================
     ANATOMY
     ========================================================= */
  function renderAnatomy() {
    $('anatSvg').innerHTML = S.anatomy();
    $('anatList').innerHTML = C.ANATOMY.map(function (a, i) {
      return '<div class="anat-item' + (i === 1 ? ' on' : '') + '" data-k="' + a.key + '">' +
        '<h4>' + a.name + ' <span class="lat">' + a.lat + '</span></h4>' +
        '<p>' + a.text + '</p></div>';
    }).join('');

    function select(key) {
      Array.prototype.forEach.call($('anatList').children, function (el) {
        el.classList.toggle('on', el.dataset.k === key);
      });
      Array.prototype.forEach.call($('anatSvg').querySelectorAll('.part'), function (el) {
        el.classList.toggle('on', el.dataset.part === key);
      });
    }
    Array.prototype.forEach.call($('anatList').children, function (el) {
      el.addEventListener('click', function () { select(el.dataset.k); });
    });
    Array.prototype.forEach.call($('anatSvg').querySelectorAll('.part'), function (el) {
      el.addEventListener('click', function () { select(el.dataset.part); });
    });
    select('cap');
  }

  /* =========================================================
     DONENESS
     ========================================================= */
  function renderDoneness(key) {
    const dn = C.DONENESS.find(function (x) { return x.key === key; });
    $('doneSvg').innerHTML = S.donenessSlab(dn);
    $('doneName').textContent = dn.name;
    $('doneTemp').textContent = dn.f + '°F · ' + dn.c + '°C';
    $('doneDesc').textContent = dn.desc;
    $('doneVerdict').textContent = dn.verdict;
    $('doneStats').innerHTML = [
      [dn.f + '°F', 'Bath temp'],
      [CFG.cook.sousVideHours + ' hr', 'Bath time'],
      ['60s', 'Sear per side']
    ].map(function (s) { return '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('');
    Array.prototype.forEach.call($('doneBtns').children, function (b) {
      b.classList.toggle('on', b.dataset.k === key);
    });
  }

  function buildDoneness() {
    $('doneBtns').innerHTML = C.DONENESS.map(function (x) {
      return '<button data-k="' + x.key + '">' + x.name + '</button>';
    }).join('');
    Array.prototype.forEach.call($('doneBtns').children, function (b) {
      b.addEventListener('click', function () { renderDoneness(b.dataset.k); });
    });
    renderDoneness('mr');
  }

  /* =========================================================
     COOK DAY CARDS
     ========================================================= */
  function buildCookCards() {
    const t = function (h) { return d(CFG.dates.cook, h).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
    const cards = [
      ['①', t(CFG.cookDay.sousVideIn), 'Into the bath',
        'Sealed steaks go straight from the fridge into water held at ' + CFG.cook.sousVideTempF + ' degrees. No thawing step, no unwrapping, no fuss. They stay in for about ' + CFG.cook.sousVideHours + ' hours, and an extra hour will not hurt anything.'],
      ['②', t(CFG.cookDay.sousVideOut), 'Out, dry, and rest',
        'Bags come out, steaks come out of the bags, and every surface gets patted completely dry with paper towels. Then they sit on a rack for ' + CFG.cook.restBeforeSearMin + ' minutes. A wet steak steams instead of searing, and that is the whole ballgame.'],
      ['③', t(CFG.cookDay.searTime), 'Fire',
        'The ' + CFG.cook.grill + ' runs wide open around ' + CFG.cook.grillTempF + ' degrees. ' + CFG.cook.searSecondsPerSide + ' seconds down, flip once, ' + CFG.cook.searSecondsPerSide + ' seconds down, off. Tongs only. Do not press it, do not poke it, do not walk away from it.'],
      ['④', t(CFG.cookDay.serveTime), 'Forks up',
        'Straight from the grill to the board to the plate. No rest needed because the bath already handled that. Flaky salt on the cut surface, and the cap muscle goes to whoever has been the most patient about this website.']
    ];
    $('cookCards').innerHTML = cards.map(function (c) {
      return '<div class="card"><span class="big">' + c[0] + '</span>' +
        '<div class="mono" style="font-size:12px;color:var(--muted2);letter-spacing:.1em">' + c[1] + '</div>' +
        '<h4 style="margin-top:6px">' + c[2] + '</h4><p>' + c[3] + '</p></div>';
    }).join('');
  }

  /* =========================================================
     FAQ + TICKER + ORACLE
     ========================================================= */
  function buildFaq() {
    $('faqList').innerHTML = C.FAQ.map(function (f, i) {
      return '<details' + (i === 0 ? ' open' : '') + '><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>';
    }).join('');
  }

  let tickerPool = [], tickerIdx = 0;
  function refreshTickerPool() {
    const id = getState().id;
    const agingDays = Math.max(0, Math.floor((now() - D.fridge) / DAY));
    tickerPool = (C.TICKER_BY_PHASE[id] || C.TICKER_BY_PHASE.aging)
      .map(function (s) { return s.replace('{day}', agingDays); });
    tickerIdx = Math.floor(Math.random() * tickerPool.length);
  }
  function pushTicker() {
    if (!tickerPool.length) refreshTickerPool();
    const el = $('ticker');
    const stamp = now().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' });
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = '<span class="t">' + stamp + '</span><span>' + tickerPool[tickerIdx % tickerPool.length] + '</span>';
    el.insertBefore(row, el.firstChild);
    tickerIdx++;
    while (el.children.length > 12) el.removeChild(el.lastChild);
  }

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('on'); }, 3200);
  }

  /* =========================================================
     TIME MACHINE
     ========================================================= */
  /* The last three stages happen inside a single afternoon, so a linear
     slider would make them impossible to land on. Give every stage an
     equal slice of the track instead. */
  const SEG = 1000 / BOUNDS.length;

  function sliderToTime(v) {
    const i = Math.min(BOUNDS.length - 1, Math.floor(v / SEG));
    const local = Math.max(0, Math.min(1, (v - i * SEG) / SEG));
    const b = BOUNDS[i];
    return b[1].getTime() + local * (b[2].getTime() - b[1].getTime());
  }
  function timeToSlider(t) {
    for (let i = 0; i < BOUNDS.length; i++) {
      const b = BOUNDS[i];
      if (t < b[2].getTime() || i === BOUNDS.length - 1) {
        const local = Math.max(0, Math.min(1, (t - b[1].getTime()) / (b[2].getTime() - b[1].getTime())));
        return Math.round((i + local) * SEG);
      }
    }
    return 1000;
  }
  function tmLabelFor(dt, i) {
    return i >= 4
      ? fmtShort(dt) + ' ' + dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      : fmtShort(dt);
  }

  function setupTimeMachine() {
    const slider = $('tm');
    const label = $('tmLabel');
    const reset = $('tmReset');

    function liveMode() {
      virtualNow = null;
      slider.value = timeToSlider(Date.now());
      label.textContent = 'Live';
      $('liveChip').classList.remove('travel');
      $('liveChipText').textContent = 'Live';
      reset.hidden = true;
      lastPhaseId = null;
      refreshTickerPool();
      renderAll();
    }

    slider.addEventListener('input', function () {
      const v = +slider.value;
      virtualNow = new Date(sliderToTime(v));
      label.textContent = tmLabelFor(virtualNow, Math.min(BOUNDS.length - 1, Math.floor(v / SEG)));
      $('liveChip').classList.add('travel');
      $('liveChipText').textContent = 'Time Travel';
      reset.hidden = false;
      refreshTickerPool();
      renderAll();
    });
    reset.addEventListener('click', liveMode);
    liveMode();
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function renderAll() {
    renderConsole();
    renderSteaks();
  }

  function boot() {
    $('heroSub').textContent =
      'One ' + CFG.meat.grade + ' whole ribeye. ' + CFG.meat.steakCount + ' steaks. ' + TOTAL_DAYS +
      ' days from the bag to the board, tracked here in something uncomfortably close to real time.';

    buildTimeline();
    selectedPhase = getState().i;
    renderDetail(selectedPhase);
    buildDoneness();
    buildCookCards();
    buildFaq();
    renderAnatomy();

    renderMarble(3);
    $('marbleRange').addEventListener('input', function (e) { renderMarble(+e.target.value); });

    $('oracleBtn').addEventListener('click', function () {
      $('oracleOut').textContent = C.ORACLE[Math.floor(Math.random() * C.ORACLE.length)];
    });

    $('footTime').textContent = 'last refreshed ' + new Date().toLocaleString();

    setupTimeMachine();

    refreshTickerPool();
    for (let i = 0; i < 6; i++) pushTicker();
    setInterval(pushTicker, 3400);

    setInterval(function () {
      if (!virtualNow) { renderCountdown(); }
    }, 1000);
    setInterval(function () {
      if (!virtualNow) { renderConsole(); renderSteaks(); }
    }, 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
