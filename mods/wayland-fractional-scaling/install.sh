#!/usr/bin/env bash
#
# xscriptor — Wayland fractional scaling fix for VS Code / VS Code Insiders
#
# Works around Chromium/Electron clamping wp_fractional_scale_v1 to 1.0 on
# displays scaled below 100% (KDE Plasma 65-90%, SteamOS, etc.). The real fix
# lands with Electron 44+ (Chromium 151+); until VS Code ships it, this script
# installs a launcher wrapper that disables the feature.
#
# Remote usage:
#   curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --insiders
#
# Run with --help for all options.

set -euo pipefail

MARKER="xscriptor:wayland-fractional-scaling"
FEATURE_FLAG="--disable-features=WaylandFractionalScaleV1"

BIN_DIR="${XDG_BIN_HOME:-$HOME/.local/bin}"
APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"

TARGET=""
UNINSTALL=0
WITH_FUNC=1

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m warn:\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
	cat <<'EOF'
Wayland fractional scaling fix (<100%) for VS Code / VS Code Insiders.

Usage:
  install.sh [options]

Options:
  -c, --code, --stable   Target Visual Studio Code (stable)
  -i, --insiders         Target Visual Studio Code - Insiders
  -b, --both             Target both installations
  -u, --uninstall        Remove wrappers, desktop overrides and shell functions
      --no-func          Do not install the shell restart functions
  -h, --help             Show this help

Environment:
  VSCODE_LAUNCHER        Override the detected launcher path
  XDG_BIN_HOME           Wrapper directory (default: ~/.local/bin)
  XDG_DATA_HOME          Desktop/XDG data dir (default: ~/.local/share)

Examples:
  curl -fsSL .../install.sh | bash -s -- --insiders
  curl -fsSL .../install.sh | bash -s -- --code
  curl -fsSL .../install.sh | bash -s -- --uninstall
EOF
}

# --- helpers -----------------------------------------------------------------

_prompt() {
	_msg="$1"
	if [ -t 0 ]; then
		printf '%s' "$_msg"
		read -r _ans || _ans=""
	elif [ -r /dev/tty ]; then
		printf '%s' "$_msg" >/dev/tty
		read -r _ans </dev/tty 2>/dev/null || die "interactive prompt unavailable; pass --code or --insiders"
	else
		die "interactive prompt unavailable; pass --code or --insiders"
	fi
	printf '%s' "$_ans"
}

remove_block() {
	_file="$1" _begin="$2" _end="$3"
	[ -f "$_file" ] || return 0
	_tmp="$_file.tmp.$$"
	awk -v b="$_begin" -v e="$_end" '
		$0 == b { skip = 1; next }
		$0 == e { skip = 0; next }
		!skip { print }
	' "$_file" >"$_tmp"
	cat "$_tmp" >"$_file"
	rm -f "$_tmp"
}

launcher_for() {
	_kind="$1"
	if [ -n "${VSCODE_LAUNCHER:-}" ]; then
		printf '%s' "$VSCODE_LAUNCHER"
		return 0
	fi
	case "$_kind" in
	insiders)
		_candidates="/usr/share/code-insiders/bin/code-insiders /usr/lib/code-insiders/bin/code-insiders /opt/visual-studio-code-insiders/bin/code-insiders /usr/bin/code-insiders /snap/bin/code-insiders"
		;;
	stable)
		_candidates="/usr/share/code/bin/code /usr/lib/code/bin/code /opt/visual-studio-code/bin/code /usr/bin/code /snap/bin/code"
		;;
	esac
	for _p in $_candidates; do
		if [ -x "$_p" ]; then
			readlink -f "$_p" 2>/dev/null || printf '%s' "$_p"
			return 0
		fi
	done
	return 1
}

binary_for() {
	_launcher="$1"
	_dir="$(dirname "$_launcher")"
	if [ "$(basename "$_dir")" = "bin" ]; then
		_app="$(dirname "$_dir")"
	else
		_app="$_dir"
	fi
	_bin="$_app/$(basename "$_app")"
	if [ -x "$_bin" ]; then
		printf '%s' "$_bin"
	else
		printf '%s' "$_launcher"
	fi
}

system_desktop() {
	_kind="$1"
	case "$_kind" in
	insiders) _candidates="/usr/share/applications/code-insiders.desktop" ;;
	stable) _candidates="/usr/share/applications/code.desktop /usr/share/applications/visual-studio-code.desktop /usr/share/applications/code-oss.desktop" ;;
	esac
	for _p in $_candidates; do
		if [ -f "$_p" ]; then
			printf '%s' "$_p"
			return 0
		fi
	done
	return 1
}

# --- install steps -----------------------------------------------------------

