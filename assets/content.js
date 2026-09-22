/* =============================================================
   MEAT TRACKER — all the words
   ============================================================= */
(function (global) {
  'use strict';

  const PHASES = [
    {
      id: 'aging',
      icon: '😴',
      name: 'The Long Nap',
      short: 'Wet Aging',
      tag: 'Cryovac, undisturbed',
      blurb: 'The ribeye is sealed in its own private vacuum, sitting at 36 degrees, doing absolutely nothing visible and an enormous amount of chemistry.',
      detail: 'This is wet aging. The subprimal stays in the bag it was packed in, and the beef’s own enzymes go to work on the connective tissue and muscle proteins. No air, no mold, no shrinkage, no smell. Just time. Twenty one days is the floor for a noticeable difference. Twenty eight is where most of the tenderizing has already happened and you start hitting diminishing returns.',
      sci: 'Two enzyme families do the work. Calpains break down the proteins that hold muscle fibers rigid, and they do most of their damage in the first 10 to 14 days. Cathepsins are slower and keep chipping away at connective tissue for weeks. Neither one needs oxygen, which is why a sealed bag works fine.',
      sciTitle: 'What is actually happening'
    },
    {
      id: 'butchery',
      icon: '🔪',
      name: 'Butchery Day',
      short: 'The Cut',
      tag: 'Bag comes off',
      blurb: 'The bag opens, the beef hits oxygen and blooms from deep purple to bright red in about fifteen minutes, and one roll becomes fourteen steaks.',
      detail: 'The roll comes out, gets patted dry, and the outer fat gets tidied up. Then it is cut into steaks about an inch and a half thick, which is the thickness where sous vide plus a hard sear gives you a real crust without a grey band underneath. Thinner than that and the sear cooks past the surface. Thicker and it stops fitting on a plate like a reasonable person.',
      sci: 'The color change is myoglobin, not blood. In the bag, with no oxygen, myoglobin sits as purple deoxymyoglobin. Expose it to air and it grabs oxygen to become bright red oxymyoglobin. That is the bloom. Leave it out for days and it eventually oxidizes to brown metmyoglobin, which is where the supermarket markdown rack comes from.',
      sciTitle: 'Why it changes color'
    },
    {
      id: 'drydown',
      icon: '💨',
      name: 'The Dry-Down',
      short: 'Pellicle',
      tag: 'Uncovered, 24 hours',
      blurb: 'The steaks go back in the fridge naked on a rack. Air moves over them. Surface moisture leaves. The crust you get later is decided right here.',
      detail: 'A wet steak cannot brown. Every bit of surface water has to boil off before the surface can get above 212 degrees, and browning does not really start until around 300. Twenty four hours uncovered on a wire rack in a cold fridge pulls the surface moisture out and leaves a slightly tacky, matte skin called a pellicle. It also lightly seasons the surface if you salt first, which you should.',
      sci: 'This is where the dry brine happens too. Salt on the surface pulls moisture out, dissolves into it, and then that concentrated brine gets reabsorbed and carried into the muscle. The salt denatures some proteins so they hold water better during cooking. Result: seasoned all the way through, and a drier surface than when you started.',
      sciTitle: 'Dry brining, explained'
    },
    {
      id: 'sealed',
      icon: '🧊',
      name: 'Cryo-Sleep, Part Two',
      short: 'Sealed',
      tag: 'Individually vacuum sealed',
      blurb: 'Each steak gets its own vacuum bag. Oxygen is removed, the clock slows way down, and the fridge goes quiet until game day.',
      detail: 'Individually sealed means each steak can go straight from the bag into the water bath with no handling, and it means a steak nobody claims can go into the freezer without freezer burn. Vacuum sealing does not stop aging, but it slows oxidation down to almost nothing, which is what keeps the fat from picking up an off flavor.',
      sci: 'Freezer burn is sublimation. Ice crystals on the surface skip the liquid phase and go straight to vapor, leaving dehydrated, oxidized patches behind. No air in the bag means nowhere for that vapor to go, so the surface stays intact.',
      sciTitle: 'Why vacuum sealing works'
    },
    {
      id: 'sousvide',
      icon: '🛁',
      name: 'The Hot Tub',
      short: 'Sous Vide',
      tag: 'Water bath, 129 degrees',
      blurb: 'Sealed steaks go into a water bath held within a degree of target. The steak cannot overcook because the water is not hot enough to overcook it.',
      detail: 'This is the entire trick of sous vide: the water is exactly as hot as you want the steak to be. Give it a few hours and the whole steak, edge to edge, is the same temperature. No grey band, no guessing, no crowding around a thermometer. Then it comes out, gets patted bone dry, and rests for a few minutes before it goes anywhere near fire.',
      sci: 'Conventional cooking creates a steep temperature gradient. The outside has to overshoot badly so the center can catch up, which is what the grey ring on a pan-seared steak is. Holding everything at one temperature removes the gradient entirely, so 129 degrees means 129 degrees from crust to crust.',
      sciTitle: 'Why there is no grey band'
    },
    {
      id: 'sear',
      icon: '🔥',
      name: 'The Fire',
      short: 'Sear',
      tag: 'Primo XL, about 700 degrees',
      blurb: 'Sixty seconds a side on a ceramic kamado running hotter than your oven can dream about. This part is loud, fast, and entirely about the crust.',
      detail: 'The steak is already cooked. The only job left is building a crust, so the grill runs as hot as it will go and the steak is on and off before the interior notices. Dry surface, ripping hot grates, one flip, and then straight to the board. There is no rest needed on the back end because sous vide already did the resting.',
      sci: 'The Maillard reaction is amino acids and reducing sugars rearranging into hundreds of new aromatic compounds. It needs a dry surface and roughly 300 degrees or more, and it accelerates hard above 350. Everything you think of as steak flavor, the roasted and nutty and savory notes, is manufactured in those sixty seconds.',
      sciTitle: 'The Maillard reaction'
    },
    {
      id: 'served',
      icon: '🍽️',
      name: 'Steak Day',
      short: 'Served',
      tag: 'Forks up',
      blurb: 'Weeks of patience, resolved in about nine minutes of eating. Worth it. Eat the cap last.',
      detail: 'Slice against the grain, salt the cut surface with something flaky, and do not put steak sauce on this. The spinalis, the crescent of fat-laced muscle around the outside, is the best bite on the steak. Save it. Make eye contact with someone while you eat it.',
      sci: 'Ribeye muscle fibers run in different directions in the eye and the cap, so there is no single correct slicing angle for the whole steak. Cut the eye against its grain, then separate the cap and cut that against its own. Or eat the cap in one piece, which is also a legitimate scientific approach.',
      sciTitle: 'Slice it right'
    }
  ];

  const GRADES = [
    {
      name: 'USDA Select',
      sub: 'Slight marbling',
      blurb: 'Lean, affordable, and perfectly fine if you are braising or grinding. As a thick steak it tends to run dry and a little tough, because there is not much intramuscular fat to melt and lubricate the fibers.',
      stats: [['~2%', 'Fat by weight'], ['Grades', 'Bottom third'], ['Use', 'Braise, grind']]
    },
    {
      name: 'USDA Choice',
      sub: 'Small marbling',
      blurb: 'The workhorse grade and the majority of what sits in a good grocery store. A Choice ribeye is a genuinely good steak. It just has a wider quality range inside the grade than most people realize.',
      stats: [['~4%', 'Fat by weight'], ['~50%', 'Of graded beef'], ['Use', 'Anything']]
    },
    {
      name: 'Upper Choice',
      sub: 'Modest to moderate marbling',
      blurb: 'The top of Choice, sometimes branded and sold as a premium program. Frequently this is Prime that missed by a hair, and it is the best value in the entire case if you can find it.',
      stats: [['~6%', 'Fat by weight'], ['Top', 'Third of Choice'], ['Use', 'Steaks']]
    },
    {
      name: 'USDA Prime',
      sub: 'Slightly abundant to abundant marbling',
      blurb: 'This is the one in the fridge. Roughly two to five percent of graded carcasses make Prime, and most of that gets bought by steakhouses before retail ever sees it. The fat is webbed all the way through the eye, which is why it stays juicy even if somebody overcooks it a little.',
      stats: [['~9%', 'Fat by weight'], ['~2-5%', 'Of graded beef'], ['Use', 'This']]
    },
    {
      name: 'Japanese A5',
      sub: 'Off the USDA scale entirely',
      blurb: 'A5 Wagyu scores 8 to 12 on the Japanese BMS scale, which starts roughly where USDA Prime tops out. The fat melts near body temperature. It is spectacular, and it is also so rich that four ounces is a full portion. Different food, not a better ribeye.',
      stats: [['30%+', 'Fat by weight'], ['BMS 8-12', 'Japanese scale'], ['Use', 'Two ounces']]
    }
  ];

  const ANATOMY = [
    {
      key: 'eye',
      name: 'The Eye',
      lat: 'Longissimus dorsi',
      text: 'The big round center muscle, and the one people picture when they hear ribeye. Fine grained, evenly marbled, and consistent from bite to bite. It does almost no work on the animal, which is exactly why it is tender.'
    },
    {
      key: 'cap',
      name: 'The Cap (Deckle)',
      lat: 'Spinalis dorsi',
      text: 'The crescent wrapped around the outside, separated from the eye by a seam of fat. This is the best bite on the entire animal and it is not close. Looser grain, heavier marbling, more beef flavor. Eat it last.'
    },
    {
      key: 'comp',
      name: 'The Little One',
      lat: 'Complexus',
      text: 'A small third muscle that shows up on steaks cut from the chuck end of the roll. Some of your steaks will have it, some will not. It is tender, slightly chewier than the eye, and nothing to worry about either way.'
    },
    {
      key: 'seam',
      name: 'The Fat Seam',
      lat: 'Intermuscular fat',
      text: 'The band of fat separating the eye from the cap. It renders during cooking and bastes both muscles from the inside. Cutting it out is a crime with no statute of limitations.'
    },
    {
      key: 'fat',
      name: 'The Fat Cap',
      lat: 'Subcutaneous fat',
      text: 'The outer rind. Trimmed down to about a quarter inch so it renders and crisps instead of sitting there as a cold white wall. On the grill this is where the flare-ups come from, which is a feature until it is not.'
    }
  ];

  const DONENESS = [
    {
      key: 'rare', name: 'Rare', f: 125, c: 52, core: '#a51f2f', grey: 0.04,
      desc: 'Cool red center, very soft, barely any fat rendered. On a Prime ribeye this leaves a lot of the intramuscular fat solid, which reads as slick rather than juicy.',
      verdict: 'Defensible on a leaner cut. On a Prime ribeye you are leaving money on the table.'
    },
    {
      key: 'mr', name: 'Medium Rare', f: 129, c: 54, core: '#c0343f', grey: 0.12,
      desc: 'Warm red center. Enough heat to start rendering the intramuscular fat without squeezing the muscle fibers hard enough to push out moisture. This is the house temperature.',
      verdict: 'Correct. You may proceed to the front of the line.'
    },
    {
      key: 'medium', name: 'Medium', f: 135, c: 57, core: '#c8635f', grey: 0.32,
      desc: 'Warm pink center, noticeably firmer. Most of the fat has rendered and the muscle fibers have contracted enough to start pushing water out.',
      verdict: 'Completely reasonable, and genuinely better for anyone who finds medium rare too soft. No judgment here.'
    },
    {
      key: 'mwell', name: 'Medium Well', f: 145, c: 63, core: '#c08b76', grey: 0.58,
      desc: 'Faint pink at the very center. Collagen has tightened, most of the free moisture is gone, and the texture has moved from tender to chewy.',
      verdict: 'We are still friends. This is simply a different relationship than the one we had before.'
    },
    {
      key: 'well', name: 'Well Done', f: 160, c: 71, core: '#a8836c', grey: 0.92,
      desc: 'No pink. Myoglobin is fully denatured, the muscle fibers have contracted hard, and most of the water has been squeezed out. The marbling is the only thing keeping it edible, and on Prime, honestly, it still is.',
      verdict: 'Look. It is your steak. The sous vide will at least make it an evenly cooked well done steak, which is the best possible version of this decision.'
    }
  ];

  const FAQ = [
    ['Is it going to smell weird?', 'No. Wet aging in a sealed bag produces a mild sour, slightly metallic smell when you first open it, and that dissipates in a couple of minutes. It is lactic acid from harmless bacteria doing their thing in an oxygen-free bag. If it smells genuinely bad, that is a different conversation and the beef loses.'],
    ['Wet aging or dry aging? Which is better?', 'They do different things. Wet aging tenderizes without changing flavor much and loses no weight. Dry aging tenderizes and also concentrates flavor through moisture loss, developing nutty and funky notes, but it costs you 15 to 30 percent of the weight in evaporation and trim, and it needs controlled humidity and airflow. A regular kitchen fridge is not set up for a proper dry age. Wet aging in the bag it came in is the right call here.'],
    ['Can I have two steaks?', 'You can claim two steaks on this website. What happens in the physical world is governed by an entirely separate and much less forgiving set of rules.'],
    ['Why sous vide if you are just going to grill it anyway?', 'Because cooking fourteen steaks to the same doneness on a grill, at the same time, for a group of people, is a nightmare. The water bath takes doneness off the table completely, so game day is only about the sear. It also means nobody has to stand around while the last four steaks catch up.'],
    ['What is a Primo XL?', 'A ceramic kamado grill. Thick ceramic walls hold heat like a pizza oven, so it will sit at 700 degrees or higher without complaint. For a sixty second sear that is exactly what you want. It is also a genuinely excellent low and slow smoker, which is irrelevant today.'],
    ['Is 21 to 28 days safe?', 'Yes, in an unopened factory cryovac bag held at refrigeration temperature. That is how beef gets from the packing plant to the store in the first place, and packers routinely spec 35 to 45 days of shelf life on primal cuts. The bag being intact is the part that matters. A punctured bag is a trash bag.'],
    ['Why does the meat look purple in the tracker?', 'Because it is purple in there. Myoglobin without oxygen is a deep purple red. Once the bag opens and the meat hits air, it blooms bright red within about fifteen minutes. Watch the Butchery Day stage on the timeline and you will see it change.'],
    ['Can I bring anything?', 'Yes. Bring a side, bring a bottle, bring your appetite, and bring the ability to wait patiently for sixty seconds per side without offering grilling advice.']
  ];

  const TICKER_BY_PHASE = {
    aging: [
      'Enzymes clocked in.',
      'Calpain reports steady progress on the myofibrils.',
      'Cathepsin is taking the long view, as usual.',
      'Bag integrity: intact. Morale: high.',
      'Fridge compressor cycled. Beef unbothered.',
      'Someone opened the fridge looking for cheese. Beef was not disturbed.',
      'Connective tissue continues to lose the argument.',
      'Internal temperature holding at 36 degrees.',
      'Purge liquid accumulating on schedule. This is normal and you should stop thinking about it.',
      'No mold. No air. No drama.',
      'Day ' + '{day}' + ' of the nap. Beef has no notes.',
      'Chef checked on it again. Chef was told to go away.',
      'Tenderness index nudged upward by an amount no instrument here can measure.',
      'Still purple. Still correct.'
    ],
    butchery: [
      'Bag breached. Oxygen deployed.',
      'Bloom initiated. Purple giving way to red.',
      'Knife sharpened. Twice.',
      'Fat cap trimmed to a quarter inch.',
      'Steak one is on the board and it is a beauty.',
      'Cap-to-eye ratio: excellent.',
      'Measuring for an inch and a half. Eyeballing for an inch and a half.',
      'Spinalis sighted. Spinalis is enormous.',
      'Trim scraps quietly set aside for a future burger of some significance.'
    ],
    drydown: [
      'Steaks placed on wire rack, uncovered.',
      'Surface moisture beginning its exit.',
      'Salt applied. Dry brine engaged.',
      'Air circulating. Pellicle forming.',
      'Surface has gone from glossy to matte. This is the good sign.',
      'Fridge now smells faintly like a very good butcher shop.',
      'Crust potential rising steadily.'
    ],
    sealed: [
      'Vacuum sealer warming up.',
      'Steak sealed. Oxygen level: zero.',
      'Bag labeled. Bag double checked.',
      'All units secured and stacked.',
      'Countdown to cook day is now the only remaining variable.',
      'Fridge is quiet. Suspiciously quiet.',
      'Freezer on standby for any steak that goes unclaimed. There will be none.'
    ],
    sousvide: [
      'Water bath up to temperature.',
      'Circulator holding 129 degrees, plus or minus nothing.',
      'Steaks submerged. Timer running.',
      'Core temperature climbing. Slowly. On purpose.',
      'Edge to edge uniformity approaching one hundred percent.',
      'Grey band eliminated before it was ever born.',
      'Grill lighting in the background. Do not rush this part.'
    ],
    sear: [
      'Primo XL at 700 degrees and climbing.',
      'Steaks out of the bath. Patted bone dry.',
      'Grates are glowing. This is fine.',
      'Steak on. Sixty seconds. Nobody move.',
      'Maillard reaction proceeding at an aggressive pace.',
      'Flip. One flip. That is the whole rule.',
      'Crust achieved. Chef visibly emotional.',
      'Someone offered grilling advice. It was noted and ignored.'
    ],
    served: [
      'Steaks on the board.',
      'Flaky salt applied to the cut surface.',
      'Cap muscle located and claimed by whoever is fastest.',
      'Steak sauce requested. Request denied, warmly.',
      'All that waiting. Nine minutes. Worth it.',
      'Plates cleared with suspicious efficiency.',
      'Chef accepting compliments in the kitchen.'
    ]
  };

  const ORACLE = [
    'The Oracle says: your steak is thinking about you too.',
    'The Oracle says: the cap is the best part and you already knew that.',
    'The Oracle says: do not ask for it well done in front of the other guests. Ask privately. It will be handled with dignity.',
    'The Oracle says: bring a red wine that costs slightly more than you planned to spend.',
    'The Oracle says: the answer is more salt, and it was always more salt.',
    'The Oracle says: fourteen steaks, one grill, zero excuses.',
    'The Oracle says: the person who offers grilling advice will receive the smallest steak. This is not a threat, it is physics.',
    'The Oracle says: patience is the only ingredient that cannot be purchased.',
    'The Oracle says: the fridge hums the same note as the universe.',
    'The Oracle says: yes, you can have the end cut. No, you cannot have two end cuts.',
    'The Oracle says: a steak rested is a steak respected. Except this one, which already rested in a bag.',
    'The Oracle says: somewhere a cow is being remembered very fondly.',
    'The Oracle says: check back tomorrow. The beef will still be aging. That is sort of the whole point.',
    'The Oracle says: eat the fat. That is where they hid the flavor.'
  ];

  const STEAK_NAMES = [
    'Ribeye McGee', 'Sir Loin', 'The Marbler', 'Beefany', 'Chuck Norris',
    'Wagyu Smith', 'Steve', 'The Deckle', 'Prime Minister', 'Capcake',
    'Tender Lovingcare', 'Medium Rare Bear', 'Fat Cap Kelly', 'Spinalis Joplin',
    'Hank Sizzle', 'The Understudy', 'Maillard Fillmore', 'Grillary Clinton',
    'Beef Wellington III', 'Marbles Barkley', 'Cowabunga', 'The Closer',
    'Sizzle Chapman', 'Bark Ruffalo', 'The Cap Itself', 'Angus Young'
  ];

  global.MeatContent = {
    PHASES: PHASES,
    GRADES: GRADES,
    ANATOMY: ANATOMY,
    DONENESS: DONENESS,
    FAQ: FAQ,
    TICKER_BY_PHASE: TICKER_BY_PHASE,
    ORACLE: ORACLE,
    STEAK_NAMES: STEAK_NAMES
  };

})(window);
