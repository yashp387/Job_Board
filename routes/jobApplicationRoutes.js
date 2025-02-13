const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { generateToken, authMiddleware } = require("./../middlewares/authMiddleware");
const Job = require("./../models/job");
const JobApplication = require("./../models/jobApplication");
const { findById } = require("../models/user");
const jobApplication = require("./../models/jobApplication");


// Apply for a job
router.post("/:jobId/apply", authMiddleware, async (req, res) => {
    try {
        const {jobId} = req.params;
        const {resumeUrl, coverLetter} = req.body;

        // Validate jobId as a mongoose ObjectId
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({msg: "Invalid job ID"});
        }

        // Find the Job
        const job = await Job.findById(jobId);
        if(!job) return res.status(404).json({msg: "Job not found"});

        //Ensure only jobseeker can apply
        if(req.user.role !== "jobseeker") {
            return res.status(403).json({msg: "Only Jobseeker can apply"});
        }

        // Check if the user already applied
        const existingApplication = await JobApplication.findOne({jobId, applicationId:req.user.id});
        if(existingApplication) {
            return res.status(403).json({msg: "You have already applied for this job"});
        }

        // Create a new job application
        const application = new JobApplication({
            jobId,
            applicationId: req.user.id,
            resumeUrl,
            coverLetter,
            status: "pending",
            appliedAt: new Date(),
        });

        await application.save();

        res.status(200).json({msg: "Application submitted successfully", application});
    } catch (error) {
        console.log("Error applying for jobs", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get applications for a job (employer only)
router.get("/:jobId/applications", authMiddleware, async (req, res) => {
    try {
        const {jobId} = req.params;
        
        // Validate jobId as a mongoose ObjectId
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({msg: "Invalid job ID"});
        }

        // Find the job and ensure it exist
        const job = await Job.findById(jobId);
        if(!job) return res.status(404).json({msg: "Job not found"});

        // Ensure the authenticated user is the employer who posted this job
        if(job.employerId.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized, You do not own this job posting"});
        }

        // Fetch application for the given job
        const application = await JobApplication.find({jobId}).populate("applicationId", "name email");

        if(application.length === 0) {
            return res.status(404).json({msg: "No applications found for this job"});
        }

        res.status(200).json({application});

    } catch (error) {
        console.log("Error for fetching job application", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get user job application
router.get("/my-applications", authMiddleware, async (req, res) => {
    try {
        // Ensure user is a jobseeker
        if(req.user.role !== "jobseeker") {
            console.log(req.user.role)
            return res.status(403).json({msg: "Only jobseeker can view their applications"});
        }

        // Fetch all job applications for the logged-in user
        const application = await JobApplication.find({userId: req.user.id})
            .populate("jobId", "title company location jobType status");
        
        if(application.length === 0) {
            return res.status(404).json({msg: "No job application found"});
        }

        res.status(200).json({application});
    } catch (error) {
        console.log("Error fetching user job application", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update applications status (employers only)
router.put("/:applicationId/status", authMiddleware, async (req, res) => {
    try {
        const {applicationId} = req.params;
        const {status} = req.body;

        // Check if applicationId is valid mongoDB objectId
        if(!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({msg: "Invalid application ID"})
        }

        // Find the job application
        const application = await JobApplication.findById(applicationId).populate("jobId");
        if(!application) return res.status(404).json({msg: "No application found"});

        // Ensure only the employer who posted the job can update the application status
        if(req.user.role !== "employer" || application.jobId.employerId.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized, You cannot update this application"});
        }

        // Update the application status
        application.status = status;
        await application.save();

        res.status(200).json({msg: "Application status updated successfully", application});

    } catch (error) {
        console.log("Error updating applications status", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Delete Job application (employer only)
router.delete("/:applicationId", authMiddleware, async (req, res) => {
    try {
        const {applicationId} = req.params;
        const userId = req.user.id;

        // Check is applicationId is valid mongoDB objectId
        if(!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({msg: "Invalid application ID"});
        }

        // Find the job application
        const application = await JobApplication.findById(applicationId);
        if(!application) return res.status(404).json({msg: "Job application not found"});

        // Ensure only the jobseeker who applied can delete their appplication
        if(application.applicationId.toString() !== userId) {
            return res.status(403).json({msg: "You can delete your own application"});
        }

        // Check if application in deletable state
        // You might prevent deletion of accepted application
        if(application.status === "accepted") {
            return res.status(400).json({msg: "Cannot delete an accepted application"});
        }

        // Delete an application
        await JobApplication.findByIdAndDelete(applicationId);

        res.status(200).json({msg: "Job application deleted successfully"});

    } catch (error) {
        console.log("Error deleting job application", error);
        res.status(500).json("Internal server error");
    }
});

module.exports = router;