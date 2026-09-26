import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LAB = path.join(ROOT, "labs/xscriptor-themes/preview-icons");
const LOGOS = path.join(LAB, "logos-src");
const OUT = path.join(LAB, "index.html");

// ── Palettes (source of truth: themes/xscriptor-themes/colors.md) ──
const colorsMd = fs.readFileSync(path.join(ROOT, "themes/xscriptor-themes/colors.md"), "utf8");
const THEMES = [...colorsMd.matchAll(/<h2[^>]*>([^<]+)<\/h2>\s*```json\s*(\{[\s\S]*?\})\s*```/g)].map(
  ([, name, json]) => {
    const j = JSON.parse(json);
    return {
      name: name.trim(),
      bg: j.background,
      fg: j.foreground,
      palette: [j.color1, j.color2, j.color3, j.color4, j.color5, j.color6],
    };
  }
);

// ── Color utils ──
const hex2rgb = (h) => {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lum = (hex) => {
  const [r, g, b] = hex2rgb(hex).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mix = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
const ensureContrast = (color, bg, min) => {
  if (ratio(color, bg) >= min) return color;
  const target = lum(bg) < 0.5 ? "#ffffff" : "#000000";
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) {
    const t = (lo + hi) / 2;
    if (ratio(mix(color, target, t), bg) >= min) hi = t; else lo = t;
  }
  return mix(color, target, hi);
};
const readableOn = (bg) => (ratio("#0a0a0a", bg) >= ratio("#f7f1ff", bg) ? "#0a0a0a" : "#f7f1ff");

// ── Icons: id, badge label, palette slot (1-6), simple-icons slug ──
const ICONS = [
  ["js", "JS", 3, "javascript"], ["ts", "TS", 6, "typescript"], ["jsx", "JSX", 6, "react"],
  ["tsx", "TSX", 6, "react"], ["vue", "VUE", 2, "vuedotjs"], ["svelte", "SV", 4, "svelte"],
  ["astro", "AST", 5, "astro"], ["html", "H", 4, "html5"], ["css", "CSS", 6, "css3"],
  ["sass", "SAS", 1, "sass"], ["less", "LES", 6, "less"], ["stylus", "STY", 5, "stylus"],
  ["python", "PY", 3, "python"], ["php", "PHP", 5, "php"], ["java", "JV", 4, "java"],
  ["go", "GO", 6, "go"], ["rust", "RS", 4, "rust"], ["ruby", "RB", 1, "ruby"],
  ["csharp", "C#", 5, "csharp"], ["kotlin", "KT", 5, "kotlin"], ["swift", "SW", 4, "swift"],
  ["c", "C", 6, "c"], ["cpp", "C++", 6, "cplusplus"], ["bash", "SH", 2, "gnubash"],
  ["powershell", "PS", 6, "powershell"], ["lua", "LUA", 5, "lua"], ["perl", "PL", 6, "perl"],
  ["r", "R", 6, "r"], ["scala", "SC", 1, "scala"], ["haskell", "HS", 5, "haskell"],
  ["elixir", "EX", 5, "elixir"], ["dart", "DT", 6, "dart"], ["sql", "SQL", 6, "mysql"],
  ["graphql", "GQL", 1, "graphql"], ["prisma", "PR", 6, "prisma"], ["json", "{}", 3, "json"],
  ["yaml", "YML", 5, "yaml"], ["xml", "XML", 4, "xml"], ["markdown", "MD", 6, "markdown"],
  ["git", "GIT", 4, "git"], ["github", "GH", 4, "github"], ["npm", "NPM", 1, "npm"],
  ["pnpm", "PN", 3, "pnpm"], ["yarn", "Y", 6, "yarn"], ["webpack", "WP", 6, "webpack"],
  ["vite", "V", 5, "vite"], ["eslint", "ES", 5, "eslint"], ["prettier", "PR", 1, "prettier"],
  ["babel", "B", 3, "babel"], ["docker", "D", 6, "docker"], ["svgicon", "SVG", 5, "svg"],
];

const SPECIAL_FOLDERS = {
  folder: { slot: 3, glyph: null },
  "folder-open": { slot: 3, glyph: null },
  "folder-components": { slot: 6, glyph: "jsx" },
  "folder-tests": { slot: 6, glyph: "jest" },
  "folder-assets": { slot: 5, glyph: "svgicon" },
  "folder-node": { slot: 1, glyph: "npm" },
};

const MATRIX = ["js", "ts", "python", "php", "html", "css", "docker", "json", "markdown", "git"];

const TREE = [
  { d: 0, icon: "folder", name: ".vscode" },
  { d: 0, icon: "folder-open", name: "src" },
  { d: 1, icon: "folder-components", name: "components" },
  { d: 2, icon: "tsx", name: "Button.tsx" },
  { d: 2, icon: "sass", name: "styles.scss" },
  { d: 1, icon: "ts", name: "index.ts" },
  { d: 1, icon: "vue", name: "App.vue" },
  { d: 0, icon: "folder-tests", name: "tests" },
  { d: 1, icon: "js", name: "app.test.js" },
  { d: 0, icon: "folder-assets", name: "assets" },
  { d: 1, icon: "svgicon", name: "logo.svg" },
  { d: 1, icon: "file", name: "photo.png" },
  { d: 0, icon: "folder-node", name: "node_modules" },
  { d: 0, icon: "npm", name: "package.json" },
  { d: 0, icon: "ts", name: "tsconfig.json" },
  { d: 0, icon: "docker", name: "Dockerfile" },
  { d: 0, icon: "git", name: ".gitignore" },
  { d: 0, icon: "markdown", name: "README.md" },
];

// ── Load logo symbols ──
const slugToInner = {};
const slugs = new Set(ICONS.map(([, , , s]) => s));
for (const slug of [...slugs, "jest", "svg"]) {
  let svg = fs.readFileSync(path.join(LOGOS, `${slug}.svg`), "utf8");
  const inner = svg
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<svg[^>]*>/, "")
    .replace(/<\/svg>/, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .trim();
  slugToInner[slug] = inner;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const labelFs = (l) => (l.length <= 1 ? 12 : l.length === 2 ? 10 : l.length === 3 ? 8.2 : 6.8);
const labelLs = (l) => (l.length >= 3 ? -0.35 : -0.1);

// ── Build symbols (once) ──
const badgeIds = new Map();
const parts = [];

parts.push(`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>`);

for (const [id, , , slug] of ICONS) {
  parts.push(`<symbol id="lg-${id}" viewBox="0 0 24 24"><g class="glyph">${slugToInner[slug]}</g></symbol>`);
}
parts.push(`<symbol id="lg-jest" viewBox="0 0 24 24"><g class="glyph">${slugToInner.jest}</g></symbol>`);
parts.push(`<symbol id="lg-file" viewBox="0 0 24 24"><g class="glyph"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7zm0 2.5L17.5 9H13V4.5zM8 13h8v1.6H8V13zm0 3.2h8v1.6H8v-1.6zm0-6.4h4v1.6H8V9.8z"/></g></symbol>`);

let bi = 0;
for (const [, label] of ICONS) {
  if (badgeIds.has(label)) continue;
  const bid = `bd-${bi++}`;
  badgeIds.set(label, bid);
  parts.push(
    `<symbol id="${bid}" viewBox="0 0 24 24"><rect class="tile" x="0" y="0" width="24" height="24" rx="4.5"/><text class="lbl" x="12" y="12.4" font-size="${labelFs(label)}" letter-spacing="${labelLs(label)}">${esc(label)}</text><text class="xt" x="20.5" y="6.5">x</text></symbol>`
  );
}
parts.push(
  `<symbol id="bd-IMG" viewBox="0 0 24 24"><rect class="tile" x="0" y="0" width="24" height="24" rx="4.5"/><text class="lbl" x="12" y="12.4" font-size="7.5" letter-spacing="-0.3">IMG</text><text class="xt" x="20.5" y="6.5">x</text></symbol>`
);

for (const [id] of ICONS) {
  parts.push(
    `<symbol id="hb-${id}" viewBox="0 0 24 24"><rect class="tile" x="0" y="0" width="24" height="24" rx="4.5"/><use href="#lg-${id}" width="24" height="24" transform="translate(3.2 3.2) scale(0.7333)"/><text class="xt" x="20.5" y="6.5">x</text></symbol>`
  );
}
parts.push(
  `<symbol id="hb-file" viewBox="0 0 24 24"><rect class="tile" x="0" y="0" width="24" height="24" rx="4.5"/><use href="#lg-file" width="24" height="24" transform="translate(3.2 3.2) scale(0.7333)"/><text class="xt" x="20.5" y="6.5">x</text></symbol>`
);
parts.push(
  `<symbol id="xmark-logo" viewBox="0 0 24 24"><text class="xl" x="20.5" y="6.5">x</text></symbol>`
);

// folders (bootstrap folder2 / folder2-open, MIT, 16 viewBox scaled to 24)
const folderShape = fs.readFileSync(path.join(LOGOS, "folder2.svg"), "utf8").match(/d="([^"]+)"/)[1];
const folderOpenShape = fs.readFileSync(path.join(LOGOS, "folder2-open.svg"), "utf8").match(/d="([^"]+)"/)[1];
parts.push(`<symbol id="lg-folder" viewBox="0 0 24 24"><g class="fshape"><path transform="scale(1.5)" d="${folderShape}"/></g><text class="xf" x="20.5" y="6.5">x</text></symbol>`);
parts.push(`<symbol id="lg-folder-open" viewBox="0 0 24 24"><g class="fshape"><path transform="scale(1.5)" d="${folderOpenShape}"/></g><text class="xf" x="20.5" y="6.5">x</text></symbol>`);
for (const [fid, def] of Object.entries(SPECIAL_FOLDERS)) {
  const shape = fid === "folder-open" ? folderOpenShape : folderShape;
  const overlay = def.glyph
    ? `<use href="#lg-${def.glyph}" width="24" height="24" transform="translate(8 8.4) scale(0.3333)"/>`
    : "";
  parts.push(`<symbol id="fd-${fid}" viewBox="0 0 24 24"><g class="fshape"><path transform="scale(1.5)" d="${shape}"/></g>${overlay}<text class="xf" x="20.5" y="6.5">x</text></symbol>`);
}
parts.push(`</defs></svg>`);

