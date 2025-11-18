# Deployment Guide

This guide covers various deployment options for EduCertEngine.

## Prerequisites

- Node.js v14 or higher
- MongoDB v4.4 or higher
- npm or yarn
- A domain name (for production)
- SSL/TLS certificate (for production)

## Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000

# Database - Use MongoDB Atlas or your own instance
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/educertengine?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_very_secure_random_string_here
JWT_EXPIRE=30d

# Domain Configuration
BASE_DOMAIN=educert.com
FRONTEND_URL=https://educert.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./public/uploads

# Certificate Storage
CERT_PATH=./public/certificates
TEMPLATE_PATH=./public/templates
```

## Deployment Options

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Add MongoDB Add-on**
   ```bash
   heroku addons:create mongodb:sandbox
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret_here
   heroku config:set BASE_DOMAIN=your-app-name.herokuapp.com
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Open App**
   ```bash
   heroku open
   ```

### Option 2: DigitalOcean

1. **Create a Droplet**
   - Choose Ubuntu 20.04 LTS
   - Select appropriate size (minimum 2GB RAM recommended)
   - Add SSH key

2. **Connect to Server**
   ```bash
   ssh root@your_server_ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

6. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/amansky404/EduCertEngine.git
   cd EduCertEngine
   ```

7. **Install Dependencies**
   ```bash
   npm install --production
   ```

8. **Create .env File**
   ```bash
   nano .env
   # Add your environment variables
   ```

9. **Start Application with PM2**
   ```bash
   pm2 start server.js --name educertengine
   pm2 save
   pm2 startup
   ```

10. **Setup Nginx as Reverse Proxy**
    ```bash
    sudo apt-get install nginx
    sudo nano /etc/nginx/sites-available/educertengine
    ```

    Add the following configuration:
    ```nginx
    server {
        listen 80;
        server_name educert.com *.educert.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    Enable the site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/educertengine /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d educert.com -d *.educert.com
    ```

### Option 3: AWS EC2

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 or Ubuntu
   - t2.medium or larger recommended
   - Configure security group (ports 22, 80, 443)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Follow Similar Steps as DigitalOcean**
   - Install Node.js, MongoDB, PM2
   - Clone repository and configure
   - Setup Nginx and SSL

4. **Configure AWS S3 for File Storage (Optional)**
   - Create S3 bucket for certificates and uploads
   - Update code to use AWS SDK for file operations
   - Set appropriate IAM roles and permissions

### Option 4: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install --production

   COPY . .

   EXPOSE 5000

   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/educertengine
       depends_on:
         - mongo
       volumes:
         - ./public:/app/public

     mongo:
       image: mongo:6.0
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db

   volumes:
     mongo-data:
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

### Option 5: Vercel (API Only)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

Note: Vercel is serverless, so you'll need to use MongoDB Atlas for the database.

## DNS Configuration

### Wildcard Subdomain Setup

For multi-tenancy to work, you need to configure wildcard subdomains:

**DNS A Records:**
```
@           A    your_server_ip
*           A    your_server_ip
```

This allows:
- `educert.com` (main site)
- `tech-uni.educert.com` (university subdomain)
- `medical-college.educert.com` (another university)

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Account** at https://www.mongodb.com/cloud/atlas

2. **Create Cluster**
   - Choose your cloud provider and region
   - Select cluster tier (M10+ for production)

3. **Configure Network Access**
   - Add your server's IP address
   - Or allow access from anywhere (0.0.0.0/0) with strong authentication

4. **Create Database User**
   - Username and strong password
   - Grant read/write access

5. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/educertengine
   ```

6. **Update .env**
   ```env
   MONGODB_URI=your_connection_string_here
   ```

## File Storage

### Local Storage (Development)
Files are stored in `./public` directory.

### AWS S3 (Production Recommended)

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://educert-files
   ```

2. **Configure Bucket Policy**
   - Allow public read for certificate files
   - Private for uploads

3. **Install AWS SDK**
   ```bash
   npm install aws-sdk
   ```

4. **Update Environment Variables**
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=educert-files
   ```

## SSL/TLS Configuration

### Using Let's Encrypt (Free)

```bash
sudo certbot --nginx -d educert.com -d *.educert.com
```

### Using Custom Certificate

1. Place certificate files in `/etc/ssl/certs/`
2. Update Nginx configuration:
   ```nginx
   ssl_certificate /etc/ssl/certs/educert.com.crt;
   ssl_certificate_key /etc/ssl/private/educert.com.key;
   ```

## Monitoring and Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs educertengine

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Setup Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Application Monitoring (Optional)

Consider using:
- **New Relic**: Application performance monitoring
- **Sentry**: Error tracking
- **DataDog**: Infrastructure monitoring

## Backup Strategy

### Database Backup

**Automated Daily Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

**Add to Crontab:**
```bash
0 2 * * * /path/to/backup-script.sh
```

### File Backup

Sync to S3:
```bash
aws s3 sync ./public/certificates s3://educert-backup/certificates/
aws s3 sync ./public/templates s3://educert-backup/templates/
```

## Security Checklist

- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (UFW or AWS Security Groups)
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Use helmet.js for security headers
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity

## Performance Optimization

### Enable Gzip Compression in Nginx

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Database Indexing

Ensure all indexes are created:
```javascript
// Already configured in models
- university.subdomain
- certificate.certificateNumber
- certificate.verificationCode
- Full-text search on student info
```

### Caching (Optional)

Consider Redis for:
- Session storage
- API response caching
- Rate limiting

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or AWS ELB
2. **Multiple Instances**: Run multiple PM2 instances
3. **Database Replication**: MongoDB replica sets

### Vertical Scaling

- Upgrade server resources (CPU, RAM)
- Optimize database queries
- Use CDN for static assets

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs educertengine

# Check MongoDB status
sudo systemctl status mongod

# Test MongoDB connection
mongo --eval "db.adminCommand('ping')"
```

### Subdomain Not Working

1. Check DNS propagation: `nslookup subdomain.educert.com`
2. Verify Nginx configuration
3. Check BASE_DOMAIN in .env

### File Upload Issues

1. Check directory permissions: `chmod 755 public/uploads`
2. Verify MAX_FILE_SIZE in .env
3. Check disk space: `df -h`

## Maintenance

### Update Application

```bash
cd /var/www/EduCertEngine
git pull origin main
npm install
pm2 restart educertengine
```

### Monitor Disk Space

```bash
# Check disk usage
df -h

# Clean old logs
pm2 flush
```

### Database Maintenance

```bash
# Compact database
mongo educertengine --eval "db.runCommand({ compact: 'certificates' })"

# Rebuild indexes
mongo educertengine --eval "db.certificates.reIndex()"
```

## Support

For deployment issues, please:
1. Check logs first
2. Review this guide
3. Search existing GitHub issues
4. Create new issue with detailed error logs

## Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
