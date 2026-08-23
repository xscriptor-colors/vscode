import fs from "fs";
import path from "path";

const BASE = path.join(process.cwd(), "themes/xscriptor-themes/icons");
const ROOT = process.cwd();

// ── Palettes ──
const P = {
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

const GEN_ALL = ["x","madrid","oslo","praha","berlin","london","helsinki","lahabana","miami","paris","bogota"];
const DISPLAY = { lahabana:"Lahabana", praha:"Praha", bogota:"Bogota", oslo:"Oslo" };

function lum(h){ const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255; const L=c=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4); return 0.2126*L(r)+0.7152*L(g)+0.0722*L(b); }
function cr(a,b){ return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05); }
function fg(bg){ const bl=lum(bg),d=cr(lum("#0a0a0a"),bl),l=cr(lum("#f7f1ff"),bl); if(d>=4.5)return"#0a0a0a"; if(l>=4.5)return"#f7f1ff"; return d>l?"#0a0a0a":"#f7f1ff"; }

function langSvg(bg,l,sz=24){ const t=fg(bg); let fs=l.length<=2?9:l.length===3?7:5; return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sz} ${sz}" width="16" height="16">\n  <rect x="0" y="0" width="${sz}" height="${sz}" fill="${bg}" rx="3" ry="3"/>\n  <text x="${sz/2}" y="${sz/2+fs*0.35}" text-anchor="middle" fill="${t}" font-family="Arial, sans-serif" font-size="${fs}" font-weight="bold">${l}</text>\n  <text x="${sz-3}" y="7" text-anchor="middle" fill="${t}" font-family="Arial, sans-serif" font-size="4" font-weight="bold" opacity="0.8">x</text>\n</svg>\n`; }
function termSvg(bg){ const t=fg(bg); return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">\n  <rect x="0" y="0" width="24" height="24" fill="${bg}" rx="3" ry="3"/>\n  <text x="4" y="16" fill="${t}" font-family="monospace" font-size="9" font-weight="bold">>_</text>\n  <text x="21" y="7" text-anchor="middle" fill="${t}" font-family="Arial, sans-serif" font-size="4" font-weight="bold" opacity="0.8">x</text>\n</svg>\n`; }
function folderTermSvg(bg){ const t=fg(bg); return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">\n  <path d="M2 6h20v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="${bg}"/>\n  <path d="M2 4a2 2 0 012-2h5l2 2h9a2 2 0 012 2v2H2V4z" fill="${bg}" opacity="0.7"/>\n  <text x="5" y="17" fill="${t}" font-family="monospace" font-size="7" font-weight="bold">>_</text>\n  <text x="21" y="7" text-anchor="middle" fill="${t}" font-family="Arial, sans-serif" font-size="4" font-weight="bold" opacity="0.8">x</text>\n</svg>\n`; }
function gsSvg(c){ return c.replace(/fill="(#[0-9A-Fa-f]{6})"/g,(_,h)=>{ const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16); const gy=Math.round(0.299*r+0.587*g+0.114*b).toString(16).padStart(2,"0"); return`fill="#${gy}${gy}${gy}"`; }); }

const LANGS={js:"JS",ts:"TS",jsx:"JSX",tsx:"TSX",mdx:"MDX",css:"CSS",html:"H",json:"{}",python:"PY",markdown:"MD",php:"PHP",java:"JV",c:"C",cpp:"C++",go:"GO",rust:"RS",ruby:"RB",csharp:"C#",kotlin:"KT",swift:"SW",sql:"SQL",bash:"SH",dart:"DT",scala:"SC",perl:"PL",objectivec:"OC",r:"R",matlab:"M",haskell:"HS",elixir:"EX",yaml:"YML",docker:"D",powershell:"PS",lua:"LUA",cobol:"COB",vue:"VUE",svelte:"SV",astro:"AST",scss:"SCS",sass:"SAS",less:"LES",stylus:"STY",graphql:"GQL",prisma:"PR"};
const SPECS=[["gitignore","!"],["packagejson","{}"],["tsconfig","TS"],["readme","MD"],["license","©"],["env","ENV"],["env-local","ENV"],["env-example","ENV"],["env-development","ENV"],["editorconfig","EC"],["eslint","ES"],["prettier","PR"],["vite","V"],["webpack","WP"],["nextjs","N"],["babel","B"],["changelog","CL"],["packagelock","{}"],["yarn","Y"],["pnpm","PN"],["jsconfig","JS"],["csv","CSV"],["xml","XML"],["svg","SVG"],["pdf","PDF"],["xlsx","XLS"],["docx","DOC"],["wasm","W"],["font","F"],["key","🔑"],["conf","CFG"],["file","F"],["image","IMG"]];
const FEXTS={jsx:"jsx",tsx:"tsx",mdx:"mdx",js:"js",mjs:"js",cjs:"js",ts:"ts",mts:"ts",cts:"ts",css:"css",html:"html",htm:"html",json:"json",jsonl:"json",jsonc:"json",py:"python",pyw:"python",md:"markdown",markdown:"markdown",php:"php",phtml:"php",java:"java",class:"java",c:"c",h:"c",cpp:"cpp",cc:"cpp",cxx:"cpp",hpp:"cpp",hxx:"cpp",go:"go",rs:"rust",rb:"ruby",cs:"csharp",kt:"kotlin",kts:"kotlin",swift:"swift",sql:"sql",sh:"terminal",bash:"bash",zsh:"bash",fish:"bash",dart:"dart",scala:"scala",sc:"scala",pl:"perl",pm:"perl",m:"objectivec",mm:"objectivec",r:"r",mat:"matlab",hs:"haskell",lhs:"haskell",ex:"elixir",exs:"elixir",yml:"yaml",yaml:"yaml",toml:"conf",ini:"conf",cfg:"conf",conf:"conf",config:"conf",dockerfile:"docker",ps1:"terminal",psm1:"powershell",psd1:"powershell",lua:"lua",cob:"cobol",cbl:"cobol",cpy:"cobol",vue:"vue",svelte:"svelte",astro:"astro",scss:"scss",sass:"sass",less:"less",styl:"stylus",graphql:"graphql",gql:"graphql",prisma:"prisma",png:"image",jpg:"image",jpeg:"image",gif:"image",svg:"svg",webp:"image",bmp:"image",ico:"image",pdf:"pdf",csv:"csv",xml:"xml",xlsx:"xlsx",xls:"xlsx",docx:"docx",doc:"docx",wasm:"wasm",ttf:"font",otf:"font",woff:"font",woff2:"font",pem:"key",der:"key",key:"key",cert:"key",pub:"key",txt:"markdown",rst:"markdown",adoc:"markdown",log:"markdown",env:"conf"};
const FNAMES={".gitignore":"gitignore","package.json":"packagejson","package-lock.json":"packagelock","yarn.lock":"yarn","pnpm-lock.yaml":"pnpm","tsconfig.json":"tsconfig","jsconfig.json":"jsconfig",".editorconfig":"editorconfig",".env":"env",".env.local":"env-local",".env.example":"env-example",".env.development":"env-development","README.md":"readme","LICENSE":"license","CHANGELOG.md":"changelog",".eslintrc.js":"eslint",".eslintrc.json":"eslint",".prettierrc":"prettier","vite.config.js":"vite","vite.config.ts":"vite","webpack.config.js":"webpack","next.config.js":"nextjs",".babelrc":"babel","index.html":"html","index.js":"js","index.ts":"ts","Dockerfile":"docker","docker-compose.yml":"docker","docker-compose.yaml":"docker",".dockerignore":"docker",".sh":"terminal",".ps1":"terminal"};
const FOLDERS={src:"folder-src",source:"folder-src",sources:"folder-src",scripts:"folder-terminal",script:"folder-terminal",tests:"folder-tests",test:"folder-tests","__tests__":"folder-tests",docs:"folder-docs",doc:"folder-docs",documentation:"folder-docs",assets:"folder-assets",images:"folder-images",img:"folder-assets",icons:"folder-icons",icon:"folder-icon",config:"folder-config",conf:"folder-config",settings:"folder-config",node_modules:"folder-node",public:"folder-public",out:"folder-out",dist:"folder-dist",build:"folder-build",screenshots:"folder-screenshots",screenshot:"folder-screenshots",app:"folder-app",api:"folder-api",blog:"folder-blog",components:"folder-components",component:"folder-components",contact:"folder-contact",contacto:"folder-contact",info:"folder-info",terms:"folder-terms",pages:"folder-pages",page:"folder-pages",lib:"folder-lib",libs:"folder-lib",library:"folder-lib",php:"folder-php",fonts:"folder-fonts",font:"folder-fonts",preview:"folder-preview",x:"folder-x",general:"folder-general",basics:"folder-basics",basic:"folder-basics",android:"folder-android",ios:"folder-ios",web:"folder-web",".vscode":"folder-vscode",vscode:"folder-vscode",".github":"folder-github",".git":"folder-git",".husky":"folder-husky",workflows:"folder-workflows",".next":"folder-next",nuxt:"folder-nuxt",".svelte-kit":"folder-sveltekit",".cache":"folder-cache",temp:"folder-temp",tmp:"folder-tmp",middleware:"folder-middleware",server:"folder-server",controllers:"folder-controllers",routes:"folder-routes",terminal:"folder-terminal",shell:"folder-terminal",console:"folder-terminal",utils:"folder-utils",helpers:"folder-helpers",hooks:"folder-hooks",services:"folder-services",context:"folder-context",store:"folder-store",database:"folder-database",db:"folder-db",migrations:"folder-migrations",seeds:"folder-seeds",models:"folder-models",auth:"folder-auth",security:"folder-security",certs:"folder-certs",nemches:"folder-nemches",examples:"folder-examples",example:"folder-examples",target:"folder-target",".cargo":"folder-cargo",cargo:"folder-cargo",bin:"folder-bin",include:"folder-include",obj:"folder-obj",release:"folder-release",installer:"folder-installer",sandbox:"folder-sandbox",playground:"folder-playground",drafts:"folder-drafts",draft:"folder-drafts",infra:"folder-infra",infrastructure:"folder-infra",docker:"folder-docker",translations:"folder-translations",translation:"folder-translations",localization:"folder-localization",locale:"folder-localization",locales:"folder-localization",styles:"folder-styles",style:"folder-styles",css:"folder-css",modules:"folder-modules",module:"folder-modules",plugins:"folder-plugins",plugin:"folder-plugins",extensions:"folder-extensions",extension:"folder-extensions",packages:"folder-packages",package:"folder-packages",dev:"folder-dev",".devcontainer":"folder-devcontainer",devcontainer:"folder-devcontainer",gnome:"folder-gnome",kitty:"folder-kitty",konsole:"folder-terminal",powershell:"folder-terminal",mods:"folder-mods",mod:"folder-mods",tools:"folder-utils",tool:"folder-utils",vendor:"folder-node",vendors:"folder-node",views:"folder-components",view:"folder-components",data:"folder-database",types:"folder-src",type:"folder-src",schemas:"folder-models",schema:"folder-models",events:"folder-services",event:"folder-services",jobs:"folder-services",mail:"folder-contact",notifications:"folder-info",notification:"folder-info",storage:"folder-database",logs:"folder-out",log:"folder-out",".terraform":"folder-github",".kube":"folder-github",".ssh":"folder-security",".aws":"folder-github",".azure":"folder-github",".gcloud":"folder-github",".bundle":"folder-node",".gem":"folder-node",".pip":"folder-node",".venv":"folder-node",".tox":"folder-node",".mypy_cache":"folder-cache",".pytest_cache":"folder-cache",".ruff_cache":"folder-cache",".angular":"folder-config",".expo":"folder-config",".expo-shared":"folder-config",".metro":"folder-config",".svn":"folder-git",".hg":"folder-git",".bzr":"folder-git",".npm":"folder-node",".nvm":"folder-node",".pnpm":"folder-node",".yarn":"folder-node",".rush":"folder-node",".lerna":"folder-node",".envs":"folder-config",".ebextensions":"folder-github",".elasticbeanstalk":"folder-github",".platform":"folder-github",".circleci":"folder-github",".travis":"folder-github",".jenkins":"folder-github",".drone":"folder-github",".semaphore":"folder-github",".bitbucket":"folder-github",".gitlab":"folder-github",".devops":"folder-github",".vscode-test":"folder-vscode",".cursor":"folder-vscode",".windsurf":"folder-vscode",".zed":"folder-vscode",".continue":"folder-vscode",".aider":"folder-vscode",".cline":"folder-vscode",".opencode":"folder-vscode",".agents":"folder-vscode",".roo":"folder-vscode",".gemini":"folder-vscode",".copilot":"folder-vscode",".copilot-ut":"folder-vscode",".codex":"folder-vscode",".tabby":"folder-vscode",".codium":"folder-vscode",".qoder":"folder-vscode",".pearai":"folder-vscode",".void":"folder-vscode",".augment":"folder-vscode",".sourcegraph":"folder-vscode",".supermaven":"folder-vscode",".avante":"folder-vscode",".storybook":"folder-config",".changeset":"folder-config",".turbo":"folder-build",".nx":"folder-build",".eslintcache":"folder-cache",".pnpm-store":"folder-github",".yarnrc":"folder-github",".npmrc":"folder-github",".envrc":"folder-github",".direnv":"folder-github",".cmake":"folder-github",".gradle":"folder-github",".mvn":"folder-github",".pulumi":"folder-github",".cdk":"folder-github",".cdktf":"folder-github",".serverless":"folder-github",".sam":"folder-github",".chalice":"folder-github",".netlify":"folder-github",".vercel":"folder-github",".firebase":"folder-github",".supabase":"folder-github",".planetscale":"folder-github",".dvc":"folder-github",".mlflow":"folder-github",".wandb":"folder-github",".jupyter":"folder-github",".ipynb_checkpoints":"folder-github",".streamlit":"folder-github",".gradio":"folder-github",".openapi":"folder-github",".redoc":"folder-github"};
const LIDS={javascript:"js",typescript:"ts",javascriptreact:"jsx",typescriptreact:"tsx",mdx:"mdx",css:"css",scss:"scss",sass:"sass",less:"less",stylus:"stylus",html:"html",json:"json",jsonc:"json",python:"python",markdown:"markdown",php:"php",java:"java",c:"c",cpp:"cpp",go:"go",rust:"rust",ruby:"ruby",csharp:"csharp",kotlin:"kotlin",swift:"swift",sql:"sql",shellscript:"bash",dart:"dart",scala:"scala",perl:"perl",r:"r","objective-c":"objectivec",matlab:"matlab",haskell:"haskell",elixir:"elixir",yaml:"yaml",xml:"xml",csv:"csv",dockerfile:"docker",dockercompose:"docker",powershell:"powershell",lua:"lua",cobol:"cobol",vue:"vue",svelte:"svelte",astro:"astro",graphql:"graphql",prisma:"prisma"};

// ── Step 1: Renames ──
console.log("1. Renames...");

function mv(o,n){ const od=path.join(BASE,o),nd=path.join(BASE,n); if(fs.existsSync(od)){ if(fs.existsSync(nd))fs.rmSync(nd,{recursive:true,force:true}); fs.renameSync(od,nd); } }
function mvJson(o,n,op,np){ const of=path.join(BASE,o+".json"),nf=path.join(BASE,n+".json"); if(fs.existsSync(of)){ if(fs.existsSync(nf))fs.unlinkSync(nf); const m=JSON.parse(fs.readFileSync(of,"utf8")); if(op&&np) for(const[,d] of Object.entries(m.iconDefinitions||{})) if(d.iconPath) d.iconPath=d.iconPath.replace(`./${op}/`,`./${np}/`); fs.writeFileSync(nf,JSON.stringify(m,null,2)); fs.unlinkSync(of); } }

// Order matters: save before overwriting
// 1. xoslo → old-oslo (safe, no conflict)
mv("xoslo","old-oslo"); mvJson("xoslo","old-oslo");
// 2. colors → old-x (save original X SVGs before overwriting)
mv("colors","old-x"); mvJson("colors","old-x");
// 3. lang → colors (language brand icons become new Colors)
mv("lang","colors"); mvJson("lang","colors");
console.log("   Done.");

// ── Step 2: Clean generated ──
console.log("\n2. Cleaning old generated...");
for (const n of ["x","madrid","oslo","praha","berlin","london","helsinki","lahabana","miami","paris","bogota"]) {
  const d=path.join(BASE,n); if(fs.existsSync(d)){fs.rmSync(d,{recursive:true,force:true});}
  const m=path.join(BASE,n+".json"); if(fs.existsSync(m))fs.unlinkSync(m);
}
console.log("   Done.");

// ── Step 3: Generate ──
console.log("\n3. Generating...");
const srcD = path.join(BASE,"old-x");
const sff = fs.existsSync(srcD) ? fs.readdirSync(srcD).filter(f=>f.startsWith("folder-")&&f.endsWith(".svg")) : [];
console.log(`   ${sff.length} source folder SVGs`);
let c=0;

for (const name of GEN_ALL) {
  const pal=P[name], dir=path.join(BASE,name);
  fs.mkdirSync(dir,{recursive:true});
  const gs=(name==="berlin"||name==="london");

  for (const f of sff) {
    const sp=path.join(srcD,f), dp=path.join(dir,f);
    if(!fs.existsSync(sp))continue;
    if(gs) fs.writeFileSync(dp,gsSvg(fs.readFileSync(sp,"utf8"))); else fs.copyFileSync(sp,dp);
  }

  let ci=0; function nb(){return pal[ci++%pal.length];}
  for(const[id,lb]of Object.entries(LANGS)) fs.writeFileSync(path.join(dir,id+".svg"),langSvg(nb(),lb));
  for(const[id,lb]of SPECS) fs.writeFileSync(path.join(dir,id+".svg"),langSvg(nb(),lb));
  fs.writeFileSync(path.join(dir,"terminal.svg"),termSvg(nb()));
  fs.writeFileSync(path.join(dir,"folder-terminal.svg"),folderTermSvg(nb()));

  for(const f of["folder.svg","file.svg"]){
    const dp=path.join(dir,f); if(!fs.existsSync(dp)){const sp=path.join(srcD,f); if(fs.existsSync(sp)){if(gs&&f==="folder.svg")fs.writeFileSync(dp,gsSvg(fs.readFileSync(sp,"utf8"))); else fs.copyFileSync(sp,dp);}}
  }

  const svgs=fs.readdirSync(dir).filter(f=>f.endsWith(".svg")).map(f=>f.replace(".svg",""));
  const idefs={}; for(const id of svgs)idefs[id]={iconPath:`./${name}/${id}.svg`};
  fs.writeFileSync(path.join(BASE,name+".json"),JSON.stringify({showLanguageModeIcons:true,iconDefinitions:idefs,file:"file",folder:"folder",folderExpanded:"folder",rootFolder:"folder",rootFolderExpanded:"folder",fileExtensions:FEXTS,fileNames:FNAMES,folderNames:FOLDERS,folderNamesExpanded:FOLDERS,languageIds:LIDS},null,2));
  c++;
  const lb=DISPLAY[name]||name.charAt(0).toUpperCase()+name.slice(1);
  console.log(`   ${name.padEnd(10)} → ${lb.padEnd(12)} ${svgs.length} SVGs${gs?' [GS]':''}`);
}

// ── Step 4: Update package.json ──
console.log("\n4. package.json...");
const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,"themes/xscriptor-themes/package.json"),"utf8"));

const R={
  "x-icons":{id:"old-x-icons",label:"Old X",path:"./icons/old-x.json"},
  "xoslo-icons":{id:"old-oslo-icons",label:"Old Oslo",path:"./icons/old-oslo.json"},
};
for(const t of pkg.contributes.iconThemes){
  if(R[t.id])Object.assign(t,R[t.id]);
}
pkg.contributes.iconThemes=pkg.contributes.iconThemes.filter(t=>!["lang-icons","test-icons"].includes(t.id));

const ex=new Set(pkg.contributes.iconThemes.map(t=>t.id));
for(const n of GEN_ALL){
  const id=`${n}-icons`;
  if(!ex.has(id)){ex.add(id); const lb=DISPLAY[n]||n.charAt(0).toUpperCase()+n.slice(1); pkg.contributes.iconThemes.push({id,label:lb,path:`./icons/${n}.json`});}
}

for(const t of pkg.contributes.iconThemes){
  const fp=path.join(ROOT,"themes/xscriptor-themes",t.path);
  if(!fs.existsSync(fp))console.log(`   WARN: missing ${t.path}`);
}
fs.writeFileSync(path.join(ROOT,"themes/xscriptor-themes/package.json"),JSON.stringify(pkg,null,2));
pkg.contributes.iconThemes.forEach(t=>console.log(`   ${t.label.padEnd(12)} → ${t.path}`));
console.log(`\nDone. ${c} themes generated.`);
