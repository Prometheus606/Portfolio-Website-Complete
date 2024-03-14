const router = require("express").Router();

// Middleware for custom error handling for not found routes
router.use((req, res, next) => {
    if (req.application === "whispersphere") {
        return res.status(404).render("WhisperSphere/error", {
            code: 404,
            error: 'Sorry, the page was not found!'
          });
    }
    
    res.json({success: false, code: 404, error: 'Sorry, the page was not found!', errorCode: 1005});
});

// Middleware for general error handling
router.use((err, req, res, next) => {
    if (req.application === "whispersphere") {
        console.error(err.stack);
        return res.status(500).render("WhisperSphere/error", {
          code: 500,
          error: 'Something went wrong!'
        });
    }

    const error = {success: false, code: 500, error: 'Something went wrong!', errorCode: 1004}
    console.error(error, err.stack);
    res.json(error);
});

module.exports = router