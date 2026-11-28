const express = require("express");
const router = express.Router();
const wordSearchModel = require("../models/wordSearchModels");
const requireLogin = require("../middleware/requireLogin");

router.use(requireLogin);

router.get("/", async (req, res) => {
    try {
        res.json(await wordSearchModel.getWordSearchByUser(req.user.id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load Word Searches." });
    }
});

module.exports = router;