/* ============================================================================
   networks.js — puzzles for Critical Path (MS-N2) and the graph tasks in
   MS-N1. Pure data: the activity list and the graph, nothing else.

   §9.9 — the critical path and the minimum spanning tree are NEVER stored
   here. The game and the validator each run their own independent algorithm
   over this data, which is the only way to know the stored answer is right.
   The reference app hand-authored a synthesis route once and it was wrong.
   ========================================================================== */
window.MS = window.MS || {};

/* Activity-on-node projects. `pre` lists immediate predecessors; `dur` is in
   the project's own time unit. Every project must have at least one activity
   with no predecessors and one that nothing depends on. */
window.MS.PROJECTS = (window.MS.PROJECTS || []).concat([
  { id: 'p-cafe', nm: 'Café fit-out', unit: 'days',
    ds: 'A small café refit. Everything waits on the plumbing.',
    activities: [
      { id: 'A', nm: 'Strip out old fittings', dur: 3, pre: [] },
      { id: 'B', nm: 'Plumbing rough-in', dur: 4, pre: ['A'] },
      { id: 'C', nm: 'Electrical rough-in', dur: 2, pre: ['A'] },
      { id: 'D', nm: 'Tiling', dur: 5, pre: ['B'] },
      { id: 'E', nm: 'Install counter', dur: 3, pre: ['C', 'D'] },
      { id: 'F', nm: 'Final inspection', dur: 1, pre: ['E'] }
    ] },

  { id: 'p-festival', nm: 'School festival', unit: 'days',
    ds: 'Two independent streams that both have to land before opening.',
    activities: [
      { id: 'A', nm: 'Book the venue', dur: 2, pre: [] },
      { id: 'B', nm: 'Hire the stage', dur: 5, pre: ['A'] },
      { id: 'C', nm: 'Print the programs', dur: 3, pre: ['A'] },
      { id: 'D', nm: 'Sell tickets', dur: 8, pre: ['C'] },
      { id: 'E', nm: 'Rig the sound', dur: 2, pre: ['B'] },
      { id: 'F', nm: 'Brief the volunteers', dur: 1, pre: ['D', 'E'] },
      { id: 'G', nm: 'Open the gates', dur: 1, pre: ['F'] }
    ] },

  { id: 'p-house', nm: 'House extension', unit: 'weeks',
    ds: 'Council approval blocks everything, and the roof blocks the interior.',
    activities: [
      { id: 'A', nm: 'Council approval', dur: 6, pre: [] },
      { id: 'B', nm: 'Excavation', dur: 2, pre: ['A'] },
      { id: 'C', nm: 'Foundations', dur: 3, pre: ['B'] },
      { id: 'D', nm: 'Frame', dur: 4, pre: ['C'] },
      { id: 'E', nm: 'Roof', dur: 2, pre: ['D'] },
      { id: 'F', nm: 'Order windows', dur: 5, pre: ['A'] },
      { id: 'G', nm: 'Fit windows', dur: 1, pre: ['E', 'F'] },
      { id: 'H', nm: 'Interior lining', dur: 3, pre: ['G'] }
    ] },

  { id: 'p-app', nm: 'App release', unit: 'days',
    ds: 'Three parallel streams converging on one test window.',
    activities: [
      { id: 'A', nm: 'Requirements', dur: 4, pre: [] },
      { id: 'B', nm: 'Design screens', dur: 5, pre: ['A'] },
      { id: 'C', nm: 'Build backend', dur: 9, pre: ['A'] },
      { id: 'D', nm: 'Build frontend', dur: 7, pre: ['B'] },
      { id: 'E', nm: 'Write content', dur: 3, pre: ['B'] },
      { id: 'F', nm: 'Integrate', dur: 2, pre: ['C', 'D'] },
      { id: 'G', nm: 'Test', dur: 4, pre: ['E', 'F'] },
      { id: 'H', nm: 'Publish', dur: 1, pre: ['G'] }
    ] },

  { id: 'p-play', nm: 'School production', unit: 'weeks',
    ds: 'The set and the cast are independent until the dress rehearsal.',
    activities: [
      { id: 'A', nm: 'Choose the script', dur: 1, pre: [] },
      { id: 'B', nm: 'Auditions', dur: 2, pre: ['A'] },
      { id: 'C', nm: 'Build the set', dur: 6, pre: ['A'] },
      { id: 'D', nm: 'Rehearse acts', dur: 7, pre: ['B'] },
      { id: 'E', nm: 'Make costumes', dur: 4, pre: ['B'] },
      { id: 'F', nm: 'Dress rehearsal', dur: 1, pre: ['C', 'D', 'E'] },
      { id: 'G', nm: 'Opening night', dur: 1, pre: ['F'] }
    ] },

  { id: 'p-road', nm: 'Road resurfacing', unit: 'days',
    ds: 'Short, with one stream carrying a single day of float.',
    activities: [
      { id: 'A', nm: 'Traffic plan', dur: 2, pre: [] },
      { id: 'B', nm: 'Mill the surface', dur: 4, pre: ['A'] },
      { id: 'C', nm: 'Relocate services', dur: 3, pre: ['A'] },
      { id: 'D', nm: 'Lay base course', dur: 3, pre: ['B'] },
      { id: 'E', nm: 'Adjust pit lids', dur: 3, pre: ['C'] },
      { id: 'F', nm: 'Lay asphalt', dur: 2, pre: ['D', 'E'] },
      { id: 'G', nm: 'Line marking', dur: 1, pre: ['F'] }
    ] },

  { id: 'p-catering', nm: 'Wedding catering', unit: 'hours',
    ds: 'Short durations, tight dependencies, one long lead item.',
    activities: [
      { id: 'A', nm: 'Confirm numbers', dur: 1, pre: [] },
      { id: 'B', nm: 'Order stock', dur: 3, pre: ['A'] },
      { id: 'C', nm: 'Slow-roast the mains', dur: 6, pre: ['B'] },
      { id: 'D', nm: 'Prep salads', dur: 2, pre: ['B'] },
      { id: 'E', nm: 'Set the tables', dur: 2, pre: ['A'] },
      { id: 'F', nm: 'Plate up', dur: 1, pre: ['C', 'D', 'E'] },
      { id: 'G', nm: 'Service', dur: 3, pre: ['F'] }
    ] },

  { id: 'p-warehouse', nm: 'Warehouse move', unit: 'days',
    ds: 'Nine activities and a long tail — the float times are worth reading.',
    activities: [
      { id: 'A', nm: 'Audit the stock', dur: 3, pre: [] },
      { id: 'B', nm: 'Lease the new site', dur: 5, pre: [] },
      { id: 'C', nm: 'Pack non-essentials', dur: 4, pre: ['A'] },
      { id: 'D', nm: 'Fit out racking', dur: 6, pre: ['B'] },
      { id: 'E', nm: 'Book the trucks', dur: 1, pre: ['B'] },
      { id: 'F', nm: 'Move racking stock', dur: 3, pre: ['C', 'D'] },
      { id: 'G', nm: 'Move office', dur: 2, pre: ['E'] },
      { id: 'H', nm: 'Reconnect systems', dur: 2, pre: ['F', 'G'] },
      { id: 'I', nm: 'Stocktake', dur: 2, pre: ['H'] }
    ] },

  { id: 'p-bridge', nm: 'Footbridge repair', unit: 'days',
    ds: 'Two long streams, one of which has surprising slack.',
    activities: [
      { id: 'A', nm: 'Close the bridge', dur: 1, pre: [] },
      { id: 'B', nm: 'Scaffold', dur: 4, pre: ['A'] },
      { id: 'C', nm: 'Survey the damage', dur: 2, pre: ['A'] },
      { id: 'D', nm: 'Fabricate steel', dur: 10, pre: ['C'] },
      { id: 'E', nm: 'Strip the deck', dur: 3, pre: ['B'] },
      { id: 'F', nm: 'Install steel', dur: 4, pre: ['D', 'E'] },
      { id: 'G', nm: 'Re-deck', dur: 3, pre: ['F'] },
      { id: 'H', nm: 'Reopen', dur: 1, pre: ['G'] }
    ] },

  { id: 'p-farm', nm: 'Harvest week', unit: 'days',
    ds: 'Everything depends on the weather window, so the float matters.',
    activities: [
      { id: 'A', nm: 'Service the header', dur: 2, pre: [] },
      { id: 'B', nm: 'Test moisture', dur: 1, pre: [] },
      { id: 'C', nm: 'Harvest north paddock', dur: 4, pre: ['A', 'B'] },
      { id: 'D', nm: 'Harvest south paddock', dur: 3, pre: ['C'] },
      { id: 'E', nm: 'Cart to silo', dur: 2, pre: ['C'] },
      { id: 'F', nm: 'Grade and store', dur: 2, pre: ['D', 'E'] }
    ] },

  { id: 'p-market', nm: 'Market stall launch', unit: 'days',
    ds: 'Small, fast, and one activity is on two paths at once.',
    activities: [
      { id: 'A', nm: 'Apply for permit', dur: 4, pre: [] },
      { id: 'B', nm: 'Design signage', dur: 2, pre: [] },
      { id: 'C', nm: 'Print signage', dur: 2, pre: ['B'] },
      { id: 'D', nm: 'Buy stock', dur: 3, pre: ['A'] },
      { id: 'E', nm: 'Set up stall', dur: 1, pre: ['C', 'D'] },
      { id: 'F', nm: 'Trade', dur: 1, pre: ['E'] }
    ] },

  { id: 'p-solar', nm: 'Solar installation', unit: 'days',
    ds: 'Grid approval is the long pole and nothing shortens it.',
    activities: [
      { id: 'A', nm: 'Site assessment', dur: 1, pre: [] },
      { id: 'B', nm: 'Grid application', dur: 12, pre: ['A'] },
      { id: 'C', nm: 'Order panels', dur: 5, pre: ['A'] },
      { id: 'D', nm: 'Order inverter', dur: 7, pre: ['A'] },
      { id: 'E', nm: 'Mount rails', dur: 2, pre: ['C'] },
      { id: 'F', nm: 'Fit panels', dur: 2, pre: ['E'] },
      { id: 'G', nm: 'Wire inverter', dur: 1, pre: ['D', 'F'] },
      { id: 'H', nm: 'Commission', dur: 1, pre: ['B', 'G'] }
    ] }
]);

