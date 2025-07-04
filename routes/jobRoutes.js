const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("./../models/user");
const Job = require("./../models/job");
const { generateToken, authMiddleware } = require("./../middlewares/authMiddleware");


// Create a job listing (employer only)
router.post("/", authMiddleware, async (req, res) => {
    try {
        // Ensure that only employer can posting a job
        if(req.user.role !== "employer") {
            return res.status(403).json({msg: "Access denied, employer only"});
        }

         // Assuming that the request body contains the user data
         const data = req.body;

        // Assign the employerId from the authenticated user 
        data.employerId = req.user.id;
         
        // Create a new job instance
        const job = new Job(data);

        //save the user to data
        const response = await job.save();
        console.log("New job added to database");
        
        res.status(200).json({mag: "Job posted successfully", job: response});
    } catch (error) {
        console.log("Error: Error adding job");
        res.status(500).json({msg: "Internal server error"});
    }
});


// List all jobs (with filter)
router.get("/", async (req, res) => {
    try {
        // Extract query parameters for filtering
        const {title, location, category, jobType, minSalary, maxSalary, status} = req.query;

        // Create a filter
        let filter = {};

        if(title) filter.title = new RegExp(title, "i")   // Case-insensitive title search
        if(location) filter.location = new RegExp(location, "i");
        if(category) filter.category = category;
        if(jobType) filter.jobType = jobType;
        if(status) filter.status = status;

        // Salary range filter
        if(minSalary || maxSalary) {
            filter.salary = {};
            if(minSalary) filter.salary.$gte = Number(minSalary);
            if(maxSalary) filter.salary.$lte = Number(maxSalary);
        }

        const jobs = await Job.find(filter).populate("employerId", "name email");

        if(jobs.length === 0) {
            return res.status(404).json({msg: "No jobs found"});   
        }
        res.status(200).json(jobs);
        
    } catch (error) {
        console.log("Error fetching jobs", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Search jobs
router.get("/search", async (req, res) => {
    try {
        const {title, location, category} = req.query;

        // Build dynamic query object
        let query = {};

        if(title) {
            query.title = {$regex: title, $options: "i"}  // Case-insensitive search
        }
        if(location) {
            query.location = {$regex: location, $options: "i"}
        }
        if(category) {
            query.location - {$regex: category, $options: "i"}
        }

        //
        const jobs = await Job.find(query);

        if(jobs.length === 0) {
            return res.status(404).json({msg: "No jobs found"});
        }
        res.status(200).json(jobs)

    } catch (error) {
        console.log("Error searching jobs", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Get job details 
router.get("/:id", async (req, res) => {
    try {
        // Get a job id from URL params
        const jobId = req.params.id;

        // Find job by ID
        const job = await Job.findById(jobId).populate("employerId", "name email");

        if(!job) return res.status(404).json({msg: "Job not found"});

        res.status(200).json({ job });
    } catch (error) {
        console.log("Error getting job details", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Update jobs listing
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        // Get a job id from URL parameter
        const jobId = req.params.id;
        const updateJob = req.body;

        // Check if jobId is valid mongoDB ObjectId
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({msg: "Invalid job ID"});
        }

        // Find the job first
        const job = await Job.findById(jobId);
        if(!job) return res.status(404).json({msg: "Job not found"});

        if(req.user.role !== "employer" || job.employerId.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized: You can only update you own job listing"});
        }

        // Update the job
        const jobs = await Job.findByIdAndUpdate(jobId, updateJob, {
            new: true,   // Run the updated documents
            runValidators: true,   // Run the mongoose schema validation 
        });

        if(!jobs) return res.status(404).json({msg: "No jobs found"});

        res.status(200).json({msg: "Job updated successfully"});
    } catch (error) {
        console.log("Error updating job listing", error);
        res.status(500).json({msg: "Internal server error"});
    }
});


// Delete job listing
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const jobId = req.params.id;

        // Check if jobId is valid mongoDB ObjectId
        if(!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({msg: "Invalid job ID"});
        }

        // Find the job
        const job = await Job.findById(jobId);
        if(!job) return res.status(404).json({msg: "Job not found"});

        // Check if the user is an employer adn owns the job
        if(req.user.role !== "employer" || job.employerId.toString() !== req.user.id) {
            return res.status(403).json({msg: "Unauthorized: You can not delete this job"});
        }

        // Delete the job
        const jobs = await Job.findByIdAndDelete(jobId);

        res.status(200).json({msg: "Job deleted successfully"});
    } catch (error) {
        console.log("Error deleting job", error);
        res.status(500).json({msg: "Internal server error"});
    }
});

module.exports = router;