install_wrapper() {
	_launcher="$1" _wrapper="$2"
	mkdir -p "$BIN_DIR"
	cat >"$_wrapper" <<EOF
#!/usr/bin/env sh
# $MARKER
# Workaround: Wayland fractional scaling below 100% (Electron <= 43 / Chromium <= 150).
# Remove when VS Code ships Electron 44+ (Chromium 151+).
exec "$_launcher" $FEATURE_FLAG "\$@"
EOF
	chmod +x "$_wrapper"
	info "wrapper:  $_wrapper"
}

install_desktop() {
	_kind="$1" _wrapper="$2"
	case "$_kind" in
	insiders)
		_label="Visual Studio Code - Insiders"
		_icon="vscode-insiders"
		_wmclass="Code - Insiders"
		_fallback="code-insiders.desktop"
		_mime="application/x-code-insiders-workspace"
		;;
	stable)
		_label="Visual Studio Code"
		_icon="vscode"
		_wmclass="Code"
		_fallback="code.desktop"
		_mime="application/x-code-workspace"
		;;
	esac
	mkdir -p "$APP_DIR"
	_sysdesk="$(system_desktop "$_kind" || true)"
	if [ -n "$_sysdesk" ]; then
		_dest="$APP_DIR/$(basename "$_sysdesk")"
		awk -v w="$_wrapper" -v m="$MARKER" '
			BEGIN { print "# " m }
			/^TryExec=/ { next }
			/^Exec=/ { sub(/^Exec=[^ \t]+/, "Exec=" w) }
			{ print }
		' "$_sysdesk" >"$_dest"
	else
		_dest="$APP_DIR/$_fallback"
		cat >"$_dest" <<EOF
# $MARKER
[Desktop Entry]
Name=$_label
Comment=Code Editing. Redefined.
GenericName=Text Editor
Exec=$_wrapper %F
Icon=$_icon
Type=Application
StartupNotify=false
StartupWMClass=$_wmclass
Categories=TextEditor;Development;IDE;
MimeType=$_mime;
EOF
	fi
	info "desktop:  $_dest"
}

install_func() {
	_fn="$1" _wrapper="$2" _binary="$3"
	_begin="# >>> $MARKER:$_fn >>>"
	_end="# <<< $MARKER:$_fn <<<"
	_done=0
	for _rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
		[ -f "$_rc" ] || continue
		remove_block "$_rc" "$_begin" "$_end"
		cat >>"$_rc" <<EOF

$_begin
$_fn() {
  pkill -u "\$USER" -f '^$_binary' 2>/dev/null
  sleep 1
  nohup "$_wrapper" "\$@" >/dev/null 2>&1 &
}
$_end
EOF
		_done=1
	done
	if [ "$_done" = 1 ]; then
		info "function: $_fn (auto-restart)"
	else
		warn "no ~/.zshrc or ~/.bashrc found; skipped $_fn"
	fi
}

ensure_path() {
	case ":$PATH:" in
	*":$BIN_DIR:"*) return 0 ;;
	esac
	_found=0
	for _rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
		[ -f "$_rc" ] || continue
		if grep -F 'PATH=' "$_rc" 2>/dev/null | grep -qF "$BIN_DIR"; then
			_found=1
		fi
	done
	if [ "$_found" = 0 ]; then
		_begin="# >>> $MARKER:path >>>"
		_end="# <<< $MARKER:path <<<"
		_wrote=0
		for _rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
			[ -f "$_rc" ] || continue
			remove_block "$_rc" "$_begin" "$_end"
			cat >>"$_rc" <<EOF

$_begin
export PATH="$BIN_DIR:\$PATH"
$_end
EOF
			_wrote=1
		done
		if [ "$_wrote" = 1 ]; then
			warn "$BIN_DIR added to PATH; open a new terminal or source your rc file."
		else
			warn "add $BIN_DIR to your PATH so the wrapper is picked up."
		fi
	fi
	case ":$PATH:" in
	*":$BIN_DIR:"*) ;;
	*) warn "$BIN_DIR is not in the current PATH; the wrapper applies in new shells." ;;
	esac
}

