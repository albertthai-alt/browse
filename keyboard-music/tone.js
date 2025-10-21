// Tone.js Piano using multi-samples (Salamander) with reverb and compressor
// Exposes window.tonePiano with ensureStarted(), attack(note), release(note), play(note, duration), stopAll()

;(function(){
  // Guard if Tone is not available
  if (typeof Tone === 'undefined') {
    console.warn('Tone.js not found. Piano instrument will be unavailable.');
    window.tonePiano = null;
    return;
  }

  // Master chain: subtle reverb -> volume -> destination
  const reverb = new Tone.Reverb({ decay: 2.4, preDelay: 0.01, wet: 0.12 });
  const vol = new Tone.Volume(-4);
  reverb.connect(vol).toDestination();

  // Sampler using Tone.js Salamander hosted samples
  // Reference: https://github.com/Tonejs/Tone.js/ and https://tonejs.github.io/audio/salamander/
  const baseUrl = 'https://tonejs.github.io/audio/salamander/';
  const sampler = new Tone.Sampler({
    urls: {
      "A0": "A0.mp3", "C1": "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3", "A1": "A1.mp3",
      "C2": "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3", "A2": "A2.mp3",
      "C3": "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3", "A3": "A3.mp3",
      "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3",
      "C5": "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3", "A5": "A5.mp3",
      "C6": "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3", "A6": "A6.mp3",
      "C7": "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3", "A7": "A7.mp3",
      "C8": "C8.mp3"
    },
    release: 3.2,
    baseUrl
  });
  sampler.connect(reverb);
  const activeNotes = new Set();

  window.tonePiano = {
    async ensureStarted() {
      // Start the audio context for Tone
      if (Tone.context.state !== 'running') {
        try { await Tone.start(); } catch(_) {}
      }
    },
    async attack(note, velocity = 0.8) {
      await this.ensureStarted();
      try {
        sampler.triggerAttack(note, Tone.now(), velocity);
        activeNotes.add(note);
      } catch (e) { console.warn('Tone piano attack failed', note, e); }
    },
    async release(note) {
      await this.ensureStarted();
      try {
        sampler.triggerRelease(note);
        activeNotes.delete(note);
      } catch (e) { console.warn('Tone piano release failed', note, e); }
    },
    async play(note, duration = '2n') {
      await this.ensureStarted();
      try { sampler.triggerAttackRelease(note, duration); }
      catch (e) { console.warn('Tone piano play failed', note, e); }
    },
    stopAll() {
      try { sampler.releaseAll(); activeNotes.clear(); } catch(_) {}
    }
  };
})();
