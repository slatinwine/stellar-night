// 从 index.html 读精确配置，查看网关注入的请求头
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const endpoint = html.match(/endpoint:\s*"([^"]+)"/)[1];
const key = html.match(/publishableKey:\s*"([^"]+)"/)[1];
console.log("using endpoint:", endpoint, "| key:", key.slice(0, 12) + "...");
(async () => {
  const res = await fetch(endpoint + "/.cloud/database/rest/rpc/debug_headers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": endpoint,
      "x-wb-webapp-access-key": key,
      "X-Forwarded-For": "9.9.9.9",
      "X-Test-Marker": "hello-marker"
    },
    body: "{}"
  });
  console.log("status", res.status);
  console.log(await res.text());
})().catch(e => { console.error("FAIL", e.message); process.exit(1); });
