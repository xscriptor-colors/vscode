import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const EXT = "themes/xscriptor-themes";
const LAB = path.join(ROOT, "labs/xscriptor-themes");
const STAGE = path.join(LAB, "tinted-preview");
const OUT = path.join(STAGE, "icons");
const LOGOS = path.join(LAB, "preview-icons/logos-src");
const NO_X = process.argv.includes("--no-x");

// ── Palettes from colors.md ──
const colorsMd = fs.readFileSync(path.join(ROOT, EXT, "colors.md"), "utf8");
const THEMES = [...colorsMd.matchAll(/<h2[^>]*>([^<]+)<\/h2>\s*```json\s*(\{[\s\S]*?\})\s*```/g)].map(([, name, json]) => {
  const j = JSON.parse(json);
  return { name: name.trim(), bg: j.background, fg: j.foreground, palette: [j.color1, j.color2, j.color3, j.color4, j.color5, j.color6] };
});

// ── Color utils ──
const hex2rgb = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lum = (hex) => { const [r, g, b] = hex2rgb(hex).map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const ensureContrast = (color, bg, min) => {
  if (ratio(color, bg) >= min) return color;
  const target = lum(bg) < 0.5 ? "#ffffff" : "#000000";
  let lo = 0, hi = 1;
  for (let i = 0; i < 16; i++) { const t = (lo + hi) / 2; if (ratio(mix(color, target, t), bg) >= min) hi = t; else lo = t; }
  return mix(color, target, hi);
};
const readableOn = (bg) => (ratio("#0a0a0a", bg) >= ratio("#f7f1ff", bg) ? "#0a0a0a" : "#f7f1ff");

// ── Logos ──
const LOGO = {};
for (const f of fs.readdirSync(LOGOS).filter((f) => f.endsWith(".svg") && !f.startsWith("folder2"))) {
  const slug = f.replace(/\.svg$/, "");
  LOGO[slug] = fs.readFileSync(path.join(LOGOS, f), "utf8").replace(/<\?xml[^>]*\?>/g, "").replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").replace(/<title>[\s\S]*?<\/title>/g, "").trim();
}
const FOLDER_SHAPE = fs.readFileSync(path.join(LOGOS, "folder2.svg"), "utf8").match(/d="([^"]+)"/)[1];
const FOLDER_OPEN_SHAPE = fs.readFileSync(path.join(LOGOS, "folder2-open.svg"), "utf8").match(/d="([^"]+)"/)[1];
const GENERIC_FILE = `<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7zm0 2.5L17.5 9H13V4.5zM8 13h8v1.6H8V13zm0 3.2h8v1.6H8v-1.6zm0-6.4h4v1.6H8V9.8z"/>`;

// ── Mapping: existing icon ids → tinted source ──
// logo: slug | badge: [label, slot] | file: generic silhouette
const MAP = {
  js: ["logo", "javascript", 3], ts: ["logo", "typescript", 6], jsx: ["logo", "react", 6], tsx: ["logo", "react", 6],
  vue: ["logo", "vuedotjs", 2], svelte: ["logo", "svelte", 4], astro: ["logo", "astro", 5],
  html: ["logo", "html5", 4], css: ["logo", "css3", 6], sass: ["logo", "sass", 1], scss: ["logo", "sass", 1],
  less: ["logo", "less", 6], stylus: ["logo", "stylus", 5], mdx: ["badge", "MDX", 5],
  python: ["logo", "python", 3], php: ["logo", "php", 5], java: ["logo", "java", 4], go: ["logo", "go", 6],
  rust: ["logo", "rust", 4], ruby: ["logo", "ruby", 1], csharp: ["logo", "csharp", 5], kotlin: ["logo", "kotlin", 5],
  swift: ["logo", "swift", 4], c: ["logo", "c", 6], cpp: ["logo", "cplusplus", 6], bash: ["logo", "gnubash", 2],
  powershell: ["logo", "powershell", 6], lua: ["logo", "lua", 5], perl: ["logo", "perl", 6], r: ["logo", "r", 6],
  scala: ["logo", "scala", 1], haskell: ["logo", "haskell", 5], elixir: ["logo", "elixir", 5], dart: ["logo", "dart", 6],
  objectivec: ["badge", "OC", 4], matlab: ["badge", "M", 5], cobol: ["badge", "COB", 5],
  json: ["logo", "json", 3], yaml: ["logo", "yaml", 5], xml: ["logo", "xml", 4], sql: ["logo", "mysql", 6],
  graphql: ["logo", "graphql", 1], prisma: ["logo", "prisma", 6], conf: ["badge", "CFG", 5],
  env: ["badge", "ENV", 5], "env-local": ["badge", "ENV", 5], "env-example": ["badge", "ENV", 5], "env-development": ["badge", "ENV", 5],
  editorconfig: ["badge", "EC", 5], tsconfig: ["logo", "typescript", 6], jsconfig: ["badge", "JS", 6],
  packagejson: ["logo", "npm", 1], packagelock: ["badge", "{}", 3], pnpm: ["logo", "pnpm", 3], yarn: ["logo", "yarn", 6],
  gitignore: ["logo", "git", 4], github: ["logo", "github", 4], eslint: ["logo", "eslint", 5],
  prettier: ["logo", "prettier", 1], babel: ["logo", "babel", 3], vite: ["logo", "vite", 5], webpack: ["logo", "webpack", 6],
  nextjs: ["badge", "N", 4], changelog: ["badge", "CL", 3], license: ["badge", "©", 4], readme: ["logo", "markdown", 6],
  markdown: ["logo", "markdown", 6], terminal: ["logo", "gnubash", 2], docker: ["logo", "docker", 6],
  image: ["badge", "IMG", 4], svg: ["logo", "svg", 5], pdf: ["badge", "PDF", 1], xlsx: ["badge", "XLS", 2],
  docx: ["badge", "DOC", 3], csv: ["badge", "CSV", 4], wasm: ["badge", "W", 5], font: ["badge", "F", 4],
  key: ["badge", "KEY", 5], file: ["silhouette", null, 3],
};

