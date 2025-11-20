# How to Run EduCertEngine - Quick Start Guide

This guide provides simple, step-by-step instructions to get EduCertEngine running on your local machine or server.

## 🎯 Overview

EduCertEngine is a Next.js application that can run in:
- **Development mode** - For local development and testing
- **Production mode** - For deployment to servers

## 📋 Prerequisites

Before you begin, make sure you have:

✅ **Node.js** (version 18 or higher)
- Download from: https://nodejs.org/
- Check version: `node --version`

✅ **npm** (comes with Node.js)
- Check version: `npm --version`

✅ **Git** (for cloning the repository)
- Download from: https://git-scm.com/
- Check version: `git --version`

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/amansky404/EduCertEngine.git
cd EduCertEngine
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages (may take 2-3 minutes).

### Step 3: Set Up Environment Variables

Create your environment file:

```bash
cp .env.example .env
```

The default settings in `.env` work for local development. No changes needed!

### Step 4: Set Up the Database

Run these commands in order:

```bash
# Generate Prisma Client
npx prisma generate

# Create the database and run migrations
npx prisma migrate dev --name init
```

### Step 5: Start the Application

```bash
npm run dev
```

**That's it!** The application is now running at:

🌐 **http://localhost:3000**

Open this URL in your browser to see EduCertEngine running!

---

## 🎮 First-Time Setup

After running the application for the first time:

### Create Super Admin Account

1. **Open your browser** and go to: `http://localhost:3000/superadmin/register`

2. **Fill in the registration form**:
   - Name: Your name
   - Email: Your email address
   - Password: Choose a secure password

3. **Click "Register"**

4. **Log in** at `http://localhost:3000/superadmin/login` with your credentials

### Create Your First University

1. **After logging in**, you'll see the Super Admin dashboard

2. **Click "Create University"**

3. **Fill in the details**:
   - University Name: e.g., "Tech University"
   - Subdomain: e.g., "techuni" (will become techuni.localhost:3000)
   - Slug: e.g., "tech-university"
   - Colors: Choose your university colors
   - Enable QR Codes: Check this box

4. **Create University Admin Account** (for this university)

5. **Save**

### Access Your University

Your university is now available at:

🎓 **http://techuni.localhost:3000**

(Replace "techuni" with your chosen subdomain)

> **Note for Local Testing**: 
> On some systems, you may need to add entries to your hosts file:
> - macOS/Linux: `/etc/hosts`
> - Windows: `C:\Windows\System32\drivers\etc\hosts`
> 
> Add this line:
> ```
> 127.0.0.1 techuni.localhost
> ```

---

## 🛠️ Development Mode

Development mode includes:
- Hot reloading (changes reflect immediately)
- Detailed error messages
- Development tools enabled

### Starting Development Server

```bash
npm run dev
```

**Default port**: 3000
**URL**: http://localhost:3000

### Change Port (if needed)

If port 3000 is already in use:

```bash
PORT=3001 npm run dev
```

Now access at: http://localhost:3001

### Stop Development Server

Press `Ctrl + C` in the terminal where the server is running.

---

## 🏭 Production Mode

Production mode is optimized for:
- Better performance
- Smaller bundle size
- Security hardening

### Build for Production

```bash
npm run build
```

This creates an optimized production build (takes 1-2 minutes).

### Start Production Server

```bash
npm start
```

**URL**: http://localhost:3000

### Environment Configuration for Production

Edit `.env` file:

```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secure-production-secret-min-32-chars"
NEXT_PUBLIC_BASE_DOMAIN="yourdomain.com"
```

### Deploy Production Database Migrations

```bash
npx prisma migrate deploy
```

---

## 📦 Available Scripts

Here are all the commands you can use:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Check code quality |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Create and apply database migration |
| `npx prisma migrate deploy` | Deploy migrations to production |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Push schema changes (dev only) |

---

## 🗄️ Database Management

### View Database in Browser

```bash
npx prisma studio
```

Opens a web interface at http://localhost:5555 where you can:
- View all tables
- Edit data
- Create records
- Delete records

### Reset Database (Warning: Deletes All Data!)

```bash
npx prisma migrate reset
```

Use this only in development to start fresh.

### Backup Database

#### SQLite (Development)
```bash
cp prisma/dev.db prisma/backup.db
```

#### PostgreSQL (Production)
```bash
pg_dump -U username dbname > backup.sql
```

---

## 🌐 Subdomain Testing Locally

To test subdomains on your local machine:

### macOS / Linux

1. **Edit hosts file**:
   ```bash
   sudo nano /etc/hosts
   ```

2. **Add these lines**:
   ```
   127.0.0.1 localhost
   127.0.0.1 techuni.localhost
   127.0.0.1 university2.localhost
   ```

3. **Save and exit** (Ctrl+X, then Y, then Enter)

### Windows

1. **Open Notepad as Administrator**

