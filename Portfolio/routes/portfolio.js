const express = require("express")
const router = express.Router()

router.get("/:lang", (req, res) => {
    const lang = req.params.lang;
    res.setLocale(lang);
    res.render("portfolio")
})

router.get("/", (req, res) => {
    let lang = req.session.preferredLanguage;
    if (!lang) lang = "de"
    res.setLocale(lang);
    res.render("portfolio")
})

module.exports = router