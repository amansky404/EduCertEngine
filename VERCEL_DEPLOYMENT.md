# Vercel Deployment Guide with Auto Subdomain Support

This guide explains how to deploy EduCertEngine on Vercel with automatic subdomain routing for multi-tenant universities.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Domain Name**: You'll need a domain (e.g., `educert.com`)
3. **MongoDB Atlas**: Set up a cloud MongoDB database
4. **GitHub Repository**: Push your code to GitHub

## Step 1: Prepare Your Database

### Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster or use existing
3. Create a database user with read/write permissions
4. Whitelist all IPs (`0.0.0.0/0`) for Vercel's dynamic IPs
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/educertengine?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Vercel

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"

2. **Import Git Repository**
   - Connect your GitHub account
   - Select the EduCertEngine repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_BASE_DOMAIN=educertengine.vercel.app
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/educertengine
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRE=30d
   NEXTAUTH_URL=https://educertengine.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)
   - Your app will be available at `https://educertengine.vercel.app`

### Method 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /home/kalki/Desktop/Archive/KAchra/EduCertEngine
   vercel
   ```

4. **Follow Prompts**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `educertengine`
   - In which directory? `./`
   - Want to override settings? `N`

5. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_BASE_DOMAIN
   # Enter: your-domain.vercel.app
   
   vercel env add MONGODB_URI
   # Enter: your-mongodb-connection-string
   
   vercel env add JWT_SECRET
   # Enter: your-jwt-secret
   
   vercel env add NEXTAUTH_SECRET
   # Enter: your-nextauth-secret
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Custom Domain

### Add Your Domain to Vercel

1. **Go to Project Settings**
   - Dashboard → Your Project → Settings → Domains

2. **Add Domain**
   - Click "Add"
   - Enter your domain: `educert.com`
   - Click "Add"

3. **Add Wildcard Subdomain**
   - Click "Add" again
   - Enter: `*.educert.com`
   - Click "Add"

### Update DNS Settings

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these DNS records:

#### For Vercel Nameservers (Recommended):

```
Type    Name    Value
NS      @       ns1.vercel-dns.com
NS      @       ns2.vercel-dns.com
```

#### Or use A/CNAME Records:

```
Type     Name    Value                       TTL
A        @       76.76.21.21                 3600
CNAME    *       cname.vercel-dns.com        3600
CNAME    www     cname.vercel-dns.com        3600
```

**Note**: DNS propagation can take 24-48 hours.

## Step 4: Verify Deployment

### Test Main Domain
```bash
curl https://educert.com
```

### Test Subdomain
1. **Create a University** with subdomain `tech-uni`
2. **Access**: `https://tech-uni.educert.com`

### Test API Endpoints
```bash
# Health check
curl https://educert.com/api/health

# Login
curl -X POST https://educert.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@educert.com","password":"admin123"}'
```

## Step 5: Update Environment Variables

After adding custom domain, update `NEXT_PUBLIC_BASE_DOMAIN`:

```bash
vercel env rm NEXT_PUBLIC_BASE_DOMAIN production
vercel env add NEXT_PUBLIC_BASE_DOMAIN production
# Enter: educert.com
```

Then redeploy:
```bash
vercel --prod
```

## Subdomain Routing

The middleware automatically handles subdomain routing:

- `educert.com` → Main platform (landing page, admin)
- `tech-uni.educert.com` → Tech University portal
- `medical.educert.com` → Medical College portal

### How It Works

1. **Middleware Detection** (`middleware.ts`):
   - Extracts subdomain from request hostname
   - Adds subdomain to request headers
   - Routes to appropriate university content

2. **University Pages**:
   - Each university gets isolated routes
   - Dynamic data fetching based on subdomain
   - Shared components, isolated data

## File Storage Configuration

Since Vercel is serverless, modify file storage:

### Option 1: Vercel Blob Storage

```bash
npm install @vercel/blob
```

Update upload handlers to use Vercel Blob.

### Option 2: AWS S3

```bash
npm install @aws-sdk/client-s3
```

Configure S3 for certificate and template storage.

### Option 3: Cloudinary

```bash
npm install cloudinary
```

