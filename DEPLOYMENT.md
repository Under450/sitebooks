# SiteBooks Deployment Guide

## Phase 1 - Initial Setup Complete ✅

The following has been built:
- ✅ Project structure
- ✅ Database schema
- ✅ Type definitions
- ✅ Utility functions (tax year, formatting, etc.)
- ✅ Homepage with tile-based UI
- ✅ Branding (Charcoal + Amber)
- ✅ Mobile-first responsive design
- ✅ PWA manifest

## Next Steps for Deployment

### 1. Set Up Supabase

1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key
4. Run the SQL in `database/schema.sql` in the SQL Editor
5. Create a storage bucket called "receipts"

### 2. Set Up Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_APP_NAME=SiteBooks
NEXT_PUBLIC_COMPANY_EMAIL=info@sitebooks.co.uk
NEXT_PUBLIC_OWNER_NAME=Craig Jeavons
```

### 3. Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Vercel

Option A - Via GitHub:
1. Push this code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repository
4. Add environment variables
5. Deploy

Option B - Via Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel
```

### 5. Post-Deployment

1. Test on iPhone
2. Add to home screen (PWA)
3. Create first job
4. Upload first receipt

## What's Built (Phase 1)

### Core Features
- Tax year management (UK April 6 - April 5)
- Job tracking structure
- Receipt upload capability
- Mileage tracking structure
- Database schema
- Mobile-optimized UI

### What's Next (Need to Build)
- Job creation form
- Job list view
- Receipt scanning with OCR
- Receipt list per job
- Mileage entry form
- Basic authentication
- Export functionality

## Current Status

**Phase 1A Complete**: Foundation & Homepage
**Phase 1B Next**: Forms & CRUD operations

Estimated time to complete Phase 1B: 2-3 hours
