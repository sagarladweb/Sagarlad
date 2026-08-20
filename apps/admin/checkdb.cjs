const pg = require("/Users/karandhiver/Developer/Sagarlad/demo/node_modules/pg");
const { parse } = require("/Users/karandhiver/Developer/Sagarlad/demo/node_modules/pg-connection-string");

const url = process.env.DATABASE_URL || "";
const config = parse(url);
const connectionString = `postgresql://${encodeURIComponent(config.user ?? "")}:${encodeURIComponent(config.password ?? "")}@${config.host}:${config.port ?? 5432}/${config.database ?? ""}`;
const ssl = config.ssl ? true : { rejectUnauthorized: false };
const pool = new pg.Pool({ connectionString, ssl, max: 2 });
pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'Post' ORDER BY ordinal_position`)
  .then((r) => console.log("Post columns:", r.rows.map((c) => c.column_name).join(", ")))
  .catch((e) => console.log("Post check failed:", (e.message || "").split("\n")[0]))
  .finally(() => pool.end());