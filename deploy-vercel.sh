#!/bin/bash

# Vercel Deployment Script for EduCertEngine
# This script helps you deploy to Vercel with all necessary configurations

echo "🚀 EduCertEngine Vercel Deployment Script"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✓ MongoDB Atlas database set up"
echo "2. ✓ Database connection string ready"
echo "3. ✓ Domain name ready (optional)"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "🔐 Setting up environment variables..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cat > .env << EOL
NEXT_PUBLIC_BASE_DOMAIN=localhost:3000
MONGODB_URI=mongodb://localhost:27017/educertengine
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=30d
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
EOL
    echo "✅ Created .env file with random secrets"
else
    echo "✅ .env file exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps
echo "✅ Dependencies installed"

echo ""
echo "🧪 Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi
echo "✅ Build successful"

echo ""
echo "🌐 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Go to Vercel dashboard: https://vercel.com/dashboard"
    echo "2. Add environment variables in Project Settings"
    echo "3. Add your custom domain in Domains settings"
    echo "4. Add wildcard subdomain: *.yourdomain.com"
    echo "5. Update NEXT_PUBLIC_BASE_DOMAIN environment variable"
    echo ""
    echo "🔗 Important URLs:"
    echo "   - Vercel Dashboard: https://vercel.com/dashboard"
    echo "   - MongoDB Atlas: https://cloud.mongodb.com"
    echo "   - Documentation: ./VERCEL_DEPLOYMENT.md"
    echo ""
else
    echo "❌ Deployment failed. Check errors above."
    exit 1
fi
