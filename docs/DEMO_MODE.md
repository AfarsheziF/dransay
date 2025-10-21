# Demo Mode Configuration

This configuration allows the app to run as a static demo on GitHub Pages without requiring authentication or a database.

## Features in Demo Mode:
- ✅ Task management (localStorage-based)
- ✅ All UI components working
- ✅ Form validation
- ✅ Real-time updates simulation
- ❌ User authentication (bypassed)
- ❌ Database persistence (uses localStorage)

## Environment Variables for Demo:
```bash
DEMO_MODE=true
NODE_ENV=production
```

## GitHub Pages Deployment:
1. Build static version with `npm run build:static`
2. Deploy to `gh-pages` branch
3. Access at: `https://[username].github.io/dransay`