#!/bin/bash
# PromptWARS LAMP Stack Bootstrap Script
# Installs Apache, PHP 7.4, PostgreSQL 15, and deploys the application

set -e  # Exit on error
exec > >(tee /var/log/deployment.log)
exec 2>&1

echo "========================================="
echo "PromptWARS LAMP Stack Deployment"
echo "Started: $(date)"
echo "========================================="

# Update system
echo "[1/10] Updating system packages..."
apt-get update
apt-get upgrade -y

# Install basic tools
echo "[2/10] Installing basic tools..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    ca-certificates \
    apt-transport-https

# Install PHP 7.4
echo "[3/10] Installing PHP 7.4..."
add-apt-repository -y ppa:ondrej/php
apt-get update
apt-get install -y \
    php7.4 \
    php7.4-fpm \
    php7.4-cli \
    php7.4-pgsql \
    php7.4-curl \
    php7.4-json \
    php7.4-mbstring \
    php7.4-xml \
    php7.4-zip \
    php7.4-gd

# Verify PHP installation
php -v

# Install Apache
echo "[4/10] Installing Apache..."
apt-get install -y apache2 libapache2-mod-php7.4

# Enable Apache modules
a2enmod rewrite
a2enmod ssl
a2enmod headers
a2enmod php7.4

# Install PostgreSQL 15
echo "[5/10] Installing PostgreSQL 15..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get install -y postgresql-15 postgresql-contrib-15

# Install Composer
echo "[6/10] Installing Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Node.js (for frontend build)
echo "[7/10] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Configure PostgreSQL
echo "[8/10] Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE promptwars;"
sudo -u postgres psql -c "CREATE USER promptwars_user WITH PASSWORD '${db_password}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE promptwars TO promptwars_user;"
sudo -u postgres psql -c "ALTER DATABASE promptwars OWNER TO promptwars_user;"

# Clone application repository
echo "[9/10] Cloning application repository..."
cd /var/www
git clone ${git_repo_url} promptwars
cd promptwars
git checkout ${git_branch}

# Install backend dependencies
echo "[9.1/10] Installing backend dependencies..."
cd backend-php
composer install --no-dev --optimize-autoloader

# Create .env file
cat > .env <<EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promptwars
DB_USER=promptwars_user
DB_PASSWORD=${db_password}

JWT_SECRET=${jwt_secret}
JWT_EXPIRY=3600

LITELLM_API_KEY=${litellm_api_key}
LITELLM_BASE_URL=https://api.openai.com/v1
LITELLM_MODEL=${litellm_model}

SMTP_HOST=${smtp_host}
SMTP_PORT=${smtp_port}
SMTP_USER=${smtp_user}
SMTP_PASS=${smtp_pass}
SMTP_FROM=${smtp_from}

APP_URL=${app_url}
ALLOWED_ORIGINS=${app_url}
EOF

# Import database schema
echo "[9.2/10] Importing database schema..."
cd /var/www/promptwars
PGPASSWORD=${db_password} psql -h localhost -U promptwars_user -d promptwars -f database/schema.sql

# Build frontend
echo "[9.3/10] Building frontend..."
cd /var/www/promptwars/frontend
npm install
npm run build

# Configure Apache
echo "[10/10] Configuring Apache..."

# Create Apache config for frontend
cat > /etc/apache2/sites-available/promptwars.conf <<'APACHECONF'
<VirtualHost *:80>
    ServerName ${domain_name}
    DocumentRoot /var/www/promptwars/frontend/build
    
    <Directory /var/www/promptwars/frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Proxy API requests to PHP backend
    ProxyPreserveHost On
    ProxyPass /api http://localhost:8000
    ProxyPassReverse /api http://localhost:8000
    
    ErrorLog \${APACHE_LOG_DIR}/promptwars_error.log
    CustomLog \${APACHE_LOG_DIR}/promptwars_access.log combined
</VirtualHost>
APACHECONF

# Enable site
a2dissite 000-default.conf
a2ensite promptwars.conf
a2enmod proxy
a2enmod proxy_http

# Set permissions
chown -R www-data:www-data /var/www/promptwars
chmod -R 755 /var/www/promptwars

# Create systemd service for PHP backend
cat > /etc/systemd/system/promptwars-api.service <<'SYSTEMD'
[Unit]
Description=PromptWARS PHP API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/promptwars/backend-php
ExecStart=/usr/bin/php -S 0.0.0.0:8000 -t public
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SYSTEMD

# Start services
systemctl daemon-reload
systemctl enable promptwars-api
systemctl start promptwars-api
systemctl restart apache2

# Configure firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp
ufw --force enable

echo "========================================="
echo "Deployment Complete!"
echo "Finished: $(date)"
echo "========================================="
echo ""
echo "Services Status:"
systemctl status apache2 --no-pager
systemctl status postgresql --no-pager
systemctl status promptwars-api --no-pager
echo ""
echo "Next steps:"
echo "1. Access application at: http://$(curl -s ifconfig.me)"
echo "2. Configure DNS if using domain"
echo "3. Set up SSL with: sudo certbot --apache"
