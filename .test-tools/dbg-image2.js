// 对比文本模型与生图模型在同一 chat 接口上的响应
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const endpoint = html.match(/endpoint:\s*"([^"]+)"/)[1];
const key = html.match(/publishableKey:\s*"([^"]+)"/)[1];

(async () => {
  for (const model of ["glm-5.3-flash", "hunyuan-image-alpha"]) {
    try {
      const res = await fetch(endpoint + "/.cloud/llm/chat/completions", {
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
            { role: "user", content: "银发剑士在群星下释放宝具，史诗动漫风插画" }
          ]
        })
      });
      console.log("---", model, "status", res.status);
      const t = await res.text();
      console.log(t.slice(0, 1800));
    } catch (e) {
      console.log("---", model, "ERROR", e.message);
    }
  }
})();
