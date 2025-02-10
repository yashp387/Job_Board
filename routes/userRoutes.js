const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("./../models/user");
const { generateToken, authMiddleware } = require("../middlewares/authMiddleware");

// User signin route
router.post("/register", async (req, res) => {
    try {
        // Assuming that the request body contains the user data
        const {name, email, password, role} = req.body;
        // const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({name, email, password, role});

        // Save the new user to the database
        const response = await user.save();
        console.log("New user added to database")

        // Generate token
        const payLoad = {
            id: response.id,
            email: response.email,
        }
        const token = generateToken(payLoad);

        res.status(200).json({response: response, token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Internal server error"})
    }
});


router.post("/login", authMiddleware, async(req, res) => {
    // Extract the credentials from the request body
    const {name, password, email} = req.body;

    if(!name || !password || !email) {
        return res.status(400).json({error: "Invalid credentials"});
    }

    // Find the user by email address
    const user = await User.findOne({email: email});

    // Generate token
    const payLoad = {
        id: user.id,
        email: user.email,
    }
    const token = generateToken(payLoad);

    // return token as response
    res.json(token);
});

module.exports = router;