const express = require("express")
const router = express.Router()
const {BinaryToImage} = require("../pictureHandler")


router.get("/", async (req, res) => {
    const db = req.db
    let books
    try {
        response = await db.query("SELECT * FROM mybrary_books ORDER BY createdAt DESC LIMIT 10;")
        books = response.rows
        books.forEach(book => {
            if (book.coverimage && book.coverimagetype) {
                book.coverimagepath = BinaryToImage(book.coverimage, book.coverimagetype);
            }
        });
    } catch (error) {
        books = []
    }
    res.render("index", {books})
})

module.exports = router