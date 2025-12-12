# Teach me Prompting LAMP Stack - Terraform Infrastructure

Deploy Teach me Prompting on AWS EC2 with Apache, PHP 7.4, and PostgreSQL 15 using Terraform.

## 📋 Prerequisites

- **Terraform** >= 1.0
- **AWS CLI** configured with credentials
- **AWS Account** with appropriate permissions
- **Git** (for cloning repository)

## 🚀 Quick Start

### 1. Configure Variables

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

**Required variables:**
- `db_password` - Strong PostgreSQL password
- `jwt_secret` - Random secret key for JWT
- `litellm_api_key` - OpenAI or Anthropic API key
- `smtp_user` - Your email for SMTP
- `smtp_pass` - SMTP password/app password

**Important:**
- Change `allowed_ssh_cidr` to your IP address!
- Update `git_repo_url` if using a fork

### 2. Initialize Terraform

```bash
terraform init
```

### 3. Plan Deployment

```bash
terraform plan
```

Review the planned changes carefully.

### 4. Deploy

```bash
terraform apply
```

Type `yes` to confirm. Deployment takes ~10-15 minutes.

### 5. Access Your Application

After deployment completes, Terraform will output:
- **SSH Command**: Connect to your instance
- **Application URL**: Access the frontend
- **API URL**: Backend API endpoint

```bash
# Example output
ssh_command = "ssh -i ~/.ssh/Teach me Prompting-lamp-key.pem ubuntu@1.2.3.4"
application_url = "http://1.2.3.4"
api_url = "http://1.2.3.4:8000"
```

## 📁 Project Structure

```
terraform-lamp/
├── main.tf                    # Root configuration
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── terraform.tfvars.example   # Example configuration
├── terraform.tfvars           # Your configuration (gitignored)
├── README.md                  # This file
└── modules/
    ├── networking/            # VPC, subnets, IGW
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── security/              # Security groups, SSH keys
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── compute/               # EC2 instance
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── user-data.sh       # Bootstrap script
```

## 🏗️ Infrastructure Components

### Networking
- **VPC**: 10.0.0.0/16
- **Public Subnet**: 10.0.1.0/24
- **Internet Gateway**: For public access
- **Route Table**: Routes internet traffic

### Security
- **Security Group**: 
  - Port 22 (SSH) - Restricted to your IP
  - Port 80 (HTTP) - Open to internet
  - Port 443 (HTTPS) - Open to internet
  - Port 8000 (PHP API) - Open to internet
- **SSH Key Pair**: Auto-generated and saved locally

