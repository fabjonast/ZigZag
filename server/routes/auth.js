const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const{
    createUser,
    getUserByEmail,
    getUserByUsername,
    login
} = require("../models/user");

router.post("/register", async (req, res) => {
    try{
        const { firstName, lastName, username, email, password } = req.body;

        if(!firstName || !lastName || !username || !email || !password){
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const existingEmail = await getUserByEmail(email);

        if(existingEmail){
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const existingUsername = await getUserByUsername(username);

        if(existingUsername){
            return res.status(409).json({
                message: "This username is already taken."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await createUser(
            firstName,
            lastName,
            username,
            email,
            passwordHash
        );

        res.status(201).json({
            message: "Account created successfully",
            user: user
        });
    } catch(error){
        console.error(error);

        res.status(500).json({
            message: "Something went wrong while creating the account."
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        console.log("Request body:", req.body);
        
        const { loginInput, password } = req.body;

        if(!loginInput || !password){
            return res.status(400).json({
                message: "Username/Email and password are required."
            });
        }

        const user = await login(loginInput, password);

        res.status(200).json({
            message: "Login successful!",
            user: user
        });
    } catch (error) {
        console.error(error);

        res.status(401).json({
            message: "Invalid username/email or password."
        });
    }
});

module.exports = router;