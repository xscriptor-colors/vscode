# Changelog — Xglass

All important modifications to this VSCode theme collection will be documented in this file.

---
## [1.1.1] - 2026-08-23

### Fixed
- Removed the unused `node_modules/**` include pattern from package.json that prevented the extension from being packaged with `vsce`.

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
