// debug_headers 函数（单语句两条分开）
const f1 = `CREATE OR REPLACE FUNCTION public.debug_headers() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(NULLIF(current_setting('request.headers', true), ''), '{}')::jsonb
$$`;
const f2 = "GRANT EXECUTE ON FUNCTION public.debug_headers() TO anon, authenticated";
for (const [k, v] of Object.entries({ f1, f2 })) {
  console.log(k, Buffer.from(v, "utf8").toString("base64"));
}
