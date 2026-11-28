require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", require("./routes/auth"));

app.use("/api/mindmaps", require("./routes/MMRoutes"));

app.use("/api/wordsearch", require("./routes/wordSearchRoutes"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/homepage.html"));
});

app.listen(PORT, () => {
    console.log(`ZigZag server running on http://localhost:${PORT}`);
})