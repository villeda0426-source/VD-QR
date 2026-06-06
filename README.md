# Villedas Delight — Social Media Campaign App

A mobile-first web app that rewards customers with a free drink coupon after visiting all three social media profiles.

**Flow:** Scan QR → visit Facebook, Instagram & TikTok → earn a unique `VDELIGHT-XXXXXX` coupon → redeem in-store.

---

## Project Structure

```
villedas-delight-campaign/
├── backend/          Node.js/Express API → deploy to Render.com
├── frontend/         React (Vite) app   → deploy to Vercel
├── database/         schema.sql         → run once in Supabase
├── qr-generator/     Generates QR PNG   → run locally after deploy
└── README.md
```

---

## Prerequisites

- Node.js 18+
- A GitHub account
- Free accounts on: Supabase, Render.com, Vercel

---

## Step 1 — GitHub Setup

```bash
# In the project root
git init
git add .
git commit -m "Initial commit"

# Create a new repo at https://github.com/new (no README, no .gitignore)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/villedas-delight-campaign.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Supabase Setup

1. Go to https://supabase.com → **New Project**
2. Name it `villedas-delight`, set a database password, choose a region close to you
3. Wait for the project to provision (~1 min)
4. Go to **SQL Editor** → paste the entire contents of `database/schema.sql` → **Run**
5. Go to **Project Settings → API**:
   - Copy **Project URL** (looks like `https://xxxx.supabase.co`)
   - Copy **service_role** key (the secret one, NOT anon)
   - Save both — you'll need them for the backend

---

## Step 3 — Backend: Deploy to Render.com

1. Go to https://render.com → **New → Web Service**
2. Connect your GitHub account → select the `villedas-delight-campaign` repo
3. Configure the service:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Plan:** Free
4. Add Environment Variables (Settings → Environment):
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJ...your-service-role-key...
   ADMIN_API_KEY=choose-any-strong-secret-string
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
   *(Fill in FRONTEND_URL after Step 4 — you can update it later)*
5. Click **Deploy** — wait for it to go live
6. Copy the service URL (e.g. `https://villedas-api.onrender.com`)

---

## Step 4 — Frontend: Deploy to Vercel

1. Go to https://vercel.com → **New Project**
2. Import from GitHub → select the same repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://villedas-api.onrender.com
   ```
   *(Use the Render URL from Step 3)*
5. Click **Deploy** — Vercel gives you a URL like `https://villedas-delight.vercel.app`
6. Go back to Render → update `FRONTEND_URL` with this Vercel URL → redeploy

---

## Step 5 — Generate the QR Code

After both services are live, decide on the final campaign URL. If you have a custom domain set up on Vercel, use that; otherwise use the Vercel URL.

```bash
cd qr-generator
npm install
CAMPAIGN_URL=https://villedasdelight.com node generate-qr.js
# → saves campaign-qr.png in this folder
```

Print `campaign-qr.png` at 2" × 2" or larger. Use it on:
- Table tents & menus
- Point-of-sale signage
- Receipts (if thermal printer supports it)
- Social media posts as a story sticker

---

## Step 6 — Custom Domain (optional but recommended)

In Vercel:
1. Project Settings → **Domains** → Add `villedasdelight.com`
2. Follow Vercel's DNS instructions (add CNAME in your domain registrar)
3. Update `CAMPAIGN_URL` for QR generation and regenerate QR

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env          # fill in your Supabase credentials
npm install
npm run dev                   # starts on http://localhost:3001

# Terminal 2 — Frontend
cd frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:3001
npm install
npm run dev                   # starts on http://localhost:5173
```

---

## Admin Dashboard

Access at `/admin` (e.g. `https://villedas-delight.vercel.app/admin`).

- Enter the `ADMIN_API_KEY` you set in Render to log in
- View all generated coupons with status (Active / Redeemed / Expired)
- Tap **Redeem** to mark a coupon used at point of sale
- Stats panel shows total sessions, issued coupons, and redemption count

---

## Campaign Config

All campaign-specific values live in two files — edit these to update URLs, copy, or reward text:

| File | Controls |
|---|---|
| `frontend/src/config/config.js` | Social URLs, brand copy, reward text |
| `backend/src/config.js` | Platform list, coupon prefix, expiration days |

---

## Environment Variables Summary

### Backend (Render.com)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key (keep secret) |
| `ADMIN_API_KEY` | Password for the admin dashboard |
| `FRONTEND_URL` | Your Vercel app URL (for CORS) |
| `PORT` | Set automatically by Render |

### Frontend (Vercel)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Your Render.com API URL |
