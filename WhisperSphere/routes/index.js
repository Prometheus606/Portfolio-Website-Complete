const router = require("express").Router()

// render home page
router.get("/", (req, res) => {
    
    params = {}
    if (req.session.joinError) params.joinError = req.session.joinError
    if (req.session.createError) params.createError = req.session.createError 
    if (req.session.generalError) params.generalError = req.session.generalError 
      
    res.render("index", params)
    
})

module.exports = router