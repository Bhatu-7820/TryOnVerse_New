# Deploying TryOnVerse on Render

This repository is pre-configured with a `render.yaml` Blueprint to deploy both the **Backend API & WebSockets** and the **Vite React Frontend** to [Render](https://render.com) seamlessly.

---

## Prerequisites
1. **GitHub Repository**: Pushed to `https://github.com/Bhatu-7820/TryOnVerse_New`
2. **MongoDB Atlas URI**: Free cluster from [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (or any hosted MongoDB).
3. **Render Account**: Free account on [render.com](https://render.com).

---

## Method 1: Instant Blueprint Deployment (Recommended)

1. Log into your **Render Dashboard**.
2. Click **New +** > **Blueprint**.
3. Select your GitHub repository: `Bhatu-7820/TryOnVerse_New`.
4. Render will automatically detect `render.yaml` and configure:
   - `tryonverse-backend` (Node.js Web Service)
   - `tryonverse-frontend` (Static Site)
5. Fill in the required environment variables:
   - `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/tryonverse?retryWrites=true&w=majority`)
   - `FRONTEND_URL`: URL of your frontend site on Render (e.g., `https://tryonverse-frontend.onrender.com`)
   - `VITE_API_URL`: URL of your backend API on Render with `/api` (e.g., `https://tryonverse-backend.onrender.com/api`)
6. Click **Apply**. Render will build and deploy both services!

---

## Method 2: Manual Service Setup on Render

### Step 1: Deploy Backend Web Service
1. Click **New +** > **Web Service**.
2. Select `Bhatu-7820/TryOnVerse_New`.
3. Configure settings:
   - **Name**: `tryonverse-backend`
   - **Root Directory**: `traveloop-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `your_random_secret_key`
   - `JWT_EXPIRE`: `30d`
   - `FRONTEND_URL`: `https://tryonverse-frontend.onrender.com`
5. Click **Create Web Service**. Note the deployed URL (e.g. `https://tryonverse-backend.onrender.com`).

### Step 2: Deploy Frontend Static Site
1. Click **New +** > **Static Site**.
2. Select `Bhatu-7820/TryOnVerse_New`.
3. Configure settings:
   - **Name**: `tryonverse-frontend`
   - **Root Directory**: `traveloop-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://tryonverse-backend.onrender.com/api`
5. Add Redirect / Rewrite Rule (for React Router client-side routing):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## Seed Production Database (Optional)
To seed 180+ runway apparel items, categories, and auction drops on your production database:
```bash
MONGO_URI="your_atlas_connection_string" node traveloop-backend/seed_tryonverse.js
```
