/* Local, opt-in focus time. No wall-clock catch-up or background accounting. */
(function (root) {
  'use strict';
  class FocusTimer {
    constructor(minutes = 45) { this.limit = minutes * 60; this.seconds = 0; this.mode = 'idle'; this.tired = false; }
    start() { this.mode = 'focus'; }
    pause() { if (this.mode !== 'idle') this.mode = 'paused'; }
    rest() { this.mode = 'rest'; }
    recover() { this.seconds = 0; this.tired = false; this.mode = 'idle'; }
    advance(seconds, visible = true) {
      if (this.mode !== 'focus' || !visible || !Number.isFinite(seconds) || seconds < 0) return;
      // A sleeping computer or stalled tab must never turn a gap into work.
      if (seconds > 2) { this.pause(); return; }
      this.seconds += seconds;
      if (this.seconds >= this.limit) this.tired = true;
    }
    setMinutes(minutes) {
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) return false;
      this.limit = minutes * 60; this.tired = this.seconds >= this.limit; return true;
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = FocusTimer;
  else root.FocusTimer = FocusTimer;
})(typeof window !== 'undefined' ? window : globalThis);
