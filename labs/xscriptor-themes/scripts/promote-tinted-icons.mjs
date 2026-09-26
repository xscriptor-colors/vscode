import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const ICONS = path.join(ROOT, "themes/xscriptor-themes/icons");
const STAGE = path.join(ROOT, "labs/xscriptor-themes/tinted-preview/icons");

const THEMES = ["x", "madrid", "lahabana", "miami", "paris", "tokio", "oslo", "helsinki", "berlin", "london", "praha", "bogota"];
const MAP_KEYS = ["fileExtensions", "fileNames", "folderNames", "languageIds"];

for (const theme of THEMES) {
  const manifestPath = path.join(ICONS, `${theme}.json`);
  const dir = path.join(ICONS, theme);
  const old = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".svg")) fs.unlinkSync(path.join(dir, f));
  }
  const svgs = fs.readdirSync(path.join(STAGE, theme)).filter((f) => f.endsWith(".svg"));
  for (const f of svgs) fs.copyFileSync(path.join(STAGE, theme, f), path.join(dir, f));

  const manifest = {
    showLanguageModeIcons: true,
    iconDefinitions: Object.fromEntries(svgs.map((f) => [f.replace(/\.svg$/, ""), { iconPath: `./${theme}/${f}` }])),
    file: "file",
    folder: "folder",
    folderExpanded: "folder-open",
    rootFolder: "folder",
    rootFolderExpanded: "folder-open",
  };
  for (const k of MAP_KEYS) manifest[k] = old[k];
  manifest.folderNamesExpanded = old.folderNames;

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`${theme}: ${svgs.length} svg, ${Object.keys(manifest.iconDefinitions).length} defs`);
}

fs.rmSync(path.join(ICONS, "colors"), { recursive: true, force: true });
fs.rmSync(path.join(ICONS, "colors.json"), { force: true });
console.log("removed icons/colors/ and icons/colors.json");
