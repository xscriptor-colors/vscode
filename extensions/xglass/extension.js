const { workspace, window, commands } = require('vscode');

function clampAlpha(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 200;
  if (n < 1) return 1;
  if (n > 255) return 255;
  return Math.round(n);
}

function clampStep(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return 10;
  if (n > 100) return 100;
  return Math.round(n);
}

function activate(context) {
  const config = () => workspace.getConfiguration('xglass');

  // Will be defined according to the platform, but accessible for commands
  let setAlpha = () => window.showErrorMessage('xglass: unsupported platform.');

  if (process.platform === 'win32') {
    let ps = null;
    let typeLoaded = false;

    const ensureWinReady = async () => {
      if (!ps) {
        const shell = require('node-powershell');
        ps = new shell({ executionPolicy: 'RemoteSigned', noProfile: true });
        context.subscriptions.push(ps);
      }
      if (!typeLoaded) {
        const path = context.asAbsolutePath('./SetTransparency.cs');
        ps.addCommand('[Console]::OutputEncoding = [Text.Encoding]::UTF8');
        ps.addCommand(`Add-Type -Path '${path}'`);
        await ps.invoke().finally(() => { ps.commands = []; });
        typeLoaded = true;
      }
    };

    setAlpha = async (alpha) => {
      try {
        alpha = clampAlpha(alpha);

        await ensureWinReady();

        // Correct C# method name! SetTransparency
        ps.addCommand(`[xglass.SetTransParency]::SetTransparency(${process.pid}, ${alpha})`);
        await ps.invoke().finally(() => { ps.commands = []; });

        console.log(`xglass: set alpha ${alpha}`);
        await config().update('alpha', alpha, true);
      } catch (err) {
        console.error(err);
        window.showErrorMessage(`xglass Error (win32): ${err}`);
      }
    };
  } else if (process.platform === 'linux') {
  const cp = require('child_process');

  // Verify xprop (X11).
  const xpropCheck = cp.spawnSync('which', ['xprop'], { stdio: 'ignore' });
  const hasXprop = xpropCheck.status === 0;
  if (!hasXprop) {
    setAlpha = () => window.showErrorMessage('xglass Error: xprop not found (X11 only). Install x11-utils/xorg-x11-utils.');
  }

  // show if is wayland
  if (process.env.XDG_SESSION_TYPE === 'wayland') {
    console.warn('xglass: Wayland session detected - not supported.');
  }

  // obtain code window
  const getCodeWindowIds = () => {
    try {
      let pids = [];
      try {
        pids = cp.execSync(`pgrep -f 'code(-insiders)?$'`).toString().trim().split('\n').filter(Boolean);
      } catch {
        try {
          pids = cp.execSync(`pgrep 'code'`).toString().trim().split('\n').filter(Boolean);
        } catch {
          pids = [];
        }
      }
      if (!pids.length) return [];

      const root = cp.execSync(`xprop -root | grep '_NET_CLIENT_LIST(WINDOW)'`).toString();
      const allIds = (root.match(/0x[\da-f]+/ig) || []);
      const codeIds = [];

      for (const wid of allIds) {
        const pidLine = cp.execSync(`xprop -id ${wid} _NET_WM_PID`).toString();
        const m = pidLine.match(/\d+/);
        const winPid = m ? m[0] : null;
        if (winPid && pids.includes(winPid)) codeIds.push(wid);
      }
      return codeIds;
    } catch (e) {
      console.error('xglass(linux): getCodeWindowIds failed', e);
      return [];
    }
  };

  if (hasXprop) {
  setAlpha = (alpha) => {
    try {
      alpha = clampAlpha(alpha);

      const ids = getCodeWindowIds();
      if (!ids.length) {
        window.showWarningMessage('xglass: no VS Code windows found (X11). Are you on Wayland?');
        return;
      }

      const opacity = `0x${Math.round(0xffffffff * alpha / 255).toString(16)}`;
      for (const id of ids) {
        cp.execFile('xprop', ['-id', id, '-f', '_NET_WM_WINDOW_OPACITY', '32c', '-set', '_NET_WM_WINDOW_OPACITY', opacity],
          async (error) => {
            if (error) {
              console.error('xglass(linux): xprop error', error);
              window.showErrorMessage(`xglass Error (linux): ${error.message}`);
              return;
            }
            console.log(`xglass(linux): set alpha ${alpha}`);
            await config().update('alpha', alpha, true);
          }
        );
      }
    } catch (err) {
      console.error(err);
      window.showErrorMessage(`xglass Error (linux): ${err.message || err}`);
    }
  };
  }
}


  console.log('xglass VSC active');

  // ---- Commands (trigger activation) ----
  context.subscriptions.push(commands.registerCommand('xglass.enable', () => {
    setAlpha(200);
  }));

  context.subscriptions.push(commands.registerCommand('xglass.increase', () => {
    const alpha = clampAlpha(config().get('alpha')) - clampStep(config().get('step'));
    setAlpha(alpha);
  }));

  context.subscriptions.push(commands.registerCommand('xglass.decrease', () => {
    const alpha = clampAlpha(config().get('alpha')) + clampStep(config().get('step'));
    setAlpha(alpha);
  }));

  context.subscriptions.push(commands.registerCommand('xglass.max', () => setAlpha(1)));
  context.subscriptions.push(commands.registerCommand('xglass.min', () => setAlpha(255)));

}

exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;
