// 宝具动画分支断言（文件方式，避免 shell 转义）
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
  T("npMedia(Saber) 有视频", ev('npMedia("Saber")') === "np-saber.mp4");
  T("npMedia(Archer) 回落 null", ev('npMedia("Archer")') === null);
  T("视频文件存在", fs.existsSync(path.join(__dirname, "..", "art", "np-saber.mp4")));
  ev('G = {turn:1,day:1,phase:"夜",location:"岁星",convId:"t",master:null,servant:{className:"Saber",np:"誓约胜利之剑",trueName:"甲"},masterHp:100,masterMana:100,servantHp:100,servantMana:100,commandSpells:3,scene:"explore",battle:null,roster:[],intel:[],clues:[],ending:null,servantsLeft:8,history:[]};');
  ev('G._options=[]; document.getElementById("log").innerHTML="";');
  ev('G._art="np"; renderTurn("叙事", "explore", "岁星")');
  const h = ev('document.getElementById("log").innerHTML');
  T("Saber 宝具播视频", h.includes('<video src="art/np-saber.mp4"') && h.includes("autoplay") && h.includes("loop"), h.slice(-200));
  T("宝具标签仍显示", h.includes("宝具解放"));
  ev('G.servant.className="Archer"; G._art="np"; renderTurn("叙事", "explore", "岁星")');
  const h2 = ev('document.getElementById("log").innerHTML');
  T("Archer 宝具回落图片", h2.includes("cls-archer.jpg") && !h2.includes("<video"), h2.slice(-200));
  console.log("OK", ok, "FAIL", fail);
  process.exit(fail ? 1 : 0);
}, 80);
