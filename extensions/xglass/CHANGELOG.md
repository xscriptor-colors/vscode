# Changelog — Xglass

All important modifications to this VSCode theme collection will be documented in this file.

---
## [1.1.2] - 2026-08-24

### Fixed
- Fixed extension activation on all VS Code versions >= 1.60: `StatusBarAlignment` is a top-level API namespace, not a member of `window` — the previous `window.StatusBarAlignment.Right` threw inside `activate()` before commands were registered, so every command failed with "command 'xglass.*' not found".
- Lowered the minimum VS Code version from `^1.85.0` to `^1.60.0`. On older builds the extension was treated as incompatible and never activated.
- Commands are now registered before any platform setup so they can never be left unregistered.
- Windows: commands no longer fail with "Command failed" errors. Replaced the fragile `node-powershell` dependency (persistent `-NoExit` session with unreliable error detection) with a one-shot `powershell.exe` invocation via `child_process`, surfacing the real error message when something goes wrong.
- Windows: `SetTransparency.cs` no longer compares `Process.StartInfo.FileName` (which can throw or silently filter out every window). It now targets VS Code windows directly with `EnumWindows`, matching window owners by process name.

## [1.1.1] - 2026-08-23

### Added
- Status bar item showing the current alpha level, updated after each change (click to increase transparency).

### Changed
- Linux X11: `xprop` is now invoked via `execFile` with separate arguments instead of a shell command string, avoiding shell interpolation.
- Linux X11: window list is parsed directly from `xprop -root` output in JS, removing the dependency on `grep`.
- Removed the unused `node_modules/**` include pattern from package.json that prevented the extension from being packaged with `vsce`.

### Fixed
- Wayland sessions now short-circuit with a clear "not supported" message instead of silently failing after a console warning.

## [1.1.0] - 2026-04-01
### Added
- Input clamping helpers for safer alpha and step handling

### Fixed
- Linux X11 dependency check now validates `xprop` availability correctly
- Linux commands now show a clearer install hint when `xprop` is missing
- Command behavior now normalizes invalid config values before applying opacity
- Documentation now matches actual defaults (`Enable` uses alpha 200)

## [1.0.2]
. Minimum update: documentation

## [1.0.2]
- update linux support

## [1.0.1]
- Fixed package json, activation events was deleted following the standard
- Added activation event onCommand:xglass.enable.
- Updated packages
- Updated compatibility
- Fixed alpha value range
- Improved documentation


## [1.0.0]
- Initial release
