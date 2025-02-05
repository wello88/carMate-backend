// import dotenv from "dotenv"
import express from "express"
import authRouter from "./src/modules/auth/auth.router.js"
import path from "path"

import { initApp } from "./src/initApp.js"
import { syncDatabase } from "./db/index.js"

const app = express()

// app.use(express.json())
// app.use('/auth',authRouter())

// authRouter()


// dotenv.config({ path: path.resolve('./config/.env') })
initApp(app, express)
syncDatabase();

export default (req, res) => {
    app(req, res)
}
// export default app