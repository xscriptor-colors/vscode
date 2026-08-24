<h1 align="center">XGlass for VS Code</h1>

<p align="center">
  Make your VS Code window look like glass by changing opacity only when you trigger it.
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/xscriptor-colors/vscode/main/extensions/xglass/images/preview.png" alt="XGlass preview" width="860" />
</p>

<hr />

<h2>Contents</h2>
<ul>
  <li><a href="#features">Features</a></li>
  <li><a href="#requirements">Requirements</a></li>
  <li><a href="#activation-opt-in">Activation (Opt-In)</a></li>
  <li><a href="#settings">Settings</a></li>
  <li><a href="#how-it-works">How It Works</a></li>
  <li><a href="#security-and-privacy">Security and Privacy</a></li>
  <li><a href="#compatibility-and-limitations">Compatibility and Limitations</a></li>
  <li><a href="#troubleshooting">Troubleshooting</a></li>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#license">License</a></li>
</ul>

<h2 id="features">Features</h2>
<ul>
  <li>Control window transparency using commands or keyboard shortcuts.</li>
  <li>Configure default alpha and step in settings.</li>
  <li>Works on Windows and Linux X11/Xorg.</li>
</ul>

<h2 id="requirements">Requirements</h2>

<h3>Windows</h3>
<ul>
  <li>Windows 10 or newer.</li>
  <li>PowerShell available in PATH.</li>
</ul>

<h3>Linux (X11/Xorg)</h3>
<ul>
  <li>Xorg session required (Wayland is not supported).</li>
  <li><code>xprop</code> must be installed.</li>
</ul>

<pre><code># Fedora
sudo dnf install xorg-x11-utils

# Debian/Ubuntu
sudo apt install x11-utils

# Arch
sudo pacman -S xorg-xprop
</code></pre>

<h2 id="activation-opt-in">Activation (Opt-In)</h2>
<p>
  XGlass does not run automatically. It activates only when you execute one of its commands.
</p>

<h3>Command Palette</h3>
<ol>
  <li>Open Command Palette (<code>Ctrl+Shift+P</code>).</li>
  <li>Search for <code>xglass</code> and run one of these commands.</li>
</ol>

<ul>
  <li><strong>xglass: Enable Transparency Mode</strong>: sets alpha to <code>200</code>.</li>
  <li><strong>xglass: + transparency</strong>: increases transparency.</li>
  <li><strong>xglass: - transparency</strong>: decreases transparency.</li>
  <li><strong>xglass: full transparency</strong>: minimum alpha.</li>
  <li><strong>xglass: No transparency</strong>: restores full opacity.</li>
</ul>

<h3>Keyboard Shortcuts</h3>
<ul>
  <li><code>Ctrl+Alt+Z</code>: + transparency</li>
  <li><code>Ctrl+Alt+C</code>: - transparency</li>
  <li><code>Ctrl+Alt+X</code>: No transparency</li>
</ul>

<h2 id="settings">Settings</h2>
<ul>
  <li><code>xglass.alpha</code>: alpha from <code>1</code> to <code>255</code>.</li>
  <li><code>xglass.step</code>: increase/decrease step size, default <code>10</code>.</li>
</ul>

<h2 id="how-it-works">How It Works</h2>

<h3>Windows</h3>
<ul>
  <li>Loads an in-memory C# helper through PowerShell <code>Add-Type</code>.</li>
  <li>Applies <code>WS_EX_LAYERED</code> and sets alpha via <code>SetLayeredWindowAttributes</code>.</li>
</ul>

<h3>Linux (X11/Xorg)</h3>
<ul>
  <li>Finds VS Code windows by process id.</li>
  <li>Sets <code>_NET_WM_WINDOW_OPACITY</code> using <code>xprop</code>.</li>
</ul>

<h2 id="security-and-privacy">Security and Privacy</h2>
<ul>
  <li>Only command-based activation; no background auto-start.</li>
  <li>No telemetry and no network calls.</li>
  <li>No admin rights required.</li>
  <li>Only affects the current VS Code window opacity.</li>
</ul>

<h2 id="compatibility-and-limitations">Compatibility and Limitations</h2>
<ul>
  <li>Windows 10 or newer supported.</li>
  <li>Linux supported only on X11/Xorg with <code>xprop</code>.</li>
  <li>Some compositors/window managers may ignore opacity settings.</li>
</ul>

<h2 id="troubleshooting">Troubleshooting</h2>
<ul>
  <li>Windows: verify PowerShell is available and execution policy allows in-memory type loading.</li>
  <li>Linux: verify X11/Xorg session and <code>xprop</code> availability.</li>
  <li>Reset: run <strong>xglass: No transparency</strong> to restore alpha <code>255</code>.</li>
</ul>

<h2 id="installation">Installation</h2>
<ul>
  <li>Install from VSIX: <code>code --install-extension xglass-1.1.2.vsix</code></li>
  <li>Or search for <strong>XGlass</strong> in the Extensions view.</li>
</ul>

<div align="center">
<h2 align="center" id="x">X</h2>

<a href="https://xscriptor.io">Web
</a>
 & 
<a href="https://github.com/xscriptor">
  Github
</a>
 & 
<a href="https://www.xscriptor.com">
  X
</a>
</div>