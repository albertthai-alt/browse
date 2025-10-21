// Minimal Tone.js setup for a piano-like instrument
// Exposes window.tonePiano with a play(note) method

;(function(){
  // Guard if Tone is not available
  if (typeof Tone === 'undefined') {
    console.warn('Tone.js not found. Piano instrument will be unavailable.');
    window.tonePiano = null;
    return;
  }

  // Create a simple poly synth with a mellow envelope to approximate piano
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.3, sustain: 0.0, release: 0.4 }
  }).toDestination();

  // Limit volume to avoid clipping
  const vol = new Tone.Volume(-6).toDestination();
  synth.connect(vol);

  window.tonePiano = {
    async ensureStarted() {
      // Start the audio context for Tone
      if (Tone.context.state !== 'running') {
        try { await Tone.start(); } catch(_) {}
      }
    },
    async play(note, duration = '8n') {
      await this.ensureStarted();
      try {
        synth.triggerAttackRelease(note, duration);
      } catch (e) {
        console.warn('Tone piano play failed for note', note, e);
      }
    }
  };
})();