2. **Open file**: `C:\Windows\System32\drivers\etc\hosts`

3. **Add these lines**:
   ```
   127.0.0.1 localhost
   127.0.0.1 techuni.localhost
   127.0.0.1 university2.localhost
   ```

4. **Save**

### Test Subdomains

Now you can access:
- Main site: http://localhost:3000
- Tech Uni: http://techuni.localhost:3000
- University 2: http://university2.localhost:3000

---

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution 1**: Use a different port
```bash
PORT=3001 npm run dev
```

**Solution 2**: Find and kill process on port 3000
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**: Make sure the database file exists
```bash
ls prisma/dev.db
```

If it doesn't exist, run:
```bash
npx prisma migrate dev --name init
```

### Prisma Client Not Found

**Error**: `@prisma/client did not initialize yet`

**Solution**: Generate Prisma Client
```bash
npx prisma generate
```

### Module Not Found

**Error**: `Cannot find module ...`

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

**Error**: Various TypeScript or build errors

**Solution**: Clear build cache and rebuild
```bash
rm -rf .next
npm run build
```

### Environment Variables Not Loading

**Error**: Environment variables are undefined

**Solution**:
1. Check `.env` file exists in root directory
2. Restart the development server
3. For production, ensure variables are set in hosting platform

### Subdomain Not Working Locally

**Error**: Subdomain redirects to main site

**Solution**:
1. Check `/etc/hosts` (or Windows equivalent) has the subdomain entry
2. Clear browser cache
3. Try incognito/private browsing mode
4. Restart development server

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string (min 32 characters)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set `NODE_ENV="production"`
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS settings
- [ ] Review and limit file upload sizes
- [ ] Set up database backups
- [ ] Configure proper error logging

---

## 📊 Monitoring Your Application

### Check Application Health

The application is running properly if:

✅ Browser shows the homepage without errors
✅ No error messages in terminal
✅ Database operations work (can create users, universities)
✅ File uploads work
✅ Subdomains route correctly

### View Logs

Development server shows logs in terminal:
- Request logs
- Error messages
- API calls
- Build status

### Database Health

```bash
npx prisma studio
```

Check if you can see and query all tables.

---

## 🚢 Deployment Options

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Go to**: https://vercel.com

3. **Import your GitHub repository**

4. **Configure**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Environment Variables: Add from `.env`

5. **Deploy** (takes 2-3 minutes)

6. **Configure domain**:
   - Add your domain
   - Set up wildcard DNS: `*.yourdomain.com`

### Deploy to Other Platforms

The application can also be deployed to:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS**
- **Google Cloud**
- **Self-hosted VPS**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed platform-specific instructions.

---

## 📱 Mobile Development

Test on mobile devices:

1. **Find your local IP address**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Access from mobile** (on same WiFi):
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

---

## ⚡ Performance Tips

### Development

- Use `npm run dev` for hot reloading
- Keep browser DevTools open for debugging
- Use React DevTools browser extension
- Monitor terminal for errors

### Production

- Always run `npm run build` before deploying
- Use environment variables for configuration
- Enable caching where appropriate
- Optimize images before uploading
- Use CDN for static assets

---

## 🎓 Learning Resources

### Documentation

- [README.md](./README.md) - Project overview and features
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [API_ENDPOINTS.md](./API_ENDPOINTS.md) - API documentation
- [STUDENT_GUIDE.md](./STUDENT_GUIDE.md) - How students use the system
- [FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md) - System workflow

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🆘 Getting Help

### Self-Help

1. Check this documentation
2. Review error messages carefully
3. Search existing GitHub issues
4. Try the troubleshooting section

### Community Support

- **GitHub Issues**: https://github.com/amansky404/EduCertEngine/issues
- Create a new issue with:
  - Detailed description
  - Steps to reproduce
  - Error messages
  - System information (OS, Node version)
  - Screenshots if applicable

---

## ✅ Success Checklist

After following this guide, you should have:

- [x] Application running locally
- [x] Database initialized
- [x] Super admin account created
- [x] First university created
- [x] Can access university subdomain
- [x] Can log in as university admin
- [x] Can create templates
- [x] Can add students
- [x] Can generate certificates

---

## 🎉 Next Steps

Now that your application is running:

1. **Read** [STUDENT_GUIDE.md](./STUDENT_GUIDE.md) to understand the student experience
2. **Review** [FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md) to understand system workflows
3. **Explore** the admin panel and create your first certificate
4. **Check** [CERTIFICATE_GENERATION_GUIDE.md](./CERTIFICATE_GENERATION_GUIDE.md) for detailed instructions
5. **Deploy** to production when ready (see [DEPLOYMENT.md](./DEPLOYMENT.md))

---

## 📝 Summary

### To Run in Development:
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### To Run in Production:
```bash
npm install
# Configure production .env
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

**That's all you need to get started! Happy coding! 🚀**

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Tested On:** Node.js 18.x, 20.x
