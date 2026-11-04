// 岁星场景组：PNG -> 裁掉底部水印(70px) -> loc-*.jpg (q80)
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const dir = path.join(__dirname, "..", "art");
const MAP = [
  ["穹顶地下城", "loc-dome.jpg"],
  ["环轨大桥", "loc-bridge.jpg"],
  ["遗迹发掘区", "loc-ruins.jpg"],
  ["星际港", "loc-port.jpg"],
  ["冷冻休眠区", "loc-cryo.jpg"],
  ["观星观察室", "loc-observatory.jpg"],
  ["轨道环廊", "loc-orbit.jpg"],
  ["岁星的抽象意象", "loc-generic.jpg"]
];
(async () => {
  const pngs = fs.readdirSync(dir).filter(f => f.endsWith(".png"));
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
    console.log(out, "<-", src.slice(0, 18) + "…", Math.round(fs.statSync(path.join(dir, out)).size / 1024) + "KB");
  }
})();
