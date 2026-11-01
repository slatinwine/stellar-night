/* 调试：vm 提取主脚本，直接调用修复器 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const blocks = [];
const re = /<script>([\s\S]*?)<\/script>/g;
let mm;
while ((mm = re.exec(html))) blocks.push(mm[1]);
const src = blocks.find((b) => b.includes("tryParseGM"));
if (!src) { console.error("no main block"); process.exit(1); }

const stubs = `var document={getElementById:()=>({classList:{add(){},remove(){}},style:{},addEventListener(){},querySelectorAll:()=>[],innerHTML:"",textContent:"",onclick:null}),querySelectorAll:()=>[],addEventListener(){},createElement:()=>({classList:{add(){}}}),querySelectorAll:()=>[]};var window=this;var localStorage={getItem:()=>null,setItem(){}};var location={search:""};`;
const ctx = vm.createContext({});
vm.runInContext(stubs + src, ctx);
const f = (name) => ctx[name];

const curly = '{“narration”:“雾夜”,“state”:{“day”:3}}';
console.log("walk:", JSON.stringify(f("_walkNormalize")(curly)));
console.log("curly parse:", JSON.stringify(f("tryParseGM")(curly)));

const bracket = '{"narration":"x","state":{"day":5,"scene":"battle"}}],"battle":{"round":2}}';
console.log("bracket parse:", JSON.stringify(f("tryParseGM")(bracket)));

const trunc = '{"narration":"午夜钟声","state":{"day":6,"masterHp":8';
console.log("trunc parse:", JSON.stringify(f("tryParseGM")(trunc)));

const salvage = '垃圾前缀{"narration":"残响","state":{"scene":"battle"},"options":[{"label":"突进"}]}';
console.log("salvage:", JSON.stringify(f("salvageGM")(salvage)));

const nested = '{"narration":"带钩子","state":{"day":7,"scene":"battle"},"options":[{"label":"冲"},{"label":"守","cmd":true}],"battle":{"enemyClass":"Saber","enemyHp":80,"round":1}}';
console.log("normal+options:", JSON.stringify(f("tryParseGM")(nested)));