// ── Per-theme styles ──
const themeCSS = [];
const themeStyle = {};
for (const t of THEMES) {
  const slots = {};
  for (let i = 0; i < 6; i++) {
    const raw = t.palette[i];
    const tile = ensureContrast(raw, t.bg, 1.35);
    slots[i + 1] = {
      g: ensureContrast(raw, t.bg, 3),
      tile,
      tileFg: readableOn(tile),
    };
  }
  const folderFill = ensureContrast(t.palette[2], t.bg, 1.35);
  const folderGlyph = readableOn(folderFill);
  slots.folder = { f: folderFill, g: folderGlyph };
  themeStyle[t.name] = slots;
}

// ── HTML helpers ──
const styleForSlot = (t, slot) => {
  const s = themeStyle[t.name][slot];
  return `--g:${s.g};--tile:${s.tile};--tile-fg:${s.tileFg};--bg:${t.bg}`;
};
const styleForFolder = (t, slot) => {
  const s = themeStyle[t.name][slot];
  const f = themeStyle[t.name].folder;
  return `--g:${f.g};--f:${f.f};--tile:${s.tile};--tile-fg:${s.tileFg};--bg:${t.bg}`;
};

const iconById = Object.fromEntries(ICONS.map((i) => [i[0], i]));

function fileIcons(t, id, size = 16) {
  if (id === "file") {
    return `<svg class="s${size} only-hybrid" style="${styleForSlot(t, 3)}"><use href="#hb-file"/></svg>
<svg class="s${size} only-badge" style="${styleForSlot(t, 3)}"><use href="#bd-IMG"/></svg>
<svg class="s${size} only-logo" style="${styleForSlot(t, 3)}"><use href="#lg-file"/></svg>`;
  }
  const [, , slot] = iconById[id];
  return `<svg class="s${size} only-hybrid" style="${styleForSlot(t, slot)}"><use href="#hb-${id}"/></svg>
<svg class="s${size} only-badge" style="${styleForSlot(t, slot)}"><use href="#${badgeIds.get(iconById[id][1])}"/></svg>
<svg class="s${size} only-logo" style="${styleForSlot(t, slot)}"><use href="#lg-${id}"/><use href="#xmark-logo"/></svg>`;
}

