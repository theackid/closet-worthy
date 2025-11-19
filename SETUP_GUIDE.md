# Closet Worthy - Complete Setup Guide 🚀

Follow these steps to get your Closet Worthy app running from scratch.

---

## ⏱️ Estimated Time: 20-30 minutes

---

## Step 1: Prerequisites Check ✅

Before starting, make sure you have:

- [ ] Node.js 18 or higher installed ([Download here](https://nodejs.org/))
- [ ] A code editor (VS Code recommended)
- [ ] A terminal/command prompt
- [ ] A Supabase account (we'll create this together)
- [ ] An Anthropic API key (we'll get this together)

### Check Node.js Version

```bash
node --version
# Should show v18.0.0 or higher
```

---

## Step 2: Create Supabase Project (5 mins) 🗄️

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up with GitHub is fastest)
3. Click **"New Project"**
4. Fill in:
   - Name: `closet-worthy` (or any name you like)
   - Database Password: Generate a strong one and **SAVE IT**
   - Region: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

---

## Step 3: Set Up Database (3 mins) 📊

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the `database-schema.sql` file from the Closet Worthy folder
4. Copy the entire contents and paste into the SQL editor
5. Click **"Run"** (bottom right)
6. You should see "Success. No rows returned" ✅

**What this did:**
- Created 5 tables (brands, categories, subcategories, conditions, closet_items)
- Added 10 sample brands (Agolde, Isabel Marant, etc.)
- Added 10 categories (Jacket, Jeans, etc.)
- Added 16 subcategories (Denim, Bomber, etc.)
- Added 6 condition levels (New with tags → Fair)

---

## Step 4: Create Storage Bucket (2 mins) 📸

1. Click **"Storage"** in left sidebar
2. Click **"Create a new bucket"**
3. Name: `closet-photos`
4. **Important:** Toggle **"Public bucket"** to ON
5. Click **"Create bucket"**

---

## Step 5: Get Supabase Credentials (1 min) 🔑

1. Click **"Settings"** in left sidebar (gear icon at bottom)
2. Click **"API"**
3. Copy these two values (you'll need them in Step 8):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## Step 6: Get Anthropic API Key (3 mins) 🤖

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Click **"API Keys"** in the sidebar
4. Click **"Create Key"**
5. Name it "Closet Worthy"
6. Copy the key (starts with `sk-ant-`)
7. **Save it immediately** - you can't see it again!

**Cost Note:** Claude API has a free tier. For this app, you'll likely stay under $5/month even with heavy use.

---

## Step 7: Install the App (2 mins) 💻

Open your terminal and run:

```bash
cd path/to/closet-worthy
npm install
```

This will install all dependencies (~2-3 minutes).

---

## Step 8: Configure Environment Variables (2 mins) ⚙️

1. In the `closet-worthy` folder, create a new file called `.env.local`
2. Add these three lines:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
```

3. Replace the values with what you copied in Steps 5 and 6
4. Save the file

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-abc123...
```

---

## Step 9: Start the App! 🎉

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

Open your browser and go to **http://localhost:3000**

---

## Step 10: Add Your First Item 👕

1. Click **"Add Item"** in the top navigation
2. Upload a photo of a clothing item (or use a stock photo for testing)
3. Fill in:
   - Item Name: "Test Jeans"
   - Brand: Select "Agolde" from dropdown
   - Category: "Jeans"
   - Subcategory: "Denim"
   - Condition: "Excellent"
   - Size: "30"
   - Colour: "Washed Black"
4. Click **"Generate Prices"** - wait ~3 seconds
5. Click **"Generate Listing"** - wait ~5 seconds
6. Click **"Add Item"**

**Success!** You should see your item in the Items view 🎊

---

## Step 11: Explore the Dashboard 📊

1. Click **"Dashboard"** in the navigation
2. You should see:
   - Total items: 1
   - Retail and resale value estimates
   - Charts showing value by brand and category

Add a few more items to see the analytics in action!

---

## 🎯 Quick Tips

### Adding More Brands
Go to Supabase > SQL Editor and run:
```sql
INSERT INTO brands (name, website) VALUES
  ('Arc'teryx', 'https://arcteryx.com'),
  ('Stone Island', 'https://stoneisland.com');
```

### Adding More Categories
```sql
INSERT INTO categories (name, body_area) VALUES
  ('Coat', 'Top'),
  ('Skirt', 'Bottom');
```

### Updating Next.js Config for Your Supabase Domain
Edit `next.config.js` and replace `your-supabase-project` with your actual project ID:
```javascript
images: {
  domains: ['abcdefgh.supabase.co'],
}
```

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database schema loaded successfully
- [ ] Storage bucket `closet-photos` created and public
- [ ] `.env.local` file created with all 3 keys
- [ ] `npm install` completed without errors
- [ ] App runs at http://localhost:3000
- [ ] Can add an item with photos
- [ ] AI pricing generates values
- [ ] AI listing generates description
- [ ] Dashboard shows correct metrics

---

## 🎓 What's Next?

1. **Add Your Actual Closet Items**
   - Take photos of your clothes
   - Upload them one by one
   - Use AI features to speed up the process

2. **Customize Your Setup**
   - Add your favorite brands
   - Create custom subcategories
   - Adjust the styling in `tailwind.config.ts`

3. **Deploy to Production**
   - See the "Deployment" section in README.md
   - Vercel makes it one-click easy

---

## 🆘 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Supabase connection failed"
- Double-check your `.env.local` file
- Make sure the URL doesn't have a trailing slash
- Verify you copied the entire anon key

### "AI features not working"
- Verify your Anthropic API key is correct
- Check you have credits in your Anthropic account
- Look at terminal logs for error messages

### Photos not displaying
- Ensure storage bucket is **public**
- Check the bucket is named exactly `closet-photos`
- Verify Next.js config has correct Supabase domain

---

## 📧 Still Stuck?

Common issues and solutions:

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill
npm run dev
```

**TypeScript errors:**
```bash
npm run build
```
Fix any errors shown, then restart dev server.

---

**Congratulations! You're now running Closet Worthy! 🎉**

Start cataloguing your wardrobe and unlock insights into your closet's value!
