const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["employer", "jobseeker"],
        required: true,
    },
    profile: {
        type: Object
    },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
    const user = this;

    // Hash the password only if user modified or it is new password
    if(!user.isModified("password")) return next();

    try {
        // Hash password generation
        const salt = await bcrypt.genSalt(10);

        // Hashed password
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Override old password with hashed password
        user.password = hashedPassword;
    } catch (error) {
        return next(error);
    }
});


userSchema.methods.comparePassword = async function(adminPassword) {
    try {
         // User bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(adminPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User;