/* Weighted undirected graphs for minimum spanning tree and shortest path.
   Coordinates are 0..1 fractions of the drawing area. */
window.MS.GRAPHS = (window.MS.GRAPHS || []).concat([
  { id: 'g-towns', nm: 'Five towns', unit: 'km',
    ds: 'Connect every town with the least total road.',
    nodes: [{ id: 'A', x: 0.12, y: 0.22 }, { id: 'B', x: 0.5, y: 0.08 }, { id: 'C', x: 0.88, y: 0.3 },
            { id: 'D', x: 0.72, y: 0.82 }, { id: 'E', x: 0.2, y: 0.75 }],
    edges: [{ a: 'A', b: 'B', w: 7 }, { a: 'A', b: 'E', w: 5 }, { a: 'B', b: 'C', w: 8 },
            { a: 'B', b: 'E', w: 9 }, { a: 'C', b: 'D', w: 5 }, { a: 'D', b: 'E', w: 6 },
            { a: 'B', b: 'D', w: 11 }] },

  { id: 'g-water', nm: 'Water mains', unit: 'm',
    ds: 'Six pump stations, seven possible pipe runs.',
    nodes: [{ id: 'P', x: 0.1, y: 0.5 }, { id: 'Q', x: 0.36, y: 0.15 }, { id: 'R', x: 0.36, y: 0.85 },
            { id: 'S', x: 0.66, y: 0.5 }, { id: 'T', x: 0.9, y: 0.18 }, { id: 'U', x: 0.9, y: 0.82 }],
    edges: [{ a: 'P', b: 'Q', w: 12 }, { a: 'P', b: 'R', w: 14 }, { a: 'Q', b: 'S', w: 9 },
            { a: 'R', b: 'S', w: 7 }, { a: 'S', b: 'T', w: 11 }, { a: 'S', b: 'U', w: 10 },
            { a: 'T', b: 'U', w: 15 }, { a: 'Q', b: 'R', w: 18 }] },

  { id: 'g-campus', nm: 'Campus paths', unit: 'm',
    ds: 'Seven buildings. Find the cheapest set of paths that links them all.',
    nodes: [{ id: 'A', x: 0.08, y: 0.3 }, { id: 'B', x: 0.32, y: 0.1 }, { id: 'C', x: 0.32, y: 0.62 },
            { id: 'D', x: 0.58, y: 0.35 }, { id: 'E', x: 0.58, y: 0.88 }, { id: 'F', x: 0.85, y: 0.14 },
            { id: 'G', x: 0.9, y: 0.68 }],
    edges: [{ a: 'A', b: 'B', w: 40 }, { a: 'A', b: 'C', w: 35 }, { a: 'B', b: 'D', w: 30 },
            { a: 'C', b: 'D', w: 25 }, { a: 'C', b: 'E', w: 45 }, { a: 'D', b: 'F', w: 38 },
            { a: 'D', b: 'G', w: 42 }, { a: 'E', b: 'G', w: 33 }, { a: 'F', b: 'G', w: 50 }] },

  { id: 'g-fibre', nm: 'Fibre rollout', unit: 'km',
    ds: 'Eight nodes and a lot of near-equal options — sort carefully.',
    nodes: [{ id: 'A', x: 0.1, y: 0.15 }, { id: 'B', x: 0.4, y: 0.1 }, { id: 'C', x: 0.72, y: 0.16 },
            { id: 'D', x: 0.92, y: 0.44 }, { id: 'E', x: 0.7, y: 0.72 }, { id: 'F', x: 0.4, y: 0.8 },
            { id: 'G', x: 0.12, y: 0.6 }, { id: 'H', x: 0.5, y: 0.45 }],
    edges: [{ a: 'A', b: 'B', w: 6 }, { a: 'B', b: 'C', w: 7 }, { a: 'C', b: 'D', w: 5 },
            { a: 'D', b: 'E', w: 6 }, { a: 'E', b: 'F', w: 4 }, { a: 'F', b: 'G', w: 8 },
            { a: 'G', b: 'A', w: 9 }, { a: 'H', b: 'A', w: 10 }, { a: 'H', b: 'B', w: 5 },
            { a: 'H', b: 'E', w: 6 }, { a: 'H', b: 'F', w: 7 }, { a: 'H', b: 'C', w: 8 }] },

  { id: 'g-delivery', nm: 'Delivery run', unit: 'min',
    ds: 'Find the shortest time from the depot at A to the far corner at G.',
    shortest: { from: 'A', to: 'G' },
    nodes: [{ id: 'A', x: 0.08, y: 0.5 }, { id: 'B', x: 0.3, y: 0.16 }, { id: 'C', x: 0.3, y: 0.84 },
            { id: 'D', x: 0.55, y: 0.5 }, { id: 'E', x: 0.75, y: 0.18 }, { id: 'F', x: 0.75, y: 0.82 },
            { id: 'G', x: 0.94, y: 0.5 }],
    edges: [{ a: 'A', b: 'B', w: 8 }, { a: 'A', b: 'C', w: 6 }, { a: 'B', b: 'D', w: 5 },
            { a: 'C', b: 'D', w: 9 }, { a: 'B', b: 'E', w: 12 }, { a: 'C', b: 'F', w: 11 },
            { a: 'D', b: 'E', w: 4 }, { a: 'D', b: 'F', w: 7 }, { a: 'E', b: 'G', w: 6 },
            { a: 'F', b: 'G', w: 5 }] },

  { id: 'g-tracks', nm: 'Walking tracks', unit: 'km',
    ds: 'Shortest route from the car park at S to the summit at T.',
    shortest: { from: 'S', to: 'T' },
    nodes: [{ id: 'S', x: 0.1, y: 0.8 }, { id: 'A', x: 0.32, y: 0.5 }, { id: 'B', x: 0.34, y: 0.88 },
            { id: 'C', x: 0.6, y: 0.24 }, { id: 'D', x: 0.62, y: 0.66 }, { id: 'T', x: 0.9, y: 0.4 }],
    edges: [{ a: 'S', b: 'A', w: 4 }, { a: 'S', b: 'B', w: 3 }, { a: 'A', b: 'C', w: 6 },
            { a: 'A', b: 'D', w: 5 }, { a: 'B', b: 'D', w: 7 }, { a: 'C', b: 'T', w: 4 },
            { a: 'D', b: 'T', w: 6 }, { a: 'C', b: 'D', w: 2 }] }
]);
