const pool = require("../db_connect");

async function getMapsByUser(userId){
    const { rows } = await pool.query(
        `SELECT mm_id AS id, title, updated_at
        FROM mind_maps
        WHERE user_id = $1
        ORDER BY updated_at DESC`,
        [userId]
    );
}