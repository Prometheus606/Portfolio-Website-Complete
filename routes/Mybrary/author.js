const express = require("express")
const router = express.Router()
const {BinaryToImage} = require("../../Middleware/Mybrary/pictureHandler")


// all authors
router.get("/", async (req, res) => {
    const db = req.db
    const searchOptions = {};
    let query = 'SELECT * FROM mybrary_authors';

    if (req.query.name && req.query.name !== "") {
        searchOptions.name = req.query.name;
        query += ` WHERE name ILIKE '%${searchOptions.name}%';`
    }
    try {
        const result = await db.query(query);
        const authors = result.rows
        res.render("Mybrary/authors/index", {
            authors,
            searchOptions: req.query
        });
    } catch (error) {
        console.log(error);
        res.redirect("/mybrary")
    }
    
})

// new author
router.get("/new", (req, res) => {
    res.render("Mybrary/authors/new", {author: {name: ""}})
})

// create author
router.post("/", async (req, res) => {
    const db = req.db
    const { name } = req.body;
    const query = 'INSERT INTO mybrary_authors (name) VALUES ($1) RETURNING *';
    let newAuthor = {name: ""};

    if (!name) {
        res.render("Mybrary/authors/new", {
            author: newAuthor,
            errorMessage: "Authors Name cannot be empty."
        });
    }

    try {
        const { rows: [newAuthor] } = await db.query(query, [name]);
        res.redirect('/mybrary/authors');
    } catch (error) {
        console.error('Error inserting author:', error);
        res.render("Mybrary/authors/new", {
            author: newAuthor,
            errorMessage: "Error Creating Author"
        });
    }
});

// view Spezific author
router.get("/:id", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }
    try {
        let result = await db.query("SELECT * FROM mybrary_authors WHERE id = $1", [id]);
        const rows = result.rows

        if (!rows || rows.length < 1) {
            res.status(404).redirect("/mybrary/authors");
            return;
        }
        const author = rows[0]

        result = await db.query("SELECT * FROM mybrary_books WHERE author = $1", [author.id]);
        author.books = result.rows
        author.books.forEach(book => {
            if (book.coverimage && book.coverimagetype) {
                book.coverimagepath = BinaryToImage(book.coverimage, book.coverimagetype);
            }
        });
        res.render("Mybrary/authors/view", {author});
    } catch (error) {
        console.error(error);
        res.status(500).redirect("/mybrary/authors");
    }
});

// edit Spezific author
router.get("/:id/edit", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }

    try {
        const result = await db.query("SELECT * FROM mybrary_authors WHERE id = $1", [id]);
        const rows = result.rows
        if (!rows || rows.length < 1) {
            res.status(404).redirect("/mybrary/authors")
            return;
        }
        const author = result.rows[0]
        res.render("Mybrary/authors/edit", {author: author});
    } catch (error) {
        console.error(error);
        res.status(500).redirect("/mybrary/authors");
    }
});

// delete Spezific author
router.delete("/:id", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }

    try {
        const result = await db.query("SELECT * FROM mybrary_books WHERE author = $1", [id]);
        if (result.rows.length >= 1) {
            return res.redirect("/mybrary/authors")
        }
        await db.query("DELETE FROM mybrary_authors WHERE id = $1", [id])
        res.redirect("/mybrary/authors");

    } catch (error) {
        console.error(error);
        res.status(500).redirect("/mybrary/authors");
    }
});

// update Spezific author
router.put("/:id", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }

    try {
        const result = await db.query("SELECT * FROM mybrary_authors WHERE id = $1", [id]);
        const rows = result.rows
        if (rows.length === 1 && req.body.name) {
            const author = rows[0]
            author.name = req.body.name
            await db.query("UPDATE mybrary_authors SET name = $2 WHERE id = $1", [id, author.name]);
            author.books = await db.query("SELECT * FROM mybrary_books WHERE author = $1", [author.id]);
            res.render("Mybrary/authors/view", {author});
        } else throw Error

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router