// 探测生图模型的正确调用方式：images 路由 / 非流式 / 不同参数
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const endpoint = html.match(/endpoint:\s*"([^"]+)"/)[1];
const key = html.match(/publishableKey:\s*"([^"]+)"/)[1];
const H = { "Content-Type": "application/json", "Origin": endpoint, "x-wb-webapp-access-key": key };
const MODEL = "hunyuan-image-alpha";
const PROMPT = "一位银发剑士在群星下释放宝具，光之剑贯穿夜空，史诗感动漫风格插画";

async function probe(name, url, body) {
  try {
    const res = await fetch(endpoint + url, { method: "POST", headers: H, body: JSON.stringify(body) });
    const t = await res.text();
    console.log("###", name, "=>", res.status);
    console.log(t.slice(0, 1200));
  } catch (e) {
    console.log("###", name, "ERROR", e.message);
  }
}

(async () => {
  await probe("images/generations", "/.cloud/llm/images/generations", { model: MODEL, prompt: PROMPT, n: 1, size: "1024x1024" });
  await probe("chat stream=false", "/.cloud/llm/chat/completions", { model: MODEL, stream: false, messages: [{ role: "user", content: PROMPT }] });
  await probe("chat prompt only", "/.cloud/llm/chat/completions", { model: MODEL, stream: true, prompt: PROMPT });
})();
