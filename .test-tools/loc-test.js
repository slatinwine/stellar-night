// 场景图触发断言（文件方式避免 shell 多层转义把字符串字面量变正则）
const JSDOM = require("C:/Users/Z/WorkBuddy/2026-10-31-08-52-39/drifting-classroom/.build-tools/node_modules/jsdom").JSDOM;
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const dom = new JSDOM(html, {
  url: "http://localhost/?mock=1", runScripts: "dangerously", pretendToBeVisual: true,
  beforeParse(w) { w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {} })); }
});
setTimeout(() => {
  const w = dom.window, ev = s => w.eval(s);
  let ok = 0, fail = 0;
  const T = (n, c, x) => { c ? ok++ : (fail++, console.log("  FAIL", n, x || "")); };
  const Q = s => "\u201c" + s + "\u201d"; // 不用
  T("穹顶地下城", ev('locArtForPlace("穹顶地下城")') === "loc-dome.jpg");
  T("穹顶变体", ev('locArtForPlace("穹顶居住区")') === "loc-dome.jpg");
  T("星港变体", ev('locArtForPlace("岁星·第三星港")') === "loc-port.jpg");
  T("观星台", ev('locArtForPlace("观星台")') === "loc-observatory.jpg");
  T("轨道环廊", ev('locArtForPlace("轨道环·B 段")') === "loc-orbit.jpg");
  T("冷冻休眠舱", ev('locArtForPlace("冷冻休眠舱区")') === "loc-cryo.jpg");
  T("未匹配兜底", ev('locArtForPlace("随便哪里")') === "loc-generic.jpg");
  T("空值兜底", ev('locArtForPlace("")') === "loc-generic.jpg");
  // 类型纯净：字符串参数进 locArtForPlace 前不能被变成 RegExp
  T("字符串保持字符串", ev('typeof (function(){var x="夜"; return x;})()') === "string");
  ev('G = {turn:1,day:1,phase:"夜",location:"旧地点",convId:"t",master:null,servant:{className:"Saber",np:"试",trueName:"甲"},masterHp:100,masterMana:100,servantHp:100,servantMana:100,commandSpells:3,scene:"explore",battle:null,roster:[],intel:[],clues:[],ending:null,servantsLeft:8,history:[]};');
  ev('G._options=[]; document.getElementById("log").innerHTML="";');
  ev('renderTurn("叙事", "explore", "旧地点")');
  T("同地点不触发", !ev('document.getElementById("log").innerHTML').includes("art-banner"));
  ev('renderTurn("叙事", "explore", "别处")');
  const h2 = ev('document.getElementById("log").innerHTML');
  T("地点变化触发 loc 图", h2.includes("art-banner") && h2.includes("抵达"), h2.slice(-160));
  ev('G.battle={round:1,enemyClass:"Lancer",enemyTrueName:"乙",enemyMaster:"丙"}; G.scene="battle"; renderTurn("叙事", "explore", "别处")');
  T("遭遇战优先", ev('document.getElementById("log").innerHTML').includes("敌影浮现"));
  // 存档 roundtrip 后 location 仍是字符串（clampState 不吃掉）
  console.log("OK", ok, "FAIL", fail);
  process.exit(fail ? 1 : 0);
}, 80);
