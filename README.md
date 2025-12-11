# SiteBooks

Professional job tracking and receipt management for UK tradespeople.

## Features

### Phase 1 (Current)
- ✅ Job tracking with property addresses
- ✅ Customer information management
- ✅ Receipt scanning with OCR (Tesseract)
- ✅ Profit calculation per job
- ✅ UK tax year management (April 6 - April 5)
- ✅ Payment status tracking
- ✅ Mileage tracker with HMRC rates
- ✅ Mobile-optimized PWA

### Phase 2 (Coming Soon)
- 🔄 Invoice generator
- 🔄 Tax estimator
- 🔄 Dashboard analytics
- 🔄 Calendar view
- 🔄 Backup & export features

### Phase 3 (Future)
- ⏳ Time tracking
- ⏳ Repeat customer tracking
- ⏳ Quote templates
- ⏳ Warranty tracking

## Tech Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **OCR:** Tesseract.js
- **Hosting:** Vercel
- **PWA:** Next-PWA

## Brand Colors

- **Charcoal:** #2C3E50 (Primary)
- **Amber:** #E67E22 (Accent)
- **Profit Green:** #27AE60
- **Cost Red:** #E74C3C

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_APP_NAME=SiteBooks
NEXT_PUBLIC_COMPANY_EMAIL=info@sitebooks.co.uk
NEXT_PUBLIC_OWNER_NAME=Craig Jeavons
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

See `database/schema.sql` for the complete database schema.

Run this in your Supabase SQL editor to set up tables.

## Project Structure

```
sitebooks/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # React components
├── lib/               # Libraries (Supabase, etc.)
├── types/             # TypeScript types
├── utils/             # Utility functions
├── pages/api/         # API routes
└── public/            # Static assets
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## License

Private - All Rights Reserved

## Support

Email: info@sitebooks.co.uk
