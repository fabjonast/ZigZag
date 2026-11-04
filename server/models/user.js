const pool = require("../db_connect");
const bcrypt = require("bcrypt");

async function createUser(firstName, lastName, username, email, passwordHash){
    const result = await pool.query(
        `INSERT INTO users (firstname, lastname, username, email, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, firstname, lastname, username, email, createdat`,
        [firstName, lastName, username, email, passwordHash]
    );

    return result.rows[0];
}

async function login(loginInput, password){
    const result = await pool.query(
        `SELECT * FROM users
        WHERE username = $1 OR email = $1`,
        [loginInput]
    );

    const cUser = result.rows[0];
    console.log("User found: ", !!cUser);
    console.log("Database columns: ", cUser ? Object.keys(cUser) : []);
    console.log("Hash value: ", cUser?.password_Hash ? "Found" : "Missing");
    console.log("Password value: ", password ? "Found" : "Missing");

    if(!cUser){
        throw Error("Username or email not found.");
    }

    const match = await bcrypt.compare(
        password,
        cUser.password_Hash
    );

    if(!match){
        throw Error("Incorrect password!");
    }

    return{
        user_id: cUser.user_id,
        firstName: cUser.firstName,
        lastName: cUser.lastName,
        username: cUser.username,
        email: cUser.email
    };
}

async function getUserByUsername(username) {
    const result = await pool.query(
        `SELECT * FROM users
        WHERE username = $1`,
        [username]
    );
    return result.rows[0];
}

async function getUserByEmail(email) {
    const result = await pool.query(
        `SELECT * FROM users
        WHERE email = $1`,
        [email]
    );
    return result.rows[0];
}

module.exports = { createUser, login, getUserByUsername, getUserByEmail };