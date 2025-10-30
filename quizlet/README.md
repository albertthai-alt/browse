# Quizlet Static — v2.2.1

A fast, client‑only tool to load Quizlet sets from saved HTML, practice or test with robust answer checking, and export your set or a standalone trainer HTML you can share offline.

- **Version**: 2.2.1
- **Updated**: 2025.10.17

## Overview

This app parses a saved Quizlet set (HTML) entirely in the browser (no server). You can:

- **Load** a Quizlet set from an HTML file saved via your browser (Save Page As → Webpage, HTML only or Complete).
- **Open** existing cards from a JSON file (and optionally append more cards).
- **Study** with flip cards.
- **Practice** with immediate retry for wrong answers (wrong card is queued to reappear later until you answer it correctly).
- **Test** with strict answer checking and automatic progression.
- **Export** to a Quizlet-formatted string, a simple list, a JSON backup, or a **standalone HTML trainer** that runs offline.

## Key Files

- `index.html` — Main UI.
- `app.js` — Core logic for parsing, study/practice/test modes, and export.
- `style.css` — Styles.

## Usage

1. **Open the app**
   - Open `index.html` in a modern browser (Chrome or Edge recommended).

2. **Load a Quizlet set (.html)**
   - Click `Chọn file HTML…` and select your saved Quizlet page, then click `Tải thẻ Quizlet`.
   - Alternatively, click `Mở thẻ` to open cards from a JSON file previously saved by this app.
   - You can also `Mở thêm thẻ` to append another JSON file to the current set.

3. **Study**
   - Use `◀ Trước`, `Lật`, `Tiếp ▶` to browse.

4. **Practice**
   - Switch to `Thực hành`.
   - Enter your answer and press `Kiểm tra`.
   - If wrong: the card stays on screen for immediate retry and is queued to reappear later. If correct: advances.

5. **Test**
   - Switch to `Kiểm tra`.
   - Enter your answer; after feedback, the app auto‑advances (~800ms delay).
   - Use the direction buttons to switch `Định nghĩa → Thuật ngữ` or `Thuật ngữ → Định nghĩa`.

6. **Export**
   - `Tạo chuỗi` — Export a Quizlet‑style line format with configurable separators.
   - `Tạo danh sách` — Export a single‑column list of terms or definitions.
   - `Lưu thẻ` — Save the entire set to JSON for backup/reuse.
   - `Tạo file HTML (thực hành + kiểm tra)` — Generate a self‑contained HTML trainer you can share. It includes:
     - Embedded JSON cards in `<script type="application/json" id="cardsData">…</script>`.
     - Inline click/Enter handlers for reliability offline and in stricter environments.
     - The same strict answer checking and Practice/Test behavior as the main app.

## Answer Checking

- All comparisons use strict normalization:
  - Lowercasing and trimming.
  - Remove accents/combining marks (e.g., Vietnamese diacritics) and map `đ → d`.
  - Remove parentheses content.
  - Keep alphanumerics only; collapse spaces and compare non‑spaced strings.
- **Strict match**: non‑empty, same length, and exact equality post‑normalization.

## Practice vs Test Behavior

- **Practice**
  - Wrong: show correct answer, stay on the card for immediate retry; enqueue the card once to reappear later.
  - Correct: advance immediately.
- **Test**
  - Both correct and wrong: show feedback then auto‑advance after ~800ms.
  - Wrong first attempt is recorded; subsequent corrective attempt does not change the score.

## Standalone Exported HTML

- Uses inline handlers (`onclick`, `onkeydown`) for `check`, `skip`, mode/direction buttons to avoid issues with blocked listeners in some browsers or `file://` contexts.
- Shows a loaded‑count badge and handles init errors visibly.
- The exported page does not depend on external scripts or networks.

## Troubleshooting

- **Buttons don’t respond in exported HTML**
  - Hard refresh (Ctrl+F5). Inline handlers are used, so it should work offline.
  - If still an issue, test in Chrome/Edge; some extensions or unusual security policies can block inline JS.

- **“Đang nạp…” or 0/0**
  - Ensure the exported HTML contains a `<script type="application/json" id="cardsData">` block with non‑empty content.
  - Open DevTools Console for any visible error message rendered into the badge.

- **Answer marked wrong when it looks right**
  - Check the active direction. If the prompt shows a definition, the expected input is the term (and vice‑versa).
  - Enable the debug toggle in the exported trainer (Kết quả panel) to see normalized forms.

- **SecurityError: Tainted canvas** (when opening `index.html` directly)
  - The app now falls back to using the raw favicon when running under `file://`. This is cosmetic and won’t affect functionality.

## Notes

- This app runs entirely client‑side. No data is uploaded.
- Best used on Chrome or Edge.

## Changelog (excerpt)

- 2.2.1 (2025.10.17)
  - Fix: Exported HTML buttons now rely on inline handlers for consistent behavior offline.
  - Fix: Prevent double‑advance in Test mode (removed duplicate listeners).
  - Fix: Robust JSON embedding and parsing using `<script type="application/json">`.
  - Fix: Stabilized normalization and strict compare in exported files.
  - Fix: Avoid favicon canvas taint under `file://`.
- 2.2 (2025.10.16)
  - Base UI and core features (Study/Practice/Test, export options).
