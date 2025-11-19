# Closet Worthy - Quick Reference Card 🚀

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Type checking
npm run lint
```

---

## Common Tasks

### Add a New Brand to Database

```sql
-- In Supabase SQL Editor
INSERT INTO brands (name, website, notes) VALUES
  ('Rick Owens', 'https://rickowens.eu', 'Italian avant-garde designer');
```

### Add a New Category

```sql
INSERT INTO categories (name, body_area) VALUES
  ('Coat', 'Top');
```

### Add a New Subcategory

```sql
-- First, get the category ID
SELECT id, name FROM categories WHERE name = 'Jacket';

-- Then insert subcategory with that ID
INSERT INTO subcategories (name, category_id) VALUES
  ('Leather Jacket', 'paste-category-uuid-here');
```

### Bulk Update Item Status

```sql
-- Mark multiple items as "Sell"
UPDATE closet_items 
SET status = 'Sell' 
WHERE brand_id = (SELECT id FROM brands WHERE name = 'Agolde');
```

---

## File Structure Quick Reference

```
src/
├── app/
│   ├── api/ai/          # AI endpoints (recognize, pricing, listing)
│   ├── layout.tsx       # App shell
│   └── page.tsx         # Main app
├── components/
│   ├── Dashboard.tsx    # Analytics & metrics
│   ├── ItemForm.tsx     # Add/edit form
│   └── ItemList.tsx     # Grid view
├── lib/
│   ├── ai.ts           # AI helper functions
│   └── supabase.ts     # DB client
└── types/
    └── index.ts        # TypeScript interfaces
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Database Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `brands` | Store brands | name, website |
| `categories` | Top-level types | name, body_area |
| `subcategories` | Detailed types | name, category_id |
| `conditions` | Item conditions | label, score |
| `closet_items` | Main inventory | item_name, photos, pricing |

---

## Useful SQL Queries

### See All Items with Full Details
```sql
SELECT 
  ci.item_name,
  b.name as brand,
  c.name as category,
  co.label as condition,
  ci.retail_price_cad,
  ci.resale_price_cad
FROM closet_items ci
LEFT JOIN brands b ON ci.brand_id = b.id
LEFT JOIN categories c ON ci.category_id = c.id
LEFT JOIN conditions co ON ci.condition_id = co.id
ORDER BY ci.created_at DESC;
```

### Get Items Missing Photos
```sql
SELECT item_name, brand_id 
FROM closet_items 
WHERE photo_urls IS NULL OR photo_urls = '{}';
```

### Get Items Missing Pricing
```sql
SELECT item_name, brand_id 
FROM closet_items 
WHERE retail_price_cad IS NULL OR resale_price_cad IS NULL;
```

### Total Value by Brand
```sql
SELECT 
  b.name,
  COUNT(ci.id) as items,
  SUM(ci.retail_price_cad) as total_retail,
  SUM(ci.estimated_resale_value_cad) as total_resale
FROM closet_items ci
LEFT JOIN brands b ON ci.brand_id = b.id
GROUP BY b.name
ORDER BY total_resale DESC;
```

---

## API Endpoints

### AI Recognition
```typescript
POST /api/ai/recognize
Body: {
  itemName: string,
  brandOverride?: string,
  categoryName?: string,
  // ... other fields
}
```

### AI Pricing
```typescript
POST /api/ai/pricing
Body: {
  brandName: string,
  itemName: string,
  categoryName: string,
  conditionLabel: string,
  // ... other fields
}
```

### AI Listing
```typescript
POST /api/ai/listing
Body: {
  brandName: string,
  itemName: string,
  size: string,
  colour: string,
  conditionLabel: string,
  // ... other fields
}
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open Add Item | (Click + button) |
| Search Items | Click search box |
| Close Form | Click X or Cancel |

---

## Customization Quick Tips

### Change Primary Color
Edit `tailwind.config.ts`:
```typescript
primary: {
  500: '#your-color-here',
  // ...
}
```

### Adjust AI Prompts
Edit `src/lib/ai.ts` - modify the prompt strings

### Add New Status Options
Update database:
```sql
ALTER TABLE closet_items 
DROP CONSTRAINT closet_items_status_check;

ALTER TABLE closet_items 
ADD CONSTRAINT closet_items_status_check 
CHECK (status IN ('Keep', 'Sell', 'Donate', 'Archive', 'Repair'));
```

Then update TypeScript types in `src/types/index.ts`

---

## Troubleshooting Quick Fixes

**Can't connect to Supabase:**
```bash
# Check .env.local exists and has correct values
cat .env.local
```

**Photos not showing:**
```bash
# Verify bucket is public in Supabase Storage settings
```

**AI not working:**
```bash
# Check Anthropic API key is valid
# View server logs for detailed error messages
```

**TypeScript errors:**
```bash
# Rebuild
npm run build
```

**Port in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

---

## Backup Your Data

### Export All Items
In Supabase SQL Editor:
```sql
COPY (
  SELECT * FROM closet_items
) TO '/tmp/closet_items_backup.csv' WITH CSV HEADER;
```

Then download from Supabase dashboard.

### Manual Backup (Recommended)
Go to: Supabase > Database > Backups > Download

---

## Performance Tips

1. **Optimize Photos** - Compress before upload (use TinyPNG or similar)
2. **Batch AI Calls** - Add 5+ items at once before generating prices
3. **Use Subcategories** - Makes filtering faster
4. **Regular Exports** - Keep monthly CSV backups

---

## Feature Flags / Config

All AI features can be disabled by simply not setting `ANTHROPIC_API_KEY`.

App will work without AI - you'll just manually enter pricing and descriptions.

---

## Deploy to Production

### Vercel (Easiest)
```bash
npm install -g vercel
vercel
# Follow prompts
# Add env vars in Vercel dashboard
```

### Build Manually
```bash
npm run build
npm start
```

---

## Need Help?

1. Check README.md for detailed docs
2. Check SETUP_GUIDE.md for setup steps
3. Review database-schema.sql for DB structure
4. Check browser console for frontend errors
5. Check terminal for backend errors

---

## Version History

- **v1.0** (Initial Release)
  - Core inventory management
  - AI recognition, pricing, listing
  - Dashboard with analytics
  - Mobile responsive

---

**Happy Closet Managing! 👕**
