LIVE SERVER URL: https://blood-for-life.vercel.app

Blood-for-life Server

A RESTful backend for the Blood-for-life app — user management, donor records, blood requests, image uploads, and admin controls. Built with Node.js, Express, and MongoDB.

Features

User registration & authentication (JWT)

Role-based access (user / admin)

Donor profile CRUD (including image upload support)

Blood requests CRUD

Make user admin endpoint

Basic validation and error handling

CORS and JSON body parsing

Table of contents

Prerequisites

Installation

Environment variables

Run

API Endpoints (examples)

Example requests (cURL)

Seeding / database

Deployment notes

Troubleshooting

Contributing

License

Prerequisites

Node.js (v16+ recommended)

npm or yarn

MongoDB URI (Atlas or self-hosted)

(Optional) Cloud image storage account (Cloudinary / S3) if you support image uploads

Installation
# clone
git clone https://your-repo-url.git
cd blood-for-life-server

# install
npm install
# or
yarn

