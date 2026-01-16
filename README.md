# Ozzium Base64 Studio

Offline, local-only Base64 ↔ Image utility.

## Dev

```bash
npm install
npm start
```

## Build portable EXE (standalone)

```bash
npm run dist
```

Output lands in `dist/`.

### Save Image button (EXE)

In the packaged app, saving uses an Electron "Save As" dialog via IPC (so it works reliably). In a normal browser, it falls back to a standard download.
