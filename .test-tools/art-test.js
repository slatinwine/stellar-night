/* 插画包专项测试：映射 / 钳制 / trueEnding 持久化 / 宝具横幅渲染 / 素材存在性 */
const path = require("path");
const fs = require("fs");
const JSDOM_PATH = "C:/Users/Z/WorkBuddy/2026-10-31-08-52-39/drifting-classroom/.build-tools/node_modules/jsdom";
const { JSDOM } = require(JSDOM_PATH);

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

let pass = 0, fail = 0;
function T(name, cond, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra ? " | " + extra : "")); }
}

const dom = new JSDOM(html, {
  url: "http://localhost/index.html?mock=1",
  runScripts: "dangerously",
  beforeParse(window) {
    window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} }));
  },
  pretendToBeVisual: true,
});
const { window } = dom;
const doc = window.document;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ev = (s) => window.eval(s);

(async () => {
  await sleep(50);

  console.log("== A. 素材存在性 ==");
  const artDir = path.join(__dirname, "..", "art");
  const files = fs.readdirSync(artDir);
  T("13 张素材齐全", files.length === 13, files.join(","));
  ["title.jpg","summon.jpg","true-ending.jpg","ending.jpg","cls-generic.jpg"].forEach(f =>
    T("存在 " + f, files.includes(f)));
  const refs = [...html.matchAll(/art\/([a-z-]+\.jpg)/g)].map(m => m[1]);
  const missing = [...new Set(refs)].filter(f => !files.includes(f));
  T("HTML 引用的插画无缺失", missing.length === 0, missing.join(","));

  console.log("== B. 职阶映射 ==");
  T("Saber → cls-saber.jpg", ev('artForClass("Saber")') === "cls-saber.jpg");
  T("Foreigner → cls-foreigner.jpg", ev('artForClass("Foreigner")') === "cls-foreigner.jpg");
  T("未知职阶 → cls-generic.jpg", ev('artForClass("Beast")') === "cls-generic.jpg");
  T("非法输入 → cls-generic.jpg", ev('artForClass(undefined)') === "cls-generic.jpg");

  console.log("== C. art 字段钳制 ==");
  const base = ev("freshGame()");
  base.servant = { className: "Saber", trueName: "试作剑士", np: "誓约胜利之剑" };
  const gWith = ev("clampState(" + JSON.stringify(base) + ', {"art":"np","state":{}})');
  T("art:np 被接受", gWith._art === "np", String(gWith._art));
  const gHack = ev("clampState(" + JSON.stringify(base) + ', {"art":"hack","state":{}})');
  T("art:hack 被拒绝", gHack._art === null, String(gHack._art));
  const noSv = ev("clampState(" + JSON.stringify(Object.assign(ev("freshGame()"), { servant: null })) + ', {"art":"np","state":{}})');
  T("无英灵时拒绝", noSv._art === null, String(noSv._art));

  console.log("== D. trueEnding 持久化（回归修复） ==");
  const gEnd = ev("clampState(" + JSON.stringify(base) + ', {"state":{},"ending":{"title":"真结局·星海","verdict":"裁决文本","wishGranted":true,"trueEnding":true}})');
  T("trueEnding 存入 g.ending", gEnd.ending && gEnd.ending.trueEnding === true, JSON.stringify(gEnd.ending));
  const gEnd2 = ev("clampState(" + JSON.stringify(base) + ', {"state":{},"ending":{"title":"普通","verdict":"裁决文本","wishGranted":true}})');
  T("缺省 false", gEnd2.ending && gEnd2.ending.trueEnding === false);

  console.log("== E. 宝具横幅端到端（mock） ==");
  doc.getElementById("btn-start").click();
  await sleep(80);
  doc.getElementById("btn-pick") && doc.getElementById("btn-pick").click();
  await sleep(120);
  // 手动注入宝具信号再渲染
  ev('G._art = "np"');
  ev('renderTurn("测试宝具叙事", "explore")');
  const banner = doc.querySelector("#log .art-banner img");
  T("宝具横幅出现", !!banner, doc.querySelector("#log").innerHTML.slice(0, 120));
  if (banner) {
    T("指向玩家职阶图", /cls-[a-z]+\.jpg$/.test(banner.getAttribute("src")), banner.getAttribute("src"));
    T("带「宝具解放」标", (doc.querySelector("#log .art-banner .art-tag") || {}).textContent.includes("宝具解放"));
  }
  T("渲染后 _art 清空", ev("G._art") === null, String(ev("G._art")));
  ev('renderTurn("无宝具回合")');
  T("普通回合无新横幅（_art 已清）", doc.querySelectorAll("#log .art-banner").length === 0);

  console.log("== F. 召唤页与标题页静态插画 ==");
  T("标题页背景层存在", !!doc.querySelector("#sc-title .title-bg"));

  console.log("\\n结果: " + pass + " 通过, " + fail + " 失败");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
