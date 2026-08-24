<h1>Changelog</h1>

<p>
All notable changes to this repository will be documented in this file.

---

## [2026-08-24]

### Fixed
- `xglass` 1.1.2: commands failed with "command 'xglass.*' not found" because activation crashed (`StatusBarAlignment` is a top-level API namespace, not part of `window`). Fixed activation, registered commands before platform setup, dropped the `node-powershell` dependency (now uses one-shot `powershell.exe`), reworked `SetTransparency.cs` to target windows via `EnumWindows`, and lowered the minimum VS Code version to `^1.60.0`.

## [2026-08-23] · Session

### Updated
- Repointed all repository URLs from `github.com/xscriptor` to `github.com/xscriptor-colors`.
- Completed every theme's color key set in `xscriptor-themes` (~905 keys per theme) from the official VS Code reference; added the `accent` field to all palettes.
- Regenerated `colors.md` and `assets` palettes with real values; standardized the "Bogota" naming.
- Reworked the **Miami** palette (corrected neon scheme: real orange/blue, saturated colors).
- Improved `xglass`: `execFile` without shell, no `grep` dependency, Wayland short-circuit, alpha status bar.
- Added `labs/xscriptor-themes/scripts/generate-color-themes.mjs` (complete existing themes or regenerate from palette into gitignored `dist/`).
- Bumped packages: `xscriptor-themes` 1.1.5, `x-dark-colors` 1.2.1, `xglass` 1.1.1 — changelogs updated.

## [2026]

### Updated
- Replaced all broken `xscriptor.github.io/badges/` with standardized shields.io badges.
- Added Windsurf and Positron editor badges for VS Code fork compatibility.
</p>

