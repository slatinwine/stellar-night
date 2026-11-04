// PNG → JPG 压缩 + 重命名（质量 80）
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "art");
const map = [
  ["遥远未来的银河系边缘殖民星夜景", "title.jpg"],
  ["华丽的召唤仪式魔法阵", "summon.jpg"],
  ["无垠的量子之海", "true-ending.jpg"],
  ["异星的黎明", "ending.jpg"],
  ["Saber", "cls-saber.jpg"],
  ["Archer", "cls-archer.jpg"],
  ["Lancer", "cls-lancer.jpg"],
  ["Rider", "cls-rider.jpg"],
  ["Caster", "cls-caster.jpg"],
  ["Assassin", "cls-assassin.jpg"],
  ["Berserker", "cls-berserker.jpg"],
  ["Foreigner", "cls-foreigner.jpg"],
  ["宝具解放的抽象意象", "cls-generic.jpg"]
];
(async () => {
  for (const [prefix, target] of map) {
    const src = fs.readdirSync(dir).find(f => f.startsWith(prefix) && f.endsWith(".png"));
    if (!src) { console.log("MISS:", prefix); continue; }
    await sharp(path.join(dir, src))
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(dir, target));
    const kb = Math.round(fs.statSync(path.join(dir, target)).size / 1024);
    console.log(target, "<-", kb, "KB");
  }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
