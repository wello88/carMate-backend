// import dotenv from "dotenv"
import express from "express"
import path from "path"
import { fileURLToPath } from 'url'
import cors from "cors";
import { initApp } from "./src/initApp.js"
import { syncDatabase } from "./db/index.js"

const app = express()
// Enable CORS for all origins
app.use(cors());


// Optionally, configure CORS with more control
app.use(cors({
    origin: "*", // Allows all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));


// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Serve static files from a 'public' directory
app.use(express.static(path.join(__dirname, 'public')))

// Add route handler for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'welcome.html'));
});

// Existing setup
// app.use(express.json())
// app.use('/auth',authRouter())
// authRouter()
// dotenv.config({ path: path.resolve('./config/.env') })

initApp(app, express)
syncDatabase();

export default (req, res) => {
    app(req, res)
}