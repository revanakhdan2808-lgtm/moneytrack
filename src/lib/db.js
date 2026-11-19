import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: Buffer.from(
      process.env.DB_CA_CERT_BASE64,
      "base64"
    ).toString("utf8"),
  },

  waitForConnections: true,
  connectionLimit: 5,
});

export default pool;