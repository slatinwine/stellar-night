// 实测云端生图模型 hunyuan-image-alpha 走 chat.completions 的返回形态
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const endpoint = html.match(/endpoint:\s*"([^"]+)"/)[1];
const key = html.match(/publishableKey:\s*"([^"]+)"/)[1];

async function tryCall(llmPath, model) {
  const res = await fetch(endpoint + llmPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": endpoint,
      "x-wb-webapp-access-key": key
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: "system", content: "You are an illustration engine." },
        { role: "user", content: "一位银发剑士在群星下释放宝具，光之剑贯穿夜空，史诗感，动漫风格插画" }
      ]
    })
  });
  console.log("=== PATH", llmPath, "MODEL", model, "=> status", res.status);
  const ct = res.headers.get("content-type") || "";
  console.log("content-type:", ct);
  const text = await res.text();
  console.log(text.slice(0, 2000));
  return { status: res.status, text };
}

(async () => {
  const model = "hunyuan-image-alpha";
  let r = await tryCall("/.cloud/llm/v1/chat/completions", model);
  if (r.status >= 400) r = await tryCall("/.cloud/llm/chat/completions", model);
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
