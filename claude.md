# Peaceful Tasks PWA - Claude Guidelines

## Project Overview

Peaceful Tasks is a progressive web app (PWA) designed to reduce overwhelm and stress through calm, secure task management. The app helps individuals and families organize tasks, take notes, set alarms, manage projects, and collaborate on shared lists. The interface is intentionally peaceful and non-overwhelming.

**Live Site:** https://akivamac.github.io/to-do/  
**Status:** Beta (features actively being developed)

**Core Philosophy**: Most productivity apps create anxiety. Peaceful Tasks is designed from the ground up to feel calm, gentle, and actually doable. Studies show people check their to-do list 10+ times daily—every one of those moments should feel peaceful.

## Architecture

- **Single-File HTML Architecture**: All UI in `index.html`, with 7 external JS modules
- **Data Sync**: Backside BaaS for real-time sync, user auth, and cloud storage
- **End-to-End Encryption**: AES-256-GCM with PBKDF2 key derivation for all sensitive data
- **Offline Support**: Service Worker (`sw.js`) with cache-first caching strategy
- **Client-Side Routing**: 404.html redirect trick for URL routing on GitHub Pages
- **Real-Time Lists**: 5-second polling when the Lists tab is open
- **PWA Capabilities**: Installable app, offline functionality, browser notifications

## File Structure

```
├── index.html              # Main UI file
│                           # - Landing page with hero, features, reviews
│                           # - Login/account screens (personal & group)
│                           # - Main app tabs and navigation
│                           # - Inline router script at bottom
│
├── app.js                  # Core application logic (~2433 lines)
│                           # - Screen management (showScreen())
│                           # - Tab switching (showTab())
│                           # - User authentication and account management
│                           # - List management (renderLists, openListDetail)
│                           # - Voice input (initVoiceInput, startVoiceInput)
│                           # - Toast/alert notifications
│                           # - Admin dashboard functions
│                           # - Settings and user data persistence
│                           # - Backside data loading (loadAndShowApp, loadBacksideData)
│                           # - Paywall / trial system
│                           # - Invite-by-link system
│                           # - Reviews and feature requests
│                           # - Global error logging to Backside
│
├── tasks.js                # Task management
│                           # - Task creation/editing/deletion
│                           # - Task completion tracking
│                           # - Task rescheduling and filtering
│                           # - Daily/weekly (Days) view rendering
│                           # - Drag-and-drop reordering
│                           # - Peaceful name suggestions (STRESS_REWRITES)
│
├── notes.js                # Notes functionality
│                           # - Note creation/editing
│                           # - Rich text via contenteditable + execCommand
│                           # - HTML sanitizer (sanitizeNoteHtml)
│                           # - Note download as .md
│
├── projects.js             # Project management
│                           # - Project creation/editing
│                           # - Task-to-project association
│                           # - Project task view
│
├── alarms.js               # Alarm/reminder system
│                           # - Alarm scheduling and toggling
│                           # - Audio notifications via Web Audio API
│                           # - Countdown timer
│
├── backside.js             # Backside BaaS integration (~648 lines)
│                           # - API configuration (BACKSIDE_API_KEY)
│                           # - E2E encryption/decryption (AES-256-GCM)
│                           # - PBKDF2 key derivation + sessionStorage persistence
│                           # - Data sync: bsSyncTask, bsSyncNote, bsSyncProject
│                           # - Trial check and paywall marking
│                           # - Invite token generation/validation
│                           # - Migration: localStorage → Backside
│                           # - Loading spinner + API error banner helpers
│                           # - Paywall modal + payment stub
│
├── styles.css              # All styling
│                           # - Responsive design, mobile-first
│                           # - PWA install banner
│                           # - Modal and form styles
│                           # - Tab and screen layouts
│
├── sw.js                   # Service Worker
│                           # - Cache name: peaceful-tasks-v2
│                           # - Cache-first strategy for all listed assets
│                           # - Bump CACHE_NAME to force update delivery
│
├── 404.html                # GitHub Pages routing bridge
│                           # - Stores path in sessionStorage.routerPath
│                           # - Redirects to index.html
│
├── manifest.json           # PWA manifest
├── robots.txt              # SEO robots directive
├── sitemap.xml             # SEO sitemap for indexing
├── icon-192.png / icon-512.png  # PWA icons
│
└── docs/                   # Linting/formatting config
    ├── .eslintrc.json
    └── .prettierrc.json
```

## Coding Standards

### JavaScript Conventions
- Use `const` by default, `let` for reassignment, avoid `var`
- Function names in camelCase: `showScreen()`, `addTask()`
- Variable names: descriptive, camelCase
- Comments for non-obvious logic only (code should be self-documenting)
- All modules are plain `<script>` files sharing global scope — no ES modules, no imports

