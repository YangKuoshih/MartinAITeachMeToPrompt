# Apache Hosting Configuration

## Directory Structure
```
/var/www/prompttrainer/
├── frontend/build/          # React SPA build files
├── backend/public/          # PHP API entry point
├── backend/src/            # PHP source code
├── uploads/                # File uploads
└── logs/                   # Application logs
```

## URL Structure
- **Frontend**: `http://prompttrainer.local/app/` → React SPA
- **API**: `http://prompttrainer.local/api/` → PHP backend
- **Static files**: Served directly by Apache

## Installation Steps

### 1. Install Dependencies
```bash
sudo apt update
sudo apt install apache2 php8.2 php8.2-fpm php8.2-pgsql php8.2-curl php8.2-json postgresql
```

### 2. Enable Apache Modules
```bash
sudo a2enmod rewrite headers ssl proxy_fcgi setenvif
sudo a2enconf php8.2-fpm
```

### 3. Copy Configuration
```bash
sudo cp prompttrainer.conf /etc/apache2/sites-available/
sudo a2ensite prompttrainer
sudo systemctl reload apache2
```

### 4. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/prompttrainer
sudo chmod -R 755 /var/www/prompttrainer
sudo chmod -R 775 /var/www/prompttrainer/uploads
```

## Key Differences from CloudFront

| Feature | CloudFront | Apache |
|---------|------------|--------|
| **Static Files** | S3 + CDN | Local filesystem |
| **Routing** | API Gateway | mod_rewrite |
| **SSL** | AWS Certificate | Let's Encrypt/Self-signed |
| **Caching** | Edge locations | mod_expires + browser cache |
| **Scaling** | Auto-scaling | Manual/Load balancer |

## Performance Considerations
- Use Apache mod_expires for static asset caching
- Enable gzip compression with mod_deflate  
- Consider nginx as reverse proxy for high traffic
- Implement Redis for session storage in multi-server setup