# Documentation & Configuration - Claude Guidelines

## Purpose

This directory contains documentation, configuration files, and build scripts for the Peaceful Tasks PWA. These files provide context for build tools and development setup.

## Contents

- `.eslintrc.json`: ESLint configuration for code quality
- `.prettierrc.json`: Prettier configuration for code formatting
- `.gitignore`: Git ignore patterns
- `manifest.json`: PWA manifest (metadata)
- `package.json`: Project metadata and dependencies
- `sw.js`: Service Worker (may be duplicated, see root sw.js)
- `scripts/`: Build and utility scripts

## Key Files

### ESLint Configuration
The `.eslintrc.json` enforces code quality standards:
- Detect unused variables
- Enforce consistent spacing
- Catch common mistakes

### Prettier Configuration
The `.prettierrc.json` ensures consistent code formatting:
- Automatic code formatting
- Consistent quote style
- Line length limits

### Service Worker (sw.js)
Handles offline functionality and caching strategy. Note: There's also an `sw.js` at the root level - ensure they're in sync or consolidate if needed.

## Development Setup

### Prerequisites
- Node.js and npm (for linting/formatting tools)
- Git (for version control)
- Local HTTP server for testing

### Installation
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Format code
npm run prettier
```

### Scripts
See `scripts/` directory for utility scripts.

## Configuration Notes

### ESLint
- Enforces JavaScript code quality
- Run before committing for consistency
- Configure rules in `.eslintrc.json`

### Prettier
- Auto-formats code on save or via CLI
- Maintains consistent style across codebase
- Edit `.prettierrc.json` to change formatting preferences

### Package.json
- Lists all dependencies
- Defines build scripts
- Contains project metadata

## Related Documentation

See `/to-do/claude.md` for overall project guidelines and architecture.