### HTML/CSS
- Single `index.html` file contains all UI
- Screen IDs follow pattern: `#screenName` (e.g., `#loginPersonalAccount`)
- CSS classes: kebab-case (e.g., `.nav-item`, `.task-list`)
- **Inline styles are acceptable** and widely used for dynamic/one-off styling. Don't refactor to classes unless a pattern repeats many times.
- Mobile-first approach via CSS media queries

### XSS Safety — CRITICAL
- **Always use `escapeHtml(str)`** when inserting user-controlled strings into `innerHTML`
- `showCustomAlert(message)` and `showCustomConfirm(title, message, …)` accept raw HTML — do NOT pass unsanitized user data to them
- Note content is sanitized via `sanitizeNoteHtml()` in notes.js (allowlist of safe tags, strips all attributes)
- Review content and feature requests are stored unencrypted; do not display them as innerHTML without sanitizing

### Data Save Pattern
Every user-data mutation follows this pattern:
```javascript
saveUserData();   // write to localStorage (no-op when Backside is configured)
syncData();       // alias for saveUserData() — kept for semantic clarity

// Then, separately, fire the Backside sync (fire-and-forget):
if (bsIsConfigured()) {
    bsSyncTask(task, date).catch(e => showApiError('Sync error: ' + e.message));
}
```
`syncData()` does NOT do real-time cloud sync. It just calls `saveUserData()`.  
Real cloud sync is done through the individual `bsSyncTask / bsSyncNote / bsSyncProject` calls.

## Important Guidelines

### Critical Rule: Commit After Every Change
**EVERY change to the app must be committed and pushed to GitHub immediately.** The live site updates automatically when changes are pushed.

```bash
git add -A
git commit -m "Description of change"
git push
```

### URL Routing (Client-Side via 404.html)
**Problem**: GitHub Pages doesn't support client-side routing directly  
**Solution**: 404.html redirect trick

**Flow**:
1. User navigates to `/to-do/login` or similar non-existent path
2. GitHub Pages 404s and serves `404.html`
3. `404.html` stores path in `sessionStorage.routerPath`
4. `404.html` redirects to `index.html`
5. Inline router script reads stored path and calls `handleRouting(path)`
6. `history.pushState()` updates browser URL without full reload

**Routes**:
- `/to-do/` - Landing page (default)
- `/to-do/login` - Login screen
- `/to-do/sign-up` - Signup screen
- `/to-do/app` - Main app after login

**Key Functions** (index.html router):
- `initRouter()` - Initialize on DOMContentLoaded
- `handleRouting(path)` - Process route and call screen functions
- `navigateTo(path)` - Programmatically navigate with pushState

### Screen Visibility Management
- All screens initially set to `display: none` via CSS (WITHOUT `!important`)
- `.hidden` class has `display: none !important` for runtime control
- `showScreen(screenId)` (app.js):
  - Adds `.hidden` to all screens in the managed list
  - Removes `.hidden` from target screen
  - Sets `currentScreen` global variable
- **`adminPanel` is NOT in the `showScreen()` screens array** — it has its own show/hide logic via `openAdminPanel()` / `exitAdminPanel()` which toggle `.hidden` on `#mainApp` and `#adminPanel` directly

### Screen List
- `#landingPage` - Welcome/getting started page (shown by default)
- `#passcodeGate` - Optional passcode entry (legacy flow)
- `#accountTypeSelection` - Choose personal or group account
- `#createPersonalAccount` - Sign up for personal account
- `#loginPersonalAccount` - Log into personal account
- `#groupSetup` - Group account selection
- `#createGroupAdmin` - Create new group (admin setup)
- `#groupJoin` - Join existing group
- `#showGroupCredentials` - Display group credentials
- `#welcomeScreen` - Welcome after login (guides through setup)
- `#mainApp` - Main application interface
- `#adminPanel` - Developer admin panel for feature requests (separate from showScreen)

### Data Sync & Encryption (backside.js)
- **API Key**: Hardcoded as `BACKSIDE_API_KEY` in backside.js line 12 (publicly visible in repo)
- **E2E Encryption**: AES-256-GCM with PBKDF2 key derivation (200,000 iterations, SHA-256)
- **Session Key**: Derived at login, stored in `sessionCryptoKey` (in-memory) + `sessionStorage._pt_ck` (for same-tab refreshes only, never localStorage)
- **Data Structure**:
  - Tasks → Backside `/tasks` endpoint, encrypted title/description
  - Notes → Backside `/notes` endpoint, encrypted title/body
  - Projects → Backside `/projects` endpoint, NOT encrypted (just names)
  - Shared Lists → Backside `/notes` with tag `peaceful-list`, markdown checkbox format
  - Reviews → Backside `/notes` with tag `peaceful-review`, NOT encrypted
  - Feature Requests → Backside `/notes` with tag `peaceful-feature-request`, NOT encrypted
  - Error logs → Backside `/notes` with tag `peaceful-error`, NOT encrypted
