const connectDB = async (req, res, next) => {

    try {
        const pg = require("pg")
        const bcrypt = require("bcrypt")

        let db;

        if (process.env.PG_URL) {
            db = new pg.Client({
                connectionString: process.env.PG_URL,
                ssl: true
            })
        } else {
            db = new pg.Client({
                user: process.env.PG_USER,
                password: process.env.PG_PW,
                port: process.env.PG_PORT,
                database: process.env.PG_DB,
                host: process.env.PG_HOST
            })
        }
        db.connect()
    
        await db.query("CREATE TABLE IF NOT EXISTS whisper_sphere_rooms ( \
            id SERIAL PRIMARY KEY, \
            creationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \
            password TEXT NOT NULL \
        )")
    
        await db.query("CREATE TABLE IF NOT EXISTS whisper_sphere_messages ( \
            id SERIAL PRIMARY KEY, \
            creationdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), \
            message TEXT NOT NULL, \
            room_id INT NOT NULL, \
            username TEXT NOT NULL, \
            FOREIGN KEY (room_id) REFERENCES whisper_sphere_rooms(id) \
        )")
    
        // create global chat if not exists (12345)
        const globalCredentials = parseInt(process.env.GLOBAL_CREDENTIALS)
        const result = await db.query("SELECT * FROM whisper_sphere_rooms WHERE id=$1", [globalCredentials])
        if (result.rows == 0) {
            const passwordHash = await bcrypt.hash(globalCredentials.toString(), 10)
            await db.query("INSERT INTO whisper_sphere_rooms (id, password) VALUES ($1, $2)", [globalCredentials, passwordHash])
        }
        
        req.db = db

        next()

    } catch (error) {
        console.log(error);
        return res.status(500).render("error", {
            code: 500,
            error:"Internal server Error"
        })
    }
}

const disconnectDB = (req, res, next) => {
    res.on('finish', () => {
        if (req.db) {
          req.db.end();
        }
    });
    next(); 
}

module.exports = {connectDB, disconnectDB}
