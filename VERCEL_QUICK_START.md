# 🚀 Quick Vercel Deployment Guide

## One-Command Deployment

```bash
npm run deploy:vercel
```

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_BASE_DOMAIN=your-app.vercel.app
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/educertengine
JWT_SECRET=your-secret-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

## Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project → Settings → Domains
   - Add: `yourdomain.com`
   - Add: `*.yourdomain.com` (for subdomains)

2. **Update DNS Records**
   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   *       cname.vercel-dns.com
   ```

3. **Update Environment Variable**
   ```env
   NEXT_PUBLIC_BASE_DOMAIN=yourdomain.com
   ```

## Subdomain Access

After deployment:
- Main: `https://yourdomain.com`
- University: `https://tech-uni.yourdomain.com`
- Another: `https://medical.yourdomain.com`

## Database Setup

1. Create MongoDB Atlas cluster (free tier available)
2. Whitelist all IPs: `0.0.0.0/0`
3. Get connection string
4. Add to Vercel environment variables

## Testing

```bash
# Test main domain
curl https://your-app.vercel.app

# Test subdomain (after creating university)
curl https://tech-uni.your-app.vercel.app

# Test API
curl https://your-app.vercel.app/api/health
```

## Full Documentation

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete guide.

## Troubleshooting

**Build fails?**
- Check logs in Vercel dashboard
- Ensure all dependencies are installed
- Verify environment variables

**Subdomain not working?**
- Verify wildcard domain added in Vercel
- Check DNS propagation: `nslookup subdomain.yourdomain.com`
- Ensure `NEXT_PUBLIC_BASE_DOMAIN` is correct

**Database connection error?**
- Verify MongoDB URI
- Check IP whitelist in MongoDB Atlas
- Ensure database user has permissions

## Support

Need help? Check:
1. [Vercel Documentation](https://vercel.com/docs)
2. [Full Deployment Guide](./VERCEL_DEPLOYMENT.md)
3. [Project Issues](https://github.com/yourusername/EduCertEngine/issues)