do_uninstall() {
	_removed=0
	for _name in code code-insiders; do
		_wrapper="$BIN_DIR/$_name"
		if [ -f "$_wrapper" ] && grep -qF "$MARKER" "$_wrapper"; then
			rm -f "$_wrapper"
			info "removed:  $_wrapper"
			_removed=1
		fi
	done
	for _desk in "$APP_DIR"/*.desktop; do
		[ -f "$_desk" ] || continue
		if grep -qF "$MARKER" "$_desk"; then
			rm -f "$_desk"
			info "removed:  $_desk"
			_removed=1
		fi
	done
	for _rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
		[ -f "$_rc" ] || continue
		for _fn in xcode xvscode; do
			if grep -qF "# >>> $MARKER:$_fn >>>" "$_rc"; then
				remove_block "$_rc" "# >>> $MARKER:$_fn >>>" "# <<< $MARKER:$_fn <<<"
				info "removed:  $_fn from $_rc"
				_removed=1
			fi
		done
		if grep -qF "# >>> $MARKER:path >>>" "$_rc"; then
			remove_block "$_rc" "# >>> $MARKER:path >>>" "# <<< $MARKER:path <<<"
			info "removed:  PATH block from $_rc"
			_removed=1
		fi
	done
	[ "$_removed" = 1 ] || warn "nothing installed by this script was found"
	info "uninstall complete"
}

# --- main --------------------------------------------------------------------

while [ $# -gt 0 ]; do
	case "$1" in
	-c | --code | --stable | --vscode) TARGET="stable" ;;
	-i | --insiders) TARGET="insiders" ;;
	-b | --both) TARGET="both" ;;
	-u | --uninstall) UNINSTALL=1 ;;
	--no-func | --no-function) WITH_FUNC=0 ;;
	-h | --help)
		usage
		exit 0
		;;
	*) die "unknown option: $1 (use --help)" ;;
	esac
	shift
done

if [ "$UNINSTALL" = 1 ]; then
	do_uninstall
	exit 0
fi

if [ "${XDG_SESSION_TYPE:-}" != "wayland" ]; then
	warn "current session is not Wayland (XDG_SESSION_TYPE=${XDG_SESSION_TYPE:-unset}); installing anyway"
fi

if [ -z "$TARGET" ]; then
	if [ -n "${VSCODE_LAUNCHER:-}" ]; then
		TARGET="stable"
	else
		_has_stable=0
		_has_insiders=0
		launcher_for stable >/dev/null 2>&1 && _has_stable=1
		launcher_for insiders >/dev/null 2>&1 && _has_insiders=1
		if [ "$_has_stable" = 1 ] && [ "$_has_insiders" = 1 ]; then
			_choice="$(_prompt 'Select target: [1] VS Code  [2] VS Code Insiders  [3] Both (default: 3): ')"
			case "${_choice:-3}" in
			1) TARGET="stable" ;;
			2) TARGET="insiders" ;;
			3) TARGET="both" ;;
			*) die "invalid selection: $_choice" ;;
			esac
		elif [ "$_has_stable" = 1 ]; then
			TARGET="stable"
			info "detected VS Code (stable)"
		elif [ "$_has_insiders" = 1 ]; then
			TARGET="insiders"
			info "detected VS Code Insiders"
		else
			die "no VS Code installation detected; install it or set VSCODE_LAUNCHER=/path/to/launcher"
		fi
	fi
fi

if [ "$TARGET" = "both" ]; then
	_targets="stable insiders"
else
	_targets="$TARGET"
fi

for _kind in $_targets; do
	_launcher="$(launcher_for "$_kind")" || die "no launcher found for $_kind; install it or set VSCODE_LAUNCHER=/path/to/launcher"
	if [ ! -x "$_launcher" ]; then
		die "launcher is not executable: $_launcher"
	fi
	_binary="$(binary_for "$_launcher")"
	case "$_kind" in
	insiders)
		_name="code-insiders"
		_fn="xvscode"
		;;
	stable)
		_name="code"
		_fn="xcode"
		;;
	esac
	_wrapper="$BIN_DIR/$_name"
	info "target:   $_kind ($_launcher)"
	install_wrapper "$_launcher" "$_wrapper"
	install_desktop "$_kind" "$_wrapper"
	if [ "$WITH_FUNC" = 1 ]; then
		install_func "$_fn" "$_wrapper" "$_binary"
	fi
done

ensure_path

_restart=""
if [ "$WITH_FUNC" = 1 ]; then
	case "$TARGET" in
	stable) _restart="  xcode" ;;
	insiders) _restart="  xvscode" ;;
	both) _restart="  xcode
  xvscode" ;;
	esac
fi

case "$(basename "$0")" in
install.sh) _uninstall_hint="$0 --uninstall" ;;
*) _uninstall_hint="curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --uninstall" ;;
esac

printf '\nDone. Launch VS Code as usual; the wrapper adds:\n  %s\n\n' "$FEATURE_FLAG"
if [ -n "$_restart" ]; then
	printf 'If an instance is already running without the flag, restart it with:\n%s\n\n' "$_restart"
fi
printf 'Verify with:  ps -ef | grep -o %s\n\n' "'disable-features=[^ ]*'"
printf 'Remove this workaround once VS Code ships Electron 44+ (Chromium 151+):\n  %s\n' "$_uninstall_hint"
