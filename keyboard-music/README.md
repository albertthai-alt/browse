# Keyboard Music

A simple browser-based musical keyboard that maps your computer keys to notes. Includes multiple instruments (Piano via Tone.js, Tank Drum, Sáo), Shift-to-sharp modifier, and a guided song player that highlights lyrics and suggests notes.

## Features
- **Piano instrument (default)** using Tone.js poly synth.
- **Tank Drum** and **Sáo** with sample/synth fallbacks.
- **Keyboard mapping** with on-screen keys and active state.
- **Shift-to-sharp**: Holding Shift turns eligible notes F, G, A, C, D into their sharp variants.
- **Song player**:
  - Load a `.txt` file describing lyrics + target notes.
  - Shows note hints under each lyric token (toggleable).
  - Highlights the current token and marks completed notes.
  - Optional guide highlight on the on-screen keyboard for the next expected note.
- **Inline favicon**: orange music note icon.

## Getting Started
1. Open `index.html` in a modern browser (Chrome/Edge recommended).
2. Ensure you allow audio playback when prompted by the browser.

No build step required.

## Instruments
- `Piano` (default): Uses Tone.js. Does not require local samples.
- `Tank Drum` and `Sáo`: Attempt to load wav samples from folders (if present). If missing, fall back to WebAudio synthesizers.

Switch instruments via the dropdown in the page header.

## Keyboard Controls
- Toggle keyboard hotkeys: checkbox "Bật phím tắt".
- Keys are shown on screen in three rows. Clicking a key with the mouse/touch also plays the mapped note.
- Holding **Shift** plays sharps for base notes in `{F, G, A, C, D}` and updates labels accordingly.
- Remapping basics come from `keymap.json`. Example mapping:
  - `z` → `A5` (note: key `;` is intentionally unmapped and removed from UI).

## Song Player
1. Use the "Tải bài hát (.txt)" file picker to select a song file.
2. Click "Tải & Hiển thị" to render the lyrics and notes.
3. Play notes on your keyboard or by clicking keys.
4. Correct notes advance the current lyric token until the song ends.
5. Use "Reset bài" to start over.

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
- "Hiển thị nốt nhạc" (default ON): show/hide note hints under each lyric token.
- "Highlight bàn phím" (default ON): highlights on-screen key(s) mapped to the next expected note.

## Project Structure
```
keyboard-music/
├─ index.html        # App UI + logic (no build step needed)
├─ keymap.json       # Key-to-note mappings per instrument
├─ tone.js           # Tone.js piano setup
├─ Happy Birthday.txt# Example song file
└─ tank drum/        # Sample wavs (optional, used by Tank Drum)
```

## Dependencies
- [Tone.js](https://tonejs.github.io/) loaded via CDN.
- Browser Web Audio API.

## Notes & Limitations
- Opening via `file://` uses default keymaps if `keymap.json` cannot be fetched.
- For best compatibility, serve via a local server or open directly in Chromium-based browsers which allow audio context unlock on user gesture.
- Shift-to-sharp guidance compares exact note names; ensure song notes match the intended octave and accidental.

## License
MIT (or your preferred license; update as needed).
