const pool = require("./db_connect");
const bcrypt = require("bcrypt");

async function createUser(firstName, lastName, username, email, passwordHash){
    const result = await pool.query(
        `INSERT INTO users (firstname, lastname, username, email, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, firstname, lastname, username, email, password_hash, createdat`,
        [firstName, lastName, username, email, passwordHash]
    );

    return result.rows[0];
}

async function login(user){
    let cUser = await getUserByUsername(user.username);
    if(!cUser) throw Error("Username not found!");

    let match = await bcrypt.compare(user.passwordHash, cUser.passwordHash);
    if(!match) throw Error("Password Incorrect!");

    return cUser;
}

async function getUserByUsername(username) {
    const result = await pool.query(
        `SELECT * FROM users
        WHERE username=$3`
    )
    [username];
    return result.rows[0];
}

async function getUserByEmail(email) {
    const result = await pool.query(
        `SELECT * FROM users
        WHERE email=$4`
    )
    [email];
    return result.rows[0];
}

module.exports = { login, getUserByUsername, getUserByEmail };