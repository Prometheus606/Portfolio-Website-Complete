const router = require("express").Router();

// Middleware for custom error handling for not found routes
router.use((req, res, next) => {
  res.status(404).render("error", {
    code: 404,
    error: 'Sorry, the page was not found!'
  });
});

// Middleware for general error handling
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    code: 500,
    error: 'Something went wrong!'
  });
});

module.exports = router