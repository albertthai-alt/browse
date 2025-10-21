# Keyboard Music

A simple browser-based musical keyboard that maps your computer keys to notes. Includes multiple instruments (Piano via Tone.js Sampler), Tank Drum, Sáo, Handpan, Đàn đá (Lithophone), and Đàn tre. Supports Shift-to-sharp, keyboard highlighting, and a guided song player.

## Features
- **Piano (default)**: High-quality Salamander piano via Tone.js `Sampler`, with sustain/hold and subtle reverb.
- **Other instruments**: Tank Drum (longer ring), Sáo (sustained/vibrato), Handpan (soft, long decay), Đàn đá/Lithophone (bright mallet), Đàn tre.
- **Keyboard mapping**: On-screen keys, active state, and special guidance highlight.
- **Shift-to-sharp**: Hold Shift to play sharps for base notes F, G, A, C, D. Sharp guidance uses a distinct red solid outline to indicate Shift is needed.
- **Song player**:
  - Load a `.txt` file describing lyrics + target notes.
  - Show/hide note hints per token (toggle).
  - Keyboard guidance highlight (toggle). Sharp notes get special highlight.
  - Progressively highlights and completes tokens as you play correct notes.
- **Inline favicon**: orange music note icon.

## Getting Started
1. Open `index.html` in a modern browser (Chrome/Edge recommended).
2. Ensure you allow audio playback when prompted by the browser.

No build step required.

## Instruments
- `Piano` (default): Tone.js `Sampler` (Salamander). No local samples needed.
- `Tank Drum`: WebAudio synth with longer decay tail.
- `Sáo`: WebAudio sustained tone with gentle vibrato.
- `Handpan`: WebAudio soft attack, harmonic blend, long decay.
- `Đàn đá (Lithophone)`: WebAudio bright/glassy mallet with medium-long ring.
- `Đàn tre`: WebAudio percussive.

Switch instruments via the dropdown in the page header.

## Keyboard Controls
- **Bật phím tắt**: enable/disable keyboard.
- On-screen keys mirror the mapping; mouse/touch works too.
- Hold **Shift** for sharps; labels update accordingly.
- Sharps in guidance are shown with a bold red outline to remind you to hold Shift.
- Key mapping comes from `keymap.json`. Example: `z` → `A5` (key `;` removed).

## Song Player
1. Use the "Tải bài hát (.txt)" picker → "Tải & Hiển thị".
2. Play by keyboard or clicking keys.
3. Correct notes advance and complete tokens; line breaks auto-advance to the next line's first token.
4. Use "Reset bài" to restart.

### Song File Format
Plain text file with tokens in the form:
- `word{NOTE}` or `word{NOTE}{NOTE}` for multiple notes.
- Bracketed words are preserved as one token: `[name]{E4}{D4}`.
- Example (`Happy Birthday.txt`):
```
hap{C4}py{C4} birth{D4}day{C4} to{F4} you{E4}
hap{C4}py{C4} birth{D4}day{C4} to{G4} you{F4}
hap{C4}py{C4} birth{C5}day{A4} dear{F4} [name]{E4}{D4}
hap{A4}py{A4} birth{A4}day{F4} to{G4} you{F4}
```
- Notes must be in scientific pitch like `C4`, `F#4`, `Bb3` (flats are parsed but keyboard sharp toggle is the primary helper).

### Song View Options
- **Hiển thị nốt nhạc** (ON): show/hide note hints.
- **Highlight bàn phím** (ON): highlight on-screen key(s) for the next expected note.
- Sharp notes use a distinct style to indicate holding Shift.

## Project Structure
```
keyboard-music/
├─ index.html         # App UI + logic (no build step needed)
├─ keymap.json        # Key-to-note mappings per instrument
├─ tone.js            # Tone.js piano (Sampler + reverb), attack/release helpers
└─ Happy Birthday.txt # Example song file
```

## Dependencies
- [Tone.js](https://tonejs.github.io/) via CDN (Sampler + Reverb).
- Browser Web Audio API.

## Notes & Limitations
- Robust keymap loading: tries multiple paths with cache-busting; falls back to `DEFAULT_KEYMAP` if fetch fails.
- Opening via `file://`: still works using default keymaps if fetching is blocked.
- For best compatibility, serve via a local server or use Chromium-based browsers for audio unlock.
- Guidance compares exact note names; ensure song notes match octave/accidentals.

## License
MIT (or your preferred license; update as needed).
