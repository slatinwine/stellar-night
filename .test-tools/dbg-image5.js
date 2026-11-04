// 最后一批路由/参数猜测
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const endpoint = html.match(/endpoint:\s*"([^"]+)"/)[1];
const key = html.match(/publishableKey:\s*"([^"]+)"/)[1];
const H = { "Content-Type": "application/json", "Origin": endpoint, "x-wb-webapp-access-key": key };
const MODEL = "hunyuan-image-alpha";
const PROMPT = "银发剑士在群星下释放宝具，史诗动漫风插画";

async function probe(name, url, body) {
  try {
    const res = await fetch(endpoint + url, { method: "POST", headers: H, body: JSON.stringify(body) });
    const t = await res.text();
    console.log("###", name, "=>", res.status, "|", t.slice(0, 300));
  } catch (e) {
    console.log("###", name, "ERROR", e.message);
  }
}

(async () => {
  await probe("modalities image", "/.cloud/llm/chat/completions", { model: MODEL, stream: true, modalities: ["image", "text"], messages: [{ role: "user", content: PROMPT }] });
  await probe("images/generate", "/.cloud/llm/images/generate", { model: MODEL, prompt: PROMPT });
  await probe("image/generations", "/.cloud/llm/image/generations", { model: MODEL, prompt: PROMPT });
  await probe("content array", "/.cloud/llm/chat/completions", { model: MODEL, stream: true, messages: [{ role: "user", content: [{ type: "text", text: PROMPT }] }] });
})();