function folderIcons(t, id, size = 16) {
  const def = SPECIAL_FOLDERS[id];
  const st = styleForFolder(t, def.slot);
  return `<svg class="s${size}" style="${st}"><use href="#fd-${id}"/></svg>`;
}

function treeRow(t, row) {
  const isFolder = row.icon.startsWith("folder");
  const icons = isFolder ? folderIcons(t, row.icon) : fileIcons(t, row.icon);
  return `<div class="row" style="padding-left:${row.d * 14}px">${icons}<span class="name">${esc(row.name)}</span></div>`;
}

function matrixRow(t, label, cellFn) {
  return `<div class="mrow"><span class="mlabel">${label}</span><div class="mcells">${MATRIX.map((id) => {
    const isFolder = false;
    return `<span class="mcell">${cellFn(id, 16)}${cellFn(id, 32)}</span>`;
  }).join("")}</div></div>`;
}

function matrixCellHybrid(t, id, size) {
  const slot = iconById[id][2];
  return `<svg class="s${size}" style="${styleForSlot(t, slot)}"><use href="#hb-${id}"/></svg>`;
}
function matrixCellBadge(t, id, size) {
  const slot = iconById[id][2];
  return `<svg class="s${size}" style="${styleForSlot(t, slot)}"><use href="#${badgeIds.get(iconById[id][1])}"/></svg>`;
}
function matrixCellLogo(t, id, size) {
  const slot = iconById[id][2];
  return `<svg class="s${size}" style="${styleForSlot(t, slot)}"><use href="#lg-${id}"/><use href="#xmark-logo"/></svg>`;
}

