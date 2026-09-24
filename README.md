# DayGrid — minimalist lifestyle dashboard (PWA)

The entire app — HTML, CSS and JavaScript — lives in **`index.html`**.

## Run
```bash
python3 -m http.server 8080   # open http://localhost:8080
```
`index.html` also works opened directly from disk, but you can't install it or use it offline that way.

## Files
```
index.html            The whole app (markup + <style> + <script>)
manifest.webmanifest  Install metadata  ┐ optional — browsers require these as
sw.js                 Offline caching   │ separate files for "Install app" and
icons/                App icons         ┘ offline mode
```
