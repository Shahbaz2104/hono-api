# Demo Asset Guide

Capture checklist and instructions for the README screenshots and GIF.

## Screenshots to capture

Save PNGs into `docs/screenshots/` with these exact names:

| File | What to show |
| --- | --- |
| `login.png` | Login page (`/login`) — email + password fields, "Sign in to Publisher CMS" |
| `dashboard.png` | Dashboard with 2+ authors, stat cards populated (Total Authors, Total Posts, Top Contributor), pagination visible if >20 authors |
| `author-detail.png` | Author detail page with at least 2 posts, one in edit mode showing the save/cancel controls |
| `toast.png` | A Sonner success toast mid-action (e.g. right after registering an author) |

Tips for consistent shots:
- Use a 1440×900 or 1280×800 browser window, light mode, bookmarks bar hidden
- Seed 3–5 authors with 2–3 posts each so the dashboard doesn't look empty
- For `toast.png`, trigger the action and screenshot within the toast's ~4s lifetime

## GIF (10-second flow)

One clip that shows the whole loop:

1. Login
2. Register an author (watch the loading → success toast)
3. Publish a post to that author (dropdown pick)
4. Open the author detail page
5. Delete the author, confirm the cascade warning — posts vanish, stats update

Recommended free tools:
- **Kap** (macOS) — https://getkap.co
- **Peek** (Linux) — `sudo apt install peek`
- **ScreenToGif** (Windows) — https://www.screentogif.com

Export as GIF (or MP4 + convert with `ffmpeg -i demo.mp4 -vf "fps=12,scale=960:-1:flags=lanczos" demo.gif`), keep it under ~5 MB, and save as `docs/screenshots/demo.gif`.

## Wiring into the root README

The root README already contains a commented-out **Demo** section right after the intro. After uploading the assets:

1. Commit the images to `docs/screenshots/` (or drag-drop them into the README editor on GitHub — GitHub hosts them if you paste into an issue/PR editor, but committing them keeps paths stable)
2. Uncomment the `<!-- DEMO-START -->` … `<!-- DEMO-END -->` block in `README.md`
3. Verify the relative paths render on GitHub

## Seeding clean demo data

To reset the local database before recording:

```bash
psql "$DATABASE_URL" -c "TRUNCATE posts, authors, users RESTART IDENTITY CASCADE;"
```

Then register a fresh demo account in the UI while recording.
