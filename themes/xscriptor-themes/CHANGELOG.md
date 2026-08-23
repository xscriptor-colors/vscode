# Changelog — Xscriptor Themes

All important modifications to this VSCode theme collection will be documented in this file.

---
## [1.1.5] - 2026-08-23

### Added
- Completed every theme's color key set to match the current official VS Code theme color reference (each theme now ships ~905 keys, zero missing). New keys include `editorGhostText.*`, `terminalSymbolIcon.*`, `terminalStickyScroll.*`, `chat.*`, `inlineChat.*`, `inlineEdit.*`, `testing.*`, `statusBarItem.*`, `checkbox.*`, `radio.*`, `commandCenter.*`, `menu.*`, `minimap*`, `scmGraph.*` and more — every value derived from each theme's own palette (foreground, accent, semantic colors, alphas).
- All 12 theme files extended with the same full key set, preserving each theme's original colors, formatting and ordering.

### Changed
- **Miami**: syntax purple switched from the dark `#D36CFF` to Paris' light purple `#C4BDFF` across text/code keys (constants, entities, variables, decorators, region.purplish), keeping background-derived keys untouched.
- **Miami**: reworked palette to a corrected neon scheme — red `#FF5C8A`, green `#45E8B0`, blue `#2FD4FF`, yellow `#FFE066`, purple `#C77DFF`, foreground `#F2F0FF`.
- **Miami**: `charts.orange` fixed from green neon `#00FFA8` to a real orange `#FF9E64`.
- **Miami**: `terminal.ansiBlue` fixed (was green, now `#2FD4FF`).

### Fixed
- Miami: misnamed orange and terminal blue that rendered as green.

## [1.1.4] - 2026-06-23

