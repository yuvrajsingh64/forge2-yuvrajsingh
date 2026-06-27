# PulseDesk Railway Deployment Guide

This guide explains how to deploy the **PulseDesk** multi-tenant help desk SaaS application to Railway.

## Prerequisites
- A **Railway** account (linked to GitHub).
- The repository must be public: `https://github.com/yuvrajsingh64/forge2-yuvrajsingh` (already created and pushed).

---

## Step 1: Provision MySQL Database
1. Go to your [Railway Dashboard](https://railway.app/).
2. Click **New Project** -> **Provision MySQL**.
3. Railway will create a MySQL database instance for you.

---

## Step 2: Deploy Backend Service (Laravel 11)
1. In the same project, click **New** -> **GitHub Repo**.
2. Select your repository: `forge2-yuvrajsingh`.
3. Rename the service to `pulsedesk-backend`.
4. Go to the service's **Settings**:
   - Set **Root Directory** to `backend`.
5. Go to the service's **Variables** and click **Raw Editor**, then paste the following variables:
   ```ini
   APP_NAME=PulseDesk
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:YOUR_GENERATED_KEY_HERE
   
   DB_CONNECTION=mysql
   DB_HOST=${{MYSQLHOST}}
   DB_PORT=${{MYSQLPORT}}
   DB_DATABASE=${{MYSQLDATABASE}}
   DB_USERNAME=${{MYSQLUSER}}
   DB_PASSWORD=${{MYSQLPASSWORD}}
   
   CACHE_DRIVER=file
   SESSION_DRIVER=file
   QUEUE_CONNECTION=sync
   ```
   > [!IMPORTANT]
   > Replace `YOUR_GENERATED_KEY_HERE` with a 32-character key. You can generate one by running `php artisan key:generate --show` locally.
6. Go to **Settings** -> **Deployments**:
   - Set the Custom **Start Command** to:
     ```bash
     php artisan migrate --force && php artisan db:seed --force && php artisan serve --host 0.0.0.0 --port $PORT
     ```
7. Go to **Settings** -> **Networking**:
   - Click **Generate Domain** to get a public URL for your backend (e.g., `https://pulsedesk-backend-production.up.railway.app`).

---

## Step 3: Deploy Frontend Service (React 19)
1. In the same project, click **New** -> **GitHub Repo**.
2. Select your repository: `forge2-yuvrajsingh`.
3. Rename the service to `pulsedesk-frontend`.
4. Go to the service's **Settings**:
   - Set **Root Directory** to `frontend`.
5. Go to the service's **Variables** and add:
   - `VITE_API_URL` = Your backend URL from Step 2 (e.g. `https://pulsedesk-backend-production.up.railway.app`).
6. Go to **Settings** -> **Networking**:
   - Click **Generate Domain** to get a public URL for your React app.

---

## Step 4: Access Your Deployed App
Once both builds are complete (green checkmarks in Railway), go to your frontend's generated domain URL. You can log in using the seeded credentials:

- **Email**: `admin@acmedemo.com`
- **Password**: `password`
