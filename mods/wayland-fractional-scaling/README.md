# Wayland fractional scaling fix (< 100%)

Wrapper and installer that fix VS Code and VS Code Insiders on Wayland when a
display is scaled **below 100%** (KDE Plasma at 65–90%, SteamOS, etc.).

## The problem

On Wayland, Chromium-based apps negotiate their scale with the compositor via
`wp_fractional_scale_v1`. With Electron **≤ 43** (Chromium **≤ 150**) the scale
is clamped to `1.0` for sub-100% values, so VS Code breaks on those monitors:

- window cannot be resized or maximized
- wrong window/content geometry
- clicks land off-target

The real fix is upstream: Chromium commit
[`893eecc`](https://github.com/chromium/chromium/commit/893eecc799a8d37387c65616b9c93d866d9292c5)
("Fix sub-1.0 fractional scale being clamped to 1.0 with viewporter", milestone
151) and it ships in **Electron 44** (Chromium 152).

Until VS Code updates its Electron, the workaround is to disable the feature:

```
--disable-features=WaylandFractionalScaleV1
```

That is exactly what this installer automates. On a sub-100% display there is no
visual penalty (the compositor downscales the 1x buffer).

> Tracking issues:
> [microsoft/vscode#311247](https://github.com/microsoft/vscode/issues/311247),
> [electron/electron#42351](https://github.com/electron/electron/issues/42351),
> [flathub/com.visualstudio.code#683](https://github.com/flathub/com.visualstudio.code/issues/683).

## What the installer does

For each selected target (VS Code and/or VS Code Insiders):

1. Creates a launcher wrapper in `~/.local/bin` that adds the flag:
   - `code` → VS Code (stable)
   - `code-insiders` → VS Code Insiders
2. Copies the system `.desktop` file to `~/.local/share/applications`, rewriting
   every `Exec=` line to use the wrapper (covers rofi, fuzzel, app menus, etc.).
3. Optionally adds restart functions to `~/.zshrc` / `~/.bashrc`:
   - `xcode` → kills and relaunches VS Code
   - `xvscode` → kills and relaunches VS Code Insiders
4. Ensures `~/.local/bin` is present in `PATH` (only if missing).

Everything is idempotent and can be removed with `--uninstall`.

## Requirements

- Linux with a Wayland session.
- Native VS Code / VS Code Insiders install (deb, rpm, AUR, `/opt`, snap).
- `bash` and `curl` for the automatic install.

Flatpak builds are **not** covered because their launcher is sandboxed.

## Install

### Automatic (remote)

```sh
# VS Code Insiders
curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --insiders

# VS Code (stable)
curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --code

# Both
curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --both
```

Run without a target and the script will prompt (works even when piped through
`curl | bash`, it reads from `/dev/tty`).

### Local clone

```sh
git clone https://github.com/xscriptor-colors/vscode.git
cd vscode/mods/wayland-fractional-scaling
bash install.sh --insiders
```

### Manual

Create the wrapper (for Insiders; use `/usr/share/code/bin/code` and the
`code` name for stable):

```sh
mkdir -p ~/.local/bin
cat > ~/.local/bin/code-insiders <<'EOF'
#!/usr/bin/env sh
exec /usr/share/code-insiders/bin/code-insiders --disable-features=WaylandFractionalScaleV1 "$@"
EOF
chmod +x ~/.local/bin/code-insiders
```

Copy the desktop entry and point its `Exec=` lines to the wrapper:

```sh
mkdir -p ~/.local/share/applications
cp /usr/share/applications/code-insiders.desktop ~/.local/share/applications/
sed -i 's|^Exec=code-insiders|Exec='"$HOME"'/.local/bin/code-insiders|' \
  ~/.local/share/applications/code-insiders.desktop
```

Optional restart function in `~/.zshrc`:

```sh
xvscode() {
  pkill -u "$USER" -f '^/usr/share/code-insiders/code-insiders' 2>/dev/null
  sleep 1
  nohup "$HOME/.local/bin/code-insiders" "$@" >/dev/null 2>&1 &
}
```

## Options

| Option | Description |
| --- | --- |
| `-c`, `--code`, `--stable` | Target VS Code (stable) |
| `-i`, `--insiders` | Target VS Code Insiders |
| `-b`, `--both` | Target both installations |
| `-u`, `--uninstall` | Remove wrappers, desktop overrides and shell functions |
| `--no-func` | Do not install the restart functions |
| `-h`, `--help` | Show help |

Environment overrides:

| Variable | Description |
| --- | --- |
| `VSCODE_LAUNCHER` | Use a custom launcher path instead of auto-detection |
| `XDG_BIN_HOME` | Wrapper directory (default `~/.local/bin`) |
| `XDG_DATA_HOME` | XDG data dir (default `~/.local/share`) |

## Verify

```sh
ps -ef | grep -o 'disable-features=[^ ]*'
```

Or check `Help > About` inside VS Code: the `Electron` line should show `44` or
newer once the workaround is no longer needed.

## Uninstall

```sh
curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --uninstall
```

Then open a new terminal (or `source ~/.zshrc`) so the functions disappear.

## Remove when Electron 44+ lands

`--disable-features=WaylandFractionalScaleV1` turns off fractional scaling
entirely. That is harmless below 100%, but on displays **above 100%** (1.25,
1.5, …) it makes text blurry. Once VS Code ships Electron 44+ (Chromium 151+),
run the uninstall command above.

## Additional notes

- Only the first VS Code process reads the flag; the wrapper/desktop entries
  guarantee that process always includes it. Use `xcode` / `xvscode` if an old
  instance is still running.
- Verified against `visual-studio-code-insiders-bin` (Arch/AUR) and the official
  deb/rpm layouts. Other paths can be handled with `VSCODE_LAUNCHER`.
