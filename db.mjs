import pg from "pg";
import dotenv from "dotenv";

const { Client } = pg;

dotenv.config();

// export const client = new Client({
//   user: process.env.DBUSER_RENDER,
//   host: process.env.DBHOST_RENDER,
//   database: process.env.DBNAME_RENDER,
//   password: process.env.DBPASSWORD_RENDER,
//   port: process.env.DBPORT,
//   //  ssl: { rejectUnauthorized: true },
// });

const client = new Client({
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

export default client;
