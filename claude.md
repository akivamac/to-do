# Peaceful Tasks PWA - Claude Guidelines

## Project Overview

Peaceful Tasks is a progressive web app (PWA) designed to reduce overwhelm and stress through calm, secure task management. The app helps individuals and families organize tasks, take notes, set alarms, manage projects, and collaborate on shared lists. The interface is intentionally peaceful and non-overwhelming.

**Live Site:** https://akivamac.github.io/to-do/  
**Status:** Beta (features actively being developed)

**Core Philosophy**: Most productivity apps create anxiety. Peaceful Tasks is designed from the ground up to feel calm, gentle, and actually doable. Studies show people check their to-do list 10+ times daily—every one of those moments should feel peaceful.

## Architecture

- **Single-File HTML Architecture**: All UI in `index.html` (~69KB), with 7 external JS modules
- **Data Sync**: Backside BaaS (bsk_live_*) for real-time sync, user auth, and cloud storage
- **End-to-End Encryption**: AES-256-GCM with PBKDF2 key derivation for all sensitive data
- **Offline Support**: Service Worker (`sw.js`) with intelligent caching strategy
- **Client-Side Routing**: 404.html redirect trick for URL routing on GitHub Pages (GitHub limitation workaround)
- **Real-Time Features**: Polling mechanism (5-second intervals) for live list updates
- **PWA Capabilities**: Installable app, offline functionality, browser notifications

## File Structure

```
├── index.html              # Main UI file (~69KB)
│                           # - Landing page with hero, features, reviews
│                           # - Login/account screens (personal & group)
│                           # - Main app tabs and navigation
│                           # - Inline router script at bottom (lines 947+)
│
├── app.js                  # Core application logic (~102KB)
│                           # - Screen management (showScreen())
│                           # - Tab switching (showTab())
│                           # - User authentication and account management
│                           # - List management (renderLists, openListDetail)
│                           # - Voice input (initVoiceInput, startVoiceInput)
│                           # - Notifications (showToastNotification)
│                           # - Admin dashboard functions
│                           # - Settings and user data persistence
│
├── tasks.js                # Task management (~37KB)
│                           # - Task creation/editing/deletion
│                           # - Task completion tracking
│                           # - Task rescheduling and filtering
│                           # - Daily/weekly view rendering
│
├── notes.js                # Notes functionality (~10KB)
│                           # - Note creation/editing
│                           # - Rich text support
│                           # - Note organization
│
├── projects.js             # Project management (~8KB)
│                           # - Project creation/editing
│                           # - Task-to-project association
│
├── alarms.js               # Alarm/reminder system (~17KB)
│                           # - Alarm scheduling
│                           # - Notifications and alerts
│
├── backside.js             # Backside BaaS integration (~27KB)
│                           # - API configuration (bsk_live_*)
│                           # - E2E encryption/decryption
│                           # - Data sync with cloud
│                           # - User management
│
├── styles.css              # All styling (~27KB)
│                           # - Responsive design
│                           # - PWA install banner
│                           # - Modal and form styles
│                           # - Tab and screen layouts
│
├── sw.js                   # Service Worker
│                           # - Offline caching
│                           # - Cache management
│
├── 404.html                # GitHub Pages routing bridge
│                           # - Stores path in sessionStorage
│                           # - Redirects to index.html
│
├── manifest.json           # PWA manifest
│                           # - App metadata
│                           # - Icons and display settings
│
├── robots.txt              # SEO robots directive
├── sitemap.xml             # SEO sitemap for indexing
├── icon-192.png            # PWA icon 192x192
├── icon-512.png            # PWA icon 512x512
│
├── docs/                   # Documentation and build config
│   ├── claude.md           # Docs-specific guidelines
│   ├── package.json        # NPM dependencies
│   ├── .eslintrc.json      # Linting rules
│   └── .prettierrc.json    # Code formatting rules
│
└── .git/                   # Git repository
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

### URL Routing (Client-Side via 404.html)
**Problem**: GitHub Pages doesn't support client-side routing directly  
**Solution**: 404.html redirect trick

**Flow**:
1. User navigates to `/to-do/login` or similar non-existent path
2. GitHub Pages 404s and serves `404.html`
3. `404.html` stores path in `sessionStorage.routerPath`
4. `404.html` redirects to `index.html`
5. Inline router script (index.html lines 947+) reads stored path
6. Router calls appropriate function via `handleRouting(path)`
7. `history.pushState()` updates browser URL without full reload

**Routes**:
- `/to-do/` - Landing page (default)
- `/to-do/login` - Login screen (→ showSignIn())
- `/to-do/sign-up` - Signup screen (→ showCreateAccount())
- `/to-do/app` - Main app after login

**Key Functions** (index.html router):
- `initRouter()` - Initialize on DOMContentLoaded
- `handleRouting(path)` - Process route and call screen functions
- `navigateTo(path)` - Programmatically navigate with pushState

### Screen Visibility Management
- All screens initially set to `display: none` via CSS at index.html lines 940-944 (WITHOUT !important)
- `.hidden` class has `display: none !important` for runtime control
- `showScreen(screenId)` function (app.js:217):
  - Adds `.hidden` class to all screens
  - Removes `.hidden` class from target screen
  - Sets `currentScreen` global variable
- Landing page shown by default on initial load
- **Important Fix**: Removed !important from initial CSS to allow .hidden class to override

### Screen List
- `#landingPage` - Welcome/getting started page (shown by default)
- `#passcodeGate` - Optional passcode entry
- `#accountTypeSelection` - Choose personal or group account
- `#createPersonalAccount` - Sign up for personal account
- `#loginPersonalAccount` - Log into personal account
- `#groupSetup` - Group account selection
- `#createGroupAdmin` - Create new group (admin setup)
- `#groupJoin` - Join existing group
- `#showGroupCredentials` - Display group credentials
- `#welcomeScreen` - Welcome after login (guides through setup)
- `#mainApp` - Main application interface
- `#adminPanel` - Admin dashboard for group management

