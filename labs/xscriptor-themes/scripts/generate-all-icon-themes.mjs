import fs from "fs";
import path from "path";

const BASE = path.join(process.cwd(), "themes/xscriptor-themes/icons");

// ── All 12 palettes from colors.md ──
const PALETTES = {
  x:        ["#fc618d","#7bd88f","#fce566","#fd9353","#948ae3","#5ad4e6"],
  madrid:   ["#990026","#007a28","#8a6408","#007a9e","#4d2699","#007a9e"],
  praha:    ["#FF5555","#B8E6A0","#FFE4A3","#BD93F9","#FF9AA2","#8BE9FD"],
  berlin:   ["#999999","#bbbbbb","#dddddd","#888888","#aaaaaa","#cccccc"],
  london:   ["#333333","#444444","#555555","#666666","#777777","#888888"],
  oslo:     ["#e05561","#8cc265","#d18f52","#4aa5f0","#c162de","#42b3c2"],
  helsinki: ["#1faa9e","#733d9a","#2e70ad","#b55a0f","#3e9d21","#bd4c3d"],
  lahabana: ["#fc618d","#7bd88f","#e5ff9d","#fd9353","#948ae3","#5ad4e6"],
  miami:    ["#FF4C8B","#7FFFD4","#FFD84C","#00FFA8","#D36CFF","#47CFFF"],
  paris:    ["#fc618d","#7bd88f","#fce566","#a3f3ff","#c4bdff","#a3f3ff"],
  bogota:   ["#fc618d","#7bd88f","#ffed89","#47e6ff","#ff9999","#47e6ff"],
};

// Skip tokio (same as x). Skip madrid + oslo (have original icon themes already)
const TO_GENERATE = ["praha","berlin","london","helsinki","lahabana","miami","paris","bogota"];
const DISPLAY = { lahabana:"Lahabana", tokio:"Tokio", praha:"Praha", bogota:"Bogota" };
const darkBg = "#0a0a0a";
const lightFg = "#f7f1ff";

function luminance(hex) {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const L = c => c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4);
  return 0.2126*L(r)+0.7152*L(g)+0.0722*L(b);
}
function contrast(a,b){ const L=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); return L; }
function textColor(bg){
  const bl=luminance(bg), d=contrast(luminance(darkBg),bl), l=contrast(luminance(lightFg),bl);
  if(d>=4.5) return darkBg; if(l>=4.5) return lightFg; return d>l?darkBg:lightFg;
}

