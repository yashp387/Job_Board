# Job Board Backend

## Overview
This is a backend application for a Job Board platform where users can register as **Employers** or **Job Seekers**. Employers can post, manage, and view job applications, while job seekers can browse and apply for jobs.

## Features
- **User Registration**: Allows users to create an account as either an employer or a job seeker.
- **User Login**: Enables users to log in securely.
- **Browse Jobs**: Displays a list of available job listings.
- **Search Jobs**: Users can search for jobs by title, location, or category.
- **View Job Details**: Shows detailed information about a job listing.
- **Apply for a Job**: Job seekers can apply for jobs by submitting their resume and cover letter.
- **Post a Job**: Employers can post job listings with job title, description, location, and requirements.
- **Manage Job Listings**: Employers can edit or delete their job listings.
- **View Applications**: Employers can view and manage job applications.
- **View Profile**: Users can view and update their profile information.

## Technologies Used
- **Node.js** (Backend Runtime)
- **Express.js** (Web Framework)
- **MongoDB** (Database)
- **Mongoose** (ODM for MongoDB)
- **JWT (JSON Web Token)** (Authentication & Authorization)
- **Bcrypt** (Password Hashing)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yashp387/Job_Board

## API Endpoints
### Authentication
- `POST /users/register` - Register a new user (Employer/Job Seeker)
- `POST /users/login` - Login and get a token

### Jobs
- `GET /jobs` - Get job details (with filters)
- `GET /jobs/search` - Get search jobs
- `GET /jobs/:id` - Get job details
- `POST /jobs` - Create a new job listing (Employers only)
- `PUT /jobs/:id` - Update job details (Employers only)
- `DELETE /jobs/:id` - Delete a job listing (Employers only)

### Applications
- `POST /applications/:jobId/apply` - Apply for a job (Job Seekers only)
- `GET /applications/:jobId/application` - Get applications for a job (employers only)
- `GET /applications/my-applications` - View job applications of logged-in user
- `PUT /applications/:applicationId/status` - Update application status (employers only)
- `DELETE /applications/:applicationId` - Delete job application (employers only)