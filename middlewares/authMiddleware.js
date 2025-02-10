const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization
    if(!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(404).json({error: "Token not found"});
    }

    const token = authorization.split(" ")[1];
    if(!token) return res.status(404).json({error: "Unauthorized"});

    try {
        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user informatiom with request object
        req.user = verified;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Invalid token"});
    }
}


// Function to generate token
const generateToken = (userdata) => {
    // Generate the jwt toke using userdata
    return jwt.sign(userdata, process.env.JWT_SECRET, {expiresIn: "24h"});
}

module.exports = {authMiddleware, generateToken};