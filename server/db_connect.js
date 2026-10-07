const { Pool } = require("pg");

const pool = new Pool({
    database: "ZigZag",
    host: "localhost",
    port: 5432,
    user: "fabjonastoja"
});

module.exports = pool;