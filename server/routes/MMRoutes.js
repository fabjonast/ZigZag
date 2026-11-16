const express = require("express");
const router = express.Router();
const mindMapModel = require("../models/mmModel");
const requireLogin = require("../middleware/requireLogin");

router.use(requireLogin);

function validateMap(body){
    const { title, nodes } = body || {};

    if(typeof title !== "string" || !Array.isArray(nodes) || nodes.length === 0 || nodes.length > 500){
        return null;
    }

    const valid = nodes.every(n => 
        typeof n.id === "string" &&
        (n.parentId === null || typeof n.parentId === "string") &&
        typeof n.text === "string" &&
        Number.isFinite(n.x) && Number.isFinite(n.y)
    );

    if(!valid){
        return null;
    }

    return { title: title.trim().slice(0, 200) || "Untitled Mind Map", nodes };
}

router.get("/", async (req, res) => {
    try {
        res.join(await mindMapModel.getMapsByUser(req.user.id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load mind maps." });
    }
});

router.get("/:id", async (req, res) => {
    const mapId = parseInt(req.params.is, 10);

    if(!Number.isInteger(mapId)){
        return res.status(400).json({ error: "Invalid map id."});
    }

    try {
        const map = await mindMapModel.getMapById(mapId, req.user.id);

        if(!map){
            return res.status(404).json({ error: "Mind Map not found."});
        }

        res.json(map);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load mind map."});
    }
});

router.post("/", async (req, res) => {
    const data = validateMap(req.body);

    if(!data){
        return res.status(400).json({ error: "Invalid Mind Map data."});
    }

    try {
        const id = await mindMapModel.createMap(req.user.id, data.title, data.nodes);
        res.status(201).json([ id ]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not save the mind map." });
    }
});

router.put("/:id", async (req, res) => {
    const mapId = parseInt(req.params.id, 10);
    const data = validateMap(req.body);

    if(!Number.isInteger(mapId) || !data){
        return res.status(400).json({ error: "Invalid Mind Map data." });
    }

    try {
        const updated = await mindMapModel.updateMap(mapId, req.user.id, data.title, data.nodes);

        if(!updated){
            return res.status(404).json({ error: "Mind Map not found." });
        }

        res.json({ id: mapId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not save the mind map." });
    }
});

module.exports = router;