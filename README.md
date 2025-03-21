# Nikwisa Frontend

## Overview

Nikwisa is a local search and business directory platform connecting users with event planning service providers (e.g., wedding planners, DJs) in Zambia. This repository contains the Next.js frontend, built with TypeScript, which connects to a Django backend to display business profiles, handle user interactions, and enable reviews.

- **Stack:** Next.js (React), TypeScript, HTML/CSS
- **Purpose:** Provides the user interface for searching, browsing, and managing business listings.
- **Backend Repo:** `https://github.com/jabulani-creator/nikwisa_backend`
- **Current State:** Partially built—pages like `/dashboard/create-store` and `/dashboard/stores-lists` render locally, but deployment to Vercel isn’t live yet.

## Problem Statement

Nikwisa solves the challenge of finding reliable service providers in a fragmented market. For event planning, users rely on word-of-mouth or scattered listings. Nikwisa centralizes search, comparison, and contact, offers verified listings for trust, streamlines communication, and boosts business visibility.

## Prerequisites

- Node.js 16.x or later
- npm (or yarn, if preferred)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/jabulani-creator/nikwisa-frontend.git
   cd nikwisa-frontend
   cd nikwisa_v2
   Install Dependencies
   bash
   ```

npm install

## Set Up Environment Variables

**Rename .Example.env to .env:**

mv .Example.env .env
Ensure the .env file includes the API endpoint:
env

NEXT_PUBLIC_API_ENDPOINT="http://127.0.0.1:8000/api/v1/test"

**Ensure Backend is Running**
The frontend connects to the Django backend (see backend repo: https://github.com/jabulani-creator/nikwisa_backend).
Start the backend server (python manage.py runserver) before running the frontend.

## Running the Frontend

**Start the Development Server**

npm run dev
The app will be available at http://localhost:3000.
Build for Production

npm run build
npm start
Note: Deployment to Vercel is pending—ensure build succeeds.
