const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    jobType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Intership", "Remote"],
    },
    category: {
        type: String,
        required: true,
    },
    requirements: {
        type: [String],
        required: true,
    },
    salary: {
        type: Number,
        required: true,
        min: 0,
    },
    benefits: {
        type: [String],
    },
    applicationDeadline: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    applicants:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
}, { timestamps: true });

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;