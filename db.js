const mongoose = require("mongoose");
require("dotenv").config();

// connetion to database
const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log("Connected to mongedb server");
});

db.on('error', () => {
    console.log("Mongedb server error", err);
});

db.on('disconnected', () => {
    console.log("Mongedb server disconnected");
});

module.exports = db;