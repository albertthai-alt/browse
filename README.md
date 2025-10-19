# GitHub Project File/Folder Browser

Simple client-only browser for a GitHub repository’s root and subfolders.

## Current Features

- **Repo target**: `albertthai-alt/browse` (GitHub REST API v3).
- **List contents** at any path (root and subfolders).
- **Exclude** `index.html` from the file list (all other files are shown).
- **Folders** appear first; click to navigate into them.
- **Breadcrumbs** and **Back/Forward** support via hash-based routing.
- **Open files in a new tab** (keeps the listing in place).
- **File size** displayed in B/KB/MB.
- **GitHub link** for each item.
- **External favicon** (no local file required).

## Usage

1. Open `C:\Users\NEC VM-7\CascadeProjects\gh-file-browser\index.html` in a browser.
2. Browse the root list. Click a folder to drill down.
3. Click a file to open it in a new tab.
4. Use breadcrumbs or the browser’s Back/Forward to navigate.
5. To deep-link a folder, append a hash: `index.html#quizlet` (or nested `#quizlet/sub`).

## Implementation Notes

- API endpoint used: `GET /repos/{owner}/{repo}/contents/{path}`.
- Path state is stored in `location.hash` (e.g. `#quizlet`).
- Links to files are relative (e.g. `./quizlet/file.html`). Adjust if your hosting layout differs.
- External favicon URL: `https://cdn-icons-png.freepik.com/256/9517/9517922.png?semt=ais_white_label`.

## Roadmap

- Optional search and type filters.
- Raw download links and Markdown rendering.
- Branch selector and rate-limit indicator.

## Notes

- Keep the GitHub repo public for unauthenticated API access. For private repos, we can add a token input and Authorization header.
- Be mindful of GitHub API rate limits.
