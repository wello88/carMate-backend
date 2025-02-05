import express from "express";
import { initApp } from "../../src/initApp.js"; // Adjust the path as necessary
import { syncDatabase } from "../../db/index.js";

const app = express();

// Initialize your app with routes and middleware
initApp(app, express);

// Connect to the database
syncDatabase();

app.get("/", (req, res) => res.send("Hello from Netlify!"));
// Export for Netlify serverless function
export default (req, res) => {
  app(req, res); // Pass requests to your Express app
};
