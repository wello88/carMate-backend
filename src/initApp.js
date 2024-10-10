import path from "path"
import dotenv from 'dotenv'
import { connectDB } from "../db/connection.js"
import { globalErrorHandler } from "./utils/appError.js"

dotenv.config({ path: path.resolve('./config/.env') })


export const initApp = (app,express) => {
 
    app.use(express.json())
    connectDB()
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`app listening on port ${port}!`))

    app.use(globalErrorHandler)
}