Use Cloudinary for image and PDF storage.

## Database Migration

Run migrations after first deployment:

```bash
# Install Prisma CLI locally
npm install -D prisma

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

Or use the seed script:
```bash
node seed-prisma.js
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_DOMAIN` | Your main domain | `educert.com` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `NEXTAUTH_URL` | NextAuth base URL | `https://educert.com` |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-nextauth-secret` |
| `NODE_ENV` | Environment | `production` |

## Monitoring & Logs

### View Deployment Logs
```bash
vercel logs
```

### View Build Logs
- Dashboard → Project → Deployments → Click deployment → View Logs

### Enable Analytics
- Dashboard → Project → Analytics tab
- Enable Web Analytics

## Troubleshooting

### Issue: Subdomain Not Working

**Solution:**
1. Verify wildcard domain added in Vercel
2. Check DNS propagation: `nslookup tech-uni.educert.com`
3. Ensure `NEXT_PUBLIC_BASE_DOMAIN` is set correctly
4. Check middleware logs in Vercel dashboard

### Issue: Database Connection Failed

**Solution:**
1. Verify MongoDB URI in environment variables
2. Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0`)
3. Ensure database user has correct permissions
4. Test connection string locally

### Issue: Build Failed

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies in `package.json`
3. Ensure TypeScript compilation succeeds locally
4. Check for missing environment variables

### Issue: API Routes 404

**Solution:**
1. Verify API routes are in `/app/api` directory
2. Check `next.config.js` configuration
3. Ensure middleware isn't blocking API routes
4. Review Vercel function logs

### Issue: Files Not Uploading

**Solution:**
1. Vercel has 4.5MB limit for serverless functions
2. Implement external storage (S3, Cloudinary, Vercel Blob)
3. Use direct upload to storage provider
4. Update upload handlers accordingly

## Performance Optimization

### Enable Edge Functions
Add to `middleware.ts`:
```typescript
export const config = {
  matcher: [/*...*/],
  runtime: 'edge'
}
```

### Enable ISR (Incremental Static Regeneration)
In page components:
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
```

### Use Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
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

## Security Best Practices

1. **Use Environment Variables** for all secrets
2. **Enable HTTPS** (automatic with Vercel)
3. **Set Security Headers** (configured in `vercel.json`)
4. **Rate Limiting**: Use Vercel's built-in protection
5. **CORS Configuration**: Set in API routes
6. **JWT Rotation**: Implement token refresh
7. **Regular Updates**: Keep dependencies updated

## Continuous Deployment

### Automatic Deployments
- Every push to `main` branch triggers production deployment
- Every push to other branches creates preview deployment
- Pull requests get automatic preview URLs

### Manual Deployments
```bash
vercel --prod
```

### Rollback
```bash
vercel rollback
```

## Cost Estimation

### Vercel Pricing (Hobby Plan - Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ 100 hours serverless function execution
- ✅ Custom domains
- ✅ SSL certificates

### Vercel Pro ($20/month)
- 1 TB bandwidth
- 1000 hours execution
- Team collaboration
- Analytics
- Password protection

### MongoDB Atlas (Free Tier)
- 512 MB storage
- Shared RAM
- Suitable for development/testing

### MongoDB Atlas (M10 - $57/month)
- 10 GB storage
- 2 GB RAM
- Production-ready

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure custom domain
3. ✅ Set up wildcard subdomain
4. 🔄 Implement external file storage
5. 🔄 Set up monitoring and alerts
6. 🔄 Configure backup strategy
7. 🔄 Set up CI/CD pipeline
8. 🔄 Load testing

## Support

### Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

### Getting Help
1. Check Vercel deployment logs
2. Review this documentation
3. Check GitHub Issues
4. Contact Vercel Support (Pro plan)

## Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Environment variables
vercel env ls
vercel env add [name]
vercel env rm [name]

# Domain management
vercel domains ls
vercel domains add [domain]
vercel domains rm [domain]

# Rollback
vercel rollback

# Link local project
vercel link

# Pull environment variables
vercel env pull
```

---

**Ready to Deploy?** Follow Step 1 and start deploying! 🚀
