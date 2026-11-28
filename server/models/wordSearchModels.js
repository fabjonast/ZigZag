const pool = require("../db_connect");

async function createWordSearch(userId, title, notes, gridSize, words) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const materialResult = await client.query(
            `INSERT INTO study_materials (user_id, title, notes)
            VALUES ($1, $2, $3)
            RETURNING material_id`,
            [userId, title, notes]
        );

        const materialId = materialResult.rows[0].material_id;

        const searchResult = await client.query(
            `INSERT INTO word_searches (material_id, grid_size)
            VALUES ($1, $2)
            RETURNING word_search_id`,
            [materialId, gridSize]
        );

        const searchId = searchResult.rows[0].word_search_id;

        for(const word of words){
            await client.query(
                `INSERT INTO words (word_search_id, word, definition, start_row, start_col, end_row, end_col)
                VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [searchId, word.word, word.definition || null, word.start.row, word.start.col, word.end.row, word.end.col]
            );
        }

        await client.query("COMMIT");

        return searchId;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally{
        client.release();
    }
}

async function getWordSearchByUser(userId) {
    const { rows } = await pool.query(
        `SELECT ws.word_search_id AS id, sm.title, ws.grid_size, ws.created_at
        FROM word_searches ws JOIN study_materials sm ON ws.material_id = sm.material_id
        WHERE sm.user_id = $1 ORDER BY ws.created_at DESC`,
        [userId]
    );
    return rows;
}

async function getWordSearchById(searchId, userId) {
    const searchResult = await pool.query(
        `SELECT ws.word_search_id AS id, ws.grid_size, sm.title, sm.notes
        FROM word_searches ws JOIN study_materials sm
        ON ws.material_id = sm.material_id
        WHERE ws.word_search_id = $1 AND sm.user_id = $2`,
        [searchId, userId]
    );

    if(searchResult.rows.length === 0){
        return null;
    }

    const wordsResult = await pool.query(
        `SELECT word_id AS id, word, definition, start_row, start_col, end_row, end_col
        FROM words WHERE word_search_id = $1`,
        [searchId]
    );

    return { ...searchResult.rows[0], words: wordsResult.rows };
}

module.exports = { createWordSearch, getWordSearchByUser, getWordSearchById };