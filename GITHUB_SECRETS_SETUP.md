# GitHub Secrets Setup for Vercel Deployment

To enable automatic deployments via GitHub Actions, you need to add these secrets to your GitHub repository.

## Step 1: Get Vercel Credentials

### 1. Get Vercel Access Token

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions Token`
4. Copy the token (you'll only see it once!)
5. Save it as `VERCEL_TOKEN` in GitHub Secrets

### 2. Get Vercel Project IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
cd /home/kalki/Desktop/Archive/KAchra/EduCertEngine
vercel link

# Get project details
vercel project ls
```

After linking, check `.vercel/project.json`:
```bash
cat .vercel/project.json
```

This will show:
```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"

Add these secrets:

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel access token | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID` | Your Vercel team/org ID | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `.vercel/project.json` → `projectId` |
| `NEXT_PUBLIC_BASE_DOMAIN` | Your domain | `yourdomain.com` or `yourapp.vercel.app` |

### Optional Secrets (if different from Vercel env vars):

| Secret Name | Example Value |
|------------|---------------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your-secret-key-min-32-chars` |
| `NEXTAUTH_SECRET` | `your-nextauth-secret` |

## Step 3: Test GitHub Action

1. **Commit and Push** your changes
2. **Watch the Workflow**:
   - Go to your repository on GitHub
   - Click "Actions" tab
   - Watch the deployment workflow run

3. **Verify Deployment**:
   - Check Vercel dashboard
   - Visit your deployment URL
   - Test subdomain routing

## Workflow Triggers

The GitHub Action automatically runs when:

- ✅ Push to `main` or `master` branch → **Production deployment**
- ✅ Pull request opened/updated → **Preview deployment**

## Manual Deployment

If you prefer manual deployments:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Troubleshooting

### Error: "Project not found"

**Solution**: Run `vercel link` in your project directory first.

### Error: "Invalid token"

**Solution**: 
1. Generate new token in Vercel dashboard
2. Update `VERCEL_TOKEN` secret in GitHub

### Error: "Build failed"

**Solution**:
1. Check GitHub Actions logs
2. Verify environment variables in Vercel dashboard
3. Test build locally: `npm run build`

### Workflow not running

**Solution**:
1. Check if `.github/workflows/deploy-vercel.yml` exists
2. Verify branch names match (`main` or `master`)
3. Check GitHub Actions is enabled in repository settings

## Security Best Practices

1. ✅ Never commit `.vercel` directory (already in `.gitignore`)
2. ✅ Rotate tokens regularly (every 90 days)
3. ✅ Use separate tokens for different projects
4. ✅ Set token expiration dates
5. ✅ Review token permissions periodically

## Commands Quick Reference

```bash
# Link project to Vercel
vercel link

# Get project info
vercel project ls

# View deployments
vercel ls

# View logs
vercel logs

# Environment variables
vercel env ls
vercel env add [NAME] production
vercel env pull

# Domains
vercel domains ls
vercel domains add [domain]

# Remove project link
vercel unlink
```

## Next Steps

After setting up GitHub Actions:

1. ✅ Push your code to trigger first deployment
2. ✅ Add custom domain in Vercel dashboard
3. ✅ Configure wildcard subdomain
4. ✅ Update DNS records
5. ✅ Test subdomain routing
6. ✅ Monitor deployment logs

## Need Help?

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
