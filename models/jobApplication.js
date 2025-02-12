const mongoose = require("mongoose");

const jobApplicationschema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    resumeUrl: {
        type: String,
    },
    coverLetter: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "accepted", "rejected"],
        default: "pending",
    },
    appliedAt: {
        type: Date,
        default: Date.now(),
    },
});

const jobApplication = mongoose.model("jobApplication", jobApplicationschema);

module.exports = jobApplication;