# Deployment Guide

This guide explains how to deploy the Student Dashboard to **Render** (Backend) and **Vercel** (Frontend).

## 1. Database Setup (MongoDB Atlas)
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster.
3. In **Network Access**, allow access from anywhere (`0.0.0.0/0`) for Render to connect.
4. In **Database Access**, create a user with a password.
5. Get your **Connection String** (SRV) and replace `<password>` with your actual password.

---

## 2. Backend Deployment (Render)
1. Log into [Render](https://render.com/).
2. Create a **New Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `MONGO_URI`: (Your SRV Connection String)
   - `JWT_SECRET`: (A long random string)
   - `FRONTEND_URL`: (Your Vercel URL - wait until step 3 to get this)
   - `NODE_ENV`: `production`

---

## 3. Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com/).
2. **Add New Project** and connect your repo.
3. Configure the Project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
4. **Environment Variables**:
   - `REACT_APP_API_URL`: (Your Render Web Service URL, e.g., `https://student-dash-api.onrender.com`)
5. Click **Deploy**.

---

## 4. Final Connection Hookup
1. Once Vercel provides your domain (e.g., `https://student-dash.vercel.app`), go back to **Render Settings**.
2. Update the `FRONTEND_URL` environment variable to match your Vercel URL.
3. Save and wait for Render to redeploy.

---

## Local Development
To test locally with the new production-ready setup:
1. Create a `.env` in the `backend/` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/student_dashboard
   JWT_SECRET=local_secret
   FRONTEND_URL=http://localhost:3000
   ```
2. Create a `.env` in `frontend/`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```
3. Run the entire project from the **root directory**:
   ```bash
   npm run install-all
   npm run dev
   ```
   Or run them separately from their respective folders using `npm start`.