- **Filtering**: All data is filtered by `contact_id` in metadata — users only see their own data
- **localStorage fallback**: When Backside is not configured, data lives in `localStorage.todoAccounts`

### Password Storage Warning
- **Backside mode**: Passwords are SHA-256 hashed and stored in Contact metadata. Encryption key is PBKDF2-derived from the password — **password changes are disabled** because re-keying all data is not implemented.
- **localStorage fallback mode**: Passwords stored in **plaintext** in `localStorage.todoAccounts`. This is a known limitation of the legacy local-only mode.
- **Sub-account passwords**: Stored in plaintext in the parent group's `subAccounts` array in localStorage.

### Two Admin Systems (Don't Confuse Them)
1. **Group Admin (Settings tab)**: For group account owners to manage sub-accounts/members. Gated by being the group admin flag. Uses localStorage. Accessible via Settings → Group Admin Section.
2. **Developer Admin Panel** (`#adminPanel`): Shows feature requests and error reports from Backside. Accessed by right-clicking the app logo (desktop) or long-pressing it (mobile). Password is SHA-256 hashed and stored in the contact's Backside metadata.
3. **System Admin Dashboard** (inside Settings → Group Admin Section): Shows all localStorage accounts. Gated by `adminPassword` in localStorage (default `removed_ADMIN_PASSWORD`, hardcoded fallback in source and visible in HTML placeholder). This is the least secure of the three — it reveals all local account data.

### Notifications System
- **Toast Notifications**: `showToastNotification(message)` reuses the `#pointsToast` element for all toasts
- **API Error Banner**: `showApiError(msg)` prepends a dismissible red banner to `#mainApp`
- **Browser Notifications**: Uses Browser Notifications API
  - Requires user permission (`requestBrowserNotificationPermission()`)
  - Only shows when `document.hasFocus()` is true
  - Deduplication via `localStorage.notifiedTaskIds`
  - 24-hour window for assignment notifications

### Voice Input (Web Speech API)
- **Implementation**: Native Web Speech API (SpeechRecognition)
- **Browser Support**: Chromium-based only — hidden on Firefox/Safari via feature detection
- **UI**: 🎤 mic button in task input area; `#voiceListeningIndicator` shows while recording
- **Functions**:
  - `initVoiceInput()` - Initialize on DOMContentLoaded
  - `startVoiceInput()` - Triggered by mic button click

### Peaceful Name Suggestions (tasks.js)
- `STRESS_REWRITES` is a local lookup table (~100 entries) mapping stressful words to calmer alternatives
- `getPeacefulSuggestion(text)` scans task text for matches
- `showPeacefulSuggestion(inputId, suggestionId)` renders the "Use this" / dismiss UI
- Zero external API calls — all local

### Shared Lists Implementation
- **Storage**: Backside Notes API with `peaceful-list` tag
- **Format**: Markdown checkboxes `- [x] completed` / `- [ ] pending`
- **Polling**: 5-second interval (`listsPollingInterval`) while list detail view is open
- **Concurrency guard**: `listOperationInProgress` flag prevents overlapping writes
- **Functions** (app.js):
  - `loadLists()` - Fetch + render all lists
  - `openListDetail(listId)` - Show list editing interface + start polling
  - `closeListDetail()` - Stop polling, close view
  - `renderListItems(list)` - Render individual items
  - `parseListItems(body)` - Parse markdown format
  - `itemsToMarkdown(items)` - Convert back to markdown
  - `addListItem()` / `toggleListItem()` / `clearListChecked()` - CRUD

### Trial and Paywall System
- **Trial**: 5 days from `trial_start` in contact metadata
- **Check**: `isTrialExpired(contact)` — called after login and after loading app
- **Paywall**: `showPaywallModal()` blocks the app; `showPaymentModal()` is a stub (no Stripe yet)
- **Bypass**: `continueForFree(contactId)` calls `bsMarkPaid()` to set `plan: 'paid'`
- Payment integration is stubbed with a TODO comment in backside.js

