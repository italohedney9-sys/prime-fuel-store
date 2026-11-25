# Prime Fuel — Wix Headless workspace

This folder contains an isolated Vite app for the future Wix Stores integration.

## Important

- The current published storefront at the repository root remains unchanged.
- Never place a Wix Client Secret, API key, or private token in frontend files.
- The Wix Client ID is public and can be supplied as `VITE_WIX_CLIENT_ID`.
- The Wix SDK, product catalog, variants, cart, and checkout will be integrated after validating the Wix Headless app configuration.

## Local development

```bash
cd headless
npm install
cp .env.example .env
