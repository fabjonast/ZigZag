function requireLogin(req, res, next){
    if(!req.session || !req.session.userId){
        return res.status(401).json({ error: "Please log in." });
    }

    req.user = { id: req.session.userId };
    next();
}

module.exports = requireLogin;