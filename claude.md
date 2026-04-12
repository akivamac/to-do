# Peaceful Tasks PWA - Claude Guidelines

## Project Overview

Peaceful Tasks is a progressive web app (PWA) designed to reduce overwhelm through task management, note-taking, and shared list coordination. The app is deployed on GitHub Pages and syncs data via Backside BaaS with end-to-end encryption.

**Live Site:** https://akivamac.github.io/to-do/

## Architecture

- **Single-File HTML Architecture**: All UI is in `index.html` with external JS modules
- **Data Sync**: Backside BaaS for real-time sync and user management
- **Encryption**: AES-256-GCM with PBKDF2 key derivation for E2E encryption
- **Offline Support**: Service Worker (`sw.js`) for offline functionality and caching
- **Client-Side Routing**: Custom router via 404.html bridge for URL handling on GitHub Pages
- **Real-Time Features**: Polling mechanism (5 seconds for lists) for live updates

## File Structure

```
├── index.html              # Main file with all UI and inline router
├── app.js                  # Core app logic, screen management, notifications
├── tasks.js                # Task management functions
├── notes.js                # Notes management functions
├── projects.js             # Projects management functions
├── alarms.js               # Alarm/reminder functions
├── backside.js             # Backside API configuration and sync logic
├── styles.css              # All styling
├── sw.js                   # Service Worker for offline support
├── 404.html                # URL routing bridge for GitHub Pages
├── manifest.json           # PWA manifest
├── robots.txt              # SEO: search engine directives
├── sitemap.xml             # SEO: site structure for indexing
└── docs/                   # Documentation and configuration files
```

## Coding Standards

### JavaScript Conventions
- Use `const` by default, `let` for reassignment, avoid `var`
- Function names in camelCase: `showScreen()`, `addTask()`
- Variable names: descriptive, camelCase
- Comments for non-obvious logic only (code should be self-documenting)

### HTML/CSS
- Single `index.html` file contains all UI
- Screen IDs follow pattern: `#screenName` (e.g., `#loginPersonalAccount`)
- CSS classes: kebab-case (e.g., `.nav-item`, `.task-list`)
- Use CSS for responsive design (mobile-first approach)

### Key Functions
- `showScreen(screenId)`: Toggle visibility of screens
- `showTab(tabName)`: Switch between app tabs (tasks, notes, projects, alarms, lists)
- `showToastNotification(message)`: Display toast messages

## Important Guidelines

### Critical Rule: Commit After Every Change
**EVERY change to the app must be committed and pushed to GitHub immediately.** The live site updates automatically when changes are pushed.

```bash
git add -A
git commit -m "Description of change"
git push
```

### URL Routing
- Uses 404.html redirect trick (GitHub Pages redirects 404s to index.html)
- Main routes: `/to-do/`, `/to-do/login`, `/to-do/sign-up`, `/to-do/app`
- Router stores path in sessionStorage and handles routing on page load
- Use `navigateTo(path)` to programmatically navigate

### Screen Visibility Management
- All screens hidden initially with CSS `display: none` (without !important)
- `.hidden` class has `display: none !important` to control visibility
- `showScreen()` adds/removes `.hidden` class to toggle screens
- Landing page shown by default on first load

### Data Sync & Encryption
- All sensitive data encrypted with Backside E2E encryption
- API key in `backside.js` (`bsk_live_...`)
- Notes tagged with `'peaceful-list'` for shared lists
- 5-second polling for real-time updates when lists tab is open

### Notifications
- Toast notifications for user feedback
- Browser Notifications API for assignment notifications (with user permission)
- Deduplication via localStorage to prevent duplicate notifications

### Voice Input
- Uses Web Speech API (Chromium-based browsers only)
- Hidden on Firefox/Safari (feature detection)
- Listening indicator shown while recording

## Building & Deployment

### Local Development
```bash
cd /data/data/com.termux/files/home/to-do
# No build step required - serve index.html directly
python -m http.server 8000  # or any local server
```

### Deployment
1. Make changes to files
2. Test in local browser
3. Commit changes: `git add -A && git commit -m "message"`
4. Push to GitHub: `git push`
5. Wait 1-2 minutes for GitHub Pages to update live site

### SEO
- `robots.txt`: Search engine directives
- `sitemap.xml`: Site structure for indexing
- Meta tags in index.html for social sharing

## Key Technologies

- **Backside BaaS**: Cloud data sync and user management
- **Web Speech API**: Voice input for tasks
- **Service Worker**: Offline functionality
- **localStorage/sessionStorage**: Client-side state
- **AES-256-GCM**: Encryption for sensitive data
- **GitHub Pages**: Static hosting with custom routing

## Features

1. **Tasks**: Create, edit, complete tasks with due dates and categories
2. **Notes**: Rich note-taking with markdown support
3. **Projects**: Organize tasks into projects
4. **Alarms**: Set reminders for tasks
5. **Shared Lists**: Markdown checkbox lists synced via Backside
6. **Voice Input**: Add tasks by speaking
7. **Real-Time Sync**: Live updates across devices
8. **Offline Support**: Full functionality without internet

## Common Tasks

### Adding a New Screen
1. Add HTML element to index.html with unique ID
2. Add to screens array in `showScreen()` function in app.js
3. Add show/hide logic in appropriate function

### Adding a Feature
1. Create new JS file if needed (e.g., `newfeature.js`)
2. Add `<script src="newfeature.js"></script>` to index.html before closing body
3. Implement feature following existing patterns
4. Test locally before committing

### Debugging
- Use browser DevTools (F12)
- Check localStorage: `localStorage.getItem('key')`
- Check Backside sync status in network tab
- Service Worker cache in Application tab

## Testing Notes

- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile (Android/iOS)
- Verify offline functionality
- Check voice input on Chromium browsers only
- Verify E2E encryption with multiple users
