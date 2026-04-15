# Peaceful Tasks

A secure, end-to-end encrypted to-do app with real-time family account sync, voice input, and alarms — all while keeping your data private.

## Features

- **End-to-End Encrypted** — All data is encrypted locally using AES-256-GCM. Only you hold the encryption key.
- **Family Accounts** — Invite family members to share a synchronized to-do list with a single shareable link.
- **Voice Input** — Dictate tasks and notes using your device's microphone.
- **Alarms & Timers** — Set reminders and timers with audio notifications.
- **Points System** — Earn points for completing tasks and share progress with family.
- **Offline-First** — Works completely offline. Syncs to the cloud when you're ready.
- **Progressive Web App** — Install on any device and use like a native app.
- **Dark Mode** — Easy on the eyes, day or night.
- **Calmer Language** — Task suggestions reframe stress into manageable action.

## Technology Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Encryption:** Web Crypto API (AES-256-GCM)
- **Storage:** IndexedDB + localStorage with graceful fallback
- **Cloud Sync:** Backside BaaS (optional)
- **Service Worker:** Cache-first PWA for instant load times
- **Routing:** 404.html trick for client-side routing on GitHub Pages

## Getting Started

### Visit the Live App

https://akivamac.github.io/to-do/

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/akivamac/to-do.git
   cd to-do
   ```

2. Start a local web server:
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

3. Open your browser to `http://localhost:8000/to-do/`

### Creating a Family Account

1. Launch the app and select "Create Personal Account"
2. Set a strong password (memorize it — there's no recovery)
3. Once logged in, click "Settings" and select "Create Shareable Invite Link"
4. Share the link with family members
5. They'll be able to join your family account and see shared tasks in real-time

### Encryption & Privacy

- Your password is never sent to the server — it stays on your device
- Data is encrypted using PBKDF2 key derivation + AES-256-GCM
- The app works completely offline; sync is optional
- All encryption happens client-side

## Architecture

```
index.html          → Main UI (screens, modals, forms)
app.js              → Core logic (auth, state, UI routing)
tasks.js            → Task rendering and management
projects.js         → Project management
notes.js            → Notes system
alarms.js           → Alarms and timers
backside.js         → Cloud sync integration
sw.js               → Service Worker for caching
manifest.json       → PWA metadata
```

## Browser Support

- Chrome/Edge 76+
- Firefox 75+
- Safari 13.1+ (iOS 13.1+)
- Android Browser (Chrome-based)

**Note:** Requires Web Crypto API support for encryption functionality.

## License

MIT License — See LICENSE file for details.

## Contributing

Found a bug? Have a feature request? Open an issue or submit a pull request.

## Security & Privacy

This project is designed with privacy-first principles:
- No server-side access to your data
- No tracking or analytics
- No login required (you control your encryption key)
- Open source so you can audit the code

For security concerns, please file an issue privately or contact the maintainer.
