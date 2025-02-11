const express = require("express");
const dotenv = require("dotenv");
const db = require("./db");
const app = express();

dotenv.config();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Import the routes
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");

// Use the routes
app.use("/user", userRoutes);
app.use("/jobs", jobRoutes);

app.listen(PORT, () => console.log(`Listening on server ${PORT}`));