const router = require("express").Router();
const CryptoJS = require('crypto-js');
const generatePassword = require("../utils/randomKey")
const bcrypt = require("bcrypt")


// get messages and render room page
router.get("/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.session.generalError = "You are not authenticated."
        return res.redirect("/whispersphere")
    }


    const db = req.db
    const roomID = req.user.id

    try {
        let result = await db.query("SELECT * FROM whisper_sphere_messages WHERE room_id=$1 ORDER BY creationdate ASC", [roomID])

        const messages = []
        let messagesOnSameDay = []
        let date = "";

        // action for each message in database
        result.rows.forEach(row => {

            //decrypt message
            const decryptedBytes = CryptoJS.AES.decrypt(row.message, process.env.MESSAGE_SECRET);
            const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);

            // Datum format (10.02.2024)
            const formattedDate = row.creationdate.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
            
            // Uhrzeit format (18:30)
            const formattedTime = row.creationdate.toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit"
            });

            // for date seperation in the chat. for each day is a box shown with the date, and then all messages of that day
            if (date === "") {
                date = formattedDate
            }

            if (formattedDate !== date && messagesOnSameDay.length > 0) {
                messages.push(messagesOnSameDay)
                messagesOnSameDay = []
                date = formattedDate
            }

            messagesOnSameDay.push({
                messageID: row.id,
                roomID: row.room_id,
                creationDate: formattedDate,
                creationTime: formattedTime,
                text: decryptedMessage,
                userName: row.username
            })
            
        });

        messages.push(messagesOnSameDay)

        const params = {
                success: true,
                roomID,
                messages,
                userName: req.user.userName
        }

        if (req.session.messagesError) {
            params.messagesError = req.session.messagesError
        }

        res.render("room", params)

    } catch (error) {
        console.log(error);
        req.session.generalError = "Error getting Messages."
        res.redirect("/whispersphere")
    }
})

// save sendet message in db and reload room page
router.post("/", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.session.generalError = "You are not authenticated."
        return res.redirect("/whispersphere")
    }

    const db = req.db
    const roomID = req.user.id
    const message = req.body.message
    const userName = req.user.userName

    try {
        const encryptedMessage = CryptoJS.AES.encrypt(message, process.env.MESSAGE_SECRET).toString();
        
        await db.query("INSERT INTO whisper_sphere_messages (room_id, message, username) VALUES ($1, $2, $3)", [roomID, encryptedMessage, userName])

        res.redirect(`/whispersphere/room/${roomID}`)

    } catch (error) {
        console.log(error);
        req.session.messagesError = "Error sending Message."
        res.redirect(`/whispersphere/room/${roomID}`)
    }
})

// creates a new room
router.post("/create", async (req, res) => {
    const db = req.db
    let password = req.body.password

    if (!password) {
        password = generatePassword(Math.floor((Math.random() * 8) + 12))
    }

    // check password quality if environment is set to production
    if (process.env.NODE_ENV === 'production') {
        if (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
            req.session.createError = "Password too weak! Please use at least 8 characters with 1 number, 1 letter, and 1 special character or leave it blank to generate one."
            return res.redirect("/whispersphere")
        }
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10)
        const result = await db.query("INSERT INTO whisper_sphere_rooms (password) VALUES ($1) RETURNING *", [passwordHash])

        res.render("newRoom", {
            success: true,
            roomID: result.rows[0].id,
            creationDate: result.rows[0].creationdate,
            password,
            message: "Save the Password! It is not stored anywhere."
        })
        
    } catch (error) {
        console.log(error);
        req.session.createError = "Error creating room."
        res.redirect("/whispersphere")
    }
})

// deletes messages
router.post("/delete-message", async (req, res) => {
    const roomID = req.user.id
    
    if (!req.isAuthenticated() || roomID === parseInt(process.env.GLOBAL_CREDENTIALS)) {
        req.session.generalError = "You are not authenticated."
        return res.redirect("/whispersphere")
    }
    
    const messageID = req.body.messageID
    const db = req.db

    try {
        await db.query("DELETE FROM whisper_sphere_messages WHERE id=$1", [messageID])

        res.redirect(`/whispersphere/room/${roomID}`)

    } catch (error) {
        console.log(error);
        req.session.generalError = "Error deleting message."
        res.redirect(`/whispersphere/room/${roomID}`)
    }
})

// delete chat room
router.post("/delete", async (req, res) => {
    const roomID = req.user.id

    if (!req.isAuthenticated() || roomID === parseInt(process.env.GLOBAL_CREDENTIALS)) {
        req.session.generalError = "You are not authenticated."
        return res.redirect("/whispersphere")
    }
    
    const db = req.db

    try {
        await db.query("DELETE FROM whisper_sphere_messages WHERE room_id=$1", [roomID])
        await db.query("DELETE FROM whisper_sphere_rooms WHERE id=$1", [roomID])

        res.render("index", {
            error: `Successful deleted room ${roomID}.`
        })
    } catch (error) {
        console.log(error);
        req.session.generalError = "Error deleting room."
        res.redirect("/whispersphere")
    }
})

module.exports = router