// ── Folder overlays (folder-<x> → [logo slug, palette slot]) ──
const FOLDER_OVERLAY = {
  node: ["npm", 1], packages: ["npm", 1], modules: ["npm", 1],
  git: ["git", 4], github: ["github", 4], workflows: ["github", 4],
  src: ["javascript", 3], tests: ["jest", 6], components: ["react", 6],
  assets: ["svg", 5], images: ["svg", 5], image: ["svg", 5],
  python: ["python", 3], php: ["php", 5], java: ["java", 4], cargo: ["rust", 4], target: ["rust", 4],
  docker: ["docker", 6], db: ["mysql", 6], database: ["mysql", 6],
  web: ["html5", 4], styles: ["css3", 6], css: ["css3", 6],
  powershell: ["powershell", 6], terminal: ["gnubash", 2], scripts: ["gnubash", 2],
  sveltekit: ["svelte", 4],
};

const existing = fs.readdirSync(path.join(ROOT, EXT, "icons/colors")).filter((f) => f.endsWith(".svg")).map((f) => f.replace(/\.svg$/, ""));
const FILE_IDS = existing.filter((id) => !id.startsWith("folder"));
const FOLDER_IDS = existing.filter((id) => id.startsWith("folder-"));

const baseManifest = JSON.parse(fs.readFileSync(path.join(ROOT, EXT, "icons/paris.json"), "utf8"));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const labelFs = (l) => (l.length <= 1 ? 12 : l.length === 2 ? 10 : l.length === 3 ? 8.2 : 6.8);
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const xMark = (fill, stroke, opacity = 0.85) => NO_X ? "" : `<text x="20.5" y="6.5" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="1" paint-order="stroke" stroke-linejoin="round"` : ""} opacity="${opacity}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-weight="700" font-size="6.4">x</text>`;

