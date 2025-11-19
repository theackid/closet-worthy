# Closet Worthy - Deployment Guide 🚀

Get your Closet Worthy app live on the internet!

---

## 🎯 Recommended: Vercel (5 minutes)

Vercel is made by the Next.js team and offers:
- ✅ Free tier (perfect for personal use)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration
- ✅ Automatic deployments from GitHub

### Step 1: Prepare Your Code

1. Make sure your project works locally:
```bash
npm run build
```

2. Push to GitHub (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/closet-worthy.git
git push -u origin main
```

### Step 2: Deploy to Vercel

**Option A: Vercel CLI (Fastest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from your project folder)
cd closet-worthy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? closet-worthy
# - In which directory is your code located? ./
# - Want to override settings? No
```

**Option B: Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js settings
5. Click **"Deploy"**

### Step 3: Add Environment Variables

In Vercel dashboard:
1. Go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add these three variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

4. Click **"Save"**
5. Go to **"Deployments"** and **"Redeploy"**

### Step 4: Update Supabase CORS

In Supabase dashboard:
1. Go to **Settings** → **API**
2. Add your Vercel URL to allowed origins:
   - `https://your-app.vercel.app`

### Step 5: Test Your Live App! 🎉

Visit: `https://your-app.vercel.app`

---

## 🔄 Automatic Deployments

With Vercel + GitHub:
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Auto-creates preview deployments
- Pull requests → Auto-generates preview links

Example workflow:
```bash
git checkout -b add-new-feature
# Make changes
git add .
git commit -m "Add awesome feature"
git push origin add-new-feature
# Create PR on GitHub
# Vercel auto-creates preview at: https://closet-worthy-preview-123.vercel.app
```

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. Buy a domain (Namecheap, GoDaddy, Cloudflare)
2. In Vercel dashboard:
   - Click **"Domains"**
   - Enter your domain: `closetworthy.com`
   - Follow DNS setup instructions
3. Wait 5-60 minutes for DNS to propagate
4. Done! ✅

Vercel provides:
- Free SSL certificate
- Automatic HTTPS redirect
- Global CDN

---

## 🏗️ Alternative Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod

# Follow prompts and add env vars in dashboard
```

### Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Add environment variables
5. Deploy!

### AWS Amplify

1. Go to AWS Amplify Console
2. Connect your GitHub repo
3. Configure build settings (auto-detected)
4. Add environment variables
5. Deploy

---

## 📊 Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] Supabase RLS policies configured
- [ ] Storage bucket is properly secured
- [ ] Database has proper indexes (already done in schema)
- [ ] Next.js config has correct image domains
- [ ] .env.local is in .gitignore (never commit secrets!)
- [ ] Test all features work in production
- [ ] Set up error monitoring (optional: Sentry)

---

## 🔒 Security Best Practices

### Supabase RLS (Row Level Security)

Already configured in the schema, but you can add user-specific rules:

```sql
-- Example: If you add user authentication
CREATE POLICY "Users can only see their own items"
ON closet_items FOR SELECT
USING (auth.uid() = user_id);
```

### Environment Variables

- ✅ Never commit `.env.local`
- ✅ Use different API keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Use Vercel's encrypted storage

### API Rate Limiting

Consider adding rate limiting to AI endpoints:

```typescript
// In your API routes
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

---

## 📈 Monitoring & Analytics

### Vercel Analytics (Built-in)

In `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking with Sentry

1. Sign up at [sentry.io](https://sentry.io)
2. Install:
```bash
npm install @sentry/nextjs
```

3. Configure in `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "your-sentry-dsn",
  tracesSampleRate: 1.0,
})
```

---

## 🎯 Performance Optimization

### Image Optimization

Next.js automatically optimizes images. Ensure:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### Caching Strategy

```javascript
// Add revalidation to API routes
export const revalidate = 60 // Revalidate every 60 seconds
```

### Database Indexes

Already included in schema! Key indexes:
- `idx_closet_items_brand` - Fast brand queries
- `idx_closet_items_category` - Fast category filters
- `idx_closet_items_status` - Fast Keep/Sell/Donate filters

---

## 🔄 Database Backups

### Automatic Backups (Supabase Pro)

Upgrade to Pro for:
- Daily automatic backups
- Point-in-time recovery
- 7-day backup retention

### Manual Backups (Free Tier)

```sql
-- Export all data
COPY (SELECT * FROM closet_items) TO '/tmp/backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM brands) TO '/tmp/brands.csv' WITH CSV HEADER;
COPY (SELECT * FROM categories) TO '/tmp/categories.csv' WITH CSV HEADER;
```

Download from Supabase dashboard.

---

## 🚨 Troubleshooting Deployment

### Build Fails

```bash
# Check locally first
npm run build

# Common issues:
# - Missing env vars → Add to Vercel
# - TypeScript errors → Fix in code
# - Import errors → Check file paths
```

### 500 Server Error

Check Vercel logs:
1. Vercel Dashboard → Your Project
2. Click on the deployment
3. View "Runtime Logs"

Common causes:
- Missing `ANTHROPIC_API_KEY`
- Supabase connection issues
- API route errors

### Supabase Connection Issues

```bash
# Test connection locally
curl https://your-project.supabase.co/rest/v1/brands \
  -H "apikey: your-anon-key"

# Should return JSON with brands
```

### Images Not Loading

1. Check Supabase Storage bucket is public
2. Verify Next.js config has correct domain
3. Check browser console for CORS errors

---

## 💰 Cost Estimation

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- 6,000 build minutes/month
- Unlimited projects
- **Cost:** $0

**Supabase:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- **Cost:** $0

**Anthropic Claude API:**
- Pay-as-you-go
- ~$0.003 per 1K tokens (input)
- ~$0.015 per 1K tokens (output)
- Estimated ~$2-5/month for personal use
- **Cost:** ~$3/month

**Total:** ~$3/month (Claude API only)

### Scaling Costs

If you grow beyond free tiers:
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Claude API: Scales with usage

---

## 🎓 Next Steps

1. **Add Authentication**
   - Use Supabase Auth
   - Protect routes with middleware
   - Add user-specific RLS policies

2. **Add More Features**
   - Barcode scanning
   - Multi-platform listing sync
   - Outfit builder
   - Analytics dashboard

3. **Optimize Performance**
   - Add caching
   - Optimize images
   - Lazy load components

4. **Monitor Usage**
   - Set up Vercel Analytics
   - Add error tracking
   - Monitor API costs

---

## 📝 Post-Deployment Checklist

- [ ] App accessible at public URL
- [ ] All features working (Dashboard, Add Item, AI)
- [ ] Photos uploading and displaying
- [ ] Mobile responsive
- [ ] SSL certificate active (https://)
- [ ] Custom domain configured (optional)
- [ ] Analytics setup
- [ ] Database backups scheduled
- [ ] Error monitoring active

---

## 🎉 Congratulations!

Your Closet Worthy app is now live! Share it with:
- Friends who love fashion
- Resellers on Grailed/Poshmark
- Fashion communities
- Your social media

---

**Made with ❤️ for fashion enthusiasts everywhere**
