const express = require("express")
const router = express.Router()

router.get("/:lang", (req, res) => {
    const lang = req.params.lang;
    res.setLocale(lang);
    res.render("Portfolio/portfolio")
})

router.get("/", (req, res) => {
    let lang = req.session.preferredLanguage;
    if (!lang) lang = "en"
    res.setLocale(lang);
    res.render("Portfolio/portfolio")
})

module.exports = router