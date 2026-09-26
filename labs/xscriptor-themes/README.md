# xscriptor-themes labs

Design tooling for the Xscriptor icon themes. Nothing here ships in the extension package.

## Rebuild generated output

Scripts resolve the repository root themselves, so they can run from any directory (from the repo root in the examples):

```bash
# Full tinted icon set (staging) + preview page
node labs/xscriptor-themes/scripts/generate-tinted-icons.mjs

# Variant exploration page (badge / tinted logo / hybrid)
node labs/xscriptor-themes/scripts/preview-icon-redesign.mjs

# Promote the staged tinted set into themes/xscriptor-themes/icons
node labs/xscriptor-themes/scripts/promote-tinted-icons.mjs
```

- `tinted-preview/` is git-ignored: rebuild it with the first command instead of committing it.
- Add `--no-x` to `generate-tinted-icons.mjs` to generate without the brand `x` marker.
- Logo sources live in `preview-icons/logos-src/` and are committed: Simple Icons (CC0) for file-type logos, Bootstrap Icons (MIT) for folder shapes.
