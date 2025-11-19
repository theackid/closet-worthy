# Closet Worthy 👕

**AI-Powered Closet Inventory & Resale System**

A beautiful, full-stack web app to manage your wardrobe, track item values, generate AI-powered resale listings, and optimize your closet for Keep/Sell/Donate decisions.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Claude AI](https://img.shields.io/badge/Claude-AI-orange)

---

## ✨ Features

### Core Functionality
- 📸 **Photo Upload** - Upload multiple photos per item
- 🤖 **AI Recognition** - Automatically identify brands, categories, materials
- 💰 **AI Pricing** - Estimate retail and resale prices in CAD
- 📝 **AI Listing Generator** - Create Grailed/Vestiaire-ready descriptions
- 🏷️ **Smart Organization** - Auto-categorize by brand, category, subcategory
- 📊 **Dashboard Analytics** - Track total value, sell queue, and more

### Advanced Features
- 🔍 **Search & Filter** - Find items by name, brand, category, colour
- 📈 **Value Tracking** - See retail vs resale value
- 🎯 **Keep/Sell/Donate** - Organize your closet decisions
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌐 **Real-time Updates** - Instant syncing across views
- 💾 **Export Ready** - CSV export capability (coming soon)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)
- An Anthropic API key (for AI features)

### 1. Clone & Install

```bash
cd closet-worthy
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire `database-schema.sql` file
3. Go to **Storage** and create a bucket named `closet-photos` (make it public)
4. Copy your project URL and anon key from **Settings > API**

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 How to Use

### Adding Your First Item

1. Click **"Add Item"** in the top navigation
2. Upload photos of your clothing item
3. Fill in basic details:
   - Item name (e.g., "90s Pinch Waist Jeans")
   - Select brand from dropdown
   - Select category (Jacket, Jeans, etc.)
   - Choose condition
   - Add size, colour, purchase info
4. Click **"Generate Prices"** to get AI estimates
5. Click **"Generate Listing"** for resale descriptions
6. Save!

### Using AI Features

**AI Pricing:**
- Requires: Brand, Item Name, Category, Condition
- Estimates both retail and resale value in CAD
- Uses Claude AI to analyze brand, market trends, condition

**AI Listing:**
- Requires: All pricing fields + size + colour
- Generates platform-ready title and description
- Optimized for Grailed, Vestiaire, Poshmark, etc.

### Managing Your Closet

**Dashboard View:**
- See total retail and resale value
- Track items needing photos or pricing
- View value distribution by brand and category

**Items View:**
- Browse all items in a grid
- Filter by Keep/Sell/Donate status
- Search by name, brand, category, or colour
- Quick edit or delete actions

---

## 🗂️ Project Structure

```
closet-worthy/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   └── ai/           # AI endpoints
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main app page
│   ├── components/           # React components
│   │   ├── Dashboard.tsx     # Analytics dashboard
│   │   ├── ItemForm.tsx      # Add/Edit form
│   │   └── ItemList.tsx      # Items grid view
│   ├── lib/
│   │   ├── ai.ts            # AI helper functions
│   │   └── supabase.ts      # Database client
│   └── types/
│       └── index.ts         # TypeScript types
├── database-schema.sql       # Complete DB setup
├── package.json
└── README.md
```

---

## 🎨 Database Schema

The app uses 5 main tables:

1. **brands** - Store brand information
2. **categories** - Top-level categories (Jacket, Jeans, etc.)
3. **subcategories** - Detailed types (Denim, Bomber, etc.)
4. **conditions** - Item condition ratings (NWT, Excellent, etc.)
5. **closet_items** - Your actual inventory

All tables have proper relationships and indexes for performance.

---

## 🤖 AI Integration

### Claude API (Anthropic)

The app uses Claude Sonnet 4 for three AI features:

1. **Item Recognition** (`/api/ai/recognize`)
   - Analyzes photos and text to identify items
   - Returns structured data about brand, type, materials

2. **Pricing Estimation** (`/api/ai/pricing`)
   - Estimates retail price based on brand/category
   - Calculates realistic resale value considering condition

3. **Listing Generation** (`/api/ai/listing`)
   - Creates SEO-optimized titles
   - Writes compelling descriptions for resale platforms

All AI calls are server-side to protect your API key.

---

## 🎯 Customization

### Adding Brands

```sql
INSERT INTO brands (name, website) VALUES
  ('Your Brand', 'https://brand.com');
```

### Adding Categories

```sql
INSERT INTO categories (name, body_area) VALUES
  ('Outerwear', 'Top');
```

### Modifying AI Prompts

Edit the prompts in `src/lib/ai.ts` to customize how Claude analyzes your items.

---

## 📱 Mobile Experience

The app is fully responsive:
- Touch-friendly photo upload
- Swipe-friendly item cards
- Mobile navigation drawer
- Floating action button for quick adds

---

## 🔒 Security Notes

- Never commit `.env.local` to git
- Supabase RLS (Row Level Security) is enabled
- API keys are server-side only
- Photos are stored in public Supabase bucket (configure auth if needed)

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

### Other Platforms

Works on any Node.js hosting:
- Netlify
- Railway
- Render
- AWS Amplify

---

## 🛣️ Roadmap

- [ ] Barcode scanning for easier entry
- [ ] CSV/Excel export
- [ ] Advanced filtering (price ranges, date ranges)
- [ ] Multi-platform listing sync
- [ ] Outfit builder
- [ ] Wear tracking (track which items you wear most)
- [ ] Seasonal analytics

---

## 💡 Tips & Best Practices

1. **Take clear photos** - Front, back, tags, and detail shots
2. **Be specific with names** - "Agolde 90s Pinch Waist" beats "Jeans"
3. **Use brand override** - For sub-brands like "Isabel Marant Étoile"
4. **Review AI prices** - They're estimates; adjust based on your knowledge
5. **Add purchase price** - Track ROI over time
6. **Consistent conditions** - Use the same standards across items

---

## 🤝 Contributing

This is a personal project template, but feel free to:
- Fork and customize
- Submit issues for bugs
- Suggest features
- Share your version!

---

## 📄 License

MIT License - Use freely for personal or commercial projects

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- AI by [Anthropic Claude](https://anthropic.com/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

---

## 📧 Support

Questions? Issues? 

1. Check the database schema is properly loaded
2. Verify all environment variables are set
3. Ensure Supabase storage bucket is created and public
4. Check browser console for errors

---

**Made with ❤️ for closet organization enthusiasts**
