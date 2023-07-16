const { Pool } = require("pg");

const db = new Pool({
  host: process.env.PGSQL_HOST,
  port: process.env.PGSQL_PORT,
  database: process.env.PGSQL_DATABASE,
  user: process.env.PGSQL_USERNAME,
  password: process.env.PGSQL_PASSWORD,
});

module.exports = db;
