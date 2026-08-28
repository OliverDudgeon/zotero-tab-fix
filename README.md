# Zotero Tab Fix

A small Zotero 9 add-on that makes Ctrl+Tab toggle between the two most recently
selected tabs, matching Firefox's default behavior. Ctrl+Shift+Tab behaves the
same way; Shift no longer reverses through the tab strip.

## Compatibility

- Zotero 9.0.x (including 9.0.6)
- Node.js 24 or a current LTS release for development

## Development

Install dependencies and create an installable XPI:

```sh
npm install
npm run build
```

The XPI is written under `.scaffold/build/`.

For live development, copy `.env.example` to `.env`, set the Zotero executable
and profile paths, then run:

```sh
npm start
```

## Structure

- `src/modules/tabToggle.ts` — MRU tab tracking and shortcut interception
- `src/hooks.ts` — Zotero lifecycle hooks
- `src/addon.ts` — add-on state
- `addon/bootstrap.js` — Zotero bootstrap entry points
- `addon/manifest.json` — compatibility and add-on metadata template
- `zotero-plugin.config.ts` — build, development, and release configuration

Scaffolded from
[windingwind/zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template).

## License

AGPL-3.0-or-later. See `LICENSE`.
