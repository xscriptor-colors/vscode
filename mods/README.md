<h1 align="center">Mods</h1>

<p>
  System-level mods for VS Code on Linux: launcher wrappers, Chromium/Electron flags and small runtime fixes that cannot be done with CSS or JS injection.
</p>

<p>
  Unlike <a href="../ui-mods/">ui-mods</a>, these do not require the Custom UI Style extension and do not modify the interface.
</p>

<h2>Available Mods</h2>
<ul>
  <li><a href="./wayland-fractional-scaling/">wayland-fractional-scaling/</a>: fixes window resize/maximize and input geometry on Wayland displays scaled below 100% (Electron &le; 43).</li>
</ul>

<h2>Install</h2>
<p>
  Each mod documents its own manual and automatic installation. They are safe to uninstall and can be applied per machine.
</p>

<pre><code>curl -fsSL https://raw.githubusercontent.com/xscriptor-colors/vscode/main/mods/wayland-fractional-scaling/install.sh | bash -s -- --insiders</code></pre>
