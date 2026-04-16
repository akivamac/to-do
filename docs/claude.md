# Documentation & Configuration - Claude Guidelines

## Purpose

This directory contains build configuration, linting rules, and development tooling for the Peaceful Tasks PWA. It does NOT contain documentation in the traditional sense (like READMEs or user guides), but rather configuration for development tools and build processes.

## Directory Contents

```
docs/
├── .claude/
│   └── settings.json          # Claude Code settings (if configured)
├── .eslintrc.json             # ESLint code quality rules
├── .gitignore                 # Git ignore patterns
├── .prettierrc.json           # Code formatter configuration
├── manifest.json              # PWA manifest copy (metadata)
├── package.json               # NPM dependencies and scripts
├── sw.js                      # Service Worker copy
├── scripts/                   # Build and utility scripts (if any)
└── claude.md                  # This file - docs-specific guidelines
```

## Configuration Files

### `.eslintrc.json`
**Purpose**: JavaScript code quality linting

**What it does**:
- Detects unused variables
- Enforces consistent syntax
- Catches common JavaScript mistakes
- Ensures code follows style standards

**When to use**:
```bash
npx eslint app.js            # Check specific file
npx eslint *.js              # Check all JS files
npm run lint                 # If lint script configured
```

### `.prettierrc.json`
**Purpose**: Automatic code formatting

**What it does**:
- Enforces consistent indentation
- Formats quotes consistently
- Manages line lengths
- Formats whitespace and semicolons

**When to use**:
```bash
npx prettier --write app.js    # Auto-format file
npx prettier --check app.js    # Check if formatted
npm run prettier               # If prettier script configured
```

### `package.json`
**Purpose**: Node.js project configuration

**Contains**:
```json
{
  "name": "peaceful-tasks",
  "version": "...",
  "dependencies": { /* npm packages */ },
  "devDependencies": { /* dev-only packages */ },
  "scripts": {
    "lint": "...",
    "format": "..."
  }
}
```

**How to use**:
```bash
npm install              # Install all dependencies
npm run lint             # Run linting script
npm run format           # Run prettier script
npm test                 # Run tests (if configured)
```

### `.gitignore`
**Purpose**: Tell Git which files to ignore

**Typical entries**:
- `node_modules/` - NPM packages (don't commit)
- `.env` - Environment variables (secrets)
- `dist/` - Build output (generated)
- `.DS_Store` - macOS system files

### `manifest.json` (Copy)
**Note**: This appears to be a copy of the root manifest.json. In practice, the root manifest is used by browsers. This copy may be:
- Outdated
- Legacy from a previous build setup
- Can likely be removed if no build process uses it

### `sw.js` (Copy)
**Note**: This appears to be a copy of the root sw.js. The root version is what's actually used. This copy should probably:
- Be kept in sync with the root if both are in use
- Be deleted if not needed
- Have a documented reason for being duplicated

## Development Workflow

### Local Setup
```bash
# 1. Install dependencies
npm install

# 2. Check code quality
npx eslint app.js tasks.js notes.js projects.js alarms.js

# 3. Format code
npx prettier --write app.js tasks.js index.html styles.css

# 4. Run local server
python -m http.server 8000
# Visit http://localhost:8000

# 5. Test in browser
# - Chrome DevTools (F12)
# - Check Application tab for Service Worker
# - Check Network tab for Backside API calls
# - Open Console for errors

# 6. Commit and push
git add -A
git commit -m "Description of changes"
git push
```

### Code Quality Standards

**ESLint Best Practices**:
- Run linter before committing
- Fix all warnings and errors
- Don't disable rules without documenting why
- Keep linting rules consistent across the team

**Prettier Best Practices**:
- Run formatter after major edits
- Use in IDE if available (auto-format on save)
- Keep formatting configuration stable
- Don't manually format - let Prettier handle it

### Security Standards (BUILD STANDARDS — do not remove or weaken)

- **CSP**: A strict Content Security Policy is enforced via meta tag in `index.html`. Never add `unsafe-inline` or `unsafe-eval` to script-src or style-src. Never load scripts from unlisted external domains.
- **No inline styles**: All styles must be in `styles.css` as named CSS classes. Never add `style="..."` attributes to HTML elements or inside JavaScript template literals. Use existing classes or create new ones in styles.css.
- **No inline scripts**: All JavaScript must be in external `.js` files. Never add `<script>` blocks with inline JavaScript to `index.html`.
- **External scripts**: Any new external script must be pinned to a specific version and include an SRI `integrity` hash. Add the domain to the CSP `script-src` directive.
- **localStorage encryption**: Any sensitive data written to localStorage must be encrypted using `encryptField()` with a plaintext fallback when `sessionCryptoKey` is null.
- **Sanitization**: All marked.js output must be passed through `sanitizeNoteHtml()` before rendering. All user-controlled data inserted into the DOM must use `escapeHtml()`.

## Build Process Notes

The project uses a **lightweight build setup**:
- No build step required (single-file deployment)
- ESLint/Prettier are dev-only (not part of deployment)
- Package.json mainly documents dependencies
- GitHub Pages directly serves files from repo

**If a build process is needed in the future**:
- Would likely involve minification
- Could add webpack or esbuild
- Scripts would be added to package.json
- Configuration would go in this directory

## Related Documentation

See `/to-do/claude.md` for overall project architecture and guidelines.

## Troubleshooting Config Issues

**ESLint not found**:
```bash
npm install --save-dev eslint
npx eslint --init     # Auto-generate config
```

**Prettier conflicts with ESLint**:
```bash
npm install --save-dev eslint-config-prettier
# Add to .eslintrc.json: "extends": ["prettier"]
```

**Package.json scripts not working**:
- Make sure you run `npm install` first
- Use `npm run scriptname` not just `scriptname`
- Check that scripts are defined in "scripts" section
