/* ============================================================================
   q-n2.js — MS-N2 Critical Path Analysis (Year 12). 24 questions.
   Every scan below was computed with js/core/net.js before being written, and
   tests/validate.js re-derives each project with a second implementation.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'n2-001', mod: 'MS-N2', topic: 'Activity charts', diff: 1,
    q: 'What does an activity chart list?',
    choices: ['Each activity, its duration and its immediate predecessors', 'The critical path only', 'The float time of each activity', 'The total project cost'], a: 0,
    why: 'The chart is the input to the analysis. The critical path and float times are what you calculate FROM it.' },

  { id: 'n2-002', mod: 'MS-N2', topic: 'Forward scanning', diff: 1,
    q: 'What does forward scanning find?',
    choices: ['The earliest start time of each activity', 'The latest start time of each activity', 'The float of each activity', 'The number of activities'], a: 0,
    why: 'Forward scanning works left to right, giving each activity the earliest time it could possibly begin. The largest earliest finish is the minimum completion time.' },

  { id: 'n2-003', mod: 'MS-N2', topic: 'Forward scanning', diff: 2,
    q: 'An activity has three predecessors finishing at times 6, 9 and 7. What is its earliest start time?',
    choices: ['9', '6', '7.33', '22'], a: 0,
    why: 'The activity cannot start until ALL predecessors are done, so take the LARGEST finish time: 9. Taking the smallest or the average are the two common errors.' },

  { id: 'n2-004', mod: 'MS-N2', topic: 'Backward scanning', diff: 1,
    q: 'What does backward scanning find?',
    choices: ['The latest start time of each activity', 'The earliest start time of each activity', 'The total project duration', 'The number of predecessors'], a: 0,
    why: 'Backward scanning works right to left from the completion time, giving the latest each activity could start without delaying the project.' },

  { id: 'n2-005', mod: 'MS-N2', topic: 'Backward scanning', diff: 2,
    q: 'An activity has two successors whose latest start times are 14 and 11. What is its latest FINISH time?',
    choices: ['11', '14', '12.5', '25'], a: 0,
    why: 'It must finish before the earliest of its successors needs to start, so take the SMALLEST: 11. Forward scanning takes the largest, backward the smallest — that asymmetry is the thing to remember.' },

  { id: 'n2-006', mod: 'MS-N2', topic: 'Float time', diff: 1,
    q: 'How is float time calculated?',
    choices: ['Latest start time − earliest start time', 'Earliest start time − latest start time', 'Duration − earliest start time', 'Latest finish time + duration'], a: 0,
    why: 'Float = LST − EST, and it equals the amount an activity can slip without pushing out the project finish.' },

  { id: 'n2-007', mod: 'MS-N2', topic: 'Float time', diff: 2,
    q: 'An activity has EST = 5 and LST = 9. What is its float?',
    choices: ['4', '14', '−4', '45'], a: 0,
    why: 'Float = 9 − 5 = 4, so the activity can be delayed up to 4 time units without affecting the completion date.' },

  { id: 'n2-008', mod: 'MS-N2', topic: 'The critical path', diff: 1,
    q: 'What is the float of every activity on the critical path?',
    choices: ['Zero', 'One', 'The project duration', 'It varies'], a: 0,
    why: 'Critical activities have no slack at all, so LST = EST and float = 0. That is exactly what makes them critical.' },

  { id: 'n2-009', mod: 'MS-N2', topic: 'The critical path', diff: 2,
    q: 'What IS the critical path?',
    choices: ['The longest path through the network', 'The shortest path through the network', 'The path with the fewest activities', 'The path with the cheapest activities'], a: 0,
    why: 'The longest path determines the minimum completion time — you cannot finish sooner than the longest chain of dependent work takes.' },

  { id: 'n2-010', mod: 'MS-N2', topic: 'The critical path', diff: 2,
    q: 'Why does delaying a critical activity delay the whole project?',
    choices: ['It has zero float, so any slip pushes everything after it', 'It is always the most expensive activity', 'It has the most predecessors', 'It is always the longest activity'], a: 0,
    why: 'With no slack to absorb a delay, the slip propagates straight through to the finish. Non-critical activities have float that soaks up small delays.' },

  { id: 'n2-011', mod: 'MS-N2', topic: 'Minimum completion time', diff: 2,
    stem: 'Café fit-out. A: strip out, 3 days, no predecessors. B: plumbing, 4 days, after A. C: electrical, 2 days, after A. D: tiling, 5 days, after B. E: install counter, 3 days, after C and D. F: inspection, 1 day, after E.',
    q: 'What is the minimum completion time?',
    choices: ['16 days', '18 days', '14 days', '12 days'], a: 0,
    why: 'The longest path is A→B→D→E→F = 3 + 4 + 5 + 3 + 1 = 16 days. The route through C is shorter, so C is not critical.' },

  { id: 'n2-012', mod: 'MS-N2', topic: 'Float time', diff: 3,
    stem: 'Café fit-out. A: 3 days, no predecessors. B: 4 days after A. C: 2 days after A. D: 5 days after B. E: 3 days after C and D. F: 1 day after E.',
    q: 'What is the float time of activity C?',
    choices: ['7 days', '0 days', '4 days', '2 days'], a: 0,
    why: 'C can start at 3 (EST). E cannot start until 12, so C must finish by 12, giving LST = 12 − 2 = 10. Float = 10 − 3 = 7 days.' },

  { id: 'n2-013', mod: 'MS-N2', topic: 'The critical path', diff: 3,
    stem: 'Café fit-out. A: 3 days. B: 4 days after A. C: 2 days after A. D: 5 days after B. E: 3 days after C and D. F: 1 day after E.',
    q: 'Which activities are on the critical path?',
    choices: ['A, B, D, E, F', 'A, C, E, F', 'A, B, C, D, E, F', 'B, D, E'], a: 0,
    why: 'A, B, D, E and F all have zero float and form a continuous chain of 16 days. C has 7 days of float, so it is excluded.' },

  { id: 'n2-014', mod: 'MS-N2', topic: 'Minimum completion time', diff: 3,
    stem: 'School production. A: choose script, 1 week. B: auditions, 2 weeks after A. C: build set, 6 weeks after A. D: rehearse, 7 weeks after B. E: costumes, 4 weeks after B. F: dress rehearsal, 1 week after C, D and E. G: opening night, 1 week after F.',
    q: 'What is the minimum completion time?',
    choices: ['12 weeks', '11 weeks', '13 weeks', '22 weeks'], a: 0,
    why: 'The longest path is A→B→D→F→G = 1 + 2 + 7 + 1 + 1 = 12 weeks. Building the set takes 6 weeks from week 1 and is finished well before the dress rehearsal needs it.' },

  { id: 'n2-015', mod: 'MS-N2', topic: 'Float time', diff: 3,
    stem: 'School production. A: 1 week. B: 2 weeks after A. C: build set, 6 weeks after A. D: 7 weeks after B. E: costumes, 4 weeks after B. F: 1 week after C, D and E. G: 1 week after F.',
    q: 'What is the float time of "build set"?',
    choices: ['3 weeks', '0 weeks', '6 weeks', '1 week'], a: 0,
    why: 'C can start at week 1 and takes 6 weeks. F cannot start until week 10, so C must finish by 10, giving LST = 10 − 6 = 4. Float = 4 − 1 = 3 weeks.' },

  { id: 'n2-016', mod: 'MS-N2', topic: 'Network diagrams', diff: 2,
    q: 'In an activity network, what does an arrow between two activities mean?',
    choices: ['The first must finish before the second can start', 'The two happen at the same time', 'They cost the same amount', 'The second is optional'], a: 0,
    why: 'Arrows encode dependency. Activities with no arrow between them can run in parallel, which is what creates float.' },

  { id: 'n2-017', mod: 'MS-N2', topic: 'Network diagrams', diff: 2,
    q: 'Two activities have no dependency between them. What follows?',
    choices: ['They can run in parallel', 'They must run in alphabetical order', 'They must both be critical', 'They must have equal durations'], a: 0,
    why: 'Independent activities can be scheduled simultaneously. Running work in parallel is how a project finishes sooner than the sum of its activity durations.' },

  { id: 'n2-018', mod: 'MS-N2', topic: 'Minimum completion time', diff: 3,
    stem: 'Road resurfacing. A: traffic plan, 2 days. B: mill surface, 4 days after A. C: relocate services, 3 days after A. D: base course, 3 days after B. E: adjust pit lids, 3 days after C. F: asphalt, 2 days after D and E. G: line marking, 1 day after F.',
    q: 'What is the minimum completion time?',
    choices: ['12 days', '11 days', '14 days', '18 days'], a: 0,
    why: 'A→B→D→F→G = 2 + 4 + 3 + 2 + 1 = 12 days. The other route, A→C→E→F→G = 2 + 3 + 3 + 2 + 1 = 11 days, is one day shorter — so C and E each carry 1 day of float.' },

  { id: 'n2-019', mod: 'MS-N2', topic: 'Float time', diff: 3,
    stem: 'Road resurfacing. A: 2 days. B: 4 days after A. C: 3 days after A. D: 3 days after B. E: 3 days after C. F: 2 days after D and E. G: 1 day after F.',
    q: 'What is the float time of "relocate services"?',
    choices: ['1 day', '0 days', '3 days', '2 days'], a: 0,
    why: 'C starts at day 2 and takes 3 days. F cannot start until day 9, so E must finish by 9 and start by 6, meaning C must finish by 6 and start by 3. Float = 3 − 2 = 1 day.' },

  { id: 'n2-020', mod: 'MS-N2', topic: 'The critical path', diff: 3,
    q: 'A project has two different paths of equal maximum length. What does that mean?',
    choices: ['Both paths are critical, and both must be watched', 'Only the first alphabetically is critical', 'There is no critical path', 'The project duration is the sum of both'], a: 0,
    why: 'Any path as long as the maximum is critical. Every activity on either path has zero float, so a delay anywhere on either one pushes out the finish.' },

  { id: 'n2-021', mod: 'MS-N2', topic: 'Minimum completion time', diff: 2,
    q: 'To shorten a project, which activity should you speed up?',
    choices: ['One on the critical path', 'The activity with the most float', 'The longest activity, wherever it is', 'The activity with the most predecessors'], a: 0,
    why: 'Only critical activities determine the completion time. Speeding up an activity that already has float just increases its float — the finish date does not move.' },

  { id: 'n2-022', mod: 'MS-N2', topic: 'Minimum completion time', diff: 3,
    q: 'You shorten a critical activity by 3 days and the project only finishes 1 day earlier. Why?',
    choices: ['Another path became critical after 1 day', 'The calculation must be wrong', 'Float times are always 1 day', 'Shortening never helps by more than a day'], a: 0,
    why: 'Once the path you shortened is no longer the longest, a different path takes over as the constraint. Beyond that point, further speed-up on the original path achieves nothing.' },

  { id: 'n2-023', mod: 'MS-N2', topic: 'Activity charts', diff: 2,
    q: 'An activity chart lists an activity with no predecessors. What does that tell you?',
    choices: ['It can start immediately, at time zero', 'It is on the critical path', 'It has the largest float', 'It is the shortest activity'], a: 0,
    why: 'No predecessors means nothing blocks it, so its earliest start time is 0. Whether it is critical depends on the path lengths, not on being a starting activity.' },

  { id: 'n2-024', mod: 'MS-N2', topic: 'Backward scanning', diff: 3,
    stem: 'A project has a minimum completion time of 21 weeks. Activity H is the final activity and takes 3 weeks.',
    q: 'What is H\'s latest start time?',
    choices: ['18 weeks', '21 weeks', '24 weeks', '3 weeks'], a: 0,
    why: 'A terminal activity\'s latest finish is the project duration, 21. LST = LFT − duration = 21 − 3 = 18 weeks.' }
]);
