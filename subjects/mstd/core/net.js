/* ============================================================================
   net.js — graph and project-network algorithms (MS-N1, MS-N2).

   §9.9: nothing here trusts stored answers. The critical path, the minimum
   spanning tree and the shortest path are all COMPUTED. tests/validate.js
   runs its own independent implementation over the same data and compares —
   that is the only way to know a network puzzle is right.
   Namespace: window.MS.Net
   ========================================================================== */
window.MS = window.MS || {};
(function () {
  'use strict';
  var Net = {};

  /* ====================================================== critical path (N2)
     Activity-on-node. Forward scan for earliest start times, backward scan for
     latest start times, float = LST − EST, critical path = the zero-float
     chain that runs start to finish. */
  Net.analyse = function (activities) {
    var byId = {}, order = [], nodes = {};
    activities.forEach(function (a) { byId[a.id] = a; });

    /* Topological order (Kahn). Also detects a cycle, which is a data bug. */
    var indeg = {}, succ = {};
    activities.forEach(function (a) {
      indeg[a.id] = a.pre.length;
      succ[a.id] = succ[a.id] || [];
      a.pre.forEach(function (p) { (succ[p] = succ[p] || []).push(a.id); });
    });
    var queue = activities.filter(function (a) { return indeg[a.id] === 0; }).map(function (a) { return a.id; });
    while (queue.length) {
      var id = queue.shift();
      order.push(id);
      (succ[id] || []).forEach(function (s) {
        indeg[s]--;
        if (indeg[s] === 0) queue.push(s);
      });
    }
    if (order.length !== activities.length) {
      return { error: 'cycle in the activity list', duration: 0, nodes: {}, critical: [] };
    }

    /* Forward scan: EST is the LARGEST finish time among predecessors. */
    order.forEach(function (id) {
      var a = byId[id];
      var est = 0;
      a.pre.forEach(function (p) { est = Math.max(est, nodes[p].eft); });
      nodes[id] = { id: id, dur: a.dur, est: est, eft: est + a.dur, pre: a.pre.slice(), succ: (succ[id] || []).slice() };
    });
    var duration = 0;
    order.forEach(function (id) { duration = Math.max(duration, nodes[id].eft); });

    /* Backward scan: LFT is the SMALLEST LST among successors (or the project
       duration for a terminal activity). */
    for (var i = order.length - 1; i >= 0; i--) {
      var n = nodes[order[i]];
      var lft = n.succ.length ? Infinity : duration;
      n.succ.forEach(function (s) { lft = Math.min(lft, nodes[s].lst); });
      n.lft = lft;
      n.lst = lft - n.dur;
      n.float = n.lst - n.est;
    }

    /* The critical path: follow zero-float activities from a zero-float start
       through to a terminal one, always preferring the successor whose EST
       matches this activity's EFT (so the chain is genuinely contiguous). */
    var critical = [];
    var starts = order.filter(function (id) { return nodes[id].float === 0 && nodes[id].pre.length === 0; });
    if (starts.length) {
      var cur = starts[0];
      critical.push(cur);
      for (var guard = 0; guard < activities.length; guard++) {
        var next = null;
        var cn = nodes[cur];
        for (var s = 0; s < cn.succ.length; s++) {
          var cand = nodes[cn.succ[s]];
          if (cand.float === 0 && cand.est === cn.eft) { next = cand.id; break; }
        }
        if (!next) break;
        critical.push(next);
        cur = next;
      }
    }
    return {
      duration: duration,
      nodes: nodes,
      order: order,
      critical: critical,
      criticalSet: critical.reduce(function (m, id) { m[id] = 1; return m; }, {}),
      zeroFloat: order.filter(function (id) { return nodes[id].float === 0; })
    };
  };

  /* ============================================ minimum spanning tree (N1) */
  /* Prim: grow one blob outward, always taking the cheapest edge to a NEW
     vertex. Returns the chosen edge indices and the total weight. */
  Net.prim = function (nodes, edges, startId) {
    var inTree = {}, chosen = [], total = 0;
    var ids = nodes.map(function (n) { return n.id; });
    if (!ids.length) return { edges: [], total: 0, order: [] };
    var start = startId || ids[0];
    inTree[start] = 1;
    var order = [start];
    while (order.length < ids.length) {
      var best = -1, bestW = Infinity;
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        var ain = !!inTree[e.a], bin = !!inTree[e.b];
        if (ain === bin) continue;                          // both in, or both out
        if (e.w < bestW) { bestW = e.w; best = i; }
      }
      if (best < 0) break;                                  // disconnected graph
      var pick = edges[best];
      var added = inTree[pick.a] ? pick.b : pick.a;
      inTree[added] = 1;
      order.push(added);
      chosen.push(best);
      total += pick.w;
    }
    return { edges: chosen, total: total, order: order, complete: order.length === ids.length };
  };

  /* Kruskal: sort every edge, take cheapest-first, skip anything that would
     close a cycle. Same total as Prim; often a different edge set. */
  Net.kruskal = function (nodes, edges) {
    var parent = {};
    nodes.forEach(function (n) { parent[n.id] = n.id; });
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function union(a, b) { parent[find(a)] = find(b); }
    var idx = edges.map(function (_, i) { return i; }).sort(function (i, j) {
      return edges[i].w - edges[j].w || i - j;
    });
    var chosen = [], total = 0;
    idx.forEach(function (i) {
      var e = edges[i];
      if (find(e.a) === find(e.b)) return;
      union(e.a, e.b);
      chosen.push(i);
      total += e.w;
    });
    return { edges: chosen, total: total, complete: chosen.length === nodes.length - 1 };
  };

  /* ------------------------------------------------------- shortest path */
  /* Dijkstra on an undirected weighted graph. */
  Net.shortest = function (nodes, edges, from, to) {
    var dist = {}, prev = {}, done = {};
    nodes.forEach(function (n) { dist[n.id] = Infinity; });
    dist[from] = 0;
    var adj = {};
    edges.forEach(function (e, i) {
      (adj[e.a] = adj[e.a] || []).push({ to: e.b, w: e.w, i: i });
      (adj[e.b] = adj[e.b] || []).push({ to: e.a, w: e.w, i: i });
    });
    for (;;) {
      var u = null, best = Infinity;
      for (var k in dist) if (!done[k] && dist[k] < best) { best = dist[k]; u = k; }
      if (u == null) break;
      done[u] = 1;
      if (u === to) break;
      (adj[u] || []).forEach(function (e) {
        if (dist[u] + e.w < dist[e.to]) { dist[e.to] = dist[u] + e.w; prev[e.to] = u; }
      });
    }
    var path = [], cur = to;
    if (dist[to] < Infinity) {
      while (cur != null) { path.unshift(cur); cur = prev[cur]; }
    }
    return { total: dist[to], path: path, dist: dist };
  };

  /* ------------------------------------------------------------ properties */
  Net.degrees = function (nodes, edges) {
    var deg = {};
    nodes.forEach(function (n) { deg[n.id] = 0; });
    edges.forEach(function (e) {
      deg[e.a] = (deg[e.a] || 0) + 1;
      deg[e.b] = (deg[e.b] || 0) + 1;
      if (e.a === e.b) deg[e.a] += 0;                       // a loop already counted twice
    });
    return deg;
  };
  Net.connected = function (nodes, edges) {
    if (!nodes.length) return true;
    var adj = {}, seen = {};
    edges.forEach(function (e) {
      (adj[e.a] = adj[e.a] || []).push(e.b);
      (adj[e.b] = adj[e.b] || []).push(e.a);
    });
    var stack = [nodes[0].id];
    seen[nodes[0].id] = 1;
    while (stack.length) {
      var v = stack.pop();
      (adj[v] || []).forEach(function (w) { if (!seen[w]) { seen[w] = 1; stack.push(w); } });
    }
    return Object.keys(seen).length === nodes.length;
  };
  /* Eulerian: 0 odd vertices -> circuit; exactly 2 -> trail; otherwise neither. */
  Net.eulerian = function (nodes, edges) {
    var deg = Net.degrees(nodes, edges);
    var odd = Object.keys(deg).filter(function (k) { return deg[k] % 2 === 1; });
    if (!Net.connected(nodes, edges)) return { kind: 'none', odd: odd.length };
    if (odd.length === 0) return { kind: 'circuit', odd: 0 };
    if (odd.length === 2) return { kind: 'trail', odd: 2, ends: odd };
    return { kind: 'none', odd: odd.length };
  };

  /* Lay a project network out for drawing: column = longest chain from start. */
  Net.layout = function (activities, sol) {
    var depth = {}, maxDepth = 0;
    sol.order.forEach(function (id) {
      var a = null;
      for (var i = 0; i < activities.length; i++) if (activities[i].id === id) a = activities[i];
      var d = 0;
      a.pre.forEach(function (p) { d = Math.max(d, depth[p] + 1); });
      depth[id] = d;
      maxDepth = Math.max(maxDepth, d);
    });
    var byCol = {};
    sol.order.forEach(function (id) { (byCol[depth[id]] = byCol[depth[id]] || []).push(id); });
    var nodes = [], edges = [];
    Object.keys(byCol).forEach(function (col) {
      var list = byCol[col];
      list.forEach(function (id, i) {
        nodes.push({
          id: id,
          x: maxDepth === 0 ? 0.5 : Number(col) / maxDepth,
          y: list.length === 1 ? 0.5 : i / (list.length - 1),
          sub: String(sol.nodes[id].dur)
        });
      });
    });
    activities.forEach(function (a) {
      a.pre.forEach(function (p) { edges.push({ a: p, b: a.id }); });
    });
    return { nodes: nodes, edges: edges, depth: depth, cols: maxDepth + 1 };
  };

  window.MS.Net = Net;
})();
