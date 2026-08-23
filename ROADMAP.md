## Phase 1 · Repository foundation (already done) <!-- phase:foundation -->

- [x] Consolidate monorepo structure with packages in `extensions/`, `themes/`, and `ui-mods/` (#5)
- [x] Publish root documentation: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, `CHANGELOG.md` (#6)
- [x] Normalize package `README.md` files to GitHub-compatible HTML format (#7)
- [x] Define initial visual identity and previews in `assets/` and theme folders (#8)
- [x] Keep per-package licensing strategy (`MIT` for tooling and dedicated licenses for themes) (#9)

## Phase 2 · Governance and automation <!-- phase:automation -->

- [x] Integrate `xgh/github-roadmap-sync` into the main repo flow (`.github/scripts/sync_roadmap.py`) (#10)
- [x] Create `roadmap-sync.yml` workflow to sync `ROADMAP.md` with GitHub Issues (#11)
- [x] Define phase label convention and create baseline labels on GitHub (#12)
- [x] Run local `--dry-run` with authenticated `gh` and validate duplicate prevention (#13)
- [x] Document roadmap sync usage in root documentation (#14)

## Phase 3 · Theme quality <!-- phase:themes-quality -->

- [x] Audit contrast and readability for all themes in `themes/x-dark-colors/themes/*.json` (#15)
- [x] Audit contrast and readability for all themes in `themes/xscriptor-themes/themes/*.json` (#16)
- [x] Normalize naming (accents, city names, variants) across theme labels and docs (#17)
- [x] Review consistency between syntax colors and UI colors (activity bar, status bar, badges) (#18)
- [x] Improve accessibility for transparency combinations with `xglass` (#19)
- [x] Add a visual QA checklist per theme (JS/TS, JSON, Markdown, diff, terminal) (#20)

## Phase 4 · Versioning and releases <!-- phase:releases -->

- [x] Define semantic versioning strategy for `xglass`, `x-dark-colors`, and `xscriptor-themes` (#21)
- [x] Bump version in `extensions/xglass/package.json` with matching changelog notes (#22)
- [x] Bump version in `themes/x-dark-colors/package.json` with matching changelog notes (#23)
- [x] Bump version in `themes/xscriptor-themes/package.json` with matching changelog notes (#24)
- [x] Standardize release notes per package (highlights, breaking changes, migrations) (#25)
- [x] Prepare pipeline/manual process to package `.vsix` for each package (#26)

## Phase 5 · XGlass functional improvements <!-- phase:xglass-improvements -->

- [x] Review `xglass.alpha` and `xglass.step` defaults based on real usage feedback (#27)
- [x] Add clearer validation and error messages for Linux/X11 environments (#28)
- [x] Improve behavior in compositors that ignore opacity (#29)
- [x] Review keybindings for potential conflicts with common shortcuts (#30)
- [x] Expand platform-specific troubleshooting documentation (#31)

## Phase 6 · UI Mods and UX improvements <!-- phase:ui-mods -->

- [x] Align preset structure between `ui-mods/x-ui/` and `ui-mods/xscriptor-ui/` (#32)
- [x] Add before/after previews for each major mod (#33)
- [x] Publish step-by-step installation guide for Custom UI Style (#34)
- [x] Review mod compatibility with newer VS Code releases (#35)

## Phase 7 · Ongoing maintenance <!-- phase:maintenance -->

- [x] Create a monthly routine for issue triage and prioritization (#36)
- [x] Review broken links and missing images across documentation (#37)
- [x] Track user feedback to prioritize new palettes and improvements (#38)
- [x] Keep root `CHANGELOG.md` updated for every release (#39)
- [x] Define acceptance criteria for roadmap task closure (#40)
