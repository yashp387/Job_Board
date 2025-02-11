const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("./../models/user");
const { generateToken, authMiddleware } = require("../middlewares/authMiddleware");
const { json } = require("body-parser");
``
// User register route
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
           role: response.role,
        }
        const token = generateToken(payLoad);

        res.status(200).json({response: response, token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Internal server error"})
    }
});

// User login route
router.post("/login", authMiddleware, async (req, res) => {
    try {
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
            role: user.role,
        }
        const token = generateToken(payLoad);

        // return token as response
        res.json(token);
        } catch (error) {
            console.log(error);
            res.status(500),json({msg: "Internal server error"});
        }
});


// Get user profile
router.get("/profile", async (req, res) => {
    try {
        const users = await User.find();
        console.log("Get all users profiles");
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update the user profile
router.put("/profile/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;   // extract the userId from request parameter
        const userUpdatedData = req.body;   // Updated data for the user

        // Ensure the authenticated user can only update their user profile  (or employer)
        if(req.user.id !== userId && req.user.role !== "employer") {
            return res.status(403).json({msg: "Unauthorized: You can update your own profile"});
        }

        // Update user profile
        const user = await User.findByIdAndUpdate(userId, userUpdatedData, {
            new: true,   // return updated data
            runValidators: true,   // run mongoose validation
        });

        if(!user) return res.status(404).json({msg: "User not found"});

        res.status(200).json({msg: "User data updated successfully"});  
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: "Internal server error"});
    }
});


router.delete("/profile/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        // Ensure the authenticated user can only delete their user profile  (or employer)
        if(req.user.id !== userId && req.user.role !== "employer") {
            return res.status(403).json({msg: "Unauthorized: You can not delete this profile"});
        }

        // Delete user profile
        const user = await User.findByIdAndDelete(userId);

        if(!user) return res.status(404).json({msg: "User not found"});

        res.status(200).json({msg: "User profile deleted successfully"});
        } catch (error) {
            console.log("Error deleting user", error)
            res.status(500).json({msg: "Internal server error"});
        }
});

module.exports = router;