const treeHTML = (t) => TREE.map((r) => treeRow(t, r)).join("\n");
const swatches = (t) =>
  t.palette.map((c) => `<span class="swatch" style="background:${c}" title="${c}"></span>`).join("") +
  `<span class="swatch fg" style="background:${t.fg}" title="foreground"></span>`;

// ── Assemble page ──
const isLight = (t) => lum(t.bg) > 0.5;

const themesHTML = THEMES.map((t) => {
  const light = isLight(t);
  return `<section class="theme ${light ? "light" : "dark"}" style="--bg:${t.bg};--fg:${t.fg}">
  <header>
    <h2>${esc(t.name)}</h2>
    <div class="swatches">${swatches(t)}</div>
    <span class="badge-note">${light ? "tema claro" : "tema oscuro"} · fondo ${t.bg}</span>
  </header>
  <div class="content">
    <div class="panel" style="background:${t.bg};color:${t.fg}">
      <div class="panel-title">Explorador (muestra)</div>
      <div class="tree">
${treeHTML(t)}
      </div>
    </div>
    <div class="matrix">
      ${matrixRow(t, "Híbrido", (id, s) => matrixCellHybrid(t, id, s))}
      ${matrixRow(t, "Logo tintado", (id, s) => matrixCellLogo(t, id, s))}
      ${matrixRow(t, "Badge afinado", (id, s) => matrixCellBadge(t, id, s))}
      <div class="mrow"><span class="mlabel">Carpetas</span><div class="mcells">
        ${["folder", "folder-open", "folder-node", "folder-tests"]
          .map((f) => `<span class="mcell">${folderIcons(t, f, 16)}${folderIcons(t, f, 32)}</span>`)
          .join("")}
      </div></div>
    </div>
  </div>
</section>`;
}).join("\n");

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>xscriptor-themes · propuesta de íconos</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px 40px 80px; background: #14171c; color: #d7dae0;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  .lead { color: #9aa1ab; font-size: 13px; max-width: 900px; line-height: 1.55; }
  .lead code { background: #23272e; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  .controls { position: sticky; top: 0; z-index: 5; display: flex; gap: 18px; align-items: center;
              margin: 20px 0 26px; padding: 12px 16px; background: #1d2127ee; border: 1px solid #2c313a;
              border-radius: 10px; backdrop-filter: blur(6px); font-size: 13px; }
  .controls label { cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
  .controls .hint { margin-left: auto; color: #8b929c; }
  .s16 { width: 16px; height: 16px; flex: none; }
  .s32 { width: 32px; height: 32px; flex: none; }
  svg { display: block; }
  .glyph { fill: var(--g, currentColor); }
  .fshape { fill: var(--f, currentColor); }
  .tile { fill: var(--tile, #888); }
  .lbl { fill: var(--tile-fg, #fff); text-anchor: middle; dominant-baseline: central;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
         font-weight: 700; }
  .xt, .xf, .xl { text-anchor: middle; dominant-baseline: central; font-weight: 700; font-size: 6.4px;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .xt { fill: var(--tile-fg, #fff); opacity: .8; }
  .xf { fill: var(--g, currentColor); opacity: .8; }
  .xl { fill: var(--g, currentColor); opacity: .9; stroke: var(--bg, transparent); stroke-width: 1;
        paint-order: stroke; stroke-linejoin: round; }
  body:has(#xmark:not(:checked)) .xt,
  body:has(#xmark:not(:checked)) .xf,
  body:has(#xmark:not(:checked)) .xl { display: none; }
  .only-badge, .only-logo { display: none; }
  body:has(#v-hybrid:checked) .only-hybrid { display: block; }
  body:has(#v-hybrid:checked) .only-badge, body:has(#v-hybrid:checked) .only-logo { display: none; }
  body:has(#v-logo:checked) .only-logo { display: block; }
  body:has(#v-logo:checked) .only-badge, body:has(#v-logo:checked) .only-hybrid { display: none; }
  body:has(#v-badge:checked) .only-badge { display: block; }
  body:has(#v-badge:checked) .only-logo, body:has(#v-badge:checked) .only-hybrid { display: none; }
  .theme { border: 1px solid #2c313a; border-radius: 12px; padding: 18px 20px; margin: 0 0 26px; background: #1a1e24; }
  .theme header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
  .theme h2 { margin: 0; font-size: 15px; letter-spacing: .3px; }
  .swatches { display: flex; gap: 4px; }
  .swatch { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #ffffff22; }
  .swatch.fg { border-radius: 50%; }
  .badge-note { color: #8b929c; font-size: 12px; margin-left: auto; }
  .content { display: flex; gap: 20px; flex-wrap: wrap; }
  .panel { width: 300px; border: 1px solid #ffffff1c; border-radius: 8px; padding: 10px 0 12px; font-size: 13px; }
  .panel-title { font-size: 11px; text-transform: uppercase; letter-spacing: .6px; opacity: .55; padding: 0 12px 8px; }
  .tree .row { display: flex; align-items: center; gap: 6px; padding: 1.5px 12px; line-height: 18px; }
  .tree .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .matrix { flex: 1; min-width: 420px; }
  .mrow { display: flex; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px dashed #ffffff12; }
  .mlabel { width: 92px; flex: none; font-size: 11px; color: #8b929c; text-align: right; }
  .mcells { display: flex; gap: 4px; flex-wrap: wrap; }
  .mcell { display: inline-flex; align-items: center; gap: 6px; padding: 3px 6px; border-radius: 6px; background: #ffffff08; }
  footer { color: #7d848e; font-size: 12px; line-height: 1.6; max-width: 900px; }
  footer a { color: #8fb8ff; }
</style>
</head>
<body>
<h1>xscriptor-themes · prueba de íconos de explorador</h1>
<p class="lead">
  Tres variantes generadas desde las paletas de <code>colors.md</code> (misma fuente que los temas):
  <b>Híbrido</b> (tile de color + logo real), <b>Logo tintado</b> (solo el logo, color de la paleta, ajustado por contraste),
  <b>Badge afinado</b> (tile + letras).
  La "x" de marca se conserva en las tres variantes, ahora a tamaño legible (con contraste propio), y se puede ocultar con el toggle.
  Los logos son siluetas de <a href="https://simpleicons.org">Simple Icons</a> (CC0); las carpetas usan Bootstrap Icons (MIT) con variante abierta.
  A 16px es el tamaño real del explorador; a 32px es zoom. Berlin y London se mantienen en escala de grises porque su paleta es monocroma.
</p>
<div class="controls">
  <b>Variante en el árbol:</b>
  <label><input type="radio" name="variant" id="v-hybrid" checked> Híbrido</label>
  <label><input type="radio" name="variant" id="v-logo"> Logo tintado</label>
  <label><input type="radio" name="variant" id="v-badge"> Badge afinado</label>
  <label>Marca "x" <input type="checkbox" id="xmark" checked></label>
  <span class="hint">La matriz inferior siempre muestra las tres para comparar</span>
</div>
${themesHTML}
<footer>
  Nota legal: los logotipos son marcas de sus respectivos titulares; se usan solo con fines de identificación de tipo de archivo.
  Simple Icons es CC0 1.0; Bootstrap Icons es MIT. El color de cada logo se deriva de la paleta del tema, no del color de marca.
</footer>
${parts.join("\n")}
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`OK: ${OUT}`);
console.log(`Themes: ${THEMES.map((t) => t.name).join(", ")}`);
console.log(`Icons: ${ICONS.length} logos + ${SPECIAL_FOLDERS ? Object.keys(SPECIAL_FOLDERS).length : 0} folders`);
