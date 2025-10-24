// Shared keyboard-to-note mapping for all instruments
// Exposes window.SHARED_KEYMAP
(function(){
  window.SHARED_KEYMAP = {
    // Top row (only sharps on selected keys)
    w:'F#3', e:'G#3', r:'A#3', y:'C#4', u:'D#4', o:'F#4', p:'G#4',
    // Middle row
    a:'F3', s:'G3', d:'A3', f:'B3',
    g:'C4', h:'D4', j:'E4', k:'F4', l:'G4',
    // Bottom row
    z:'B2', x:'C3', c:'D3', v:'E3', b:'A4', n:'B4', m:'C5', ',':'D5', '.':'E5'
  };
})();