### Compute
- **EC2 Instance**: t3.medium (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 20.04 LTS
- **Storage**: 30GB gp3 EBS volume (encrypted)
- **Elastic IP**: Static public IP address

### Installed Software
- Apache 2.4
- PHP 7.4 + extensions
- PostgreSQL 15
- Composer
- Node.js 18
- Git

## 🔐 Security Best Practices

### Before Deployment
1. **Restrict SSH Access**: Set `allowed_ssh_cidr` to your IP
2. **Strong Passwords**: Use strong, random passwords
3. **Secure Secrets**: Never commit `terraform.tfvars` to git

### After Deployment
1. **Set up SSL**: Use Let's Encrypt for HTTPS
   ```bash
   ssh -i Teach me Prompting-lamp-key.pem ubuntu@<IP>
   sudo certbot --apache -d yourdomain.com
   ```

2. **Configure Firewall**: UFW is enabled by default

3. **Update Regularly**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Monitor Logs**:
   ```bash
   sudo tail -f /var/log/apache2/error.log
   sudo tail -f /var/log/deployment.log
   ```

## 🔧 Configuration

### Environment Variables

All application configuration is set via environment variables in `/var/www/Teach me Prompting/backend-php/.env`:

- `DB_*` - Database connection
- `JWT_*` - Authentication
- `LITELLM_*` - AI service
- `SMTP_*` - Email service
- `APP_URL` - Application URL
- `ALLOWED_ORIGINS` - CORS origins

### Updating Configuration

```bash
# SSH into instance
ssh -i Teach me Prompting-lamp-key.pem ubuntu@<IP>

# Edit .env
sudo nano /var/www/Teach me Prompting/backend-php/.env

# Restart API service
sudo systemctl restart Teach me Prompting-api
```

## 📊 Monitoring

### Check Service Status

```bash
# Apache
sudo systemctl status apache2

# PostgreSQL
sudo systemctl status postgresql

# PHP API
sudo systemctl status Teach me Prompting-api
```

### View Logs

```bash
# Deployment log
sudo cat /var/log/deployment.log

# Apache logs
sudo tail -f /var/log/apache2/Teach me Prompting_error.log
sudo tail -f /var/log/apache2/Teach me Prompting_access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## 🔄 Updates and Maintenance

### Update Application Code

```bash
# SSH into instance
ssh -i Teach me Prompting-lamp-key.pem ubuntu@<IP>

# Pull latest code
cd /var/www/Teach me Prompting
sudo git pull origin main

# Update backend dependencies
cd backend-php
sudo composer install --no-dev

# Rebuild frontend
cd ../frontend
sudo npm install
sudo npm run build

# Restart services
sudo systemctl restart Teach me Prompting-api
sudo systemctl restart apache2
```

### Database Backups

```bash
# Create backup
sudo -u postgres pg_dump Teach me Prompting > backup_$(date +%Y%m%d).sql

# Restore backup
sudo -u postgres psql Teach me Prompting < backup_20250101.sql
```

## 💰 Cost Estimate

| Resource | Specification | Monthly Cost |
|----------|--------------|--------------|
| EC2 (t3.medium) | 2 vCPU, 4GB RAM | ~$30 |
| EBS Storage | 30GB gp3 | ~$3 |
| Elastic IP | 1 static IP | $0 (if attached) |
| Data Transfer | ~100GB | ~$9 |
| **Total** | | **~$42/month** |

### Cost Optimization
- Use **t3.small** for development (~$15/month)
- Use **Reserved Instances** for 30-40% savings
- Use **Spot Instances** for non-production (70% savings)

## 🗑️ Cleanup

To destroy all resources:

```bash
terraform destroy
```

Type `yes` to confirm. This will delete:
- EC2 instance
- Elastic IP
- Security groups
- VPC and networking
- SSH key pair

**Note**: This does NOT delete:
- The local SSH private key file
- Terraform state files

## 🐛 Troubleshooting

### Deployment Fails

1. **Check deployment log**:
   ```bash
   ssh -i Teach me Prompting-lamp-key.pem ubuntu@<IP>
   sudo cat /var/log/deployment.log
   ```

2. **Check user-data execution**:
   ```bash
   sudo cat /var/log/cloud-init-output.log
   ```

### Application Not Accessible

1. **Check security group**: Ensure ports 80, 443, 8000 are open
2. **Check Apache**: `sudo systemctl status apache2`
3. **Check API**: `sudo systemctl status Teach me Prompting-api`
4. **Check firewall**: `sudo ufw status`

### Database Connection Issues

1. **Check PostgreSQL**: `sudo systemctl status postgresql`
2. **Test connection**:
   ```bash
   psql -h localhost -U Teach me Prompting_user -d Teach me Prompting
   ```
3. **Check credentials** in `.env` file

### SSH Connection Refused

1. **Verify security group** allows your IP
2. **Check instance status** in AWS Console
3. **Verify key permissions**: `chmod 600 Teach me Prompting-lamp-key.pem`

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Ubuntu 20.04 Server Guide](https://ubuntu.com/server/docs)
- [Apache Documentation](https://httpd.apache.org/docs/2.4/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [PHP 7.4 Documentation](https://www.php.net/manual/en/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License