### Data Sync & Encryption (backside.js)
- **API Configuration**: Backside API key in backside.js (bsk_live_VDbFLbqDghOMmDSdg79HGh4wzFA2NFozB3Q0LjDiKoc)
- **E2E Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Data Structure**:
  - Tasks stored as encrypted notes in Backside
  - Lists stored as markdown checkboxes tagged with 'peaceful-list'
  - Notes synced in real-time
  - All data encrypted before transmission
- **Sync Mechanism**:
  - `syncData()` function manages cloud sync (app.js)
  - Polling (5-second intervals) for real-time updates
  - Currently active when lists tab is open
- **Storage**: localStorage for client-side cache, sessionStorage for session state

### Notifications System
- **Toast Notifications**: `showToastNotification(message)` for in-app feedback
- **Browser Notifications**: Uses Browser Notifications API for out-of-app alerts
  - Requires user permission (`requestBrowserNotificationPermission()`)
  - Shows when tasks assigned by others
  - Only shows in foreground (doesn't interrupt with background notifications)
- **Deduplication**: Tracked via localStorage to prevent duplicate alerts
- **24-Hour Window**: Only notifies about assignments from last 24 hours

### Voice Input (Web Speech API)
- **Implementation**: Uses native Web Speech API (SpeechRecognition)
- **Browser Support**: Chromium-based only (Chrome, Edge, Brave, Opera)
  - Hidden on Firefox/Safari via feature detection
  - Graceful fallback for unsupported browsers
- **UI**: 🎤 Microphone button in task input area (hidden on non-Chromium)
- **Behavior**: Listens for speech, converts to text, adds as new task
- **Indicator**: Visual feedback while listening/processing
- **Functions**:
  - `initVoiceInput()` - Initialize on page load
  - `startVoiceInput()` - Triggered by microphone button click

### Shared Lists Implementation
- **Storage**: Backside Notes API with 'peaceful-list' tag
- **Format**: Markdown checkboxes `- [x] completed` or `- [ ] pending`
- **Sync**: 5-second polling when lists tab active
- **E2E**: Full encryption via Backside
- **Functions** (app.js):
  - `renderLists()` - Display all lists
  - `openListDetail(listId)` - Show list editing interface
  - `renderListItems(list)` - Render individual items
  - `parseListItems(body)` - Parse markdown format
  - `itemsToMarkdown(items)` - Convert to markdown
  - `closeListDetail()` - Close editing interface
- **Create/Edit**: Simple UI for adding/removing items with checkboxes

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

## Key Technologies & APIs

### Backend/Cloud
- **Backside BaaS**: Cloud data sync, user management, E2E encryption
  - API Endpoint: backside.js (line 1)
  - API Key: `bsk_live_VDbFLbqDghOMmDSdg79HGh4wzFA2NFozB3Q0LjDiKoc`
  - Features: Notes storage, user auth, encryption/decryption
  - Data Sync: Real-time with 5-second polling

### Cryptography
- **AES-256-GCM**: Symmetric encryption for data
- **PBKDF2**: Key derivation from passwords
- **Implementation**: In backside.js encryption functions

### Browser APIs
- **Web Speech API**: Voice input (SpeechRecognition)
- **Service Worker API**: Offline caching and sync
- **Notifications API**: Browser notifications with permission
- **localStorage/sessionStorage**: Client-side persistent/session storage
- **history API**: Client-side routing (pushState)
- **Fetch API**: HTTP requests to Backside

### Hosting & Deployment
- **GitHub Pages**: Static site hosting at akivamac.github.io/to-do/
- **Custom 404.html**: Routing workaround for single-page apps
- **Git**: Version control and deployment (push to GitHub auto-deploys)

### Build Tools (in docs/)
- **npm**: Package management and scripts
- **ESLint**: Code quality checking
- **Prettier**: Code formatting
- **.gitignore**: Version control exclusions

### Standards
- **HTML5**: Semantic markup, PWA features
- **CSS3**: Responsive design, gradients, flexbox/grid
- **ES6+**: Modern JavaScript (const/let, arrow functions, async/await)

## Features

### Core Features
1. **Tasks** (Today/Days/Week view)
   - Create, edit, complete tasks
   - Due dates and priorities
   - Task rescheduling and past task recovery
   - Daily and weekly views

2. **Notes**
   - Rich note-taking
   - Organization and search
   - Real-time sync

3. **Projects**
   - Organize tasks by project
   - Project-level categorization

4. **Alarms**
   - Scheduled reminders
   - Notification alerts

5. **Points System**
   - Earn "hugs" for completing tasks
   - Gamification of productivity
   - Visual celebration of progress

### Advanced Features
6. **Shared Lists** (Recently Added)
   - Family-friendly shared checklists
   - Markdown checkbox format (e.g., `- [x] item`)
   - Synced via Backside Notes with 'peaceful-list' tag
   - 5-second polling for real-time updates
   - Simple UI for collaborative list management

7. **Voice Input** (Recently Added)
   - Web Speech API for speech-to-text
   - Chromium browsers only (Chrome, Edge, Brave, Opera)
   - 🎤 Microphone button in task input
   - Listening indicator while recording

8. **Real-Time Sync Notifications** (Recently Added)
   - Browser notifications when tasks assigned by others
   - 24-hour notification window
   - Toast notifications in-app
   - Deduplication to prevent duplicates

### Infrastructure Features
9. **Real-Time Sync**: Live data updates across devices (via Backside)
10. **Offline Support**: Full functionality without internet (Service Worker)
11. **End-to-End Encryption**: All data encrypted before leaving device
12. **PWA Installability**: Install as native app on devices
13. **Multi-Account Support**: 
    - Personal accounts with passwords
    - Group accounts for families
    - Admin account for group management
    - Sub-accounts within groups
14. **Admin Dashboard**: Manage group members, view metrics, control access

## Common Tasks & Workflows

### Adding a New Screen
1. Add HTML element to index.html with unique `id="newScreenName"`
2. Add to `screens` array in `showScreen()` function (app.js:219-224)
3. Create show function: `function showNewScreen() { showScreen('newScreenName'); }`
4. Add navigation button/link that calls the show function
5. Add any screen-specific logic to functions called by showScreen()
6. Test that screen appears/hides correctly when called

### Adding a Feature
1. **Assess scope**: Small feature → add to app.js; Large → create new module JS file
2. **Create module** (if needed):
   - Create `newfeature.js` with all functions
   - Add `<script src="newfeature.js"></script>` before `backside.js` (line 936)
3. **Implement functions**: Follow existing patterns (camelCase names, error handling)
4. **Add UI** (if needed): Add HTML to index.html in appropriate screen
5. **Hook up interactions**: Add onclick/addEventListener handlers
6. **Integrate with sync**: If data needs cloud sync, use Backside via backside.js
7. **Test locally**: Run local server, test on multiple browsers
8. **Commit & push**: ALWAYS commit after ANY change

### Fixing UI Issues
1. **Screen not showing**: Check `.hidden` class, ensure showScreen() called correctly
2. **Styling issues**: Check styles.css for conflicting rules, browser DevTools
3. **Responsiveness**: Test on mobile viewport, check CSS media queries
4. **Flicker**: Ensure screens hidden initially with CSS `display: none`

### Debugging Workflow
```javascript
// Check local storage
localStorage.getItem('currentUser')
localStorage.getItem('lists')

// Check session state
sessionStorage.getItem('routerPath')

// Monitor Backside sync
// Open Network tab in DevTools, look for /notes requests

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
- [ ] localStorage/sessionStorage correct
- [ ] Backside sync working (Network tab shows requests)
- [ ] Voice input hidden on Firefox/Safari (if implemented)

**For new screens:**
- [ ] Screen shows with correct content
- [ ] Screen hides when switching tabs/screens
- [ ] Back buttons work correctly
- [ ] Navigation updates URL via router

**For sync features:**
- [ ] Data persists after refresh
- [ ] Real-time updates work (5-second polling)
- [ ] E2E encryption intact (data unreadable in DevTools)
- [ ] Works offline (test with DevTools throttling)

**For notifications:**
- [ ] Toast messages appear in correct location
- [ ] Browser notifications request permission once
- [ ] No duplicate notifications (check localStorage)
- [ ] Foreground-only (no background alerts)

## Important Debugging Notes

### Known Issues & Fixes
- **Sign In/Sign Up blank page** (FIXED): Removed !important from initial CSS to allow .hidden class override
- **Landing page won't scroll** (FIXED): Changed body overflow to `auto` and container to normal flow
- **Coming Soon notice flickers** (FIXED): Added `display: none !important` CSS to hide during init

### Tools & Resources
- **Browser DevTools**: F12 or Ctrl+Shift+I
- **Mobile Testing**: Chrome DevTools Device Emulation (Ctrl+Shift+M)
- **Network Inspection**: DevTools Network tab for API calls
- **Storage Inspection**: DevTools Application tab for localStorage/sessionStorage
- **Backside Console**: Check backside.js for API key and error logging
