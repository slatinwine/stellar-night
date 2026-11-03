// 生成三个 SQL 的 base64，供 db_exec_sql 的 sqlBase64 使用
const fs = require("fs");
const s1 = `CREATE OR REPLACE FUNCTION public.record_visit() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE h jsonb; ip text;
BEGIN
  h := NULLIF(current_setting('request.headers', true), '')::jsonb;
  ip := COALESCE(h->>'x-forwarded-for', h->>'x-real-ip', h->>'client-ip', 'unknown');
  ip := split_part(trim(ip), ',', 1);
  IF ip = '' THEN ip := 'unknown'; END IF;
  INSERT INTO public.visitor_stats(ip_hash, first_seen, last_seen, hits)
  VALUES(md5('wb-stellar-2026:' || ip), now(), now(), 1)
  ON CONFLICT (ip_hash) DO UPDATE SET last_seen = now(), hits = visitor_stats.hits + 1;
END $$`;
const s2 = `CREATE OR REPLACE FUNCTION public.visitor_count() RETURNS integer
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.visitor_stats
$$`;
const s3 = "GRANT EXECUTE ON FUNCTION public.record_visit() TO anon, authenticated; GRANT EXECUTE ON FUNCTION public.visitor_count() TO anon, authenticated";
for (const [k, v] of Object.entries({ s1, s2, s3 })) {
  console.log(k, Buffer.from(v, "utf8").toString("base64"));
}