function svg(bg, label) {
  const fg = textColor(bg), size = 24;
  let fs = label.length <= 2 ? 9 : label.length === 3 ? 7 : 5;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="16" height="16">
  <rect x="0" y="0" width="${size}" height="${size}" fill="${bg}" rx="3" ry="3"/>
  <text x="${size/2}" y="${size/2+fs*0.35}" text-anchor="middle" fill="${fg}" font-family="Arial, sans-serif" font-size="${fs}" font-weight="bold">${label}</text>
  <text x="${size-3}" y="7" text-anchor="middle" fill="${fg}" font-family="Arial, sans-serif" font-size="4" font-weight="bold" opacity="0.8">x</text>
</svg>\n`;
}

const LANGS = {
  js:"JS",ts:"TS",jsx:"JSX",tsx:"TSX",mdx:"MDX",css:"CSS",html:"H",json:"{}",
  python:"PY",markdown:"MD",php:"PHP",java:"JV",c:"C",cpp:"C++",go:"GO",rust:"RS",ruby:"RB",
  csharp:"C#",kotlin:"KT",swift:"SW",sql:"SQL",bash:"SH",dart:"DT",scala:"SC",perl:"PL",
  objectivec:"OC",r:"R",matlab:"M",haskell:"HS",elixir:"EX",yaml:"YML",docker:"D",
  powershell:"PS",lua:"LUA",cobol:"COB",vue:"VUE",svelte:"SV",astro:"AST",
  scss:"SCS",sass:"SAS",less:"LES",stylus:"STY",graphql:"GQL",prisma:"PR",
};
const SPECIALS = [
  ["gitignore","!"],["packagejson","{}"],["tsconfig","TS"],["readme","MD"],
  ["license","©"],["env","ENV"],["env-local","ENV"],["env-example","ENV"],["env-development","ENV"],
  ["editorconfig","EC"],["eslint","ES"],["prettier","PR"],["vite","V"],["webpack","WP"],
  ["nextjs","N"],["babel","B"],["changelog","CL"],["packagelock","{}"],["yarn","Y"],
  ["pnpm","PN"],["jsconfig","JS"],["csv","CSV"],["xml","XML"],["svg","SVG"],
  ["pdf","PDF"],["xlsx","XLS"],["docx","DOC"],["wasm","W"],["font","F"],
  ["key","🔑"],["conf","CFG"],["terminal",">_"],["file","F"],["image","IMG"],
];

const FILEEXTS = {
  jsx:"jsx",tsx:"tsx",mdx:"mdx",js:"js",mjs:"js",cjs:"js",ts:"ts",mts:"ts",cts:"ts",
  css:"css",html:"html",htm:"html",json:"json",jsonl:"json",jsonc:"json",
  py:"python",pyw:"python",md:"markdown",markdown:"markdown",
  php:"php",phtml:"php",java:"java",class:"java",c:"c",h:"c",
  cpp:"cpp",cc:"cpp",cxx:"cpp",hpp:"cpp",hxx:"cpp",go:"go",rs:"rust",rb:"ruby",
  cs:"csharp",kt:"kotlin",kts:"kotlin",swift:"swift",sql:"sql",
  sh:"bash",bash:"bash",zsh:"bash",fish:"bash",dart:"dart",
  scala:"scala",sc:"scala",pl:"perl",pm:"perl",m:"objectivec",mm:"objectivec",
  r:"r",mat:"matlab",hs:"haskell",lhs:"haskell",ex:"elixir",exs:"elixir",
  yml:"yaml",yaml:"yaml",toml:"conf",ini:"conf",cfg:"conf",conf:"conf",config:"conf",
  dockerfile:"docker",ps1:"powershell",psm1:"powershell",psd1:"powershell",
  lua:"lua",cob:"cobol",cbl:"cobol",cpy:"cobol",
  vue:"vue",svelte:"svelte",astro:"astro",
  scss:"scss",sass:"sass",less:"less",styl:"stylus",
  graphql:"graphql",gql:"graphql",prisma:"prisma",
  png:"image",jpg:"image",jpeg:"image",gif:"image",
  svg:"svg",webp:"image",bmp:"image",ico:"image",
  pdf:"pdf",csv:"csv",xml:"xml",xlsx:"xlsx",xls:"xlsx",
  docx:"docx",doc:"docx",wasm:"wasm",
  ttf:"font",otf:"font",woff:"font",woff2:"font",
  pem:"key",der:"key",key:"key",cert:"key",pub:"key",
  txt:"markdown",rst:"markdown",adoc:"markdown",log:"markdown",env:"conf",
};

const FILENAMES = {
  ".gitignore":"gitignore","package.json":"packagejson","package-lock.json":"packagelock",
  "yarn.lock":"yarn","pnpm-lock.yaml":"pnpm","tsconfig.json":"tsconfig","jsconfig.json":"jsconfig",
  ".editorconfig":"editorconfig",".env":"env",".env.local":"env-local",".env.example":"env-example",
  ".env.development":"env-development","README.md":"readme","LICENSE":"license","CHANGELOG.md":"changelog",
  ".eslintrc.js":"eslint",".eslintrc.json":"eslint",".prettierrc":"prettier",
  "vite.config.js":"vite","vite.config.ts":"vite","webpack.config.js":"webpack","next.config.js":"nextjs",
  ".babelrc":"babel","index.html":"html","index.js":"js","index.ts":"ts",
  "Dockerfile":"docker","docker-compose.yml":"docker","docker-compose.yaml":"docker",".dockerignore":"docker",
};

const FOLDERNAMES = {
  src:"folder-src",source:"folder-src",sources:"folder-src",scripts:"folder-src",script:"folder-src",
  tests:"folder-tests",test:"folder-tests","__tests__":"folder-tests",
  docs:"folder-docs",doc:"folder-docs",documentation:"folder-docs",
  assets:"folder-assets",images:"folder-images",img:"folder-assets",
  icons:"folder-icons",icon:"folder-icon",
  config:"folder-config",conf:"folder-config",settings:"folder-config",
  node_modules:"folder-node",public:"folder-public",out:"folder-out",dist:"folder-dist",build:"folder-build",
  screenshots:"folder-screenshots",screenshot:"folder-screenshots",
  app:"folder-app",api:"folder-api",blog:"folder-blog",
  components:"folder-components",component:"folder-components",
  contact:"folder-contact",contacto:"folder-contact",info:"folder-info",terms:"folder-terms",
  pages:"folder-pages",page:"folder-pages",
  lib:"folder-lib",libs:"folder-lib",library:"folder-lib",
  php:"folder-php",fonts:"folder-fonts",font:"folder-fonts",
  preview:"folder-preview",x:"folder-x",
  general:"folder-general",basics:"folder-basics",basic:"folder-basics",
  android:"folder-android",ios:"folder-ios",web:"folder-web",
  ".vscode":"folder-vscode",vscode:"folder-vscode",
  ".github":"folder-github",".git":"folder-git",".husky":"folder-husky",workflows:"folder-workflows",
  ".next":"folder-next",nuxt:"folder-nuxt",".svelte-kit":"folder-sveltekit",
  ".cache":"folder-cache",temp:"folder-temp",tmp:"folder-tmp",
  middleware:"folder-middleware",server:"folder-server",
  controllers:"folder-controllers",routes:"folder-routes",
  utils:"folder-utils",helpers:"folder-helpers",hooks:"folder-hooks",
  services:"folder-services",context:"folder-context",store:"folder-store",
  database:"folder-database",db:"folder-db",
  migrations:"folder-migrations",seeds:"folder-seeds",models:"folder-models",
  auth:"folder-auth",security:"folder-security",certs:"folder-certs",
  nemches:"folder-nemches",examples:"folder-examples",example:"folder-examples",
  target:"folder-target",".cargo":"folder-cargo",cargo:"folder-cargo",
  bin:"folder-bin",include:"folder-include",obj:"folder-obj",
  release:"folder-release",installer:"folder-installer",
  sandbox:"folder-sandbox",playground:"folder-playground",
  drafts:"folder-drafts",draft:"folder-drafts",
  infra:"folder-infra",infrastructure:"folder-infra",
  docker:"folder-docker",
  translations:"folder-translations",translation:"folder-translations",
  localization:"folder-localization",locale:"folder-localization",locales:"folder-localization",
  styles:"folder-styles",style:"folder-styles",css:"folder-css",
  modules:"folder-modules",module:"folder-modules",
  plugins:"folder-plugins",plugin:"folder-plugins",
  extensions:"folder-extensions",extension:"folder-extensions",
  packages:"folder-packages",package:"folder-packages",
  dev:"folder-dev",".devcontainer":"folder-devcontainer",devcontainer:"folder-devcontainer",
  gnome:"folder-gnome",kitty:"folder-kitty",
  terminal:"folder-terminal",konsole:"folder-konsole",powershell:"folder-powershell",
  mods:"folder-mods",mod:"folder-mods",
  tools:"folder-utils",tool:"folder-utils",vendor:"folder-node",vendors:"folder-node",
  views:"folder-components",view:"folder-components",data:"folder-database",
  types:"folder-src",type:"folder-src",schemas:"folder-models",schema:"folder-models",
  events:"folder-services",event:"folder-services",jobs:"folder-services",
  mail:"folder-contact",notifications:"folder-info",notification:"folder-info",
  storage:"folder-database",logs:"folder-out",log:"folder-out",
  ".terraform":"folder-github",".kube":"folder-github",".ssh":"folder-security",
  ".aws":"folder-github",".azure":"folder-github",".gcloud":"folder-github",
  ".bundle":"folder-node",".gem":"folder-node",".pip":"folder-node",".venv":"folder-node",".tox":"folder-node",
  ".mypy_cache":"folder-cache",".pytest_cache":"folder-cache",".ruff_cache":"folder-cache",
  ".angular":"folder-config",".expo":"folder-config",".expo-shared":"folder-config",".metro":"folder-config",
  ".svn":"folder-git",".hg":"folder-git",".bzr":"folder-git",
  ".npm":"folder-node",".nvm":"folder-node",".pnpm":"folder-node",".yarn":"folder-node",
  ".rush":"folder-node",".lerna":"folder-node",
  ".envs":"folder-config",".ebextensions":"folder-github",".elasticbeanstalk":"folder-github",".platform":"folder-github",
  ".circleci":"folder-github",".travis":"folder-github",".jenkins":"folder-github",".drone":"folder-github",".semaphore":"folder-github",
  ".bitbucket":"folder-github",".gitlab":"folder-github",".devops":"folder-github",
  ".vscode-test":"folder-vscode",
  ".cursor":"folder-vscode",".windsurf":"folder-vscode",".zed":"folder-vscode",
  ".continue":"folder-vscode",".aider":"folder-vscode",".cline":"folder-vscode",
  ".opencode":"folder-vscode",".agents":"folder-vscode",".roo":"folder-vscode",
  ".gemini":"folder-vscode",".copilot":"folder-vscode",".copilot-ut":"folder-vscode",
  ".codex":"folder-vscode",".tabby":"folder-vscode",".codium":"folder-vscode",
  ".qoder":"folder-vscode",".pearai":"folder-vscode",".void":"folder-vscode",
  ".augment":"folder-vscode",".sourcegraph":"folder-vscode",".supermaven":"folder-vscode",".avante":"folder-vscode",
  ".storybook":"folder-config",".changeset":"folder-config",".turbo":"folder-build",".nx":"folder-build",
  ".eslintcache":"folder-cache",
  ".pnpm-store":"folder-github",".yarnrc":"folder-github",".npmrc":"folder-github",
  ".envrc":"folder-github",".direnv":"folder-github",
  ".cmake":"folder-github",".gradle":"folder-github",".mvn":"folder-github",
  ".pulumi":"folder-github",".cdk":"folder-github",".cdktf":"folder-github",
  ".serverless":"folder-github",".sam":"folder-github",".chalice":"folder-github",
  ".netlify":"folder-github",".vercel":"folder-github",".firebase":"folder-github",
  ".supabase":"folder-github",".planetscale":"folder-github",
  ".dvc":"folder-github",".mlflow":"folder-github",".wandb":"folder-github",
  ".jupyter":"folder-github",".ipynb_checkpoints":"folder-github",
  ".streamlit":"folder-github",".gradio":"folder-github",
  ".openapi":"folder-github",".redoc":"folder-github",
};

const LANGIDS = {
  javascript:"js",typescript:"ts",javascriptreact:"jsx",typescriptreact:"tsx",mdx:"mdx",
  css:"css",scss:"scss",sass:"sass",less:"less",stylus:"stylus",
  html:"html",json:"json",jsonc:"json",python:"python",markdown:"markdown",
  php:"php",java:"java",c:"c",cpp:"cpp",go:"go",rust:"rust",ruby:"ruby",
  csharp:"csharp",kotlin:"kotlin",swift:"swift",sql:"sql",shellscript:"bash",
  dart:"dart",scala:"scala",perl:"perl",r:"r","objective-c":"objectivec",
  matlab:"matlab",haskell:"haskell",elixir:"elixir",yaml:"yaml",xml:"xml",csv:"csv",
  dockerfile:"docker",dockercompose:"docker",powershell:"powershell",lua:"lua",cobol:"cobol",
  vue:"vue",svelte:"svelte",astro:"astro",graphql:"graphql",prisma:"prisma",
};

// ── Step 0: Copy folder SVGs from colors/ as base ──
const SRC_FOLDERS = path.join(BASE, "colors");
const folderFiles = fs.readdirSync(SRC_FOLDERS).filter(f => f.startsWith("folder-") && f.endsWith(".svg"));

console.log("Generating palette-based icon themes...\n");
let generated = 0;

for (const name of TO_GENERATE) {
  const palette = PALETTES[name];
  const dir = path.join(BASE, name);
  fs.mkdirSync(dir, { recursive: true });

  // Copy folder SVGs
  for (const f of folderFiles) {
    fs.copyFileSync(path.join(SRC_FOLDERS, f), path.join(dir, f));
  }

  // Cycle palette colors for language + special SVGs
  let ci = 0;
  function nextBg() { const c = palette[ci % palette.length]; ci++; return c; }

  // Languages
  for (const [id, label] of Object.entries(LANGS)) {
    fs.writeFileSync(path.join(dir, id + ".svg"), svg(nextBg(), label));
  }

  // Specials
  for (const [id, label] of SPECIALS) {
    fs.writeFileSync(path.join(dir, id + ".svg"), svg(nextBg(), label));
  }

  // Copy generic file/folder if missing
  for (const f of ["folder.svg","file.svg"]) {
    if (!fs.existsSync(path.join(dir, f))) {
      fs.copyFileSync(path.join(SRC_FOLDERS, f), path.join(dir, f));
    }
  }

  // Build manifest
  const svgFiles = fs.readdirSync(dir).filter(f => f.endsWith(".svg")).map(f => f.replace(".svg",""));
  const iconDefinitions = {};
  for (const id of svgFiles) {
    iconDefinitions[id] = { iconPath: `./${name}/${id}.svg` };
  }

  const manifest = {
    showLanguageModeIcons: true,
    iconDefinitions,
    file: "file",
    folder: "folder",
    folderExpanded: "folder",
    rootFolder: "folder",
    rootFolderExpanded: "folder",
    fileExtensions: FILEEXTS,
    fileNames: FILENAMES,
    folderNames: FOLDERNAMES,
    folderNamesExpanded: FOLDERNAMES,
    languageIds: LANGIDS,
  };

  fs.writeFileSync(path.join(BASE, name + ".json"), JSON.stringify(manifest, null, 2));

  generated++;
  const label = DISPLAY[name] || name.charAt(0).toUpperCase() + name.slice(1);
  console.log(`  ${name}: ${svgFiles.length} SVGs, palette=${palette.length} colors → ${label}`);
}

// ── Step 1: Rename test → x ──
console.log("\nRenaming test → x...");
const testDir = path.join(BASE, "test");
const xDir = path.join(BASE, "x");

// Remove current x directory (language brand colors) and save as lang
if (fs.existsSync(xDir)) {
  const langDir = path.join(BASE, "lang");
  if (fs.existsSync(langDir)) {
    fs.rmSync(langDir, { recursive: true });
  }
  fs.renameSync(xDir, langDir);
  console.log("  icons/x/ → icons/lang/");
}

// Move test → x
if (fs.existsSync(testDir)) {
  fs.renameSync(testDir, xDir);
  console.log("  icons/test/ → icons/x/");
}

// Update test.json → x.json with iconPaths
const testManifestPath = path.join(BASE, "test.json");
const xManifestPath = path.join(BASE, "x.json");
if (fs.existsSync(testManifestPath)) {
  if (fs.existsSync(xManifestPath)) fs.unlinkSync(xManifestPath);
  const tm = JSON.parse(fs.readFileSync(testManifestPath, "utf8"));
  for (const [, def] of Object.entries(tm.iconDefinitions)) {
    if (def.iconPath) def.iconPath = def.iconPath.replace("./test/", "./x/");
  }
  fs.writeFileSync(xManifestPath, JSON.stringify(tm, null, 2));
  fs.unlinkSync(testManifestPath);
  console.log("  icons/test.json → icons/x.json (paths updated)");
}

// Create lang.json for lang directory
const langDir = path.join(BASE, "lang");
if (fs.existsSync(langDir)) {
  const langSvgs = fs.readdirSync(langDir).filter(f => f.endsWith(".svg")).map(f => f.replace(".svg",""));
  const langIcons = {};
  for (const id of langSvgs) {
    langIcons[id] = { iconPath: `./lang/${id}.svg` };
  }
  const langManifest = {
    showLanguageModeIcons: true,
    iconDefinitions: langIcons,
    file: "file",
    folder: "folder",
    folderExpanded: "folder",
    rootFolder: "folder",
    rootFolderExpanded: "folder",
    fileExtensions: FILEEXTS,
    fileNames: FILENAMES,
    folderNames: FOLDERNAMES,
    folderNamesExpanded: FOLDERNAMES,
    languageIds: LANGIDS,
  };
  fs.writeFileSync(path.join(BASE, "lang.json"), JSON.stringify(langManifest, null, 2));
  console.log("  icons/lang.json created");
}

// ── Step 2: Update package.json ──
const pkgPath = path.join(process.cwd(), "themes/xscriptor-themes/package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// Build new icon theme list: keep existing non-conflicting + add new palette-based
const existing = new Set(pkg.contributes.iconThemes.map(t => t.id));

// Update test-icons → x-icons
for (const t of pkg.contributes.iconThemes) {
  if (t.id === "test-icons") {
    t.id = "x-icons";
    t.label = "X";
    t.path = "./icons/x.json";
  }
}

// Add lang-icons if not present
if (!existing.has("lang-icons")) {
  pkg.contributes.iconThemes.push({
    id: "lang-icons",
    label: "Lang",
    path: "./icons/lang.json",
  });
}

// Add new palette-based themes
const addOrder = ["praha","berlin","london","helsinki","lahabana","miami","paris","bogota"];
for (const n of addOrder) {
  const id = `${n}-icons`;
  if (existing.has(id)) continue;
  const label = DISPLAY[n] || n.charAt(0).toUpperCase() + n.slice(1);
  pkg.contributes.iconThemes.push({ id, label, path: `./icons/${n}.json` });
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("\npackage.json updated:", pkg.contributes.iconThemes.map(t => t.label).join(", "));

console.log(`\nDone. Generated ${generated} palette-based icon themes + renamed test→x, x→lang.`);
