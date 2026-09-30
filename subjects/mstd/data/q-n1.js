/* ============================================================================
   q-n1.js — MS-N1 Networks and Paths (Year 12). 26 questions.
   ========================================================================== */
window.MS = window.MS || {};
window.MS.QUESTIONS = (window.MS.QUESTIONS || []).concat([

  { id: 'n1-001', mod: 'MS-N1', topic: 'Network terminology', diff: 1,
    q: 'What is a vertex in a network?',
    choices: ['A point where edges meet', 'A connection between two points', 'The total weight of a path', 'A closed loop of edges'], a: 0,
    why: 'Vertices (also called nodes) are the points; edges (or arcs) are the connections between them.' },

  { id: 'n1-002', mod: 'MS-N1', topic: 'Degree and connectedness', diff: 1,
    q: 'What is the degree of a vertex?',
    choices: ['The number of edges meeting at it', 'The number of vertices next to it in the alphabet', 'The total weight of its edges', 'The number of paths through it'], a: 0,
    why: 'Degree counts the edges at that vertex. A loop counts twice, since both of its ends are at the same vertex.' },

  { id: 'n1-003', mod: 'MS-N1', topic: 'Degree and connectedness', diff: 2,
    q: 'A graph has 9 edges. What is the sum of all vertex degrees?',
    choices: ['18', '9', '81', '4.5'], a: 0,
    why: 'Every edge contributes 1 to the degree of each of its two endpoints, so the degree sum is always exactly twice the number of edges: 2 \\times 9 = 18.' },

  { id: 'n1-004', mod: 'MS-N1', topic: 'Degree and connectedness', diff: 2,
    q: 'The degrees of a graph\'s vertices sum to 24. How many edges does it have?',
    choices: ['12', '24', '48', '6'], a: 0,
    why: 'Degree sum = 2 × edges, so edges = \\frac{24}{2} = 12.' },

  { id: 'n1-005', mod: 'MS-N1', topic: 'Degree and connectedness', diff: 2,
    q: 'What does it mean for a graph to be connected?',
    choices: ['Every vertex can be reached from every other vertex', 'Every vertex has the same degree as every other vertex', 'There are no cycles anywhere in the graph at all', 'Every pair of vertices is joined by a direct edge'], a: 0,
    why: 'Connectedness requires only that SOME path exists between any two vertices. A direct edge between every pair would make it a complete graph, which is much stronger.' },

  { id: 'n1-006', mod: 'MS-N1', topic: 'Network terminology', diff: 2,
    q: 'What is a bridge in a network?',
    choices: ['An edge whose removal disconnects the graph', 'The longest edge in the graph by total weight', 'A vertex of degree 2 joining two longer paths', 'An edge that forms part of at least one cycle'], a: 0,
    why: 'Removing a bridge breaks the graph into separate pieces. An edge inside a cycle is never a bridge, because the rest of the cycle provides an alternative route.' },

  { id: 'n1-007', mod: 'MS-N1', topic: 'Network terminology', diff: 2,
    q: 'What is the difference between a walk and a path?',
    choices: ['A path repeats no vertex; a walk may', 'A path is always longer than any walk', 'A walk must return to the vertex it started at', 'A path can only use edges that carry weights'], a: 0,
    why: 'A walk is any sequence of connected edges. A path is a walk that visits no vertex more than once.' },

  { id: 'n1-008', mod: 'MS-N1', topic: 'Network terminology', diff: 2,
    q: 'What is a cycle?',
    choices: ['A path that returns to its starting vertex', 'Any edge that gets repeated twice along a walk', 'A vertex with degree zero, joined to nothing', 'A graph that has vertices but no edges at all'], a: 0,
    why: 'A cycle starts and ends at the same vertex without otherwise repeating vertices. Trees are precisely the connected graphs with no cycles.' },

  { id: 'n1-009', mod: 'MS-N1', topic: 'Minimum spanning trees', diff: 1,
    q: 'What is a tree?',
    choices: ['A connected graph with no cycles', 'Any graph with more than 3 vertices', 'A graph where every degree is even', 'A graph drawn without crossing edges'], a: 0,
    why: 'Connected and acyclic. That combination forces exactly n − 1 edges for n vertices.' },

  { id: 'n1-010', mod: 'MS-N1', topic: 'Minimum spanning trees', diff: 2,
    q: 'How many edges does a spanning tree on 12 vertices have?',
    choices: ['11', '12', '13', '24'], a: 0,
    why: 'A tree on n vertices has n − 1 edges: 12 − 1 = 11. One more would create a cycle; one fewer would disconnect it.' },

  { id: 'n1-011', mod: 'MS-N1', topic: 'Minimum spanning trees', diff: 2,
    q: 'What is a MINIMUM spanning tree?',
    choices: ['The spanning tree with the smallest total edge weight', 'The spanning tree that uses the fewest possible edges', 'The shortest path between the two most distant vertices', 'The spanning tree with the smallest number of vertices'], a: 0,
    why: 'Every spanning tree has the same number of edges (n − 1), so "minimum" refers to total WEIGHT, not edge count.' },

  { id: 'n1-012', mod: 'MS-N1', topic: "Prim's algorithm", diff: 2,
    q: 'How does Prim\'s algorithm work?',
    choices: ['Start anywhere and repeatedly add the cheapest edge to a new vertex', 'Sort every edge by weight and add the cheapest one that makes no cycle', 'Repeatedly remove the most expensive edge until only a tree is left over', 'Add the edges in alphabetical order of their vertex labels until connected'], a: 0,
    why: 'Prim grows one connected blob outward, always taking the cheapest edge that reaches a vertex not yet in the tree. That construction makes cycles impossible.' },

  { id: 'n1-013', mod: 'MS-N1', topic: "Kruskal's algorithm", diff: 2,
    q: 'How does Kruskal\'s algorithm work?',
    choices: ['Sort every edge by weight and add the cheapest that creates no cycle', 'Start at one vertex and grow outward to the nearest vertex not yet used', 'Add the heaviest edges first and then prune back any cycles that form', 'Choose edges at random until every vertex in the graph is connected'], a: 0,
    why: 'Kruskal is purely edge-driven: sort, then take cheapest-first, skipping anything that would close a cycle. It can build separate fragments that merge later.' },

  { id: 'n1-014', mod: 'MS-N1', topic: "Kruskal's algorithm", diff: 3,
    q: 'What is the visible difference between Prim\'s and Kruskal\'s as they run?',
    choices: ['Prim keeps one connected group; Kruskal may build several fragments', 'Prim uses the edge weights, while Kruskal ignores weights completely', 'Kruskal always finishes in fewer steps than Prim does on the same graph', 'Prim can create cycles along the way, but Kruskal never can at all'], a: 0,
    why: 'Prim\'s partial result is always one connected tree. Kruskal\'s can be several disconnected pieces until the final edges join them. Both end with the same total weight.' },

  { id: 'n1-015', mod: 'MS-N1', topic: "Prim's algorithm", diff: 3,
    q: 'Prim\'s and Kruskal\'s are run on the same weighted graph. What can you say about the results?',
    choices: ['The total weights are equal, though the edges chosen may differ', 'Both algorithms always choose exactly the same edges as each other', 'Kruskal always produces the smaller total weight of the two answers', 'Prim produces a spanning tree but Kruskal does not produce one'], a: 0,
    why: 'Both find A minimum spanning tree. When weights tie, they can pick different edges, but the minimum total weight is unique. If your two totals differ, one answer has a cycle in it.' },

  { id: 'n1-016', mod: 'MS-N1', topic: 'Weighted graphs', diff: 2,
    stem: 'A network has these edges: A–B 7, A–E 5, B–C 8, B–E 9, C–D 5, D–E 6, B–D 11.',
    q: 'What is the total weight of the minimum spanning tree?',
    choices: ['23', '25', '28', '51'], a: 0,
    why: 'Kruskal takes A–E 5, C–D 5, D–E 6 then A–B 7 — that is 4 edges for 5 vertices and no cycles. Total = 5 + 5 + 6 + 7 = 23. B–C 8 would close a cycle once B is already reachable.' },

  { id: 'n1-017', mod: 'MS-N1', topic: 'Weighted graphs', diff: 2,
    q: 'Why must a minimum spanning tree on 5 vertices have exactly 4 edges?',
    choices: ['Because a tree on n vertices always has n − 1 edges', 'Because 4 is exactly half of 8, and trees always halve it', 'Because each vertex needs exactly one edge of its own', 'Because every cycle needs at least 5 edges to close up'], a: 0,
    why: 'It has to reach all 5 vertices (so at least 4 edges) without a cycle (so at most 4). Both conditions force exactly n − 1 = 4.' },

  { id: 'n1-018', mod: 'MS-N1', topic: 'Shortest path', diff: 2,
    q: 'Is the shortest path between two vertices always part of the minimum spanning tree?',
    choices: ['No — they solve different problems', 'Yes, always, on every possible graph', 'Only in graphs that are fully connected', 'Only when all the edge weights are equal'], a: 0,
    why: 'The MST minimises the TOTAL weight of connecting everything. The shortest path minimises the weight between one specific pair. Those goals often disagree.' },

  { id: 'n1-019', mod: 'MS-N1', topic: 'Shortest path', diff: 3,
    stem: 'Edges: A–B 8, A–C 6, B–D 5, C–D 9, B–E 12, C–F 11, D–E 4, D–F 7, E–G 6, F–G 5.',
    q: 'What is the shortest distance from A to G?',
    choices: ['22', '23', '25', '27'], a: 0,
    why: 'A–C–F–G is 6 + 11 + 5 = 22. Compare A–B–D–E–G = 8 + 5 + 4 + 6 = 23, A–B–D–F–G = 8 + 5 + 7 + 5 = 25 and A–C–D–F–G = 6 + 9 + 7 + 5 = 27. The minimum is 22 — and note it takes the single most expensive edge in the graph, which is why you must check every route rather than avoiding big weights on instinct.' },

  { id: 'n1-020', mod: 'MS-N1', topic: 'Eulerian and Hamiltonian', diff: 2,
    q: 'What does an Eulerian trail use exactly once?',
    choices: ['Every edge', 'Every vertex', 'Every cycle', 'Every bridge'], a: 0,
    why: 'Eulerian is about EDGES; Hamiltonian is about VERTICES. That single distinction answers most questions on this sub-topic.' },

  { id: 'n1-021', mod: 'MS-N1', topic: 'Eulerian and Hamiltonian', diff: 2,
    q: 'When does a connected graph have an Eulerian CIRCUIT?',
    choices: ['When every vertex has even degree', 'When exactly two vertices have odd degree', 'When it has no cycles', 'When every vertex has odd degree'], a: 0,
    why: 'A circuit must leave every vertex as often as it enters, so all degrees must be even. Exactly two odd vertices gives a trail (open) instead, starting and ending at those two.' },

  { id: 'n1-022', mod: 'MS-N1', topic: 'Eulerian and Hamiltonian', diff: 3,
    q: 'A connected graph has exactly two vertices of odd degree. What does it have?',
    choices: ['An Eulerian trail starting and ending at the odd vertices', 'An Eulerian circuit that returns to the vertex where it started', 'Neither a trail nor a circuit is possible on this network', 'A Hamiltonian circuit visiting every vertex exactly once'], a: 0,
    why: 'The two odd vertices must be the endpoints of the trail. With zero odd vertices you get a circuit; with four or more you get neither.' },

  { id: 'n1-023', mod: 'MS-N1', topic: 'Eulerian and Hamiltonian', diff: 2,
    q: 'What does a Hamiltonian path visit exactly once?',
    choices: ['Every vertex', 'Every edge', 'Every bridge', 'Every face'], a: 0,
    why: 'A Hamiltonian path visits every VERTEX once. It need not use every edge, and there is no simple degree test for whether one exists.' },

  { id: 'n1-024', mod: 'MS-N1', topic: 'Degree and connectedness', diff: 3,
    q: 'Can a graph have exactly one vertex of odd degree?',
    choices: ['No — the number of odd-degree vertices is always even', 'Yes, in any connected graph that has enough edges in it', 'Yes, but only if the graph happens to contain a loop somewhere', 'Only if the graph has an even number of edges in total'], a: 0,
    why: 'The degrees sum to twice the number of edges, which is even. An odd number of odd terms cannot sum to an even total, so odd-degree vertices always come in pairs.' },

  { id: 'n1-025', mod: 'MS-N1', topic: 'Weighted graphs', diff: 2,
    q: 'What does the weight on an edge usually represent?',
    choices: ['A cost such as distance, time or money', 'The number of times that the edge gets used', 'The degree of its two endpoint vertices added', 'The order in which the edge happened to be drawn'], a: 0,
    why: 'Weights carry the real-world quantity being minimised — kilometres of road, minutes of travel, dollars of cable.' },

  { id: 'n1-026', mod: 'MS-N1', topic: 'Minimum spanning trees', diff: 3,
    stem: 'Six towns are to be joined by road. The cheapest available links, in order, are 4, 5, 5, 6, 7, 8, 9 and 11 units.',
    q: 'How many of those links will the minimum spanning tree use?',
    choices: ['5', '6', '8', '4'], a: 0,
    why: 'Six vertices need n − 1 = 5 edges. You take them cheapest-first, skipping any that would close a cycle — so the five used are not necessarily the five cheapest.' }
]);