### Invite by Link System
- `bsGenerateInviteToken()` — generates 32-char hex token, stores in contact metadata
- `handleInviteToken()` — called first in `loadInitialState()`, reads `?invite=TOKEN` from URL
- On valid token: shows signup screen, stores token+inviterId in sessionStorage
- On signup: `clearPendingInvite()` clears the token from the inviter's contact

### Hugs / Points System
- `completedTasksCount` tracks total completions (global in app.js)
- Every 5 completions triggers `checkPointReward()` which adds a "point group" entry
- `renderPoints()` displays earned points in the Hugs tab
- Points are gamification only — no external effect

### Task Rollover
- `rolloverTasks()` runs on every `renderTodayTasks()` call
- Moves incomplete tasks from past dates to today with a `rolledFrom` marker
- Runs at most once per day per user (gated by `lastRolloverDate_${currentUser}` in localStorage)

## Building & Deployment

### Local Development
```bash
cd /data/data/com.termux/files/home/to-do
python -m http.server 8000
```

### Deployment
1. Make changes to files
2. Test in local browser
3. `git add -A && git commit -m "message"`
4. `git push`
5. Wait 1-2 minutes for GitHub Pages to update live site

### Service Worker Cache Updates
When deploying significant updates, bump the cache version in `sw.js`:
```javascript
const CACHE_NAME = 'peaceful-tasks-v3'; // increment version
```
Otherwise users on the old SW will get stale cached files. The old SW deletes old caches on `activate`.

## Key Technologies & APIs

### Backend/Cloud
- **Backside BaaS**: backside.app — contacts, tasks, notes, projects
  - API key: `BACKSIDE_API_KEY` in backside.js (publicly visible — treat as semi-public)
  - All user content is AES-256-GCM encrypted before sending

### Cryptography
- **AES-256-GCM**: Symmetric encryption for task/note content
- **PBKDF2**: Key derivation from password (200,000 iterations)
- **SHA-256**: Password hashing for login verification
- **Note**: Password changes are DISABLED — changing the password produces a new AES key, making all existing data permanently unreadable

### Browser APIs
- **Web Speech API**: Voice input (Chromium only)
- **Web Audio API**: Alarm sounds (requires user interaction to unlock on mobile)
- **Service Worker API**: Offline caching
- **Notifications API**: Browser notifications
- **localStorage / sessionStorage**: Persistent and session storage
- **history API**: Client-side routing (pushState)
- **SubtleCrypto**: PBKDF2 + AES-GCM via `crypto.subtle`
- **Fetch API**: HTTP requests to Backside

### Hosting & Deployment
- **GitHub Pages**: Static site at akivamac.github.io/to-do/
- **Git push = deploy**: No build step required

## Features

### Core Features
1. **Tasks** (Today / Days / Projects views)
   - Create, edit, complete, delete tasks
   - Due times, assignments, project tags
   - Progress bar (% completed today)
   - Drag-and-drop reorder via ☰ handle
   - Double-click to edit
   - Task rollover: unfinished tasks move to today automatically

2. **Notes**
   - Rich text via contenteditable + execCommand (deprecated but no clean alternative)
   - HTML sanitized on load via allowlist sanitizer
   - Auto-save with 1.5s debounce to Backside
   - Download as `.md`

3. **Projects**
   - Organize tasks by project
   - Per-project completion progress bar

4. **Alarms**
   - Scheduled reminders with daily recurrence
   - Web Audio API sound (unlocked on first interaction)
   - Countdown timer

5. **Points / Hugs**
   - Earn 100 "points" per 5 tasks completed
   - Visual celebration toasts
   - Displayed in Hugs tab

### Advanced Features
6. **Shared Lists**
   - Collaborative markdown checklists synced via Backside
   - Real-time: 5-second polling while list is open

7. **Voice Input**
   - Web Speech API (Chromium only)
   - Transcription populates task input field
   - Triggers peaceful suggestion check

8. **Real-Time Sync Notifications**
   - Browser notifications when tasks assigned by others
   - 24-hour window, deduplication, foreground-only

9. **Peaceful Name Suggestions**
   - Local STRESS_REWRITES table → calmer phrasing
   - "Use this" / dismiss UI on task input and edit modal

### Infrastructure Features
10. **Real-Time Sync**: Backside cloud sync per-item (task/note/project)
11. **Offline Support**: Service Worker cache-first, falls back to network
12. **End-to-End Encryption**: AES-256-GCM on all task/note content
13. **PWA Installability**: Install as native app
14. **Multi-Account Support**:
    - Personal Backside accounts
    - Group accounts with sub-accounts (localStorage only)
    - Admin account flag for group management
