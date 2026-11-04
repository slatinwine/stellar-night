// 幂等裁剪：仅当高度 >1000 时裁掉底部 70px 水印
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "art");
(async () => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".jpg") && !f.startsWith("__tmp"));
  for (const f of files) {
    const p = path.join(dir, f);
    const meta = await sharp(p).metadata();
    if (meta.height <= 1000) { console.log(f, meta.width + "x" + meta.height, "SKIP"); continue; }
    const tmp = path.join(dir, "__tmp_" + f);
    await sharp(p)
      .extract({ left: 0, top: 0, width: meta.width, height: meta.height - 70 })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(tmp);
    fs.unlinkSync(p);
    fs.renameSync(tmp, p);
    console.log(f, meta.width + "x" + (meta.height - 70), Math.round(fs.statSync(p).size / 1024) + "KB");
  }
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