function makeLogo(slug, g, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><g fill="${g}">${LOGO[slug]}</g>${xMark(g, bg)}</svg>\n`;
}
function makeBadge(label, tile, fg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><rect x="0" y="0" width="24" height="24" rx="4.5" fill="${tile}"/><text x="12" y="12.4" fill="${fg}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-weight="700" font-size="${labelFs(label)}"${label.length >= 3 ? ' letter-spacing="-0.35"' : ""}>${esc(label)}</text>${xMark(fg, null, 0.8)}</svg>\n`;
}
function makeSilhouette(g, bg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><g fill="${g}">${GENERIC_FILE}</g>${xMark(g, bg)}</svg>\n`;
}
function makeFolder(open, fill, glyphFill, overlayInner) {
  const shape = open ? FOLDER_OPEN_SHAPE : FOLDER_SHAPE;
  const overlay = overlayInner ? `<g fill="${glyphFill}" transform="translate(7 9.4) scale(0.4)">${overlayInner}</g>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="${fill}" transform="scale(1.5)" d="${shape}"/>${overlay}${xMark(glyphFill, null, 0.8)}</svg>\n`;
}

// ── Generate ──
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const built = {};

for (const t of THEMES) {
  const dir = path.join(OUT, t.name.toLowerCase());
  fs.mkdirSync(dir, { recursive: true });
  const slot = (i) => {
    const raw = t.palette[i - 1];
    return { g: ensureContrast(raw, t.bg, 3), tile: ensureContrast(raw, t.bg, 1.35), tileFg: readableOn(ensureContrast(raw, t.bg, 1.35)) };
  };
  const files = {};

  for (const id of FILE_IDS) {
    const m = MAP[id] || ["badge", id.slice(0, 3).toUpperCase(), 5];
    if (m[0] === "logo") files[id] = makeLogo(m[1], slot(m[2]).g, t.bg);
    else if (m[0] === "silhouette") files[id] = makeSilhouette(slot(m[2]).g, t.bg);
    else files[id] = makeBadge(m[1], slot(m[2]).tile, slot(m[2]).tileFg);
  }

  const folderFill = (id) => {
    if (id === "folder" || id === "folder-open") return slot(3);
    const key = id.replace(/^folder-/, "");
    const ov = FOLDER_OVERLAY[key];
    return slot(ov ? ov[1] : 3);
  };

  files["folder"] = makeFolder(false, folderFill("folder").tile, readableOn(folderFill("folder").tile), null);
  files["folder-open"] = makeFolder(true, folderFill("folder-open").tile, readableOn(folderFill("folder-open").tile), null);

  for (const id of FOLDER_IDS) {
    const key = id.replace(/^folder-/, "");
    const ov = FOLDER_OVERLAY[key];
    const overlay = ov && LOGO[ov[0]] ? LOGO[ov[0]] : null;
    const s = folderFill(id);
    files[id] = makeFolder(false, s.tile, readableOn(s.tile), overlay);
  }

  for (const [id, svg] of Object.entries(files)) fs.writeFileSync(path.join(dir, `${id}.svg`), svg);

  const manifests = {
    showLanguageModeIcons: true,
    iconDefinitions: Object.fromEntries(Object.keys(files).map((id) => [id, { iconPath: `./${t.name.toLowerCase()}/${id}.svg` }])),
    file: "file",
    folder: "folder",
    folderExpanded: "folder-open",
    rootFolder: "folder",
    rootFolderExpanded: "folder-open",
    fileExtensions: baseManifest.fileExtensions,
    fileNames: baseManifest.fileNames,
    folderNames: baseManifest.folderNames,
    folderNamesExpanded: baseManifest.folderNames,
    languageIds: baseManifest.languageIds,
  };
  fs.writeFileSync(path.join(OUT, `${t.name.toLowerCase()}.json`), JSON.stringify(manifests, null, 2));

  built[t.name] = files;
  console.log(`${t.name}: ${Object.keys(files).length} SVGs`);
}

// ── Preview page ──
const b64 = (svg) => Buffer.from(svg).toString("base64");
const img = (svg, size) => `<img class="s${size}" src="data:image/svg+xml;base64,${b64(svg)}" loading="lazy">`;
const isLight = (t) => lum(t.bg) > 0.5;

const TREE = [
  { d: 0, icon: "folder", name: ".vscode" },
  { d: 0, icon: "folder-open", name: "src" },
  { d: 1, icon: "folder-components", name: "components" },
  { d: 2, icon: "tsx", name: "Button.tsx" },
  { d: 2, icon: "scss", name: "styles.scss" },
  { d: 1, icon: "ts", name: "index.ts" },
  { d: 1, icon: "vue", name: "App.vue" },
  { d: 0, icon: "folder-tests", name: "tests" },
  { d: 1, icon: "js", name: "app.test.js" },
  { d: 0, icon: "folder-assets", name: "assets" },
  { d: 1, icon: "svg", name: "logo.svg" },
  { d: 1, icon: "image", name: "photo.png" },
  { d: 0, icon: "folder-node", name: "node_modules" },
  { d: 0, icon: "packagejson", name: "package.json" },
  { d: 0, icon: "tsconfig", name: "tsconfig.json" },
  { d: 0, icon: "docker", name: "Dockerfile" },
  { d: 0, icon: "gitignore", name: ".gitignore" },
  { d: 0, icon: "readme", name: "README.md" },
];
const ZOOM = ["js", "ts", "python", "php", "html", "css", "docker", "json", "readme", "gitignore", "folder", "folder-open", "folder-node", "folder-tests"];

const sections = THEMES.map((t) => {
  const files = built[t.name];
  const order = [...FILE_IDS, "folder", "folder-open", ...FOLDER_IDS];
  const grid = order.map((id) => `<span class="cell" title="${id}">${img(files[id], 16)}</span>`).join("");
  const folders = ["folder", "folder-open", ...FOLDER_IDS].map((id) => `<span class="cell" title="${id}">${img(files[id], 16)}</span>`).join("");
  const zoom = ZOOM.map((id) => `<span class="cell zoom" title="${id}">${img(files[id], 32)}</span>`).join("");
  const tree = TREE.map((r) => `<div class="row" style="padding-left:${r.d * 14}px">${img(files[r.icon], 16)}<span>${esc(r.name)}</span></div>`).join("\n");
  const sw = t.palette.map((c) => `<span class="swatch" style="background:${c}" title="${c}"></span>`).join("");
  return `<section class="theme ${isLight(t) ? "light" : "dark"}">
  <header><h2>${esc(t.name)}</h2><div class="swatches">${sw}</div><span class="note">${isLight(t) ? "claro" : "oscuro"} · fondo ${t.bg} · ${Object.keys(files).length} íconos</span></header>
  <div class="cols">
    <div class="panel" style="background:${t.bg};color:${t.fg}">
      <div class="ptitle">Explorador</div>
      <div class="tree">${tree}</div>
      <div class="ptitle">Zoom 32px</div>
      <div class="grid zoomgrid">${zoom}</div>
    </div>
    <div class="right">
      <div class="ptitle">Archivos (16px, tamaño real)</div>
      <div class="grid">${grid}</div>
      <div class="ptitle">Carpetas (16px)</div>
      <div class="grid folders">${folders}</div>
    </div>
  </div>
</section>`;
}).join("\n");

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>xscriptor-themes · set tintado</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px 34px 70px; background: #14171c; color: #d7dae0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  h1 { margin: 0 0 6px; font-size: 21px; }
  .lead { color: #9aa1ab; font-size: 13px; max-width: 980px; line-height: 1.55; }
  .lead code { background: #23272e; padding: 1px 5px; border-radius: 4px; }
  .theme { border: 1px solid #2c313a; border-radius: 12px; padding: 16px 18px; margin: 22px 0; background: #1a1e24; }
  .theme header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .theme h2 { margin: 0; font-size: 15px; }
  .swatches { display: flex; gap: 4px; }
  .swatch { width: 15px; height: 15px; border-radius: 4px; border: 1px solid #ffffff22; }
  .note { color: #8b929c; font-size: 12px; margin-left: auto; }
  .cols { display: flex; gap: 18px; flex-wrap: wrap; }
  .panel { width: 290px; flex: none; border: 1px solid #ffffff1c; border-radius: 8px; padding: 10px 0 12px; font-size: 13px; }
  .ptitle { font-size: 10px; text-transform: uppercase; letter-spacing: .6px; opacity: .5; padding: 6px 12px; }
  .tree .row { display: flex; align-items: center; gap: 6px; padding: 1.5px 12px; line-height: 18px; }
  .right { flex: 1; min-width: 480px; }
  .grid { display: flex; flex-wrap: wrap; gap: 2px; padding: 4px 0 10px; }
  .cell { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 6px; }
  .cell:hover { background: #ffffff14; }
  .folders .cell { width: 30px; }
  .zoomgrid { gap: 6px; }
  .zoomgrid .cell { width: 40px; height: 40px; background: #ffffff10; }
  img.s16 { width: 16px; height: 16px; display: block; }
  img.s32 { width: 32px; height: 32px; display: block; }
  footer { color: #7d848e; font-size: 12px; max-width: 980px; line-height: 1.6; }
</style></head>
<body>
<h1>xscriptor-themes · set tintado completo (staging)</h1>
<p class="lead">
  Generado por <code>labs/xscriptor-themes/scripts/generate-tinted-icons.mjs</code> con las paletas de <code>colors.md</code>.
  <b>Logos reales tintados</b> con el color de cada tema (ajustado por contraste contra su fondo); los tipos sin logo usan badge
  tonalizado con las mismas reglas; carpetas = forma tintada + overlay del logo de su categoría + variante abierta.
  La "x" de marca va integrada en las tres formas${NO_X ? " (desactivada en esta corrida)" : ""}.
  Berlin y London se mantienen monocromos por su paleta. Las imágenes son los SVG reales que se copiarían a <code>icons/&lt;tema&gt;/</code>.
</p>
${sections}
<footer>Simple Icons (CC0) para logos; Bootstrap Icons (MIT) para carpetas. Los logotipos son marcas de sus titulares, usados para identificar tipo de archivo.</footer>
</body></html>`;

fs.writeFileSync(path.join(STAGE, "index.html"), html);
console.log(`\nPreview: ${path.join(STAGE, "index.html")}`);
console.log(`SVGs: ${Object.values(built).reduce((a, f) => a + Object.keys(f).length, 0)} en ${OUT}`);
