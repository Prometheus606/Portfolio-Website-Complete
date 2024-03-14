const express = require("express")
const router = express.Router()
const {saveCover, BinaryToImage} = require("../../Middleware/Mybrary/pictureHandler")


// all books
router.get("/", async (req, res) => {
    const db = req.db
    const { title, publishedBefore, publishedAfter } = req.query;
    let queryParams = [];
    let query = 'SELECT * FROM mybrary_books';

    if (title) {
        query += ' WHERE title ILIKE $1';
        queryParams.push(`%${title}%`);
    }
    if (publishedBefore) {
        query += queryParams.length ? ' AND' : ' WHERE';
        query += ' publishDate <= $' + (queryParams.length + 1);
        queryParams.push(publishedBefore);
    }
    if (publishedAfter) {
        query += queryParams.length ? ' AND' : ' WHERE';
        query += ' publishDate >= $' + (queryParams.length + 1);
        queryParams.push(publishedAfter);
    }

    try {
        const { rows: books } = await db.query(query, queryParams);
        books.forEach(book => {
            if (book.coverimage && book.coverimagetype) {
                book.coverimagepath = BinaryToImage(book.coverimage, book.coverimagetype);
            }
        });
        res.render("Mybrary/books/index", { books, searchOptions: req.query });
    } catch (error) {
        console.error('Error executing SQL query:', error);
        res.redirect("/mybrary");
    }
});

// new book
router.get("/new", async (req, res) => {
    const db = req.db
    const response = await db.query("SELECT * FROM mybrary_authors")
    const authors = response.rows
    const emptyBook = {
        createdAt: null,
        publishDate: null,
        title: null,
        author: null,
        description: null,
        pageCount: null,
        coverImage: null,
        coverImageType: null
    }
    res.render("Mybrary/books/new", {book: emptyBook, authors})
})

// create book
router.post("/", async (req, res) => {
    const db = req.db
    const book = {
        title: req.body.title,
        publishDate: new Date(req.body.publishDate),
        author: req.body.author,
        pageCount: req.body.pageCount,
        description: req.body.description
    }
    saveCover(book, req.body.cover)
    
    try {
        await db.query(`
            INSERT INTO mybrary_books 
            (title, publishDate, author, pageCount, description, coverimage, coverimagetype) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
            [book.title, book.publishDate, book.author, book.pageCount, book.description, book.coverimage, book.coverimagetype]
        )
        res.redirect("/mybrary/books")
    } catch (error) {
        console.log(error);
        const result = await db.query("SELECT * FROM mybrary_authors")
        const authors = result.rows
        res.render("Mybrary/books/new", {book, errorMessage: "Error Creating Book", authors})
    }
})

// view Spezific book
router.get("/:id", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }
    try {
        let result = await db.query("SELECT * FROM mybrary_books WHERE id = $1", [id])
        const book = result.rows[0]
        result = await db.query("SELECT * FROM mybrary_authors WHERE id = $1", [book.author])
        const author = result.rows[0]
        if (!book || !author) {
            res.status(404).redirect("/mybrary/authors");
            return;
        }
        if (book.coverimage && book.coverimagetype) {
            book.coverimagepath = BinaryToImage(book.coverimage, book.coverimagetype);
        }
        res.render("Mybrary/books/view", {book, author});
    } catch (error) {
        console.error(error);
        res.status(500).redirect("/mybrary/books");
    }
});

// edit Spezific book
router.get("/:id/edit", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }

    try {
        let result = await db.query("SELECT * FROM mybrary_books WHERE id = $1", [id])
        const book = result.rows[0]
        result = await db.query("SELECT * FROM mybrary_authors")
        const authors = result.rows
        if (!book || !authors) {
            res.status(404).redirect("/mybrary/books")
            return;
        }
        res.render("Mybrary/books/edit", {book, authors});
    } catch (error) {
        console.error(error);
        res.status(500).redirect("/mybrary/books");
    }
});

// delete Spezific book
router.delete("/:id", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }

    try {
        await db.query("DELETE FROM mybrary_books WHERE id = $1", [id])
        res.redirect("/mybrary/books");

    } catch (error) {
        console.error(error);
        res.status(500).redirect("/mybrary/books");
    }
});

// update Spezific book
router.put("/:id", async (req, res) => {
    const db = req.db
    const id = req.params.id;
    if (!id) {
        res.status(400).send("Invalid id");
        return;
    }
    let book
    let author
    try {
        let result = await db.query("SELECT * FROM mybrary_books WHERE id = $1", [id])
        book = result.rows[0]
        result = await db.query("SELECT * FROM mybrary_authors WHERE id = $1", [book.author])
        author = result.rows[0]
        if (book) {
            if (req.body.cover) {
                saveCover(book, req.body.cover)
            }
            
            await db.query(`
                UPDATE mybrary_books SET
                title=$2, publishdate=$3, author=$4, pagecount=$5, description=$6, coverimage=$7, coverimagetype=$8 
                WHERE id = $1`, 
                [id, req.body.title, req.body.publishDate, req.body.author, req.body.pageCount, req.body.description, book.coverimage, book.coverimagetype]
            )

            res.redirect(`/mybrary/books//${book.id}`);
        } else throw Error

    } catch (error) {
        console.error(error);
        result = await db.query("SELECT * FROM mybrary_authors")
        const authors = result.rows
        res.status(500).render("Mybrary/books/new", {book, errorMessage: "Error Updating Book", authors})
    }
});


module.exports = router