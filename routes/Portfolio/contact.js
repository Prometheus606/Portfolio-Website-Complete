const express = require("express");
const sendEmail = require("./email");
const router = express.Router()

router.get("/:lang", (req, res) => {
    const lang = req.params.lang;
    res.setLocale(lang);
    res.render("Portfolio/contact")
})

router.get("/", (req, res) => {
    let lang = req.session.preferredLanguage;
    if (!lang) lang = "en"
    res.setLocale(lang);
    res.render("Portfolio/contact")
})

router.post("/", (req, res) => {
    if (req.body.name.trim().length < 3 || req.body.subject.trim().length < 3) {
        console.log("Formular falsch ausgefüllt.");
        res.render("Portfolio/contact", {
            message: res.locals.__("pages").contact.errorMessage1
        })
    }
    if (!req.body.message) {
        req.body.message = `${req.body.name} hat keine Nachricht hinterlassen.`
    }

    try {
        sendEmail(req.body.name, req.body.email, req.body.subject, req.body.message)
        res.render("Portfolio/contact", {
            message: res.locals.__("pages").contact.successMessage
        })

    } catch (error){
        console.log("Fehler beim senden.", error);
        res.render("Portfolio/contact", {
            message: res.locals.__("pages").contact.errorMessage2
        })
    }

})

module.exports = router