/* 圣杯战争 · jsdom 端到端 + JSON 修复器测试
 * 用法: node grail-war/.test-tools/smoke-test.js
 */
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

(async () => {
  console.log("== 1. 脚本加载与标题页 ==");
  await sleep(50);
  const errBox = window.onerror;
  T("script 执行后标题页按钮存在", !!doc.getElementById("btn-start"));
  T("mock 标记写入版本条", (doc.getElementById("ver-mark").textContent || "").includes("mock"));

  console.log("== 2. JSON 修复器单测 ==");
  const ev = (s) => window.eval(s);
  T("正常 JSON", (() => { const o = ev('tryParseGM(\'{"narration":"hi","state":{"day":1}}\')'); return o && o.narration === "hi"; })());
  T("代码围栏剥离", (() => { const o = ev('tryParseGM("```json\\n{\\"narration\\":\\"a\\"}\\n```")'); return o && o.narration === "a"; })());
  T("单引号 JSON", (() => { const o = ev("tryParseGM(\"{'narration':'好','state':{'day':2,'scene':'battle'}}\")"); return o && o.narration === "好" && o.state.day === 2; })());
  T("弯引号 JSON", (() => { const o = ev('tryParseGM("{“narration”:“雾夜”,“state”:{“day”:3}}")'); return o && o.narration === "雾夜"; })());
  T("单引号内含双引号", (() => { const o = ev("tryParseGM(\"{'narration':'他说“圣杯”为真','state':{'day':4}}\")"); return o && o.narration.includes("圣杯"); })());
  T("括号不配平（state 后多 ]）", (() => { const o = ev('tryParseGM(\'{"narration":"x","state":{"day":5,"scene":"battle"}}],"battle":{"round":2}}\')'); return o && o.state && o.state.day === 5; })());
  T("截断 JSON 挽救", (() => { const o = ev(`tryParseGM('{"narration":"午夜钟声","state":{"day":6,"masterHp":8')`); return o && o.narration.includes("午夜"); })());
  T("字段打捞 salvageGM", (() => { const o = ev(`salvageGM('垃圾前缀{"narration":"残响","state":{"scene":"battle"},"options":[{"label":"突进"}]}')`); return o && o.narration === "残响" && o.state.scene === "battle" && o.options.length === 1; })());
  T("全失败返回 null（不抛异常）", (() => { const o = ev('tryParseGM("完全不是JSON的一段话，连大括号都没有")'); return o === null; })());

  console.log("== 3. 状态钳制单测 ==");
  const g0 = ev("freshGame()");
  const clamp = {
    clue:{id:"C1", text:"遗迹基座刻着不属于任何已知文明的坐标阵列"},
    rosterUpdate:[{className:"Saber", trueName:"无名剑士", status:"alive"}],
    unlockedIntel:"遗迹深处有布线痕迹"
  };
  const cl2 = ev("clampState(" + JSON.stringify(Object.assign({}, g0, { turn: 0, day: 1, phase: "夜", masterHp: 100, servantHp: 100, masterMana: 100, servantMana: 100, intel: [], clues: [], roster: [{ className: "Saber", status: "alive" }] })) + ", " + JSON.stringify(clamp) + ")");
  T("线索收录（C1）", cl2.clues.length === 1 && cl2.clues[0].id === "C1", JSON.stringify(cl2.clues));
  T("线索去重", (() => { const dup = ev("clampState(" + JSON.stringify(cl2) + ", " + JSON.stringify({clue:{id:"C1", text:"重复"}}) + ")"); return dup.clues.length === 1; })());
  const rawClamp = '{"state":{"day":2,"phase":"傍晚","location":"大桥","masterHp":-9,"servantHp":999,"scene":"battle"},"battle":{"enemyClass":"Archer","enemyHp":60,"round":0},"rosterUpdate":[{"className":"Archer","trueName":"试作弓兵","status":"dead"}],"unlockedIntel":"弓兵据点在大桥"}';
  const cl = ev("clampState(" + JSON.stringify(Object.assign({}, g0, { turn: 0, day: 1, phase: "夜", masterHp: 100, servantHp: 100, masterMana: 100, servantMana: 100, intel: [], roster: [{ className: "Saber", status: "alive" }, { className: "Archer", status: "alive" }] })) + ", tryParseGM(" + JSON.stringify(rawClamp) + "))");
  T("hp 下限钳到 0", cl.masterHp === 0, String(cl.masterHp));
  T("hp 上限钳到 100", cl.servantHp === 100, String(cl.servantHp));
  T("时段别名归一（傍晚→黄昏）", cl.phase === "黄昏", cl.phase);
  T("名册死亡结算", cl.roster.find((r) => r.className === "Archer").status === "dead");
  T("真名揭露", cl.roster.find((r) => r.className === "Archer").trueName === "试作弓兵");
  T("情报解锁", cl.intel.includes("弓兵据点在大桥"));
  T("战斗信息钳制（round≥1）", cl.battle && cl.battle.round === 1 && cl.battle.enemyHp === 60);
  T("scene 非法值拒绝", (() => { const g = ev("freshGame()"); const c = ev('clampState(' + JSON.stringify(g) + ', \'{"state":{"scene":"hack"}}\')'); return c.scene !== "hack"; })());

  console.log("== 4. mock 端到端：开始战争 → 御主/英灵单抽 ==");
  doc.getElementById("btn-start").click();
  await sleep(80);
  T("抽取页显示御主面板", doc.querySelector("#draw-body .panel") !== null);
  const cards = doc.querySelectorAll("#draw-body .card");
  T("单张英灵卡", cards.length === 1, String(cards.length));
  T("御主姓名存在", (doc.querySelector("#draw-body .kv span") || {}).textContent !== undefined);
  T("缔结契约按钮存在", !!doc.getElementById("btn-pick"));
  T("重新召唤按钮存在", !!doc.getElementById("btn-redraw"));

  console.log("== 5. 缔结契约 → 开局回合 ==");
  doc.getElementById("btn-pick").click();
  await sleep(120);
  T("进入游戏屏", doc.getElementById("sc-game").classList.contains("on"));
  const narr1 = doc.querySelector("#log .narration");
  T("回合 1 叙事渲染", narr1 !== null && narr1.textContent.includes("岁星"), narr1 && narr1.textContent.slice(0, 30));
  T("真相碎片面板出现", (doc.getElementById("log").textContent || "").includes("真相碎片（1/6）"));
  T("状态栏御主 HP", (doc.getElementById("statusbar").textContent || "").includes("御主 HP"));
  T("状态栏令咒", (doc.getElementById("statusbar").textContent || "").includes("令咒"));
  const opts1 = doc.querySelectorAll("#opts .opt");
  T("选项渲染 ≥3", opts1.length >= 3, String(opts1.length));
  T("自由行动输入框存在", !!doc.getElementById("custom-input"));

  console.log("== 6. 第二回合：遭遇战 ==");
  doc.querySelector("#opts .opt").click();
  await sleep(120);
  const narr2 = doc.querySelector("#log .narration");
  T("战斗叙事渲染", narr2 !== null && narr2.textContent.includes("遭遇战"));
  T("battle 面板进入状态", (() => { const w = window.eval("G"); return w.scene === "battle" && w.battle && w.battle.enemyClass === "Archer"; })());
  const cmdOpt = Array.from(doc.querySelectorAll("#opts .opt.cmd"));
  T("令咒选项存在", cmdOpt.length >= 1);
  if (cmdOpt.length) {
    cmdOpt[0].click();
    await sleep(120);
    const spells = doc.querySelectorAll("#statusbar .spells .off");
    T("令咒消耗一划（2 亮 1 灭）", spells.length === 1, String(spells.length));
  }

  console.log("== 7. 存档 ==");
  doc.getElementById("btn-save").click();
  await sleep(30);
  T("存档模态打开", doc.getElementById("md-save").classList.contains("on"));
  const saves = doc.querySelectorAll("#save-slots [data-save]");
  T("3 个手动槽", saves.length === 3);
  saves[0].click();
  await sleep(30);
  T("手动槽写入", !!window.localStorage.getItem("gw_save_1"));
  doc.getElementById("btn-save-close").click();
  T("自动存档存在", !!window.localStorage.getItem("gw_save_auto"));

  console.log("\n结果: " + pass + " 通过, " + fail + " 失败");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("测试崩溃:", e); process.exit(1); });