15. **Trial System**: 5-day free trial, paywall modal, payment stub (Stripe TODO)
16. **Invite by Link**: One-time token system via Backside contact metadata
17. **Reviews & Feature Requests**: Submitted to Backside, shown on landing page and admin panel
18. **Error Logging**: Global `window.error` handler logs to Backside with `peaceful-error` tag

## Common Tasks & Workflows

### Adding a New Screen
1. Add HTML element to index.html with unique `id="newScreenName"`
2. Add to `screens` array in `showScreen()` function (app.js)
3. Create show function: `function showNewScreen() { showScreen('newScreenName'); }`
4. Add navigation button/link that calls the show function
5. Test that screen appears/hides correctly
6. Commit and push immediately

### Adding a Feature
1. **Assess scope**: Small → add to app.js; Large → create new module JS file
2. **Create module** (if needed):
   - Create `newfeature.js` with all functions
   - Add `<script src="newfeature.js"></script>` in index.html before `backside.js`
3. **Implement functions**: Follow existing patterns (camelCase, escapeHtml on user content)
4. **Save pattern**: Call `saveUserData()` + `syncData()` + `bsSyncXxx()` if Backside
5. **Test locally**: Run local server, test on multiple browsers
6. **Commit & push immediately**

### Fixing UI Issues
1. **Screen not showing**: Check `.hidden` class, ensure `showScreen()` called correctly
2. **Styling issues**: Check styles.css for conflicting rules
3. **Responsiveness**: Test on mobile viewport, check CSS media queries
4. **Flicker**: Ensure screens hidden initially with CSS `display: none`

### Debugging Workflow
```javascript
// Check local storage
localStorage.getItem('currentUser')
localStorage.getItem('todoAccounts')

// Check session state
sessionStorage.getItem('routerPath')
sessionStorage.getItem('_pt_ck')  // encrypted session crypto key

// Monitor Backside sync
// Open Network tab in DevTools, look for api.backside.app requests

// Check trial status
isTrialExpired(currentBsContact)

// Test voice input compatibility
'webkitSpeechRecognition' in window

// View Service Worker caches
// Application → Cache Storage in DevTools

// Check encrypted data
// Requires viewing decrypted localStorage after login
```

### Testing Checklist

**Before committing:**
- [ ] Feature works on Chrome/Chromium (primary)
- [ ] No console errors (F12 → Console)
- [ ] Responsive on mobile viewport
- [ ] Backside sync working (Network tab shows requests to api.backside.app)
- [ ] escapeHtml() used on any user content inserted into innerHTML

**For new screens:**
- [ ] Screen shows with correct content
- [ ] Screen hides when switching to other screens
- [ ] Back buttons work correctly
- [ ] Navigation updates URL via router

**For sync features:**
- [ ] Data persists after refresh
- [ ] E2E encryption intact (data unreadable in Network tab)
- [ ] Works offline (test with DevTools throttling)

**For notifications:**
- [ ] Toast messages appear correctly
- [ ] No duplicate notifications (check `notifiedTaskIds` in localStorage)

## Important Debugging Notes

### Known Issues & Fixes
- **Sign In/Sign Up blank page** (FIXED): Removed `!important` from initial CSS to allow `.hidden` class override
- **Landing page won't scroll** (FIXED): Changed body overflow to `auto` and container to normal flow
- **Coming Soon notice flickers** (FIXED): Added `display: none !important` CSS to hide during init
- **Password changes disabled** (BY DESIGN): Changing password would re-derive a different AES key, making all encrypted data unreadable. User is warned if they try.
- **Admin password `removed_ADMIN_PASSWORD` is hardcoded**: Visible in app.js constant, the HTML placeholder text, and localStorage fallback. Do not rely on this for real security.

### Security Posture (Be Aware)
- **Backside API key is public**: It's hardcoded in `backside.js` which is in a public GitHub repo. The Backside project's data access controls are the primary protection.
- **localStorage passwords are plaintext**: The non-Backside local fallback stores passwords unencrypted. This is a known limitation of the legacy mode.
- **Admin dashboard password**: The "System Admin Dashboard" in Settings has a hardcoded default (`removed_ADMIN_PASSWORD`) shown as placeholder text in the UI. It only gates a view of localStorage data on the same device — not a real security boundary.

### Tools & Resources
- **Browser DevTools**: F12 or Ctrl+Shift+I
- **Mobile Testing**: Chrome DevTools Device Emulation (Ctrl+Shift+M)
- **Network Inspection**: DevTools Network tab for API calls
- **Storage Inspection**: DevTools Application tab for localStorage/sessionStorage
- **Backside Dashboard**: backside.app — view raw data and contacts
