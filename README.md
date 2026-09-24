# DayGrid — Lifestyle Dashboard (PWA)

A vanilla HTML/CSS/JS progressive web app for tracking *everything* you do in a day,
built on the master activity list (22 categories, 600+ presets, grouped into 6 life areas, plus "Other").

## Run
```bash
cd lifestyle-dashboard
python3 -m http.server 8080      # then open http://localhost:8080
```
Service workers need `http://localhost` or HTTPS; opening index.html straight from disk (`file://`) runs the app, but you can't install it or use it offline.
`daygrid-standalone.html` is a single-file build (`python3 build-standalone.py`) you can share or preview.

## Structure
```
index.html            App shell (views, modals)
css/styles.css        Theme (light/dark), responsive layout
js/data.js            Taxonomy: AREAS → CATEGORIES → activities, tags, field options
js/app.js             State, storage, rendering, charts, timer, recurrence, PWA
sw.js                 Offline cache (stale-while-revalidate)
manifest.webmanifest  Install metadata + shortcuts
icons/                App icons (svg, 192, 512, maskable)
```

## Data model (one activity)
name, category, subcategory, tags[], date, start, end, duration, location, people, priority,
status, recurrence, energy, mood, focus, satisfaction (1–5), cost, notes, goal,
plannedStart / plannedEnd / plannedDuration, interruptions, distractions, device, screenTime,
seriesId (recurring), createdAt, updatedAt.