### Added
- New **Miami** theme (dark, vibrant neon palette) with matching internal name.
- **11 palette-based icon themes** generated programmatically from colors.md palettes (X, Madrid, Oslo, Praha, Berlin, London, Helsinki, Lahabana, Miami, Paris, Bogota, Tokio). Each theme cycles its 6 palette colors across 44 language + 33 special file SVGs with contrast-verified text (#0a0a0a or #f7f1ff per WCAG AA).
- **Colors** icon theme: circles with language brand colors and circle markers cycling through the X palette.
- `languageIds` fallback layer (~48 IDs) across all icon themes for broader file icon coverage via language mode.
- `showLanguageModeIcons: true` on all icon themes to let language-contributed icons show through when no match exists.
- **Terminal icon** (`>_` prompt in monospace) for `.sh`, `.ps1` files and `terminal`/`scripts`/`script`/`shell`/`console` folder names — across all themes.
- **GitHub Octocat icon** (cat face silhouette on #1b1f23 background) for `.gitignore`, `.gitattributes` files and `.github`, `.git` folders — across all themes.
- **294 folder name associations** per palette-based theme including .terraform, .kube, .cursor, .opencode, .windsurf, and ~120 more.
- All folders starting with `.` use folder-github color for visual consistency.

### Changed
- Original X icon theme renamed to **Old X** (preserved as legacy).
- Original XOslo icon theme renamed to **Old Oslo** (preserved as legacy, later removed).
- Colors icon theme redesigned: circles instead of rectangles with `x` marker, using X palette.
- Berlin & London icon themes: all folder SVGs converted to grayscale via luminance mapping.
- Expanded `fileNames` in all icon themes: 30+ entries including `.gitignore`, `.gitattributes`, `.env*`, config files.
- `folderNamesExpanded` support in all icon themes matching folderNames.
- Rebuilt product icon theme and generation pipeline with Node + Fantasticon.

### Fixed
- Madrid icon theme: removed dead `fileExtensions` entries (duplicate keys for `yml`/`yaml`, `ps1`).
- Oslo icon theme: added missing `folderExpanded`, `rootFolder`, `rootFolderExpanded` properties.
- Bogota, Lahabana, Paris, Tokio themes: fixed duplicate internal `"name"` field.
- All 12 theme JSON files: renamed internal `"name"` to match filename.

## [1.1.3] - 2026-05-24

### Updated
- X Theme: Fixed tab panel background color to match tab bar color (#181a1f instead of #30323a).
- Oslo Theme: Fixed tab panel background color to match tab bar color (#181a1f instead of #30323a).
- Colors updated for consistency in all themes.
- Updated docs.
- Uploaded gif demo.

## [1.1.2] - 2026-05-21

### Added
- New keys validation for compatibility with kyro trae and antigravity
- Highlight buttons with the color identity of theme

## [1.1.1] - 2026-05-21

### Added
- Accessibility audit to improve theme usability while preserving X's visual identity.

### Fixed
- shading in the selection section in the praha theme.
- Return button colors for X.
- Tokio theme: Fixed tab bar background color to match tab panel color (#191919 instead of #0a0a0a)
- Tokio & X themes: Refined tab styling with transparent borders and golden icon colors

### Changed
- Rebuilt Product Icon Theme from scratch as `x` using a custom SVG set (16x16, filled shapes) with an integrated X marker on every glyph
- Added local generation pipeline with Node + Fantasticon, plus HTML preview, and replaced previous default product icon theme mapping

## [1.1.0] - 2026-04-01
### Added
- Enhanced visual hierarchy with bracket pair guides (6 nesting levels) using palette colors
- Modern UI features: sticky scroll, inlay hints, terminal command decorations
- Colorful border combinations using theme palette definitions for improved visual consistency

### Changed
- Improved contrast and readability across all themes
- Enhanced terminal decorations with theme-specific color combinations
- Updated bracket pair highlighting for better code navigation

### Fixed
- Corrected invisible borders to use palette-based colors
- Improved UI consistency across all interface elements

## [1.0.8] - 2025-12-31
- Update docs.
- Update package.json.
- Add icons.
- Refactor: Improved file structure and renamed files for better consistency across the collection.

## [1.0.3] - 2025-10-16
- Update docs.
- Update package.json.


## [1.0.2] - 2025-10-04 
- Improve and update Product Icon Theme support (Dev)
- Update documentation
- Clean up unnecessary files and folders.
- Update Product Icon Theme font.
- Update compilation method for the extension.
- Update Support Version. (VSCode 1.85.0)

## [1.0.1] - 2025-09-26
- Add minimalist Product Icon Theme support (Dev)
- Update documentation

## [1.0.0] - 2025-09-22
- Big update, added new themes:
  - X Retro
  - X Sense
- Deleted themes:
  - X Tropical Neon
  - X Old Tropical Neon
- Removed high contrast Themes and add new standard Colors.
- Cursive Consolidation on Xscriptor Theme.
- Improve Xscriptor Theme, names and colors in general.

## [0.0.9] - 2025-09-18
- Update icons: adding persistence in folders.
- X Plain Text removed, Xgreyscale takes its place.

## [0.0.8] - 2025-09-16
- Update: X Summer Night Is the new Xscriptor Theme without cursive, cursive font added to Xscriptor Theme.

- X Summer Day deleted better you can use Xscriptor Theme Inverted.

- Xscriptor GrayScale Icons update.

## [0.0.7] - 2025-09-10
- Added new **Xscriptor Icons** theme featuring distinctive icons with an 'X' mark in the center
- Each icon uses the characteristic color of its corresponding language or file type
- Updated README.md with information about the new icon theme.

## [0.0.6] - 2025-09-05
- Xscriptor theme upgrade, including icons for xscriptor theme and xscriptor greyscale theme.
- Xscriptor Greyscale theme optimized.
- Xscriptor Greyscale Inverted theme optimized.

## [0.0.5] - 2025-09-05
- Xscriptor theme upgrade.

## [0.0.4] - 2025-09-05
- **Add Xscriptor Theme**

## [0.0.3] – 2025-01-22
### Added
- **8 new themes** added to the collection:
  - X Nord (dark theme inspired by arctic colors)
  - X Nord Inverted (light version of Nord theme)
  - X Summer Night (dark theme with warm summer night palette)
  - X Summer Day (bright and energetic light theme)
  - X Greyscale (elegant monochromatic dark theme)
  - X Greyscale Inverted (monochromatic light theme)
  - X Plain Text (ultra-minimalist monochromatic theme)
- **Complete README.md** in English with detailed descriptions of all themes
- **Proper uiTheme configurations** for each theme (vs-dark/vs-light)
### Changed
- **Extension name** changed from "X Dark Colors" to "Xscriptor Themes"
- **X Dark Colors theme** updated with very dark gray background (#1A1A1A)
- **Project structure** reorganized to support multiple themes

## [0.0.1] – 2025-07-01
### Added
- **Custom icon** visible in VSCode theme selector.
- **Golden color** in active and inactive tab file names.

## [0.0.1] - 2025-07-01
### Initial
- First version of `X Dark Colors Theme`.
- Dark base (`vs-dark`), designed to improve focus and reduce eye strain.
- Established file structure:
  - `package.json`
  - `themes/xdarkcolors.json`
- Custom colors in:
  - `editor.background`, `editor.foreground`
  - `sideBar.background`, `titleBar.activeBackground`
