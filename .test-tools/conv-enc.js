// 遭遇对峙组：PNG -> 裁掉底部水印(70px) -> enc-*.jpg (q80)
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const dir = path.join(__dirname, "..", "art");
const MAP = [
  ["银甲剑士", "enc-saber.jpg"],
  ["敌方弓兵", "enc-archer.jpg"],
  ["敌方枪兵", "enc-lancer.jpg"],
  ["敌方骑士", "enc-rider.jpg"],
  ["敌方术师", "enc-caster.jpg"],
  ["敌方暗杀者", "enc-assassin.jpg"],
  ["敌方狂战士", "enc-berserker.jpg"],
  ["来自深空的异形", "enc-foreigner.jpg"],
  ["遭遇对峙的抽象意象", "enc-generic.jpg"]
];
(async () => {
  const pngs = fs.readdirSync(dir).filter(f => f.endsWith(".png") && f.startsWith("遭遇"));
  for (const [key, out] of MAP) {
    const src = pngs.find(f => f.includes(key));
    if (!src) { console.log("MISS:", key); continue; }
    const p = path.join(dir, src);
    const meta = await sharp(p).metadata();
    const cut = meta.height > 1000 ? 70 : 0;
    const tmp = p + ".tmp.jpg";
    await sharp(p)
      .extract({ left: 0, top: 0, width: meta.width, height: meta.height - cut })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, path.join(dir, out));
    fs.unlinkSync(p);
    const kb = Math.round(fs.statSync(path.join(dir, out)).size / 1024);
    console.log(out, "<-", src.slice(0, 20) + "…", kb + "KB");
  }
})();
