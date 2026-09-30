/* Physics' sound vocabulary, played through the app's ONE AudioContext.

   The cues are Newton's Notebook's own (a rising zap for a boss hit, a snap for a
   charged lookup…). What changed: no context of its own — SQ.Sound.shared() hands
   over the app's context and master bus, so the global Sound switch and volume
   reach these too — and enabled/volume are read from the app settings. */
window.PHYS = window.PHYS || {};

PHYS.Sound = (function () {
  let lastAt = {};
  let localOn = true;

  const enabled = () => localOn && !!(SQ.Store && SQ.Store.data.settings.sound);

  /** One shaped oscillator. type/freq/dur, optional glide and delay. */
  function tone(o) {
    if (!enabled() || !SQ.Sound || !SQ.Sound.shared) return;
    const sh = SQ.Sound.shared();
    if (!sh || !sh.ctx) return;
    const c = sh.ctx;
    if (c.state === "suspended") c.resume().catch(() => {});
    const t0 = c.currentTime + (o.delay || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.to), t0 + o.dur);
    /* The stand-alone master ran at 0.34 of the volume; the shared bus carries the
       volume, so the per-tone peak is scaled by that factor instead. */
    const peak = (o.gain === undefined ? 0.5 : o.gain) * 0.34;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + Math.min(0.02, o.dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g); g.connect(sh.master || c.destination);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.02);
  }

  /** Rate-limit an event so a fast tapper does not stack twenty copies. */
  function gate(key, ms) {
    const now = Date.now();
    if (now - (lastAt[key] || 0) < ms) return false;
    lastAt[key] = now;
    return true;
  }

  const click       = () => gate("click", 40)  && tone({ freq: 520, dur: 0.05, type: "triangle", gain: 0.22 });
  const nav         = () => gate("nav", 90)    && tone({ freq: 300, to: 460, dur: 0.1, type: "sine", gain: 0.18 });
  const correct     = () => gate("correct", 60) &&
                            (tone({ freq: 660, dur: 0.09, type: "sine", gain: 0.4 }),
                             tone({ freq: 990, dur: 0.14, type: "sine", gain: 0.32, delay: 0.07 }));
  const wrong       = () => gate("wrong", 60)  &&
                            (tone({ freq: 200, to: 130, dur: 0.22, type: "sawtooth", gain: 0.24 }));
  const coin        = () => gate("coin", 60)   &&
                            (tone({ freq: 1180, dur: 0.06, type: "square", gain: 0.16 }),
                             tone({ freq: 1560, dur: 0.1,  type: "square", gain: 0.13, delay: 0.05 }));
  const tick        = () => gate("tick", 120)  && tone({ freq: 900, dur: 0.03, type: "square", gain: 0.1 });
  const win         = () => [0, 0.1, 0.2, 0.32].forEach((d, i) =>
                            tone({ freq: [523, 659, 784, 1047][i], dur: 0.24, type: "triangle", gain: 0.3, delay: d }));
  const lose        = () => [0, 0.12, 0.26].forEach((d, i) =>
                            tone({ freq: [392, 330, 262][i], dur: 0.26, type: "triangle", gain: 0.26, delay: d }));
  const levelUp     = () => [0, 0.09, 0.18, 0.27, 0.4].forEach((d, i) =>
                            tone({ freq: [523, 659, 784, 1047, 1319][i], dur: 0.3, type: "sine", gain: 0.32, delay: d }));
  const achievement = () => [0, 0.1, 0.22].forEach((d, i) =>
                            tone({ freq: [784, 1047, 1319][i], dur: 0.22, type: "triangle", gain: 0.28, delay: d }));
  const zap         = () => gate("zap", 50) &&
                            tone({ freq: 1400, to: 220, dur: 0.16, type: "sawtooth", gain: 0.2 });
  const snap        = () => gate("snap", 50) &&
                            tone({ freq: 740, to: 880, dur: 0.07, type: "square", gain: 0.2 });

  return { setEnabled: v => { localOn = !!v; }, setVolume: () => {}, click, nav, correct, wrong, coin, tick,
           win, lose, levelUp, achievement, zap, snap };
})();
