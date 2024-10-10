//import modules
import dotenv from "dotenv"
import express from "express"
import path from "path"

import { initApp } from "./src/initApp.js"

const app = express()



dotenv.config({ path: path.resolve('./config/.env') })
initApp(app, express)