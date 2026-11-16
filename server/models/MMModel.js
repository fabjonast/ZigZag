const pool = require("../db_connect");

async function getMapsByUser(userId){
    const { rows } = await pool.query(
        `SELECT mm_id AS id, title, updated_at
        FROM mind_maps
        WHERE user_id = $1
        ORDER BY updated_at DESC`,
        [userId]
    );
    return rows;
}

async function getMapById(mapId, userId){
    const mapResult = await pool.query(
        `SELECT mm_id AS id, title
        FROM mind_maps
        WHERE mm_id = $1 AND user_id = $2`,
        [mapId, userId]
    );

    if(mapResult.rows.length === 0){
        return null;
    }

    const nodesResult = await pool.query(
        `SELECT node_id AS id, parent_node_id AS "parentId", content AS text, x, y
        FROM mind_map_nodes
        WHERE map_id = $1`
        [mapId]
    );
    return { ...mapResult.rows[0], nodes: nodesResult.rows };
}

async function insertNodes(client, mapId, nodes) {
    if(nodes.length === 0){
        return;
    }

    await client.query(
        `INSERT INTO mind_map_nodes (map_id, node_is, parent_node_id, content, x, y)
        SELECT $1::int, * FROM unnest($2::text[], $3::text[], $4::text[], $5::real[], $6::real[])`,
        [
            mapId,
            nodes.map(n => n.id),
            nodes.map(n => n.parentId),
            nodes.map(n => n.text),
            nodes.map(n => n.x),
            nodes.map(n => n.y)
        ]
    );
}

async function createMap(userId, title, nodes) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `INSERT INTO mind_maps (user_id, title)
            VALUES ($1, $2)
            RETURNING mm_id AS id`,
            [userId, title]
        );

        await insertNodes(client, rows[0].id, nodes);
        await client.query("COMMIT");

        return rows[0].id;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function updateMap(mapId, userId, title, nodes){
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `UPDATE mind_maps
            SET title = $1, updated_at = now()
            WHERE mm_id = $2 AND user_id = $3
            RETURNING mm_id`,
            [title, mapId, userId]
        );

        if(rows.length === 0){
            await client.query("ROLLBACK");
            return false;
        }

        await client.query("DELETE FROM mind_map_nodes WHERE map_id = $1", [mapId]);
        await insertNodes(client, mapId, nodes);
        await client.query("COMMIT");

        return true;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { getMapsByUser, getMapById, createMap, updateMap };