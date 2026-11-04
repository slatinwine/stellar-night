// 生图模型变体测试：无 system / 带 size / content 数组
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const endpoint = html.match(/endpoint:\s*"([^"]+)"/)[1];
const key = html.match(/publishableKey:\s*"([^"]+)"/)[1];
const H = { "Content-Type": "application/json", "Origin": endpoint, "x-wb-webapp-access-key": key };
const MODEL = "hunyuan-image-alpha";
const PROMPT = "一位银发剑士在群星下释放宝具，光之剑贯穿夜空，史诗感动漫风格插画";

async function probe(name, body) {
  try {
    const res = await fetch(endpoint + "/.cloud/llm/chat/completions", { method: "POST", headers: H, body: JSON.stringify(body) });
    const t = await res.text();
    console.log("###", name, "=>", res.status);
    console.log(t.slice(0, 1000));
  } catch (e) {
    console.log("###", name, "ERROR", e.message);
  }
}

(async () => {
  await probe("user only", { model: MODEL, stream: true, messages: [{ role: "user", content: PROMPT }] });
  await probe("user only + size", { model: MODEL, stream: true, size: "1024x1024", messages: [{ role: "user", content: PROMPT }] });
})();
