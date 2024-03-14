const express = require("express")
const router = express.Router()

// Route zum Aktualisieren der bevorzugten Sprache
router.post('/', (req, res) => {
    const { language } = req.body;
    req.session.preferredLanguage = language
    res.json({ success: true });
});

module.exports = router